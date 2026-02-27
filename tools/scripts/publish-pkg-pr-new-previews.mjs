#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const PACKAGES_ROOT = join(ROOT, 'packages');
const SCOPE_PREFIX = '@module-federation/';
const ADDITIONAL_PACKAGE_NAMES = new Set(['create-module-federation']);
const SKIP_DIR_NAMES = new Set(['dist', 'node_modules', '.git', '.nx']);
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];
const MAX_ATTEMPTS = 3;
const BASE_DELAY_SECONDS = 10;
const PUBLISH_TIMEOUT_MS = 12 * 60 * 1000;
const PUBLISH_BUFFER_BYTES = 10 * 1024 * 1024;

try {
  main();
} catch (error) {
  console.error(`[pkg-pr-new] ${error.message}`);
  process.exit(1);
}

function main() {
  process.chdir(ROOT);
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const { orderedNames, orderedPaths } = resolvePackageSelection();

  if (args.json) {
    process.stdout.write(
      `${JSON.stringify({ names: orderedNames, paths: orderedPaths }, null, 2)}\n`,
    );
    return;
  }

  if (orderedPaths.length === 0) {
    console.log('No eligible packages found to publish.');
    return;
  }

  if (args.dryRun) {
    console.log(
      `[pkg-pr-new] Dry run: resolved ${orderedPaths.length} package path(s).`,
    );
    for (const packagePath of orderedPaths) {
      console.log(`- ${packagePath}`);
    }
    return;
  }

  console.log(
    `[pkg-pr-new] Publishing previews for ${orderedPaths.length} package(s).`,
  );
  const exitCode = publishPkgPrNewPreviews(orderedPaths);
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}

function parseArgs(rawArgs) {
  const args = {
    dryRun: false,
    help: false,
    json: false,
  };

  for (const arg of rawArgs) {
    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (arg === '--json') {
      args.json = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }
    throw new Error(
      `[pkg-pr-new] Unknown argument "${arg}". Use --help to see supported options.`,
    );
  }

  return args;
}

function printHelp() {
  console.log(
    'Usage: node tools/scripts/publish-pkg-pr-new-previews.mjs [options]',
  );
  console.log('');
  console.log('Options:');
  console.log(
    '  --dry-run    Resolve package paths and print them without publishing',
  );
  console.log('  --json       Resolve package names/paths and print JSON');
  console.log('  --help       Show this help message');
}

function resolvePackageSelection() {
  const packageMetaByName = new Map();
  walkPackages(PACKAGES_ROOT, packageMetaByName);

  if (packageMetaByName.size === 0) {
    return { orderedNames: [], orderedPaths: [] };
  }

  for (const meta of packageMetaByName.values()) {
    const internalDeps = new Set();
    for (const field of DEPENDENCY_FIELDS) {
      const deps = meta.pkg[field];
      if (!deps || typeof deps !== 'object') {
        continue;
      }
      for (const depName of Object.keys(deps)) {
        if (packageMetaByName.has(depName)) {
          internalDeps.add(depName);
        }
      }
    }
    meta.internalDeps = internalDeps;
  }

  const indegreeByName = new Map();
  const dependentsByName = new Map();
  for (const [name, meta] of packageMetaByName) {
    indegreeByName.set(name, meta.internalDeps.size);
    dependentsByName.set(name, new Set());
  }

  for (const [name, meta] of packageMetaByName) {
    for (const depName of meta.internalDeps) {
      dependentsByName.get(depName).add(name);
    }
  }

  const queue = Array.from(indegreeByName.entries())
    .filter(([, degree]) => degree === 0)
    .map(([name]) => name)
    .sort();
  const orderedNames = [];

  while (queue.length > 0) {
    const current = queue.shift();
    orderedNames.push(current);
    const dependents = Array.from(dependentsByName.get(current) || []).sort();
    for (const dependent of dependents) {
      const nextDegree = (indegreeByName.get(dependent) || 0) - 1;
      indegreeByName.set(dependent, nextDegree);
      if (nextDegree === 0) {
        queue.push(dependent);
      }
    }
    queue.sort();
  }

  if (orderedNames.length !== packageMetaByName.size) {
    const remaining = Array.from(packageMetaByName.keys())
      .filter((name) => !orderedNames.includes(name))
      .sort((a, b) =>
        packageMetaByName
          .get(a)
          .path.localeCompare(packageMetaByName.get(b).path),
      );
    orderedNames.push(...remaining);
  }

  const orderedPaths = orderedNames.map(
    (name) => packageMetaByName.get(name).path,
  );
  return { orderedNames, orderedPaths };
}

