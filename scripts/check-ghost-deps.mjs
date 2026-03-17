#!/usr/bin/env node
/**
 * check-ghost-deps.mjs
 *
 * Scans import/require statements in src/ directories under packages/*,
 * identifying third-party dependencies not declared in package.json (ghost dependencies).
 *
 * Usage:
 *   node scripts/check-ghost-deps.mjs          # Detect and report errors
 *   node scripts/check-ghost-deps.mjs --fix    # Print fix suggestions (pnpm add commands)
 */

import fs from 'node:fs';
import path from 'node:path';

const FIX_MODE = process.argv.includes('--fix');
const ROOT = path.resolve(import.meta.dirname, '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');

// Node.js built-in module prefixes
const NODE_BUILTINS = new Set([
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'diagnostics_channel',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
]);

// Workspace internal package prefixes (not ghost dependencies)
const WORKSPACE_PREFIXES = ['@module-federation/'];

// Virtual module / alias prefixes (skip)
const VIRTUAL_PREFIXES = [
  'virtual:',
  '\0',
  '@/',
  '~/',
  'mf:',
  'REMOTE_ALIAS_IDENTIFIER',
];

// Known virtual specifiers (exact match, skip)
const VIRTUAL_EXACT = new Set([
  'federation-host',
  'federationShare',
  'ignored-modules',
  // Test mocks / internal aliases (not real npm packages)
  'foo',
  'ui-lib',
  'REMOTE_ALIAS_IDENTIFIER',
]);

/**
 * Determine if a specifier should be skipped
 */
function shouldSkip(spec) {
  if (!spec) return true;
  if (spec.startsWith('.') || spec.startsWith('/')) return true; // relative/absolute paths
  if (spec.startsWith('node:')) return true; // node: protocol
  // Template string interpolation leftovers (e.g. `${foo}/bar`)
  if (spec.includes('${')) return true;
  // All-uppercase identifiers (macros/constants, not package names)
  if (/^[A-Z_]+$/.test(spec)) return true;
  const bare = spec.split('/')[0];
  if (NODE_BUILTINS.has(bare)) return true;
  if (WORKSPACE_PREFIXES.some((p) => spec.startsWith(p))) return true;
  if (VIRTUAL_PREFIXES.some((p) => spec.startsWith(p))) return true;
  if (VIRTUAL_EXACT.has(spec)) return true;
  return false;
}

/**
 * Extract package name from specifier (handles @scope/pkg and regular pkg)
 */
function extractPkgName(spec) {
  if (spec.startsWith('@')) {
    const parts = spec.split('/');
    return parts.slice(0, 2).join('/');
  }
  return spec.split('/')[0];
}

/**
 * Recursively traverse directory, returning all files matching given extensions
 */
function walkDir(dir, exts) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full, exts));
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Extract all import/require specifiers from file content (using regex, not full AST)
 */
function extractSpecifiers(content) {
  const specs = new Set();
  // static import/export: import ... from 'xxx' / export ... from 'xxx'
  for (const m of content.matchAll(
    /(?:import|export)\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g,
  )) {
    specs.add(m[1]);
  }
  // dynamic import: import('xxx')
  for (const m of content.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    specs.add(m[1]);
  }
  // require('xxx')
  for (const m of content.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    specs.add(m[1]);
  }
  return specs;
}

// ---- Main logic ----

let hasError = false;
const errorSummary = []; // { pkgName, pkgDir, missing: Set<string> }

const pkgDirs = fs
  .readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => path.join(PACKAGES_DIR, e.name));

for (const pkgDir of pkgDirs) {
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) continue;

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const pkgName = pkgJson.name ?? path.basename(pkgDir);

  const declared = new Set([
    ...Object.keys(pkgJson.dependencies ?? {}),
    ...Object.keys(pkgJson.devDependencies ?? {}),
    ...Object.keys(pkgJson.peerDependencies ?? {}),
    ...Object.keys(pkgJson.optionalDependencies ?? {}),
  ]);

  // Scan src/ directory (some packages may have lib/ or root directory, also scan one level as fallback)
  const srcDir = path.join(pkgDir, 'src');
  const files = walkDir(srcDir, ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

  const missing = new Set();

  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const spec of extractSpecifiers(content)) {
      if (shouldSkip(spec)) continue;
      const pkg = extractPkgName(spec);
      if (!declared.has(pkg)) {
        missing.add(pkg);
      }
    }
  }

  if (missing.size > 0) {
    hasError = true;
    errorSummary.push({ pkgName, pkgDir, missing });
    console.error(
      `\n❌ [${pkgName}] Found ghost dependencies (${missing.size} total):`,
    );
    for (const dep of [...missing].sort()) {
      console.error(`   - ${dep}`);
    }
    if (FIX_MODE) {
      const deps = [...missing].sort().join(' ');
      console.log(`\n   💡 Fix suggestion:`);
      console.log(`   pnpm --filter ${pkgName} add ${deps}`);
    }
  }
}

if (hasError) {
  console.error(
    `\n\n💥 Ghost dependencies detected! Please add declarations to the corresponding package.json files.`,
  );
  if (!FIX_MODE) {
    console.error(
      `   Tip: Run node scripts/check-ghost-deps.mjs --fix to see fix suggestions`,
    );
  }
  process.exit(1);
} else {
  console.log(
    '✅ No ghost dependencies found. All package dependencies are properly declared.',
  );
}
