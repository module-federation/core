#!/usr/bin/env node
// Bundle Size Report — measurement & comparison script
// Usage:
//   Measure: node scripts/bundle-size-report.mjs --output sizes.json [--packages-dir packages]
//   Compare: node scripts/bundle-size-report.mjs --compare base.json --current current.json --output stats.txt
// Output includes:
//   - package dist total (raw)
//   - ESM entry gzip
//   - web/node bundles (gzip, ENV_TARGET=web/node)
//   - no tree-shake bundle (gzip)

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from 'fs';
import { join, resolve, relative } from 'path';
import { builtinModules } from 'module';
import { gzipSync } from 'zlib';

const ROOT = resolve(import.meta.dirname, '..');

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} kB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function formatDelta(current, base) {
  const diff = current - base;
  if (diff === 0) return 'no change';
  const sign = diff > 0 ? '+' : '';
  const pct = base > 0 ? ((diff / base) * 100).toFixed(1) : '∞';
  const absPct = Math.abs(parseFloat(pct));
  const text = `${sign}${formatBytes(diff)} (${sign}${pct}%)`;
  return absPct > 5 ? `**${text}**` : text;
}

function formatMaybe(bytes) {
  return typeof bytes === 'number' ? formatBytes(bytes) : 'n/a';
}

function formatDeltaMaybe(current, base) {
  if (typeof current !== 'number' || typeof base !== 'number') return 'n/a';
  return formatDelta(current, base);
}

let esbuildPromise;

async function loadEsbuild() {
  if (!esbuildPromise) {
    esbuildPromise = import('esbuild');
  }
  return esbuildPromise;
}

/** Recursively sum all file sizes in a directory, excluding .map files */
function dirSize(dir) {
  let total = 0;
  if (!existsSync(dir)) return total;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += dirSize(fullPath);
    } else if (entry.isFile()) {
      // Skip source map files
      if (entry.name.endsWith('.map')) continue;
      total += statSync(fullPath).size;
    }
  }
  return total;
}

/** Detect the main ESM entry file from package.json */
function readPackageJson(pkgDir) {
  const pkgJsonPath = join(pkgDir, 'package.json');
  if (!existsSync(pkgJsonPath)) return null;
  try {
    return JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
  } catch {
    return null;
  }
}

/** Detect the main ESM entry file from package.json */
function findEsmEntry(pkgDir, pkg) {
  if (!pkg) return null;

  // Try module field first
  if (pkg.module) {
    const resolved = join(pkgDir, pkg.module);
    if (existsSync(resolved)) return resolved;
  }

  // Try exports["."].import
  if (pkg.exports && pkg.exports['.']) {
    const dot = pkg.exports['.'];
    const importPath = typeof dot === 'string' ? dot : dot.import;
    if (importPath) {
      const entry =
        typeof importPath === 'string'
          ? importPath
          : importPath.default || importPath;
      if (typeof entry === 'string') {
        const resolved = join(pkgDir, entry);
        if (existsSync(resolved)) return resolved;
      }
    }
  }

  // Fall back to main
  if (pkg.main) {
    const resolved = join(pkgDir, pkg.main);
    if (existsSync(resolved)) return resolved;
  }

  return null;
}

function collectExternal(pkg) {
  if (!pkg) return [];
  const deps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.optionalDependencies || {}),
  ];
  const builtins = builtinModules.flatMap((item) => [item, `node:${item}`]);
  return Array.from(new Set([...deps, ...builtins]));
}

/** Get gzip size of a file */
function gzipSize(filePath) {
  if (!filePath || !existsSync(filePath)) return 0;
  const content = readFileSync(filePath);
  return gzipSync(content, { level: 9 }).length;
}

