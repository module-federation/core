#!/usr/bin/env node
// Bundle Size Report — measurement & comparison script
// Usage:
//   Measure: node scripts/bundle-size-report.mjs --output sizes.json [--packages-dir packages]
//   Compare: node scripts/bundle-size-report.mjs --compare base.json --current current.json --output stats.txt
// Output includes:
//   - package dist total (raw)
//   - root ESM entry gzip
//   - web/node bundles for the root entry (gzip, ENV_TARGET=web/node)
//   - tracked tree-shakable subpath entries like ./bundler

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
  mkdirSync,
} from 'fs';
import { join, resolve, relative, extname } from 'path';
import { createRequire } from 'module';
import { tmpdir } from 'os';
import { gzipSync } from 'zlib';

const ROOT = resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);

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

let rslibPromise;
let webpackPromise;

const ASSET_RULES = [
  { test: /\.(css|scss|sass|less|styl)$/i, type: 'asset/resource' },
  {
    test: /\.(png|jpe?g|gif|svg|webp|avif|woff2?|ttf|eot)$/i,
    type: 'asset/resource',
  },
];

const JS_EXTENSIONS = new Set(['.js', '.mjs', '.cjs']);
const TRACKED_EXPORT_SUBPATHS = ['./bundler'];
const EXCLUDED_PACKAGE_NAMES = new Set(['@changesets/assemble-release-plan']);

async function loadRslib() {
  if (!rslibPromise) {
    rslibPromise = import('@rslib/core');
  }
  return rslibPromise;
}

async function loadWebpack() {
  if (!webpackPromise) {
    webpackPromise = Promise.resolve(require('webpack'));
  }
  return webpackPromise;
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

function resolveExportTarget(pkgDir, target) {
  if (!target) return null;

  if (typeof target === 'string') {
    const resolved = join(pkgDir, target);
    return existsSync(resolved) ? resolved : null;
  }

  if (typeof target !== 'object') {
    return null;
  }

  const preferredKeys = [
    'import',
    'default',
    'module',
    'browser',
    'node',
    'require',
  ];
  for (const key of preferredKeys) {
    if (!(key in target)) continue;
    const resolved = resolveExportTarget(pkgDir, target[key]);
    if (resolved) return resolved;
  }

  for (const value of Object.values(target)) {
    const resolved = resolveExportTarget(pkgDir, value);
    if (resolved) return resolved;
  }

  return null;
}

function findTrackedEntries(pkgDir, pkg) {
  const entries = [];
  const rootEntry = findEsmEntry(pkgDir, pkg);

  if (rootEntry) {
    entries.push({
      id: '.',
      label: 'Package root',
      path: rootEntry,
    });
  }

  if (!pkg?.exports || typeof pkg.exports !== 'object') {
    return entries;
  }

  for (const subpath of TRACKED_EXPORT_SUBPATHS) {
    if (!(subpath in pkg.exports)) continue;

    const resolved = resolveExportTarget(pkgDir, pkg.exports[subpath]);
    if (!resolved) continue;
    if (entries.some((entry) => entry.path === resolved)) continue;

    entries.push({
      id: subpath,
      label: `${subpath} export`,
      path: resolved,
    });
  }

  return entries;
}

function createTempDir(pkgName, target) {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const dir = join(tmpdir(), 'mf-bundle-size', pkgName, target, stamp);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function findBundleOutput(distDir, entryName) {
  if (!existsSync(distDir)) return null;
  const matches = [];
  const stack = [distDir];

  while (stack.length) {
    const dir = stack.pop();
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (entry.name.endsWith('.map') || entry.name.endsWith('.d.ts')) continue;
      const ext = extname(entry.name);
      if (!JS_EXTENSIONS.has(ext)) continue;
      if (!entry.name.startsWith(entryName)) continue;
      matches.push(fullPath);
    }
  }

  if (!matches.length) return null;
  const extOrder = ['.mjs', '.js', '.cjs'];
  matches.sort((a, b) => {
    const aExt = extname(a);
    const bExt = extname(b);
    const aRank = extOrder.indexOf(aExt);
    const bRank = extOrder.indexOf(bExt);
    if (aRank !== bRank) return aRank - bRank;
    return a.length - b.length;
  });

  return matches[0];
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
    const { build } = await loadRslib();
    const entryName = options.entryName || 'bundle';
    const distRoot = createTempDir(
      options.packageName || 'pkg',
      options.target,
    );

    await build(
      {
        lib: [
          {
            id: `${entryName}-${options.target}`,
            format: 'esm',
            bundle: true,
            dts: false,
            syntax: 'es2021',
            autoExternal: true,
          },
        ],
        source: {
          entry: {
            [entryName]: entryPath,
          },
          define: options.define,
        },
        output: {
          target: options.target,
          distPath: {
            root: distRoot,
          },
          cleanDistPath: true,
          minify: true,
          externals: [/^[^./]/],
          externalsType: 'module',
        },
        tools: {
          rspack: (config) => {
            config.module ??= {};
            config.module.rules = [
              ...(config.module.rules || []),
              ...ASSET_RULES,
            ];
          },
        },
      },
      {
        root: ROOT,
      },
    );

    const outputPath = findBundleOutput(distRoot, entryName);
    if (!outputPath) {
      return { bytes: null, gzip: null, error: 'bundle output not found' };
    }

    const bytes = statSync(outputPath).size;
    const gzip = gzipSize(outputPath);
    return { bytes, gzip };
  } catch (error) {
    return {
      bytes: null,
      gzip: null,
      error: error?.message ? error.message : String(error),
    };
  }
}

