#!/usr/bin/env node
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { resolve, dirname, basename, isAbsolute, join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fg from 'fast-glob';

const DEFAULT_HARNESS_CONFIG = 'rslib.harness.config.mjs';
const DEFAULT_PARALLEL = 1;
const RSLIB_CONFIG_FILES = [
  'rslib.config.mjs',
  'rslib.config.ts',
  'rslib.config.js',
  'rslib.config.cjs',
  'rslib.config.mts',
  'rslib.config.cts',
];
const HARNESS_CONFIG_PATTERN =
  /^rslib\.harness\.config\.(?:mjs|js|cjs|mts|cts|ts)$/;

function printUsage() {
  console.log(`Rslib monorepo harness

Usage:
  node scripts/rslib-harness.mjs [command] [options] [-- passthrough]

Commands:
  build            Run "rslib build" in resolved projects (default)
  inspect          Run "rslib inspect" in resolved projects
  mf-dev           Run "rslib mf-dev" (single-project only)
  list             Resolve and print projects only

Options:
  -c, --config <path>       Harness config path (default: ${DEFAULT_HARNESS_CONFIG})
  -r, --root <path>         Root directory for resolving config and projects
  -p, --project <value>     Filter project(s) by name or path (repeatable or comma-separated)
      --parallel <number>   Concurrent project commands (default: ${DEFAULT_PARALLEL})
      --dry-run             Print commands without executing
      --list                Print resolved projects before execution
      --json                Print resolved projects as JSON
      --continue-on-error   Continue running remaining projects when one fails
  -h, --help                Show help
`);
}

function parseCliArgs(argv) {
  const parsed = {
    command: 'build',
    config: DEFAULT_HARNESS_CONFIG,
    root: process.cwd(),
    projectFilters: [],
    parallel: DEFAULT_PARALLEL,
    dryRun: false,
    list: false,
    json: false,
    continueOnError: false,
    passthroughArgs: [],
  };

  let commandSet = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--') {
      parsed.passthroughArgs = argv.slice(i + 1);
      break;
    }

    if (arg === '-h' || arg === '--help') {
      printUsage();
      process.exit(0);
    }

    if (!arg.startsWith('-') && !commandSet) {
      parsed.command = arg;
      commandSet = true;
      continue;
    }

    if (arg === '-c' || arg === '--config') {
      parsed.config = requireNextValue(argv, i, arg);
      i += 1;
      continue;
    }

    if (arg === '-r' || arg === '--root') {
      parsed.root = requireNextValue(argv, i, arg);
      i += 1;
      continue;
    }

    if (arg === '-p' || arg === '--project') {
      const value = requireNextValue(argv, i, arg);
      i += 1;
      parsed.projectFilters.push(...splitListOption(value));
      continue;
    }

    if (arg === '--parallel') {
      const value = requireNextValue(argv, i, arg);
      i += 1;
      const parallel = Number.parseInt(value, 10);
      if (!Number.isFinite(parallel) || parallel < 1) {
        throw new Error(`Invalid --parallel value "${value}". Expected >= 1.`);
      }
      parsed.parallel = parallel;
      continue;
    }

    if (arg === '--dry-run') {
      parsed.dryRun = true;
      continue;
    }

    if (arg === '--list') {
      parsed.list = true;
      continue;
    }

    if (arg === '--json') {
      parsed.json = true;
      parsed.list = true;
      continue;
    }

    if (arg === '--continue-on-error') {
      parsed.continueOnError = true;
      continue;
    }

    if (arg.startsWith('--project=')) {
      parsed.projectFilters.push(
        ...splitListOption(arg.slice('--project='.length)),
      );
      continue;
    }

    if (arg.startsWith('--parallel=')) {
      const value = arg.slice('--parallel='.length);
      const parallel = Number.parseInt(value, 10);
      if (!Number.isFinite(parallel) || parallel < 1) {
        throw new Error(`Invalid --parallel value "${value}". Expected >= 1.`);
      }
      parsed.parallel = parallel;
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option "${arg}". Use --help for usage.`);
    }

    throw new Error(
      `Unexpected positional argument "${arg}". Pass through command arguments after "--".`,
    );
  }

  if (!['build', 'inspect', 'mf-dev', 'list'].includes(parsed.command)) {
    throw new Error(
      `Unknown command "${parsed.command}". Expected build | inspect | mf-dev | list.`,
    );
  }

  if (parsed.command === 'list') {
    parsed.list = true;
  }

  parsed.projectFilters = Array.from(new Set(parsed.projectFilters));
  parsed.root = resolve(process.cwd(), parsed.root);

  return parsed;
}

function requireNextValue(argv, index, optionName) {
  const value = argv[index + 1];
  if (!value || value.startsWith('-')) {
    throw new Error(`Missing value for ${optionName}.`);
  }
  return value;
}

function splitListOption(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function readPackageName(projectRoot) {
  const packageJsonPath = join(projectRoot, 'package.json');
  if (!existsSync(packageJsonPath)) {
    return basename(projectRoot);
  }

  try {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return typeof pkg.name === 'string' && pkg.name.trim()
      ? pkg.name.trim()
      : basename(projectRoot);
  } catch {
    return basename(projectRoot);
  }
}

function toCanonicalPath(targetPath) {
  try {
    return realpathSync(targetPath);
  } catch {
    return resolve(targetPath);
  }
}

function resolveWithRootDirToken(value, rootDir) {
  const withToken = value.replaceAll('<rootDir>', rootDir);
  if (isAbsolute(withToken)) {
    return withToken;
  }
  return resolve(rootDir, withToken);
}

function isHarnessConfigFile(filePath) {
  return HARNESS_CONFIG_PATTERN.test(basename(filePath));
}

function isRslibConfigFile(filePath) {
  return RSLIB_CONFIG_FILES.includes(basename(filePath));
}

function findProjectRslibConfig(projectRoot) {
  for (const file of RSLIB_CONFIG_FILES) {
    const configPath = join(projectRoot, file);
    if (existsSync(configPath)) {
      return configPath;
    }
  }
  return null;
}

async function loadHarnessConfig(configPath) {
  const absolutePath = resolve(configPath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Harness config not found: ${absolutePath}`);
  }

  const moduleUrl = pathToFileURL(absolutePath).href;
  const imported = await import(moduleUrl);
  const config = imported.default ?? imported;

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error(
      `Invalid harness config at ${absolutePath}: expected object export.`,
    );
  }

  if (!Array.isArray(config.projects)) {
    throw new Error(
      `Invalid harness config at ${absolutePath}: "projects" must be an array.`,
    );
  }

  validateHarnessConfigShape(config, absolutePath);

  return {
    path: absolutePath,
    config,
  };
}

