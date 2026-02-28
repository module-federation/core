#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');

main();

function main() {
  const projectFiles = collectProjectFiles(ROOT);
  const projectGraph = buildProjectGraph(projectFiles);
  let updatedCount = 0;

  for (const projectFile of projectFiles) {
    const projectDir = dirname(projectFile);
    const packageJsonPath = resolve(projectDir, 'package.json');
    if (!existsSync(packageJsonPath)) {
      continue;
    }

    const projectJson = JSON.parse(readFileSync(projectFile, 'utf-8'));
    if (!projectJson?.targets || typeof projectJson.targets !== 'object') {
      continue;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const originalScriptsJson = JSON.stringify(packageJson.scripts || {});
    const scripts = { ...(packageJson.scripts || {}) };

    for (const [targetName, targetDefinition] of Object.entries(
      projectJson.targets,
    )) {
      const baseCommand = commandFromDefinition(targetDefinition);
      if (baseCommand) {
        scripts[targetName] = rewriteNxInvocations(baseCommand, projectGraph);
      }

      const configurations = targetDefinition?.configurations || {};
      for (const [configurationName, configurationDefinition] of Object.entries(
        configurations,
      )) {
        const configurationCommand =
          commandFromDefinition(configurationDefinition) || baseCommand;
        if (!configurationCommand) {
          continue;
        }
        scripts[`${targetName}:${configurationName}`] = rewriteNxInvocations(
          configurationCommand,
          projectGraph,
        );
      }
    }

    const nextScriptsJson = JSON.stringify(scripts);
    if (nextScriptsJson !== originalScriptsJson) {
      packageJson.scripts = scripts;
      writeFileSync(
        packageJsonPath,
        `${JSON.stringify(packageJson, null, 2)}\n`,
        'utf-8',
      );
      updatedCount += 1;
    }
  }

  console.log(
    `[sync-project-target-scripts] Updated scripts in ${updatedCount} package.json file(s).`,
  );
}

function commandFromDefinition(targetDefinition) {
  if (!targetDefinition || typeof targetDefinition !== 'object') {
    return null;
  }

  const options = targetDefinition.options || targetDefinition;
  if (!options || typeof options !== 'object') {
    return null;
  }

  if (typeof options.command === 'string' && options.command.trim()) {
    return options.command.trim();
  }

  const commands = Array.isArray(options.commands) ? options.commands : [];
  const normalizedCommands = commands
    .map((commandEntry) => {
      if (typeof commandEntry === 'string') {
        return commandEntry.trim();
      }
      if (
        commandEntry &&
        typeof commandEntry === 'object' &&
        typeof commandEntry.command === 'string'
      ) {
        return commandEntry.command.trim();
      }
      return '';
    })
    .filter(Boolean);

  if (normalizedCommands.length === 0) {
    return null;
  }

  if (normalizedCommands.length === 1) {
    return normalizedCommands[0];
  }

  if (options.parallel === true) {
    const quoted = normalizedCommands.map((value) => JSON.stringify(value));
    return `pnpm exec concurrently ${quoted.join(' ')}`;
  }

  return normalizedCommands.join(' && ');
}

function rewriteNxInvocations(command, projectToPackage) {
  const split = splitCommandByOperators(command);
  const nextSegments = split.segments.map((segment) =>
    convertNxSegment(segment, projectToPackage),
  );

  let rebuilt = '';
  for (let index = 0; index < nextSegments.length; index += 1) {
    rebuilt += nextSegments[index];
    if (index < split.operators.length) {
      rebuilt += ` ${split.operators[index]} `;
    }
  }
  return replaceInlineNxRunCommands(rebuilt.trim(), projectToPackage);
}

function buildProjectGraph(projectFiles) {
  const byProject = new Map();
  const byTag = new Map();

  for (const projectFile of projectFiles) {
    const projectDir = dirname(projectFile);
    const packageJsonPath = resolve(projectDir, 'package.json');
    if (!existsSync(packageJsonPath)) {
      continue;
    }
    const projectJson = JSON.parse(readFileSync(projectFile, 'utf-8'));
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    if (projectJson?.name && packageJson?.name) {
      const project = {
        projectName: projectJson.name,
        packageName: packageJson.name,
        tags: new Set(projectJson.tags || []),
        targets: new Set(Object.keys(projectJson.targets || {})),
      };
      byProject.set(project.projectName, project);

      for (const tag of project.tags) {
        if (!byTag.has(tag)) {
          byTag.set(tag, new Map());
        }
        byTag.get(tag).set(project.projectName, project);
      }
    }
  }
  return { byProject, byTag };
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
      } else if (entry.isFile() && entry.name === 'project.json') {
        results.push(next);
      }
    }
  }
  return results;
}

