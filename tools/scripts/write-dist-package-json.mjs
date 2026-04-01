#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function usageAndExit(code = 1) {
  // Keep output minimal: this script is invoked from build pipelines.
  // eslint-disable-next-line no-console
  console.error(
    'Usage: node tools/scripts/write-dist-package-json.mjs --source <package.json> --out <dist/package.json>',
  );
  process.exit(code);
}

function parseArgs(argv) {
  const args = {
    source: null,
    out: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--source') {
      args.source = argv[++i] ?? null;
      continue;
    }
    if (a === '--out') {
      args.out = argv[++i] ?? null;
      continue;
    }
    if (a === '-h' || a === '--help') {
      usageAndExit(0);
    }
  }
  return args;
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function findRepoRoot(fromDir) {
  let cur = path.resolve(fromDir);
  while (true) {
    const marker = path.join(cur, 'pnpm-workspace.yaml');
    if (await fileExists(marker)) return cur;

    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  throw new Error(
    `Cannot locate repo root (pnpm-workspace.yaml) from: ${fromDir}`,
  );
}

function shouldIgnoreDir(name) {
  return (
    name === 'node_modules' ||
    name === '.git' ||
    name === 'dist' ||
    name === 'build' ||
    name === 'coverage' ||
    name === '.turbo' ||
    name === '.next' ||
    name === 'out'
  );
}

async function* walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (shouldIgnoreDir(e.name)) continue;
      yield* walkDir(full);
      continue;
    }
    if (e.isFile()) yield full;
  }
}

async function buildWorkspaceVersionMap(repoRoot) {
  /** @type {Map<string, string>} */
  const map = new Map();

  for await (const p of walkDir(repoRoot)) {
    if (!p.endsWith('package.json')) continue;
    // Avoid common false positives in large repos.
    if (p.includes(`${path.sep}node_modules${path.sep}`)) continue;
    if (p.includes(`${path.sep}dist${path.sep}`)) continue;
    if (p.includes(`${path.sep}.git${path.sep}`)) continue;

    let json;
    try {
      json = JSON.parse(await fs.readFile(p, 'utf8'));
    } catch {
      continue;
    }

    if (!json || typeof json !== 'object') continue;
    const name = json.name;
    const version = json.version;
    if (typeof name !== 'string' || typeof version !== 'string') continue;

    // First-win to avoid edge cases where multiple package.json share names.
    if (!map.has(name)) map.set(name, version);
  }

  return map;
}

function resolveWorkspaceRange(range, depName, versionMap) {
  const spec = range.slice('workspace:'.length);

  const depVersion = versionMap.get(depName);
  if (!depVersion) {
    throw new Error(
      `Cannot resolve workspace dependency version for ${depName} (${range}). ` +
        'Ensure the dependency is a workspace package with a version field.',
    );
  }

  // pnpm semantics:
  // - workspace:*  => exact version
  // - workspace:^  => ^<exact version>
  // - workspace:~  => ~<exact version>
  // - workspace:<range> => <range> (strip protocol)
  if (spec === '*' || spec === '') return depVersion;
  if (spec === '^') return `^${depVersion}`;
  if (spec === '~') return `~${depVersion}`;

  return spec;
}

function rewriteWorkspaceDeps(pkgJson, versionMap) {
  const depFields = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ];

  for (const field of depFields) {
    const deps = pkgJson[field];
    if (!deps || typeof deps !== 'object') continue;

    for (const [dep, range] of Object.entries(deps)) {
      if (typeof range !== 'string') continue;
      if (!range.startsWith('workspace:')) continue;
      deps[dep] = resolveWorkspaceRange(range, dep, versionMap);
    }
  }
}

async function main() {
  const { source, out } = parseArgs(process.argv.slice(2));
  if (!source || !out) usageAndExit(1);

  const cwd = process.cwd();
  const repoRoot = await findRepoRoot(cwd);
  const versionMap = await buildWorkspaceVersionMap(repoRoot);

  const sourcePath = path.resolve(cwd, source);
  const outPath = path.resolve(cwd, out);

  const pkgJson = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
  rewriteWorkspaceDeps(pkgJson, versionMap);

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(pkgJson, null, 2)}\n`, 'utf8');
}

await main();