function assertStringArray(value, pathLabel, configPath) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(
      `Invalid harness config at ${configPath}: "${pathLabel}" must be an array of strings.`,
    );
  }
}

function validateProjectEntryShape(entry, pathLabel, configPath) {
  if (typeof entry === 'string') {
    return;
  }

  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new Error(
      `Invalid harness config at ${configPath}: "${pathLabel}" must be a string or object entry.`,
    );
  }

  if (entry.name !== undefined && typeof entry.name !== 'string') {
    throw new Error(
      `Invalid harness config at ${configPath}: "${pathLabel}.name" must be a string.`,
    );
  }

  if (entry.root !== undefined && typeof entry.root !== 'string') {
    throw new Error(
      `Invalid harness config at ${configPath}: "${pathLabel}.root" must be a string.`,
    );
  }

  if (entry.config !== undefined && typeof entry.config !== 'string') {
    throw new Error(
      `Invalid harness config at ${configPath}: "${pathLabel}.config" must be a string.`,
    );
  }

  if (entry.args !== undefined) {
    assertStringArray(entry.args, `${pathLabel}.args`, configPath);
  }

  if (entry.ignore !== undefined) {
    assertStringArray(entry.ignore, `${pathLabel}.ignore`, configPath);
  }

  if (entry.projects !== undefined) {
    if (!Array.isArray(entry.projects)) {
      throw new Error(
        `Invalid harness config at ${configPath}: "${pathLabel}.projects" must be an array.`,
      );
    }
    entry.projects.forEach((childEntry, index) =>
      validateProjectEntryShape(
        childEntry,
        `${pathLabel}.projects[${index}]`,
        configPath,
      ),
    );
  }

  const allowedEntryKeys = new Set([
    'name',
    'root',
    'config',
    'args',
    'ignore',
    'projects',
  ]);
  const unknownEntryKeys = Object.keys(entry).filter(
    (key) => !allowedEntryKeys.has(key),
  );
  if (unknownEntryKeys.length > 0) {
    throw new Error(
      `Invalid harness config at ${configPath}: "${pathLabel}" has unknown keys: ${unknownEntryKeys.join(
        ', ',
      )}.`,
    );
  }
}

