import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yargs from 'yargs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');

const argv = yargs(process.argv.slice(2))
  .option('appName', {
    type: 'string',
    demandOption: true,
  })
  .option('base', {
    type: 'string',
  })
  .option('head', {
    type: 'string',
  })
  .strict(false)
  .parseSync();

const appNames = argv.appName
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

if (appNames.length === 0) {
  console.log('No valid app names were provided.');
  process.exit(1);
}

const base = resolveBase(argv.base);
const head = resolveHead(argv.head);

if (!base || !head) {
  console.warn(
    `Unable to resolve a valid base/head commit (base=${base}, head=${head}). Running e2e by default.`,
  );
  process.exit(0);
}

if (base === head) {
  console.warn(
    `Resolved base and head are identical (${base}). Running e2e by default.`,
  );
  process.exit(0);
}

const projectGraph = loadProjectGraph();
let changedFiles = [];
try {
  changedFiles = execSync(`git diff --name-only ${base} ${head}`, {
    cwd: ROOT,
    encoding: 'utf-8',
  })
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
} catch (error) {
  console.warn(
    `Failed to evaluate changed files for base=${base} head=${head}. Running e2e by default.`,
  );
  if (error instanceof Error) {
    console.warn(error.message);
  }
  process.exit(0);
}

if (changedFiles.length === 0) {
  console.log(
    `appNames: ${appNames.join(',')} , base=${base} head=${head}, no changed files detected.`,
  );
  process.exit(1);
}

const affectedProjects = new Set();
let hasUnmappedChange = false;
for (const changedFile of changedFiles) {
  const project = resolveProjectForPath(changedFile, projectGraph.projects);
  if (!project) {
    hasUnmappedChange = true;
    continue;
  }
  affectedProjects.add(project);
}

if (hasUnmappedChange) {
  console.warn(
    `Detected changed files outside known project roots for base=${base} head=${head}. Running e2e by default.`,
  );
  process.exit(0);
}

const isAffected = appNames.some((name) =>
  isRequestedAppAffected(name, affectedProjects),
);

if (isAffected) {
  console.log(
    `appNames: ${appNames.join(',')} , base=${base} head=${head}, conditions met, executing e2e CI.`,
  );
  process.exit(0);
}

console.log(
  `appNames: ${appNames.join(',')} , base=${base} head=${head}, conditions not met, skipping e2e CI.`,
);
process.exit(1);

