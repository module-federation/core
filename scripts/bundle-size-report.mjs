#!/usr/bin/env node
// Bundle Size Report — zero-dependency measurement & comparison script
// Usage:
//   Measure: node scripts/bundle-size-report.mjs --output sizes.json [--packages-dir packages]
//   Compare: node scripts/bundle-size-report.mjs --compare base.json --current current.json --output stats.txt

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from 'fs';
import { join, resolve, relative } from 'path';
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
function findEsmEntry(pkgDir) {
  const pkgJsonPath = join(pkgDir, 'package.json');
  if (!existsSync(pkgJsonPath)) return null;

  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));

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

/** Get gzip size of a file */
function gzipSize(filePath) {
  if (!filePath || !existsSync(filePath)) return 0;
  const content = readFileSync(filePath);
  return gzipSync(content, { level: 9 }).length;
}

// ── Discovery ────────────────────────────────────────────────────────────────

/** Find package directories from workspace package manifests */
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
      const packageJsonPath = join(pkgDir, 'package.json');
      if (!existsSync(packageJsonPath)) continue;

      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        if (!packageJson?.name) continue;
        packages.push({
          name: packageJson.name,
          dir: pkgDir,
        });
      } catch {
        // Skip packages with invalid package.json
      }
    }
  }

  return packages.sort((a, b) => a.name.localeCompare(b.name));
}

// ── Measure ──────────────────────────────────────────────────────────────────

function measure(packagesDir) {
  const packages = discoverPackages(packagesDir);
  const results = {};

  for (const pkg of packages) {
    const distDir = join(pkg.dir, 'dist');
    const totalSize = dirSize(distDir);
    const esmEntry = findEsmEntry(pkg.dir);
    const esmGzip = gzipSize(esmEntry);

    results[pkg.name] = {
      totalDist: totalSize,
      esmGzip,
      esmEntry: esmEntry ? relative(pkg.dir, esmEntry) : null,
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
  let totalDistBase = 0;
  let totalDistCurrent = 0;
  let totalEsmBase = 0;
  let totalEsmCurrent = 0;

  for (const name of [...allPackages].sort()) {
    const base = baseData[name] || { totalDist: 0, esmGzip: 0 };
    const current = currentData[name] || { totalDist: 0, esmGzip: 0 };

    totalDistBase += base.totalDist;
    totalDistCurrent += current.totalDist;
    totalEsmBase += base.esmGzip;
    totalEsmCurrent += current.esmGzip;

    const distChanged = base.totalDist !== current.totalDist;
    const esmChanged = base.esmGzip !== current.esmGzip;

    if (distChanged || esmChanged) {
      changed.push({ name, base, current });
    } else {
      unchangedCount++;
    }
  }

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
    lines.push('| Package | Total dist | Delta | ESM gzip | Delta |');
    lines.push('|---------|-----------|-------|----------|-------|');

    // Sort by absolute dist delta descending
    changed.sort((a, b) => {
      const aDelta = Math.abs(a.current.totalDist - a.base.totalDist);
      const bDelta = Math.abs(b.current.totalDist - b.base.totalDist);
      return bDelta - aDelta;
    });

    for (const { name, base, current } of changed) {
      const distDelta = formatDelta(current.totalDist, base.totalDist);
      const esmDelta = formatDelta(current.esmGzip, base.esmGzip);
      lines.push(
        `| \`${name}\` | ${formatBytes(current.totalDist)} | ${distDelta} | ${formatBytes(current.esmGzip)} | ${esmDelta} |`,
      );
    }

    lines.push('');
  }

  lines.push(
    `**Total dist:** ${formatBytes(totalDistCurrent)} (${formatDelta(totalDistCurrent, totalDistBase)})`,
  );
  lines.push(
    `**Total ESM gzip:** ${formatBytes(totalEsmCurrent)} (${formatDelta(totalEsmCurrent, totalEsmBase)})`,
  );
  lines.push('');

  return lines.join('\n');
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
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
    const results = measure(packagesDir);
    const packageCount = Object.keys(results).length;

    writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`Measured ${packageCount} packages → ${outputPath}`);

    // Print summary
    let totalDist = 0;
    let totalEsm = 0;
    for (const [name, data] of Object.entries(results)) {
      totalDist += data.totalDist;
      totalEsm += data.esmGzip;
      console.log(
        `  ${name}: dist=${formatBytes(data.totalDist)}, esm-gzip=${formatBytes(data.esmGzip)}`,
      );
    }
    console.log(
      `Total dist: ${formatBytes(totalDist)}, Total ESM gzip: ${formatBytes(totalEsm)}`,
    );
  }
}

main();