function validateHarnessConfigShape(config, configPath) {
  const allowedConfigKeys = new Set(['root', 'ignore', 'defaults', 'projects']);
  const unknownConfigKeys = Object.keys(config).filter(
    (key) => !allowedConfigKeys.has(key),
  );
  if (unknownConfigKeys.length > 0) {
    throw new Error(
      `Invalid harness config at ${configPath}: unknown top-level keys: ${unknownConfigKeys.join(
        ', ',
      )}.`,
    );
  }

  if (config.root !== undefined && typeof config.root !== 'string') {
    throw new Error(
      `Invalid harness config at ${configPath}: "root" must be a string.`,
    );
  }

  if (config.ignore !== undefined) {
    assertStringArray(config.ignore, 'ignore', configPath);
  }

  if (config.defaults !== undefined) {
    if (!config.defaults || typeof config.defaults !== 'object') {
      throw new Error(
        `Invalid harness config at ${configPath}: "defaults" must be an object.`,
      );
    }

    if (config.defaults.args !== undefined) {
      assertStringArray(config.defaults.args, 'defaults.args', configPath);
    }

    const allowedDefaultsKeys = new Set(['args']);
    const unknownDefaultsKeys = Object.keys(config.defaults).filter(
      (key) => !allowedDefaultsKeys.has(key),
    );
    if (unknownDefaultsKeys.length > 0) {
      throw new Error(
        `Invalid harness config at ${configPath}: unknown defaults keys: ${unknownDefaultsKeys.join(
          ', ',
        )}.`,
      );
    }
  }

  config.projects.forEach((entry, index) =>
    validateProjectEntryShape(entry, `projects[${index}]`, configPath),
  );
}

function mergeIgnorePatterns(parentIgnore, configIgnore) {
  const combined = [
    ...parentIgnore,
    ...(Array.isArray(configIgnore) ? configIgnore : []),
  ];
  return Array.from(new Set(combined));
}

function createProjectRecord({ name, root, configFile, args, sourceConfig }) {
  return {
    name,
    root,
    configFile: configFile ?? null,
    args: args ?? [],
    sourceConfig,
  };
}

function ensureUniqueProjectName(projectByName, project, dedupeKey) {
  const existing = projectByName.get(project.name);
  if (!existing) {
    projectByName.set(project.name, {
      dedupeKey,
      root: project.root,
      configFile: project.configFile,
    });
    return;
  }

  if (existing.dedupeKey === dedupeKey) {
    return;
  }

  throw new Error(
    `Duplicate project name "${project.name}" detected.\n` +
      `- Existing: ${existing.configFile ?? existing.root}\n` +
      `- New:      ${project.configFile ?? project.root}\n` +
      'Use explicit unique "name" values in harness entries.',
  );
}

function shouldFilterProject(project, projectFilters) {
  if (projectFilters.length === 0) {
    return true;
  }

  const rootLower = project.root.toLowerCase();
  const configLower = (project.configFile ?? '').toLowerCase();
  const nameLower = project.name.toLowerCase();

  return projectFilters.some((filterValue) => {
    const needle = filterValue.toLowerCase();
    return (
      nameLower === needle ||
      nameLower.includes(needle) ||
      rootLower.includes(needle) ||
      configLower.includes(needle)
    );
  });
}

function toDisplayPath(pathValue, rootDir, fallback = '(auto)') {
  if (!pathValue) {
    return fallback;
  }
  return pathValue.startsWith(rootDir)
    ? pathValue.slice(rootDir.length + 1) || '.'
    : pathValue;
}

function toProjectOutput(project, rootDir) {
  return {
    name: project.name,
    root: toDisplayPath(project.root, rootDir, '.'),
    config: toDisplayPath(project.configFile, rootDir, '(auto)'),
    args: project.args,
  };
}

function getProjectCommandArgs(project, command, passthroughArgs) {
  const args = ['exec', 'rslib', command, ...project.args];
  if (project.configFile) {
    args.push('--config', project.configFile);
  }
  args.push(...passthroughArgs);
  return args;
}