function walkPackages(dir, packageMetaByName) {
  if (!existsSync(dir)) {
    return;
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) {
        continue;
      }
      walkPackages(fullPath, packageMetaByName);
      continue;
    }

    if (!entry.isFile() || entry.name !== 'package.json') {
      continue;
    }

    const packagePath = relative(ROOT, dir);
    const pkg = JSON.parse(readFileSync(fullPath, 'utf8'));
    const packageName = pkg.name;
    if (
      typeof packageName !== 'string' ||
      (!packageName.startsWith(SCOPE_PREFIX) &&
        !ADDITIONAL_PACKAGE_NAMES.has(packageName))
    ) {
      continue;
    }

    const existing = packageMetaByName.get(packageName);
    if (!existing || packagePath.length < existing.path.length) {
      packageMetaByName.set(packageName, { path: packagePath, pkg });
    }
  }
}

function publishPkgPrNewPreviews(paths) {
  const args = [
    'dlx',
    'pkg-pr-new',
    'publish',
    '--pnpm',
    '--packageManager=pnpm',
    '--comment=update',
    '--commentWithSha',
    ...paths,
  ];

  let lastStatus = 1;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    if (attempt > 1) {
      console.warn(
        `[pkg-pr-new] Retrying publish (attempt ${attempt}/${MAX_ATTEMPTS})...`,
      );
    }

    const result = spawnSync('pnpm', args, {
      encoding: 'utf8',
      timeout: PUBLISH_TIMEOUT_MS,
      maxBuffer: PUBLISH_BUFFER_BYTES,
    });

    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }

    if (result.status === 0) {
      return 0;
    }

    const commandError = result.error;
    const combinedOutput = `${result.stdout || ''}\n${result.stderr || ''}\n${
      commandError?.message || ''
    }`;
    if (
      combinedOutput.includes(
        'https://github.com/apps/pkg-pr-new is not installed',
      )
    ) {
      console.log(
        '[pkg-pr-new] App is not installed on this repository; skipping preview publish.',
      );
      return 0;
    }

    lastStatus = result.status || 1;
    const timedOut = commandError?.code === 'ETIMEDOUT';
    const shouldRetry =
      attempt < MAX_ATTEMPTS &&
      (timedOut || isRetriablePkgPrFailure(combinedOutput));
    if (!shouldRetry) {
      if (commandError) {
        console.error(
          `[pkg-pr-new] Publish failed to execute: ${commandError.message}`,
        );
      }
      return lastStatus;
    }

    const delaySeconds = BASE_DELAY_SECONDS * 2 ** (attempt - 1);
    console.warn(
      `[pkg-pr-new] Publish failed with ${
        timedOut ? 'timeout' : 'retriable error'
      }. Waiting ${delaySeconds}s before retry...`,
    );
    spawnSync('bash', ['-lc', `sleep ${delaySeconds}`], { stdio: 'inherit' });
  }

  return lastStatus;
}

function isRetriablePkgPrFailure(output) {
  return (
    /Publishing failed \((5\d\d|429)\)/.test(output) ||
    /Cloudflare|Internal Server Error|Bad Gateway|Gateway Timeout/.test(output)
  );
}