function hasGitRef(ref) {
  if (!ref) {
    return false;
  }
  try {
    execSync(`git rev-parse --verify --quiet "${ref}^{commit}"`, {
      cwd: ROOT,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

function resolveBase(requestedBase) {
  if (hasGitRef(requestedBase)) {
    return requestedBase;
  }
  if (hasGitRef(process.env.CI_LOCAL_BASE_REF)) {
    return process.env.CI_LOCAL_BASE_REF;
  }
  if (hasGitRef('origin/main')) {
    return 'origin/main';
  }
  if (hasGitRef('main')) {
    return 'main';
  }
  if (hasGitRef('HEAD~1')) {
    return 'HEAD~1';
  }
  return null;
}

function resolveHead(requestedHead) {
  if (hasGitRef(requestedHead)) {
    return requestedHead;
  }
  if (hasGitRef('HEAD')) {
    return 'HEAD';
  }
  return null;
}

function loadProjectGraph() {
  const packageFiles = collectPackageFiles(ROOT);
  const projects = packageFiles
    .map((packageFile) => {
      const root = dirname(packageFile);
      const relativeRoot = normalizePath(relative(ROOT, root));
      const packageJson = JSON.parse(readFileSync(packageFile, 'utf-8'));
      const aliases = new Set();

      if (typeof packageJson?.name === 'string' && packageJson.name) {
        aliases.add(packageJson.name);
        if (packageJson.name.startsWith('@')) {
          const [, unscopedName] = packageJson.name.split('/');
          if (unscopedName) {
            aliases.add(unscopedName);
          }
        }
      }

      const folderName = basename(relativeRoot);
      if (folderName) {
        aliases.add(folderName);
        if (folderName.startsWith('metro-')) {
          aliases.add(folderName.slice('metro-'.length));
        }
      }

      for (const alias of getLegacyAliases(relativeRoot)) {
        aliases.add(alias);
      }

      return { root: relativeRoot, aliases };
    })
    .filter(Boolean)
    .sort((left, right) => right.root.length - left.root.length);

  return { projects };
}

function collectPackageFiles(rootDir) {
  const results = [];
  const queue = [rootDir];
  while (queue.length > 0) {
    const current = queue.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') {
        continue;
      }
      const next = resolve(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(next);
        continue;
      }
      if (entry.isFile() && entry.name === 'package.json') {
        const relativePath = normalizePath(relative(rootDir, next));
        if (relativePath === 'package.json') {
          continue;
        }
        results.push(next);
      }
    }
  }
  return results;
}

function resolveProjectForPath(filePath, projects) {
  const normalizedPath = normalizePath(filePath);
  for (const project of projects) {
    if (
      normalizedPath === project.root ||
      normalizedPath.startsWith(`${project.root}/`)
    ) {
      return project;
    }
  }
  return null;
}

function isRequestedAppAffected(requestedName, affectedProjects) {
  for (const project of affectedProjects) {
    if (project.aliases.has(requestedName)) {
      return true;
    }
  }
  if (requestedName === 'modernjs') {
    for (const project of affectedProjects) {
      for (const alias of project.aliases) {
        if (alias.startsWith('modernjs-')) {
          return true;
        }
      }
    }
  }
  return false;
}

function getLegacyAliases(relativeRoot) {
  if (relativeRoot === 'apps/manifest-demo/webpack-host') {
    return ['manifest-webpack-host', '3008-webpack-host'];
  }
  if (relativeRoot === 'apps/runtime-demo/3005-runtime-host') {
    return ['runtime-host'];
  }
  if (relativeRoot === 'apps/runtime-demo/3006-runtime-remote') {
    return ['runtime-remote1'];
  }
  if (relativeRoot === 'apps/runtime-demo/3007-runtime-remote') {
    return ['runtime-remote2'];
  }
  if (relativeRoot === 'apps/router-demo/router-host-2000') {
    return ['host'];
  }
  if (relativeRoot === 'apps/router-demo/router-host-v5-2200') {
    return ['host-v5'];
  }
  if (relativeRoot === 'apps/router-demo/router-host-vue3-2100') {
    return ['host-vue3'];
  }
  if (relativeRoot === 'apps/router-demo/router-remote1-2001') {
    return ['remote1'];
  }
  if (relativeRoot === 'apps/router-demo/router-remote2-2002') {
    return ['remote2'];
  }
  if (relativeRoot === 'apps/router-demo/router-remote3-2003') {
    return ['remote3'];
  }
  if (relativeRoot === 'apps/router-demo/router-remote4-2004') {
    return ['remote4'];
  }
  if (relativeRoot === 'apps/router-demo/router-remote5-2005') {
    return ['remote5'];
  }
  if (relativeRoot === 'apps/router-demo/router-remote6-2006') {
    return ['remote6'];
  }
  if (relativeRoot === 'apps/modern-component-data-fetch/host') {
    return ['modernjs-ssr-data-fetch-host'];
  }
  if (relativeRoot === 'apps/modern-component-data-fetch/provider') {
    return ['modernjs-ssr-data-fetch-provider'];
  }
  if (relativeRoot === 'apps/modern-component-data-fetch/provider-csr') {
    return ['modernjs-ssr-data-fetch-provider-csr'];
  }
  if (relativeRoot === 'apps/modernjs-ssr/host') {
    return ['modernjs-ssr-host'];
  }
  if (relativeRoot === 'apps/modernjs-ssr/remote') {
    return ['modernjs-ssr-remote'];
  }
  if (relativeRoot === 'apps/modernjs-ssr/remote-new-version') {
    return ['modernjs-ssr-remote-new-version'];
  }
  if (relativeRoot === 'apps/modernjs-ssr/nested-remote') {
    return ['modernjs-ssr-nested-remote'];
  }
  if (relativeRoot === 'apps/modernjs-ssr/dynamic-remote') {
    return ['modernjs-ssr-dynamic-remote'];
  }
  if (relativeRoot === 'apps/modernjs-ssr/dynamic-remote-new-version') {
    return ['modernjs-ssr-dynamic-remote-new-version'];
  }
  if (relativeRoot === 'apps/modernjs-ssr/dynamic-nested-remote') {
    return ['modernjs-ssr-dynamic-nested-remote'];
  }
  if (relativeRoot === 'apps/node-host') {
    return ['node-host'];
  }
  if (relativeRoot === 'apps/node-host-e2e') {
    return ['node-host-e2e'];
  }
  if (relativeRoot === 'apps/node-local-remote') {
    return ['node-local-remote'];
  }
  if (relativeRoot === 'apps/node-remote') {
    return ['node-remote'];
  }
  if (relativeRoot === 'apps/node-dynamic-remote') {
    return ['node-dynamic-remote'];
  }
  if (relativeRoot === 'apps/node-dynamic-remote-new-version') {
    return ['node-dynamic-remote-new-version'];
  }
  if (relativeRoot === 'apps/next-app-router/next-app-router-4000') {
    return ['next-app-router-4000'];
  }
  if (relativeRoot === 'apps/next-app-router/next-app-router-4001') {
    return ['next-app-router-4001'];
  }
  if (relativeRoot === 'apps/3000-home') {
    return ['3000-home'];
  }
  if (relativeRoot === 'apps/3001-shop') {
    return ['3001-shop'];
  }
  if (relativeRoot === 'apps/3002-checkout') {
    return ['3002-checkout'];
  }
  return [];
}

function normalizePath(value) {
  return value.replace(/\\/g, '/');
}