async function resolveProjects({ harnessConfigPath, rootDir, projectFilters }) {
  const dedupeMap = new Map();
  const projectByName = new Map();
  const resolvedProjects = [];

  async function recurseConfig({
    configPath,
    inheritedRootDir,
    inheritedIgnore,
    inheritedArgs,
  }) {
    const { path: absoluteConfigPath, config } =
      await loadHarnessConfig(configPath);
    const configDir = dirname(absoluteConfigPath);
    const configRootDir = config.root
      ? resolveWithRootDirToken(config.root, configDir)
      : (inheritedRootDir ?? configDir);
    const configIgnore = mergeIgnorePatterns(inheritedIgnore, config.ignore);
    const configArgs = [
      ...inheritedArgs,
      ...(Array.isArray(config.defaults?.args) ? config.defaults.args : []),
    ];

    for (const entry of config.projects) {
      await resolveEntry({
        entry,
        entryRootDir: configRootDir,
        ignorePatterns: configIgnore,
        inheritedArgs: configArgs,
        sourceConfig: absoluteConfigPath,
      });
    }
  }

  async function addProject({
    name,
    projectRoot,
    configFile,
    args,
    sourceConfig,
  }) {
    const canonicalConfig = configFile ? toCanonicalPath(configFile) : null;
    const canonicalRoot = toCanonicalPath(projectRoot);
    const dedupeKey = canonicalConfig
      ? `config:${canonicalConfig}`
      : `root:${canonicalRoot}`;

    if (dedupeMap.has(dedupeKey)) {
      return;
    }

    const finalName = name ?? readPackageName(projectRoot);
    const project = createProjectRecord({
      name: finalName,
      root: canonicalRoot,
      configFile: canonicalConfig,
      args,
      sourceConfig,
    });

    ensureUniqueProjectName(projectByName, project, dedupeKey);
    dedupeMap.set(dedupeKey, project);
    resolvedProjects.push(project);
  }

  async function resolvePathLikeEntry({
    targetPath,
    inheritedArgs,
    sourceConfig,
    entryRootDir,
    ignorePatterns,
  }) {
    const absolutePath = resolveWithRootDirToken(targetPath, entryRootDir);

    if (!existsSync(absolutePath)) {
      throw new Error(
        `Project entry "${targetPath}" resolved to missing path: ${absolutePath} (from ${sourceConfig})`,
      );
    }

    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      const nestedHarnessConfig = join(absolutePath, DEFAULT_HARNESS_CONFIG);
      if (existsSync(nestedHarnessConfig)) {
        await recurseConfig({
          configPath: nestedHarnessConfig,
          inheritedRootDir: absolutePath,
          inheritedIgnore: ignorePatterns,
          inheritedArgs,
        });
        return;
      }

      const rslibConfigPath = findProjectRslibConfig(absolutePath);
      if (!rslibConfigPath) {
        return;
      }

      await addProject({
        projectRoot: absolutePath,
        configFile: rslibConfigPath,
        args: inheritedArgs,
        sourceConfig,
      });
      return;
    }

    if (isHarnessConfigFile(absolutePath)) {
      await recurseConfig({
        configPath: absolutePath,
        inheritedRootDir: dirname(absolutePath),
        inheritedIgnore: ignorePatterns,
        inheritedArgs,
      });
      return;
    }

    if (!isRslibConfigFile(absolutePath)) {
      throw new Error(
        `Unsupported project file "${absolutePath}". Expected rslib.config.* or rslib.harness.config.*`,
      );
    }

    await addProject({
      projectRoot: dirname(absolutePath),
      configFile: absolutePath,
      args: inheritedArgs,
      sourceConfig,
    });
  }

  async function resolveStringEntry({
    value,
    entryRootDir,
    ignorePatterns,
    inheritedArgs,
    sourceConfig,
  }) {
    const expandedValue = value.replaceAll('<rootDir>', entryRootDir);

    if (fg.isDynamicPattern(expandedValue)) {
      const matches = await fg(expandedValue, {
        cwd: entryRootDir,
        absolute: true,
        dot: true,
        onlyFiles: false,
        unique: true,
        followSymbolicLinks: false,
        ignore: ignorePatterns,
      });

      matches.sort((a, b) => a.localeCompare(b));

      for (const match of matches) {
        await resolvePathLikeEntry({
          targetPath: match,
          entryRootDir,
          ignorePatterns,
          inheritedArgs,
          sourceConfig,
        });
      }
      return;
    }

    await resolvePathLikeEntry({
      targetPath: expandedValue,
      entryRootDir,
      ignorePatterns,
      inheritedArgs,
      sourceConfig,
    });
  }

  async function resolveObjectEntry({
    entry,
    entryRootDir,
    ignorePatterns,
    inheritedArgs,
    sourceConfig,
  }) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(
        `Invalid project entry in ${sourceConfig}. Expected object, got ${typeof entry}.`,
      );
    }

    const objectRootDir = entry.root
      ? resolveWithRootDirToken(entry.root, entryRootDir)
      : entryRootDir;
    const objectIgnore = mergeIgnorePatterns(ignorePatterns, entry.ignore);
    const objectArgs = [
      ...inheritedArgs,
      ...(Array.isArray(entry.args) ? entry.args : []),
    ];

    if (Array.isArray(entry.projects)) {
      for (const nestedEntry of entry.projects) {
        await resolveEntry({
          entry: nestedEntry,
          entryRootDir: objectRootDir,
          ignorePatterns: objectIgnore,
          inheritedArgs: objectArgs,
          sourceConfig,
        });
      }
      return;
    }

    const explicitConfigFile = entry.config
      ? resolveWithRootDirToken(entry.config, objectRootDir)
      : findProjectRslibConfig(objectRootDir);

    if (!explicitConfigFile) {
      throw new Error(
        `Project entry in ${sourceConfig} resolved to "${objectRootDir}" but no rslib.config.* file was found.`,
      );
    }

    if (!existsSync(explicitConfigFile)) {
      throw new Error(
        `Project config path "${explicitConfigFile}" does not exist (from ${sourceConfig}).`,
      );
    }

    await addProject({
      name: entry.name,
      projectRoot: dirname(explicitConfigFile),
      configFile: explicitConfigFile,
      args: objectArgs,
      sourceConfig,
    });
  }

  async function resolveEntry({
    entry,
    entryRootDir,
    ignorePatterns,
    inheritedArgs,
    sourceConfig,
  }) {
    if (typeof entry === 'string') {
      await resolveStringEntry({
        value: entry,
        entryRootDir,
        ignorePatterns,
        inheritedArgs,
        sourceConfig,
      });
      return;
    }

    await resolveObjectEntry({
      entry,
      entryRootDir,
      ignorePatterns,
      inheritedArgs,
      sourceConfig,
    });
  }

  await recurseConfig({
    configPath: harnessConfigPath,
    inheritedRootDir: rootDir,
    inheritedIgnore: ['**/node_modules/**', '**/.git/**'],
    inheritedArgs: [],
  });

  resolvedProjects.sort((left, right) => {
    if (left.root !== right.root) {
      return left.root.localeCompare(right.root);
    }
    if (left.name !== right.name) {
      return left.name.localeCompare(right.name);
    }
    return (left.configFile ?? '').localeCompare(right.configFile ?? '');
  });

  const filteredProjects = resolvedProjects.filter((project) =>
    shouldFilterProject(project, projectFilters),
  );

  if (projectFilters.length > 0 && filteredProjects.length === 0) {
    throw new Error(
      `No projects matched filters: ${projectFilters.join(', ')}`,
    );
  }

  return filteredProjects;
}

