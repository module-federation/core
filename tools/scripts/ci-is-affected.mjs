import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
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
  affectedProjects.add(project.name);
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
  const projectFiles = collectProjectFiles(ROOT);
  const projects = projectFiles
    .map((projectFile) => {
      const root = dirname(projectFile);
      const relativeRoot = normalizePath(relative(ROOT, root));
      const projectJson = JSON.parse(readFileSync(projectFile, 'utf-8'));
      if (!projectJson?.name) {
        return null;
      }
      return { name: projectJson.name, root: relativeRoot };
    })
    .filter(Boolean)
    .sort((left, right) => right.root.length - left.root.length);

  return { projects };
}

function collectProjectFiles(rootDir) {
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
      if (entry.isFile() && entry.name === 'project.json') {
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
  if (affectedProjects.has(requestedName)) {
    return true;
  }
  if (requestedName === 'modernjs') {
    for (const projectName of affectedProjects) {
      if (projectName.startsWith('modernjs-')) {
        return true;
      }
    }
  }
  return false;
}

function normalizePath(value) {
  return value.replace(/\\/g, '/');
}