async function bundleEntry(entryPath, options) {
  if (!entryPath || !existsSync(entryPath)) {
    return { bytes: null, gzip: null, error: 'entry not found' };
  }

  try {
    const { build } = await loadEsbuild();
    const result = await build({
      entryPoints: [entryPath],
      absWorkingDir: ROOT,
      bundle: true,
      write: false,
      splitting: false,
      format: 'esm',
      platform: options.platform,
      treeShaking: options.treeShaking,
      minify: options.minify ?? true,
      target: 'es2021',
      define: options.define,
      external: options.external,
      logLevel: 'silent',
    });

    const output = result.outputFiles?.[0];
    if (!output) {
      return { bytes: null, gzip: null, error: 'no output generated' };
    }

    const bytes = output.contents.length;
    const gzip = gzipSync(output.contents, { level: 9 }).length;
    return { bytes, gzip };
  } catch (error) {
    return {
      bytes: null,
      gzip: null,
      error: error?.message ? error.message : String(error),
    };
  }
}

// ── Discovery ────────────────────────────────────────────────────────────────

/** Find all packages tagged with type:pkg */
function discoverPackages(packagesDir) {
  const packages = [];
  const searchDirs = [packagesDir];

  // Also search bridge/ subdirectory if it exists
  const bridgeDir = join(packagesDir, 'bridge');
  if (existsSync(bridgeDir)) {
    searchDirs.push(bridgeDir);
  }

  // Also search runtime-plugins/ subdirectory if it exists
  const runtimePluginsDir = join(packagesDir, 'runtime-plugins');
  if (existsSync(runtimePluginsDir)) {
    searchDirs.push(runtimePluginsDir);
  }

  for (const searchDir of searchDirs) {
    if (!existsSync(searchDir)) continue;
    const entries = readdirSync(searchDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const pkgDir = join(searchDir, entry.name);
      const projectJsonPath = join(pkgDir, 'project.json');
      if (!existsSync(projectJsonPath)) continue;

      try {
        const projectJson = JSON.parse(readFileSync(projectJsonPath, 'utf8'));
        const tags = projectJson.tags || [];
        if (tags.includes('type:pkg')) {
          packages.push({
            name: projectJson.name || entry.name,
            dir: pkgDir,
          });
        }
      } catch {
        // Skip packages with invalid project.json
      }
    }
  }

  return packages.sort((a, b) => a.name.localeCompare(b.name));
}

// ── Measure ──────────────────────────────────────────────────────────────────

async function measure(packagesDir) {
  const packages = discoverPackages(packagesDir);
  const results = {};

  for (const pkg of packages) {
    const pkgJson = readPackageJson(pkg.dir);
    const distDir = join(pkg.dir, 'dist');
    const totalSize = dirSize(distDir);
    const esmEntry = findEsmEntry(pkg.dir, pkgJson);
    const esmGzip = gzipSize(esmEntry);
    const external = collectExternal(pkgJson);

    let webBundle = { bytes: null, gzip: null };
    let nodeBundle = { bytes: null, gzip: null };
    let noTreeBundle = { bytes: null, gzip: null };
    const bundleErrors = {};

    if (esmEntry) {
      const [webResult, nodeResult, noTreeResult] = await Promise.all([
        bundleEntry(esmEntry, {
          platform: 'browser',
          treeShaking: true,
          define: { ENV_TARGET: JSON.stringify('web') },
          external,
        }),
        bundleEntry(esmEntry, {
          platform: 'node',
          treeShaking: true,
          define: { ENV_TARGET: JSON.stringify('node') },
          external,
        }),
        bundleEntry(esmEntry, {
          platform: 'neutral',
          treeShaking: false,
          minify: true,
          external,
        }),
      ]);

      webBundle = webResult;
      nodeBundle = nodeResult;
      noTreeBundle = noTreeResult;

      if (webResult.error) bundleErrors.web = webResult.error;
      if (nodeResult.error) bundleErrors.node = nodeResult.error;
      if (noTreeResult.error) bundleErrors.noTree = noTreeResult.error;
    }

    results[pkg.name] = {
      totalDist: totalSize,
      esmGzip,
      esmEntry: esmEntry ? relative(pkg.dir, esmEntry) : null,
      webBundleBytes: webBundle.bytes,
      webBundleGzip: webBundle.gzip,
      nodeBundleBytes: nodeBundle.bytes,
      nodeBundleGzip: nodeBundle.gzip,
      noTreeBundleBytes: noTreeBundle.bytes,
      noTreeBundleGzip: noTreeBundle.gzip,
      bundleEntry: esmEntry ? relative(pkg.dir, esmEntry) : null,
      bundleErrors: Object.keys(bundleErrors).length ? bundleErrors : null,
    };
  }

  return results;
}