function printResolvedProjects(projects, rootDir, options = {}) {
  if (options.json === true) {
    const payload = projects.map((project) =>
      toProjectOutput(project, rootDir),
    );
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`[rslib-harness] Resolved ${projects.length} project(s):`);
  for (const project of projects) {
    const root = project.root.startsWith(rootDir)
      ? project.root.slice(rootDir.length + 1) || '.'
      : project.root;
    const configPath = project.configFile?.startsWith(rootDir)
      ? project.configFile.slice(rootDir.length + 1) || '.'
      : (project.configFile ?? '(auto)');
    console.log(`- ${project.name}`);
    console.log(`  root:   ${root}`);
    console.log(`  config: ${configPath}`);
    if (project.args.length > 0) {
      console.log(`  args:   ${project.args.join(' ')}`);
    }
  }
}

function spawnProjectCommand({ project, command, passthroughArgs, dryRun }) {
  const args = getProjectCommandArgs(project, command, passthroughArgs);

  const commandLine = `pnpm ${args.join(' ')}`;
  console.log(`[rslib-harness] ${project.name}: ${commandLine}`);

  if (dryRun) {
    return Promise.resolve({ code: 0, project });
  }

  return new Promise((resolvePromise) => {
    const child = spawn('pnpm', args, {
      cwd: project.root,
      stdio: 'inherit',
      env: process.env,
    });

    child.on('close', (code) => {
      resolvePromise({
        code: code ?? 1,
        project,
      });
    });
  });
}