async function measureEntry(entry, pkgName, pkgDir) {
  const entryGzip = gzipSize(entry.path);
  const [webResult, nodeResult] = await Promise.all([
    bundleEntry(entry.path, {
      target: 'web',
      packageName: pkgName,
      entryName: entry.id === '.' ? 'bundle' : sanitizeEntryId(entry.id),
      define: { ENV_TARGET: JSON.stringify('web') },
    }),
    bundleEntry(entry.path, {
      target: 'node',
      packageName: pkgName,
      entryName: entry.id === '.' ? 'bundle' : sanitizeEntryId(entry.id),
      define: { ENV_TARGET: JSON.stringify('node') },
    }),
  ]);

  const bundleErrors = {};
  if (webResult.error) bundleErrors.web = webResult.error;
  if (nodeResult.error) bundleErrors.node = nodeResult.error;

  return {
    label: entry.label,
    entry: relative(pkgDir, entry.path),
    gzip: entryGzip,
    webBundleBytes: webResult.bytes,
    webBundleGzip: webResult.gzip,
    nodeBundleBytes: nodeResult.bytes,
    nodeBundleGzip: nodeResult.gzip,
    bundleErrors: Object.keys(bundleErrors).length ? bundleErrors : null,
  };
}

function sanitizeEntryId(entryId) {
  return (
    entryId.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'entry'
  );
}

function findPackage(packages, name) {
  return packages.find((pkg) => pkg.name === name) || null;
}

function createScenarioResult(label, data) {
  return {
    label,
    webBytes: data.webBytes ?? null,
    webGzip: data.webGzip ?? null,
    nodeBytes: data.nodeBytes ?? null,
    nodeGzip: data.nodeGzip ?? null,
    details: data.details ?? null,
    errors: data.errors ?? null,
  };
}

async function runWebpackBuild(config) {
  const webpack = await loadWebpack();
  const compiler = webpack(config);

  return new Promise((resolveBuild, rejectBuild) => {
    compiler.run((error, stats) => {
      const done = (closeError) => {
        if (error) {
          rejectBuild(error);
          return;
        }
        if (closeError) {
          rejectBuild(closeError);
          return;
        }
        if (!stats) {
          rejectBuild(new Error('webpack returned no stats'));
          return;
        }
        if (stats.hasErrors()) {
          rejectBuild(
            new Error(
              stats.toString({
                all: false,
                errors: true,
                errorDetails: true,
              }),
            ),
          );
          return;
        }
        resolveBuild(stats);
      };

      if (typeof compiler.close === 'function') {
        compiler.close(done);
      } else {
        done();
      }
    });
  });
}