// ── Compare ──────────────────────────────────────────────────────────────────

function compare(baseData, currentData) {
  const allPackages = new Set([
    ...Object.keys(baseData),
    ...Object.keys(currentData),
  ]);
  const changed = [];
  let unchangedCount = 0;

  const distMetrics = [
    { key: 'totalDist', label: 'Total dist (raw)' },
    { key: 'esmGzip', label: 'ESM gzip' },
  ];

  const bundleMetrics = [
    { key: 'webBundleGzip', label: 'Web bundle (gzip)' },
    { key: 'nodeBundleGzip', label: 'Node bundle (gzip)' },
    { key: 'noTreeBundleGzip', label: 'No tree-shake bundle (gzip)' },
  ];

  const allMetrics = [...distMetrics, ...bundleMetrics];

  for (const name of [...allPackages].sort()) {
    const base = baseData[name] || {};
    const current = currentData[name] || {};

    const hasChange = allMetrics.some(({ key }) => {
      const baseValue = base[key];
      const currentValue = current[key];
      if (typeof baseValue === 'number' && typeof currentValue === 'number') {
        return baseValue !== currentValue;
      }
      return typeof baseValue === 'number' || typeof currentValue === 'number';
    });

    if (hasChange) {
      changed.push({ name, base, current });
    } else {
      unchangedCount++;
    }
  }

  const sumMetric = (data, key) =>
    Object.values(data).reduce((sum, item) => {
      const value = item?.[key];
      return typeof value === 'number' ? sum + value : sum;
    }, 0);

  const totalDistBase = sumMetric(baseData, 'totalDist');
  const totalDistCurrent = sumMetric(currentData, 'totalDist');
  const totalEsmBase = sumMetric(baseData, 'esmGzip');
  const totalEsmCurrent = sumMetric(currentData, 'esmGzip');
  const totalWebBase = sumMetric(baseData, 'webBundleGzip');
  const totalWebCurrent = sumMetric(currentData, 'webBundleGzip');
  const totalNodeBase = sumMetric(baseData, 'nodeBundleGzip');
  const totalNodeCurrent = sumMetric(currentData, 'nodeBundleGzip');
  const totalNoTreeBase = sumMetric(baseData, 'noTreeBundleGzip');
  const totalNoTreeCurrent = sumMetric(currentData, 'noTreeBundleGzip');

  const buildTable = (title, metrics) => {
    if (changed.length === 0) return [];
    const rows = [];
    rows.push(`### ${title}`);
    rows.push('');

    const headers = ['Package'];
    for (const metric of metrics) {
      headers.push(metric.label, 'Delta');
    }
    rows.push(`| ${headers.join(' | ')} |`);
    rows.push(`| ${headers.map(() => '---').join(' | ')} |`);

    for (const { name, base, current } of changed) {
      const cells = [`\`${name}\``];
      for (const metric of metrics) {
        const currentValue = current[metric.key];
        const baseValue = base[metric.key];
        cells.push(
          formatMaybe(currentValue),
          formatDeltaMaybe(currentValue, baseValue),
        );
      }
      rows.push(`| ${cells.join(' | ')} |`);
    }

    rows.push('');
    return rows;
  };

  // Build markdown
  const lines = [];
  lines.push('## Bundle Size Report');
  lines.push('');

  if (changed.length === 0) {
    lines.push('No bundle size changes detected.');
    lines.push('');
  } else {
    lines.push(
      `${changed.length} package(s) changed, ${unchangedCount} unchanged.`,
    );
    lines.push('');
  }

  lines.push(...buildTable('Package dist + ESM entry', distMetrics));
  lines.push(...buildTable('Bundle targets', bundleMetrics));

  lines.push(
    `**Total dist (raw):** ${formatBytes(totalDistCurrent)} (${formatDelta(totalDistCurrent, totalDistBase)})`,
  );
  lines.push(
    `**Total ESM gzip:** ${formatBytes(totalEsmCurrent)} (${formatDelta(totalEsmCurrent, totalEsmBase)})`,
  );
  lines.push(
    `**Total web bundle (gzip):** ${formatBytes(totalWebCurrent)} (${formatDelta(totalWebCurrent, totalWebBase)})`,
  );
  lines.push(
    `**Total node bundle (gzip):** ${formatBytes(totalNodeCurrent)} (${formatDelta(totalNodeCurrent, totalNodeBase)})`,
  );
  lines.push(
    `**Total no tree-shake bundle (gzip):** ${formatBytes(totalNoTreeCurrent)} (${formatDelta(totalNoTreeCurrent, totalNoTreeBase)})`,
  );
  lines.push('');
  lines.push(
    '_Bundle sizes are generated with esbuild. Web/node bundles set ENV_TARGET and enable tree-shaking; the no tree-shake bundle disables tree-shaking and leaves ENV_TARGET undefined._',
  );
  lines.push('');

  const errored = Object.entries(currentData).filter(
    ([, data]) => data?.bundleErrors,
  );
  if (errored.length) {
    lines.push('### Bundle errors');
    for (const [name, data] of errored) {
      const parts = Object.entries(data.bundleErrors).map(
        ([target, error]) => `${target}: ${error}`,
      );
      lines.push(`- \`${name}\`: ${parts.join('; ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);

  if (args.compare) {
    // Compare mode
    const basePath = resolve(args.compare);
    const currentPath = resolve(args.current || 'current.json');
    const outputPath = resolve(args.output || 'stats.txt');

    if (!existsSync(basePath)) {
      console.error(`Base file not found: ${basePath}`);
      process.exit(1);
    }
    if (!existsSync(currentPath)) {
      console.error(`Current file not found: ${currentPath}`);
      process.exit(1);
    }

    const baseData = JSON.parse(readFileSync(basePath, 'utf8'));
    const currentData = JSON.parse(readFileSync(currentPath, 'utf8'));
    const markdown = compare(baseData, currentData);

    writeFileSync(outputPath, markdown, 'utf8');
    console.log(`Comparison written to ${outputPath}`);
    console.log(markdown);
  } else {
    // Measure mode
    const packagesDir = resolve(args['packages-dir'] || join(ROOT, 'packages'));
    const outputPath = resolve(args.output || 'bundle-sizes.json');

    console.log(`Scanning packages in ${packagesDir}...`);
    const results = await measure(packagesDir);
    const packageCount = Object.keys(results).length;

    writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`Measured ${packageCount} packages → ${outputPath}`);

    // Print summary
    let totalDist = 0;
    let totalEsm = 0;
    let totalWeb = 0;
    let totalNode = 0;
    let totalNoTree = 0;
    for (const [name, data] of Object.entries(results)) {
      totalDist += data.totalDist;
      totalEsm += data.esmGzip;
      if (typeof data.webBundleGzip === 'number')
        totalWeb += data.webBundleGzip;
      if (typeof data.nodeBundleGzip === 'number')
        totalNode += data.nodeBundleGzip;
      if (typeof data.noTreeBundleGzip === 'number')
        totalNoTree += data.noTreeBundleGzip;
      const bundleErrorNote = data.bundleErrors
        ? ` (bundle errors: ${Object.keys(data.bundleErrors).join(', ')})`
        : '';
      console.log(
        `  ${name}: dist=${formatBytes(data.totalDist)}, esm-gzip=${formatBytes(data.esmGzip)}, web-gzip=${formatMaybe(data.webBundleGzip)}, node-gzip=${formatMaybe(data.nodeBundleGzip)}, no-tree-gzip=${formatMaybe(data.noTreeBundleGzip)}${bundleErrorNote}`,
      );
    }
    console.log(
      `Total dist: ${formatBytes(totalDist)}, Total ESM gzip: ${formatBytes(totalEsm)}, Total web gzip: ${formatBytes(totalWeb)}, Total node gzip: ${formatBytes(totalNode)}, Total no-tree gzip: ${formatBytes(totalNoTree)}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