async function runWithConcurrency({
  projects,
  command,
  passthroughArgs,
  parallel,
  dryRun,
  continueOnError,
}) {
  const failures = [];
  const queue = [...projects];
  const active = new Set();
  let shouldStop = false;

  async function launchNext() {
    if (shouldStop) {
      return;
    }

    const nextProject = queue.shift();
    if (!nextProject) {
      return;
    }

    const runPromise = spawnProjectCommand({
      project: nextProject,
      command,
      passthroughArgs,
      dryRun,
    }).then((result) => {
      if (result.code !== 0) {
        failures.push(result);
        if (!continueOnError) {
          shouldStop = true;
        }
      }
    });

    active.add(runPromise);
    runPromise.finally(() => active.delete(runPromise));

    if (active.size >= parallel) {
      await Promise.race(active);
    }

    await launchNext();
  }

  const initialWorkers = Math.min(parallel, queue.length);
  const workers = [];
  for (let i = 0; i < initialWorkers; i += 1) {
    workers.push(launchNext());
  }
  await Promise.all(workers);
  await Promise.all(active);

  return failures;
}

function validateCommandGuards({
  command,
  passthroughArgs,
  projects,
  parallel,
}) {
  const watchRequested =
    command === 'mf-dev' ||
    passthroughArgs.includes('--watch') ||
    passthroughArgs.includes('-w');

  if (watchRequested && projects.length > 1) {
    throw new Error(
      'Watch/mf-dev mode is currently single-project only. Use --project to select one project.',
    );
  }

  if (watchRequested && parallel !== 1) {
    throw new Error('Watch/mf-dev mode does not support --parallel > 1.');
  }
}

async function main() {
  const cli = parseCliArgs(process.argv.slice(2));
  const harnessConfigPath = isAbsolute(cli.config)
    ? cli.config
    : resolve(cli.root, cli.config);

  if (cli.json && cli.command !== 'list' && !cli.dryRun) {
    throw new Error(
      '--json requires list mode or --dry-run to avoid mixed structured and live command output.',
    );
  }

  const projects = await resolveProjects({
    harnessConfigPath,
    rootDir: cli.root,
    projectFilters: cli.projectFilters,
  });

  if (projects.length === 0) {
    throw new Error('No projects were resolved from harness config.');
  }

  if (cli.command === 'list') {
    printResolvedProjects(projects, cli.root, { json: cli.json });
    return;
  }

  if (cli.json && cli.dryRun) {
    const payload = {
      command: cli.command,
      dryRun: true,
      projects: projects.map((project) => toProjectOutput(project, cli.root)),
      commands: projects.map((project) => ({
        name: project.name,
        cwd: toDisplayPath(project.root, cli.root, '.'),
        command: `pnpm ${getProjectCommandArgs(
          project,
          cli.command,
          cli.passthroughArgs,
        ).join(' ')}`,
      })),
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (cli.list || cli.dryRun) {
    printResolvedProjects(projects, cli.root, { json: cli.json });
  }

  validateCommandGuards({
    command: cli.command,
    passthroughArgs: cli.passthroughArgs,
    projects,
    parallel: cli.parallel,
  });

  const failures = await runWithConcurrency({
    projects,
    command: cli.command,
    passthroughArgs: cli.passthroughArgs,
    parallel: cli.parallel,
    dryRun: cli.dryRun,
    continueOnError: cli.continueOnError,
  });

  if (failures.length > 0) {
    console.error(
      `[rslib-harness] ${failures.length} project(s) failed:\n` +
        failures
          .map(
            (failure) => `- ${failure.project.name} (${failure.project.root})`,
          )
          .join('\n'),
    );
    process.exit(1);
  }
}

const isMainModule =
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMainModule) {
  main().catch((error) => {
    console.error(
      `[rslib-harness] ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  });
}

export { parseCliArgs, resolveProjects, validateCommandGuards };