async function measureEnhancedRemoteScenario(packagesDir, packages) {
  const enhancedPkg = findPackage(packages, '@module-federation/enhanced');
  if (!enhancedPkg) {
    return createScenarioResult('Enhanced remoteEntry', {
      errors: { scenario: 'package not found' },
    });
  }

  const enhancedEntry = join(enhancedPkg.dir, 'dist/src/index.js');
  if (!existsSync(enhancedEntry)) {
    return createScenarioResult('Enhanced remoteEntry', {
      errors: { scenario: 'built enhanced entry not found' },
    });
  }

  const { ModuleFederationPlugin } = require(enhancedEntry);
  const scenarioRoot = createTempDir('scenario-enhanced-remote', 'matrix');
  const entryPath = join(scenarioRoot, 'index.js');
  const exposePath = join(scenarioRoot, 'noop.js');
  writeFileSync(entryPath, 'module.exports = 1;\n', 'utf8');
  writeFileSync(exposePath, 'module.exports = () => "noop";\n', 'utf8');

  const buildTarget = async ({
    optimizationTarget,
    disableSnapshot,
    suffix,
  }) => {
    const outputPath = join(scenarioRoot, `dist-${suffix}`);
    mkdirSync(outputPath, { recursive: true });
    const filename = `remoteEntry-${suffix}.js`;

    await runWebpackBuild({
      mode: 'production',
      context: scenarioRoot,
      entry: './index.js',
      target: 'async-node',
      infrastructureLogging: { level: 'error' },
      stats: 'errors-only',
      output: {
        path: outputPath,
        filename: '[name].js',
        chunkFilename: '[name].js',
        publicPath: '/',
        uniqueName: `bundle-size-enhanced-${suffix}`,
        clean: true,
      },
      optimization: {
        minimize: true,
        chunkIds: 'named',
        moduleIds: 'named',
      },
      plugins: [
        new ModuleFederationPlugin({
          name: `bundle_size_${suffix}`,
          filename,
          library: {
            type: 'commonjs-module',
            name: `bundle_size_${suffix}`,
          },
          exposes: {
            './noop': './noop.js',
          },
          remotes: {
            remote: 'remote@http://localhost:3001/remoteEntry.js',
          },
          manifest: false,
          experiments: {
            optimization: {
              target: optimizationTarget,
              disableSnapshot,
            },
          },
        }),
      ],
    });

    const outputFile = join(outputPath, filename);
    return {
      bytes: statSync(outputFile).size,
      gzip: gzipSize(outputFile),
      file: outputFile,
    };
  };

  try {
    const [webResult, nodeResult] = await Promise.all([
      buildTarget({
        optimizationTarget: 'web',
        disableSnapshot: true,
        suffix: 'web',
      }),
      buildTarget({
        optimizationTarget: 'node',
        disableSnapshot: false,
        suffix: 'node',
      }),
    ]);

    return createScenarioResult('Enhanced remoteEntry', {
      webBytes: webResult.bytes,
      webGzip: webResult.gzip,
      nodeBytes: nodeResult.bytes,
      nodeGzip: nodeResult.gzip,
      details: {
        webFile: relative(ROOT, webResult.file),
        nodeFile: relative(ROOT, nodeResult.file),
        packagesDir: relative(ROOT, packagesDir),
      },
    });
  } catch (error) {
    return createScenarioResult('Enhanced remoteEntry', {
      errors: {
        scenario: error?.message ? error.message : String(error),
      },
    });
  }
}