function splitCommandByOperators(command) {
  const segments = [];
  const operators = [];
  let current = '';
  let quote = null;

  for (let index = 0; index < command.length; index += 1) {
    const char = command[index];
    const nextChar = command[index + 1];

    if (quote) {
      current += char;
      if (char === quote && command[index - 1] !== '\\') {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === '&' && nextChar === '&') {
      segments.push(current.trim());
      operators.push('&&');
      current = '';
      index += 1;
      continue;
    }

    if (char === '|' && nextChar === '|') {
      segments.push(current.trim());
      operators.push('||');
      current = '';
      index += 1;
      continue;
    }

    if (char === '&') {
      segments.push(current.trim());
      operators.push('&');
      current = '';
      continue;
    }

    if (char === ';') {
      segments.push(current.trim());
      operators.push(';');
      current = '';
      continue;
    }

    current += char;
  }

  segments.push(current.trim());
  return { segments, operators };
}

function convertNxSegment(segment, projectGraph) {
  if (!segment || !/\bnx\b/.test(segment)) {
    return segment;
  }

  const tokens = tokenize(segment);
  if (tokens.length === 0) {
    return segment;
  }

  const envAssignments = [];
  while (tokens.length > 0 && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[0])) {
    envAssignments.push(tokens.shift());
  }

  if (tokens[0] === 'npx' && tokens[1] === 'nx') {
    tokens.shift();
    tokens.shift();
  } else if (tokens[0] === 'nx') {
    tokens.shift();
  } else {
    return segment;
  }

  const nxCommand = tokens.shift();
  if (!nxCommand) {
    return segment;
  }

  const envPrefix = envAssignments
    .filter((entry) => !entry.startsWith('NX_TUI='))
    .join(' ')
    .trim();

  const converted = convertNxCommand(nxCommand, tokens, projectGraph);
  if (!converted) {
    return segment;
  }

  if (!envPrefix) {
    return converted;
  }
  return `${envPrefix} ${converted}`;
}

function convertNxCommand(command, tokens, projectGraph) {
  if (command === 'format:check') {
    return 'pnpm exec prettier --check .';
  }
  if (command === 'format:write') {
    return 'pnpm exec prettier --write .';
  }
  if (command === 'run') {
    return convertNxRun(tokens, projectGraph);
  }
  if (command === 'run-many') {
    return convertNxRunMany(tokens, projectGraph);
  }
  if (command === 'affected') {
    return convertNxAffected(tokens);
  }
  if (['build', 'test', 'lint', 'serve', 'e2e'].includes(command)) {
    return convertNxSingleTarget(command, tokens, projectGraph);
  }
  if (command.includes(':')) {
    return convertNxSingleTarget(command, tokens, projectGraph);
  }
  return null;
}

function convertNxRun(tokens, projectGraph) {
  const { positional, options } = parseOptions(tokens);
  const runSpec = positional[0];
  if (!runSpec) {
    return null;
  }

  const firstColon = runSpec.indexOf(':');
  if (firstColon === -1) {
    return null;
  }

  const projectName = runSpec.slice(0, firstColon);
  const project = projectGraph.byProject.get(projectName);
  if (!project) {
    return null;
  }

  const remainder = runSpec.slice(firstColon + 1);
  const parsed = parseTargetAndConfiguration(remainder, project.targets);
  const configuredTarget =
    options.configuration || options.c
      ? `${parsed.target}:${unwrapValue(options.configuration || options.c)}`
      : parsed.configuration
        ? `${parsed.target}:${parsed.configuration}`
        : parsed.target;

  return `pnpm --filter ${project.packageName} run ${configuredTarget}`;
}

function convertNxSingleTarget(target, tokens, projectGraph) {
  const { positional, options } = parseOptions(tokens);
  const projectName = positional[0];
  if (!projectName) {
    return null;
  }
  const project = projectGraph.byProject.get(projectName);
  if (!project) {
    return null;
  }
  const configuration =
    options.configuration || options.c
      ? `:${unwrapValue(options.configuration || options.c)}`
      : '';
  return `pnpm --filter ${project.packageName} run ${target}${configuration}`;
}

function convertNxRunMany(tokens, projectGraph) {
  const { options } = parseOptions(tokens);

  const targetsValue = options.target || options.targets || options.t;
  if (!targetsValue) {
    return null;
  }

  const targets = unwrapValue(targetsValue)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (targets.length === 0) {
    return null;
  }

  const configuration = options.configuration || options.c;
  const projectsValue = options.projects || options.p;
  const all = Boolean(options.all);
  let packages = [];

  if (!all && projectsValue) {
    packages = resolvePackageFilters(unwrapValue(projectsValue), projectGraph);
  }

  if (options.exclude) {
    packages = applyExcludeFilters(
      packages,
      unwrapValue(options.exclude),
      projectGraph,
    );
  }

  const parallelValue = options.parallel;
  const concurrency =
    parallelValue && parallelValue !== true
      ? ` --concurrency=${unwrapValue(parallelValue)}`
      : '';

  const filterFlags =
    packages.length > 0
      ? ` ${packages.map((pkg) => `--filter=${pkg}`).join(' ')}`
      : '';

  const commands = targets.map((target) => {
    const script = configuration
      ? `${target}:${unwrapValue(configuration)}`
      : target;
    return `pnpm exec turbo run ${script}${filterFlags}${concurrency}`.trim();
  });
  return commands.join(' && ');
}