async function measureScenarios(packagesDir, packages) {
  const scenarios = {};
  scenarios.enhancedRemoteEntry = await measureEnhancedRemoteScenario(
    packagesDir,
    packages,
  );
  return scenarios;
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
        if (EXCLUDED_PACKAGE_NAMES.has(packageJson.name)) continue;
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

async function measure(packagesDir) {
  const packages = discoverPackages(packagesDir);
  const results = {};

  for (const pkg of packages) {
    const pkgJson = readPackageJson(pkg.dir);
    const distDir = join(pkg.dir, 'dist');
    const totalSize = dirSize(distDir);
    const measuredEntries = findTrackedEntries(pkg.dir, pkgJson);
    const entrypoints = {};

    for (const entry of measuredEntries) {
      entrypoints[entry.id] = await measureEntry(entry, pkg.name, pkg.dir);
    }

    const rootMetrics = entrypoints['.'] || {
      entry: null,
      gzip: 0,
      webBundleBytes: null,
      webBundleGzip: null,
      nodeBundleBytes: null,
      nodeBundleGzip: null,
      bundleErrors: null,
    };

    results[pkg.name] = {
      totalDist: totalSize,
      esmGzip: rootMetrics.gzip,
      esmEntry: rootMetrics.entry,
      webBundleBytes: rootMetrics.webBundleBytes,
      webBundleGzip: rootMetrics.webBundleGzip,
      nodeBundleBytes: rootMetrics.nodeBundleBytes,
      nodeBundleGzip: rootMetrics.nodeBundleGzip,
      bundleEntry: rootMetrics.entry,
      bundleErrors: rootMetrics.bundleErrors,
      entrypoints,
    };
  }

  return {
    packages: results,
    scenarios: await measureScenarios(packagesDir, packages),
  };
}

// ── Compare ──────────────────────────────────────────────────────────────────

function normalizeMeasuredData(data) {
  if (
    data &&
    typeof data === 'object' &&
    'packages' in data &&
    'scenarios' in data
  ) {
    return {
      packages: data.packages || {},
      scenarios: data.scenarios || {},
    };
  }

  return {
    packages: data || {},
    scenarios: {},
  };
}

function compare(baseData, currentData) {
  const normalizedBase = normalizeMeasuredData(baseData);
  const normalizedCurrent = normalizeMeasuredData(currentData);
  const basePackages = normalizedBase.packages;
  const currentPackages = normalizedCurrent.packages;
  const baseScenarios = normalizedBase.scenarios;
  const currentScenarios = normalizedCurrent.scenarios;
  const allPackages = new Set([
    ...Object.keys(basePackages),
    ...Object.keys(currentPackages),
  ]);
  let unchangedCount = 0;
  const emptyPackageMetrics = {
    totalDist: 0,
    esmGzip: 0,
    webBundleGzip: 0,
    nodeBundleGzip: 0,
  };

  const distMetrics = [
    { key: 'totalDist', label: 'Total dist (raw)' },
    { key: 'esmGzip', label: 'ESM gzip' },
  ];

  const bundleMetrics = [
    { key: 'webBundleGzip', label: 'Web bundle (gzip)' },
    { key: 'nodeBundleGzip', label: 'Node bundle (gzip)' },
  ];

  const allMetrics = [...distMetrics, ...bundleMetrics];
  const changedRootRows = [];
  const changedEntrypointRows = [];
  const changedPackages = new Set();

  const hasMetricChange = (base, current, metrics) =>
    metrics.some(({ key }) => {
      const baseValue = base?.[key];
      const currentValue = current?.[key];
      if (typeof baseValue === 'number' && typeof currentValue === 'number') {
        return baseValue !== currentValue;
      }
      return typeof baseValue === 'number' || typeof currentValue === 'number';
    });

  const getEntrypoints = (pkg) => {
    const entrypoints = { ...(pkg?.entrypoints || {}) };
    if (!entrypoints['.']) {
      entrypoints['.'] = {
        label: 'Package root',
        entry: pkg?.bundleEntry ?? pkg?.esmEntry ?? null,
        gzip: pkg?.esmGzip ?? 0,
        webBundleBytes: pkg?.webBundleBytes ?? null,
        webBundleGzip: pkg?.webBundleGzip ?? null,
        nodeBundleBytes: pkg?.nodeBundleBytes ?? null,
        nodeBundleGzip: pkg?.nodeBundleGzip ?? null,
        bundleErrors: pkg?.bundleErrors ?? null,
      };
    }
    return entrypoints;
  };

  for (const name of [...allPackages].sort()) {
    const base = basePackages[name] || emptyPackageMetrics;
    const current = currentPackages[name] || emptyPackageMetrics;
    const baseEntrypoints = getEntrypoints(base);
    const currentEntrypoints = getEntrypoints(current);

    if (hasMetricChange(base, current, allMetrics)) {
      changedRootRows.push({ name, base, current });
      changedPackages.add(name);
    }

    const trackedEntrypoints = new Set([
      ...Object.keys(baseEntrypoints),
      ...Object.keys(currentEntrypoints),
    ]);
    trackedEntrypoints.delete('.');

    for (const entryId of [...trackedEntrypoints].sort()) {
      const baseEntry = baseEntrypoints[entryId] || {};
      const currentEntry = currentEntrypoints[entryId] || {};
      const entryMetrics = [
        { key: 'gzip' },
        { key: 'webBundleGzip' },
        { key: 'nodeBundleGzip' },
      ];

      if (!hasMetricChange(baseEntry, currentEntry, entryMetrics)) {
        continue;
      }

      changedEntrypointRows.push({
        name,
        entryId,
        base: baseEntry,
        current: currentEntry,
      });
      changedPackages.add(name);
    }
  }

  const changed = [...changedPackages].sort();
  unchangedCount = allPackages.size - changed.length;

  const sumMetric = (data, key) =>
    Object.values(data).reduce((sum, item) => {
      const value = item?.[key];
      return typeof value === 'number' ? sum + value : sum;
    }, 0);

  const sumEntrypointMetric = (data, entryId, key) =>
    Object.values(data).reduce((sum, item) => {
      const value = item?.entrypoints?.[entryId]?.[key];
      return typeof value === 'number' ? sum + value : sum;
    }, 0);

  const totalDistBase = sumMetric(basePackages, 'totalDist');
  const totalDistCurrent = sumMetric(currentPackages, 'totalDist');
  const totalEsmBase = sumMetric(basePackages, 'esmGzip');
  const totalEsmCurrent = sumMetric(currentPackages, 'esmGzip');
  const totalWebBase = sumMetric(basePackages, 'webBundleGzip');
  const totalWebCurrent = sumMetric(currentPackages, 'webBundleGzip');
  const totalNodeBase = sumMetric(basePackages, 'nodeBundleGzip');
  const totalNodeCurrent = sumMetric(currentPackages, 'nodeBundleGzip');
  const totalBundlerEntryBase = sumEntrypointMetric(
    basePackages,
    './bundler',
    'gzip',
  );
  const totalBundlerEntryCurrent = sumEntrypointMetric(
    currentPackages,
    './bundler',
    'gzip',
  );
  const totalBundlerWebBase = sumEntrypointMetric(
    basePackages,
    './bundler',
    'webBundleGzip',
  );
  const totalBundlerWebCurrent = sumEntrypointMetric(
    currentPackages,
    './bundler',
    'webBundleGzip',
  );
  const totalBundlerNodeBase = sumEntrypointMetric(
    basePackages,
    './bundler',
    'nodeBundleGzip',
  );
  const totalBundlerNodeCurrent = sumEntrypointMetric(
    currentPackages,
    './bundler',
    'nodeBundleGzip',
  );

  const buildTable = (title, metrics, rowsData) => {
    if (rowsData.length === 0) return [];
    const rows = [];
    rows.push(`### ${title}`);
    rows.push('');

    const headers = ['Package'];
    for (const metric of metrics) {
      headers.push(metric.label, 'Delta');
    }
    rows.push(`| ${headers.join(' | ')} |`);
    rows.push(`| ${headers.map(() => '---').join(' | ')} |`);

    for (const { name, base, current } of rowsData) {
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

  const formatSignedBytes = (bytes) => {
    if (typeof bytes !== 'number' || bytes === 0) return '0 B';
    return `${bytes > 0 ? '+' : '-'}${formatBytes(Math.abs(bytes))}`;
  };

  const buildEntrypointTable = () => {
    if (changedEntrypointRows.length === 0) return [];

    const rows = [];
    rows.push('### Tree-shakable entrypoints');
    rows.push('');
    rows.push(
      '| Package | Export | Entry gzip | Delta | Web bundle (gzip) | Delta | Node bundle (gzip) | Delta | Gap (node-web) | Delta |',
    );
    rows.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');

    for (const { name, entryId, base, current } of changedEntrypointRows) {
      const currentGap =
        typeof current.nodeBundleGzip === 'number' &&
        typeof current.webBundleGzip === 'number'
          ? current.nodeBundleGzip - current.webBundleGzip
          : null;
      const baseGap =
        typeof base.nodeBundleGzip === 'number' &&
        typeof base.webBundleGzip === 'number'
          ? base.nodeBundleGzip - base.webBundleGzip
          : null;

      rows.push(
        [
          `\`${name}\``,
          `\`${entryId}\``,
          formatMaybe(current.gzip),
          formatDeltaMaybe(current.gzip, base.gzip),
          formatMaybe(current.webBundleGzip),
          formatDeltaMaybe(current.webBundleGzip, base.webBundleGzip),
          formatMaybe(current.nodeBundleGzip),
          formatDeltaMaybe(current.nodeBundleGzip, base.nodeBundleGzip),
          currentGap === null ? 'n/a' : formatSignedBytes(currentGap),
          currentGap === null || baseGap === null
            ? 'n/a'
            : formatSignedBytes(currentGap - baseGap),
        ].join(' | '),
      );
      rows[rows.length - 1] = `| ${rows[rows.length - 1]} |`;
    }

    rows.push('');
    return rows;
  };

  const buildScenarioTable = () => {
    const scenarioNames = new Set([
      ...Object.keys(baseScenarios),
      ...Object.keys(currentScenarios),
    ]);
    if (scenarioNames.size === 0) return [];

    const rows = [];
    rows.push('### Consumer scenarios');
    rows.push('');
    rows.push(
      '| Scenario | Web output (gzip) | Delta | Node output (gzip) | Delta | Gap (node-web) | Delta |',
    );
    rows.push('| --- | --- | --- | --- | --- | --- | --- |');

    for (const name of [...scenarioNames].sort()) {
      const base = baseScenarios[name] || {};
      const current = currentScenarios[name] || {};
      const currentGap =
        typeof current.nodeGzip === 'number' &&
        typeof current.webGzip === 'number'
          ? current.nodeGzip - current.webGzip
          : null;
      const baseGap =
        typeof base.nodeGzip === 'number' && typeof base.webGzip === 'number'
          ? base.nodeGzip - base.webGzip
          : null;

      rows.push(
        `| ${current.label || base.label || `\`${name}\``} | ${formatMaybe(current.webGzip)} | ${formatDeltaMaybe(current.webGzip, base.webGzip)} | ${formatMaybe(current.nodeGzip)} | ${formatDeltaMaybe(current.nodeGzip, base.nodeGzip)} | ${currentGap === null ? 'n/a' : formatSignedBytes(currentGap)} | ${currentGap === null || baseGap === null ? 'n/a' : formatSignedBytes(currentGap - baseGap)} |`,
      );
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

  lines.push(
    ...buildTable('Package dist + ESM entry', distMetrics, changedRootRows),
  );
  lines.push(...buildTable('Bundle targets', bundleMetrics, changedRootRows));
  lines.push(...buildEntrypointTable());
  lines.push(...buildScenarioTable());

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
  if (
    totalBundlerEntryBase > 0 ||
    totalBundlerEntryCurrent > 0 ||
    totalBundlerWebBase > 0 ||
    totalBundlerWebCurrent > 0 ||
    totalBundlerNodeBase > 0 ||
    totalBundlerNodeCurrent > 0
  ) {
    lines.push(
      `**Tracked ./bundler entry gzip:** ${formatBytes(totalBundlerEntryCurrent)} (${formatDelta(totalBundlerEntryCurrent, totalBundlerEntryBase)})`,
    );
    lines.push(
      `**Tracked ./bundler web bundle (gzip):** ${formatBytes(totalBundlerWebCurrent)} (${formatDelta(totalBundlerWebCurrent, totalBundlerWebBase)})`,
    );
    lines.push(
      `**Tracked ./bundler node bundle (gzip):** ${formatBytes(totalBundlerNodeCurrent)} (${formatDelta(totalBundlerNodeCurrent, totalBundlerNodeBase)})`,
    );
  }
  lines.push('');
  lines.push(
    '_Bundle sizes are generated with rslib (Rspack). Package-root metrics preserve the historical report. Tracked subpath exports such as `./bundler` are measured separately so ENV_TARGET-driven tree-shaking is visible. Bare imports are externalized to keep package-level sizes consistent, and assets are emitted as resources._',
  );
  lines.push('');

  const errored = [];
  for (const [name, data] of Object.entries(currentPackages)) {
    const entrypoints = getEntrypoints(data);
    for (const [entryId, entry] of Object.entries(entrypoints)) {
      if (!entry?.bundleErrors) continue;
      errored.push({
        name,
        entryId,
        bundleErrors: entry.bundleErrors,
      });
    }
  }

  if (errored.length) {
    lines.push('### Bundle errors');
    for (const item of errored) {
      const parts = Object.entries(item.bundleErrors).map(
        ([target, error]) => `${target}: ${error}`,
      );
      const entryLabel = item.entryId === '.' ? '' : ` ${item.entryId}`;
      lines.push(`- \`${item.name}${entryLabel}\`: ${parts.join('; ')}`);
    }
    lines.push('');
  }

  const erroredScenarios = Object.values(currentScenarios).filter(
    (scenario) => scenario?.errors,
  );
  if (erroredScenarios.length) {
    lines.push('### Scenario errors');
    for (const scenario of erroredScenarios) {
      const parts = Object.entries(scenario.errors).map(
        ([target, error]) => `${target}: ${error}`,
      );
      lines.push(`- ${scenario.label || 'Scenario'}: ${parts.join('; ')}`);
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
    const packageCount = Object.keys(results.packages).length;

    writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`Measured ${packageCount} packages → ${outputPath}`);

    // Print summary
    let totalDist = 0;
    let totalEsm = 0;
    let totalWeb = 0;
    let totalNode = 0;
    for (const [name, data] of Object.entries(results.packages)) {
      totalDist += data.totalDist;
      totalEsm += data.esmGzip;
      if (typeof data.webBundleGzip === 'number')
        totalWeb += data.webBundleGzip;
      if (typeof data.nodeBundleGzip === 'number')
        totalNode += data.nodeBundleGzip;
      const bundleErrorNote = data.bundleErrors
        ? ` (bundle errors: ${Object.keys(data.bundleErrors).join(', ')})`
        : '';
      console.log(
        `  ${name}: dist=${formatBytes(data.totalDist)}, esm-gzip=${formatBytes(data.esmGzip)}, web-gzip=${formatMaybe(data.webBundleGzip)}, node-gzip=${formatMaybe(data.nodeBundleGzip)}${bundleErrorNote}`,
      );
      for (const [entryId, entry] of Object.entries(data.entrypoints || {})) {
        if (entryId === '.') continue;
        const entryBundleErrorNote = entry.bundleErrors
          ? ` (bundle errors: ${Object.keys(entry.bundleErrors).join(', ')})`
          : '';
        console.log(
          `    ${entryId}: entry-gzip=${formatMaybe(entry.gzip)}, web-gzip=${formatMaybe(entry.webBundleGzip)}, node-gzip=${formatMaybe(entry.nodeBundleGzip)}${entryBundleErrorNote}`,
        );
      }
    }
    for (const scenario of Object.values(results.scenarios || {})) {
      const scenarioErrorNote = scenario.errors
        ? ` (errors: ${Object.keys(scenario.errors).join(', ')})`
        : '';
      console.log(
        `  scenario ${scenario.label}: web-gzip=${formatMaybe(scenario.webGzip)}, node-gzip=${formatMaybe(scenario.nodeGzip)}${scenarioErrorNote}`,
      );
    }
    console.log(
      `Total dist: ${formatBytes(totalDist)}, Total ESM gzip: ${formatBytes(totalEsm)}, Total web gzip: ${formatBytes(totalWeb)}, Total node gzip: ${formatBytes(totalNode)}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