function convertNxAffected(tokens) {
  const { options } = parseOptions(tokens);
  const target = options.target || options.targets || options.t;
  if (!target) {
    return null;
  }
  const script = unwrapValue(target);
  const parallelValue = options.parallel;
  const concurrency =
    parallelValue && parallelValue !== true
      ? ` --concurrency=${unwrapValue(parallelValue)}`
      : '';
  return `pnpm exec turbo run ${script}${concurrency}`.trim();
}

function resolvePackageFilters(projectSelectors, projectGraph) {
  const selectors = projectSelectors
    .split(',')
    .map((selector) => selector.trim())
    .filter(Boolean);
  const packageSet = new Set();
  for (const selector of selectors) {
    for (const project of resolveSelector(selector, projectGraph)) {
      packageSet.add(project.packageName);
    }
  }
  return Array.from(packageSet);
}

function applyExcludeFilters(packages, excludeExpression, projectGraph) {
  if (!excludeExpression) {
    return packages;
  }

  const includes = excludeExpression
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.startsWith('!'))
    .map((value) => value.slice(1));
  if (includes.length === 0) {
    return packages;
  }

  const includePackages = new Set();
  for (const includeSelector of includes) {
    for (const project of resolveSelector(includeSelector, projectGraph)) {
      includePackages.add(project.packageName);
    }
  }

  return packages.filter((pkg) => includePackages.has(pkg));
}

function resolveSelector(selector, projectGraph) {
  const normalized = selector.replace(/^['"]|['"]$/g, '');
  if (!normalized) {
    return [];
  }

  if (normalized.startsWith('tag:')) {
    const projects = projectGraph.byTag.get(normalized);
    return projects ? Array.from(projects.values()) : [];
  }

  if (normalized.includes('*')) {
    const regex = globToRegex(normalized);
    return Array.from(projectGraph.byProject.values()).filter((project) =>
      regex.test(project.projectName),
    );
  }

  const direct = projectGraph.byProject.get(normalized);
  return direct ? [direct] : [];
}

function parseTargetAndConfiguration(remainder, knownTargets) {
  if (knownTargets.has(remainder)) {
    return { target: remainder, configuration: null };
  }

  const parts = remainder.split(':').filter(Boolean);
  if (parts.length <= 1) {
    return { target: remainder, configuration: null };
  }

  for (let index = parts.length - 1; index > 0; index -= 1) {
    const target = parts.slice(0, index).join(':');
    if (knownTargets.has(target)) {
      return { target, configuration: parts.slice(index).join(':') };
    }
  }

  return {
    target: parts.slice(0, -1).join(':'),
    configuration: parts[parts.length - 1],
  };
}

function parseOptions(tokens) {
  const positional = [];
  const options = {};

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === '--') {
      break;
    }

    if (token.startsWith('--') || token.startsWith('-')) {
      const option = token.startsWith('--') ? token.slice(2) : token.slice(1);
      const equalsIndex = option.indexOf('=');
      if (equalsIndex !== -1) {
        const key = option.slice(0, equalsIndex);
        const value = option.slice(equalsIndex + 1);
        options[key] = value;
        continue;
      }
      const next = tokens[index + 1];
      if (next && !next.startsWith('-')) {
        options[option] = next;
        index += 1;
      } else {
        options[option] = true;
      }
      continue;
    }

    positional.push(token);
  }

  return { positional, options };
}

function tokenize(segment) {
  return segment.match(/"[^"]*"|'[^']*'|\S+/g) || [];
}

function unwrapValue(value) {
  if (typeof value !== 'string') {
    return value;
  }
  return value.replace(/^['"]|['"]$/g, '');
}

function globToRegex(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function replaceInlineNxRunCommands(command, projectGraph) {
  let rewritten = command
    .replace(/\bNX_TUI=false\s+/g, '')
    .replace(/\bNX_DAEMON=false\s+/g, '');

  rewritten = rewritten.replace(
    /(?:npx\s+)?nx\s+run\s+([A-Za-z0-9_-]+):([A-Za-z0-9:_-]+)(?:\s+--configuration(?:=|\s+)([A-Za-z0-9:_-]+))?/g,
    (fullMatch, projectName, targetSpec, configuration) => {
      const project = projectGraph.byProject.get(projectName);
      if (!project) {
        return fullMatch;
      }
      const parsed = parseTargetAndConfiguration(targetSpec, project.targets);
      const finalScript =
        configuration || parsed.configuration
          ? `${parsed.target}:${configuration || parsed.configuration}`
          : parsed.target;
      return `pnpm --filter ${project.packageName} run ${finalScript}`;
    },
  );

  rewritten = rewritten.replace(
    /(?:npx\s+)?nx\s+(build|test|lint|serve|e2e)\s+([A-Za-z0-9_-]+)(?:\s+--configuration(?:=|\s+)([A-Za-z0-9:_-]+))?/g,
    (fullMatch, targetName, projectName, configuration) => {
      const project = projectGraph.byProject.get(projectName);
      if (!project) {
        return fullMatch;
      }
      const finalScript = configuration
        ? `${targetName}:${configuration}`
        : targetName;
      return `pnpm --filter ${project.packageName} run ${finalScript}`;
    },
  );

  return rewritten;
}
