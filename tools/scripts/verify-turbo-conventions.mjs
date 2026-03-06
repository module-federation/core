#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const ROOT_PACKAGE_JSON_PATH = resolve(ROOT, 'package.json');
const TURBO_RUN_COMMAND_REGEX =
  /(?:^|\s)(?:pnpm\s+exec\s+turbo|pnpm\s+turbo|turbo)\s+run\s+([^\s]+)([\s\S]*)$/;
const TURBO_FILTER_ARG_REGEX = /--filter(?:=|\s+)(['"]?)([^'"\s]+)\1/g;
const SHELL_SEPARATOR_REGEX = /\s*(?:&&|\|\||;)\s*/;
const DISALLOWED_ROOT_SCRIPTS = new Set([
  'build:pkg',
  'test:pkg',
  'turbo:build:pkg',
  'turbo:lint:pkg',
  'turbo:test:pkg',
]);
const DISALLOWED_PACKAGE_TASKS = new Set([
  'turbo:build',
  'turbo:test',
  'turbo:lint',
]);
const CROSS_PACKAGE_BUILD_REGEX = /pnpm\s+-C\s+\.\.\/[^\s]+\s+build\b/;

main();

function main() {
  const errors = [];

  const packageJsonPaths = listPackageJsonPaths();
  if (packageJsonPaths.length === 0) {
    failWith(errors, '[verify-turbo-conventions] No package.json files found.');
  }

  const rootPackageJsonPath = resolve(ROOT, 'package.json');
  const rootPackageJson = readJson(rootPackageJsonPath, errors);
  const workspacePackageNames = getWorkspacePackageNames(errors);
  if (rootPackageJson) {
    checkRootScripts(
      rootPackageJsonPath,
      rootPackageJson,
      workspacePackageNames,
      errors,
    );
  }

  for (const packageJsonPath of packageJsonPaths) {
    const pkgJson = readJson(packageJsonPath, errors);
    if (!pkgJson) {
      continue;
    }
    checkPackageScripts(packageJsonPath, pkgJson, errors);
  }

  if (errors.length > 0) {
    reportErrorsAndExit(errors);
  }

  console.log('[verify-turbo-conventions] OK');
}

function listPackageJsonPaths() {
  const result = spawnSync(
    'rg',
    [
      '--files',
      '--glob',
      'package.json',
      '--glob',
      '!**/node_modules/**',
      '--glob',
      '!**/dist/**',
      '--glob',
      '!**/build/**',
      '--glob',
      '!**/.next/**',
    ],
    {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: 'pipe',
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `[verify-turbo-conventions] Failed to list package.json files: ${result.stderr || result.stdout}`,
    );
  }

  return result.stdout
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => resolve(ROOT, entry));
}

function readJson(path, errors) {
  try {
    const raw = readFileSync(path, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    errors.push(
      `[verify-turbo-conventions] Failed to read ${formatPath(path)}: ${error.message}`,
    );
    return null;
  }
}

function checkRootScripts(path, pkgJson, workspacePackageNames, errors) {
  const scripts =
    pkgJson?.scripts && typeof pkgJson.scripts === 'object'
      ? pkgJson.scripts
      : {};

  for (const key of DISALLOWED_ROOT_SCRIPTS) {
    if (Object.prototype.hasOwnProperty.call(scripts, key)) {
      errors.push(
        `[verify-turbo-conventions] Root package.json contains legacy script "${key}" in ${formatPath(path)}. Remove it and use Turbo task aliases instead.`,
      );
    }
  }

  for (const [scriptName, scriptValue] of Object.entries(scripts)) {
    if (typeof scriptValue !== 'string') {
      continue;
    }
    checkRootTurboFilters(
      path,
      scriptName,
      scriptValue,
      workspacePackageNames,
      errors,
    );
  }
}

function checkPackageScripts(path, pkgJson, errors) {
  const scripts =
    pkgJson?.scripts && typeof pkgJson.scripts === 'object'
      ? pkgJson.scripts
      : {};
  const packageName = typeof pkgJson?.name === 'string' ? pkgJson.name : '';
  const isRootPackage = path === ROOT_PACKAGE_JSON_PATH;

  for (const key of DISALLOWED_PACKAGE_TASKS) {
    if (Object.prototype.hasOwnProperty.call(scripts, key)) {
      errors.push(
        `[verify-turbo-conventions] Disallowed script "${key}" found in ${formatPath(path)}. Package scripts must not define turbo:* aliases.`,
      );
    }
  }

  for (const [scriptName, scriptValue] of Object.entries(scripts)) {
    if (typeof scriptValue !== 'string') {
      continue;
    }
    if (CROSS_PACKAGE_BUILD_REGEX.test(scriptValue)) {
      errors.push(
        `[verify-turbo-conventions] Script "${scriptName}" in ${formatPath(path)} uses cross-package build chaining ("pnpm -C ../... build"). Use Turbo filters instead.`,
      );
    }

    if (isRootPackage) {
      continue;
    }

    const filteredBuildTargets = extractFilteredBuildTargets(scriptValue);
    for (const target of filteredBuildTargets) {
      if (isSelfFilterTarget(target, packageName)) {
        continue;
      }
      errors.push(
        `[verify-turbo-conventions] Script "${scriptName}" in ${formatPath(path)} uses cross-package build filter ("pnpm --filter ${target} run build"). Use Turbo task dependencies instead.`,
      );
    }
  }
}

function extractFilteredBuildTargets(scriptValue) {
  const filteredBuildRegex =
    /pnpm\s+--filter(?:=|\s+)(['"]?)([^'"\s]+)\1\s+run\s+build\b/g;
  const targets = [];
  for (const match of scriptValue.matchAll(filteredBuildRegex)) {
    const target = match?.[2];
    if (typeof target === 'string' && target.trim()) {
      targets.push(target.trim());
    }
  }
  return targets;
}

function isSelfFilterTarget(target, packageName) {
  return (
    target === packageName ||
    target === '.' ||
    target === './' ||
    target === '.\\'
  );
}

function reportErrorsAndExit(errors) {
  console.error('[verify-turbo-conventions] FAILED');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

function checkRootTurboFilters(
  path,
  scriptName,
  scriptValue,
  workspacePackageNames,
  errors,
) {
  const turboRuns = extractRootTurboRuns(scriptValue);
  for (const turboRun of turboRuns) {
    const taskName = turboRun.task;
    const filters = turboRun.filters;

    for (const rawFilterTarget of filters) {
      const filterTargets = splitCommaSeparatedFilter(rawFilterTarget);
      for (const filterTarget of filterTargets) {
        if (isPathFilter(filterTarget)) {
          continue;
        }

        const normalizedTarget = normalizeFilterTarget(filterTarget);
        if (isPathFilter(normalizedTarget)) {
          continue;
        }

        if (hasWildcard(normalizedTarget)) {
          if (
            workspaceHasMatchingPackagePattern(
              normalizedTarget,
              workspacePackageNames,
            )
          ) {
            continue;
          }
          errors.push(
            `[verify-turbo-conventions] Root script "${scriptName}" in ${formatPath(path)} uses turbo filter "${filterTarget}" for task "${taskName}", but no workspace package matches pattern "${normalizedTarget}".`,
          );
          continue;
        }

        if (workspacePackageNames.has(normalizedTarget)) {
          continue;
        }

        errors.push(
          `[verify-turbo-conventions] Root script "${scriptName}" in ${formatPath(path)} uses turbo filter "${filterTarget}" for task "${taskName}", but no such workspace package exists.`,
        );
      }
    }
  }
}

function splitCommaSeparatedFilter(filterTarget) {
  if (!filterTarget.includes(',')) {
    return [filterTarget];
  }
  return filterTarget
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeFilterTarget(filterTarget) {
  if (isNegatedFilter(filterTarget)) {
    return filterTarget.slice(1);
  }
  return filterTarget;
}

function hasWildcard(filterTarget) {
  return filterTarget.includes('*') || filterTarget.includes('?');
}

function workspaceHasMatchingPackagePattern(pattern, workspacePackageNames) {
  const regex = globPatternToRegex(pattern);
  for (const packageName of workspacePackageNames) {
    if (regex.test(packageName)) {
      return true;
    }
  }
  return false;
}

function globPatternToRegex(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`);
}

function getWorkspaceItemsFromTurboPayload(payload) {
  if (Array.isArray(payload?.packages?.items)) {
    return payload.packages.items;
  }
  if (Array.isArray(payload?.packages)) {
    return payload.packages;
  }
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
}

function extractWorkspaceName(item) {
  if (!item) {
    return null;
  }
  if (typeof item === 'string') {
    return item;
  }
  if (typeof item.name === 'string') {
    return item.name;
  }
  return null;
}

function splitShellSegments(scriptValue) {
  return scriptValue
    .split(SHELL_SEPARATOR_REGEX)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function extractTurboRun(segment) {
  const match = segment.match(TURBO_RUN_COMMAND_REGEX);
  if (!match) {
    return null;
  }
  const task = match?.[1]?.trim();
  const tail = match?.[2] ?? '';
  if (!task) {
    return null;
  }
  return { task, tail };
}

function extractFiltersFromTurboTail(tail) {
  const filters = [];
  for (const filterMatch of tail.matchAll(TURBO_FILTER_ARG_REGEX)) {
    const target = filterMatch?.[2]?.trim();
    if (target) {
      filters.push(target);
    }
  }
  return filters;
}

function getWorkspacePackageNames(errors) {
  const result = spawnSync('pnpm', ['exec', 'turbo', 'ls', '--output=json'], {
    cwd: ROOT,
    stdio: 'pipe',
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 64,
    env: process.env,
  });

  if (result.status !== 0) {
    errors.push(
      `[verify-turbo-conventions] Failed to list workspace packages from Turbo: ${result.stderr || result.stdout}`,
    );
    return new Set();
  }

  let payload;
  try {
    payload = JSON.parse(result.stdout || '{}');
  } catch (error) {
    errors.push(
      `[verify-turbo-conventions] Failed to parse Turbo workspace package output: ${error.message}`,
    );
    return new Set();
  }

  const items = getWorkspaceItemsFromTurboPayload(payload);
  const names = new Set();
  for (const item of items) {
    const name = extractWorkspaceName(item);
    if (typeof name === 'string' && name) {
      names.add(name);
    }
  }

  if (names.size === 0) {
    errors.push(
      '[verify-turbo-conventions] Turbo workspace package list was empty; cannot validate root script filters reliably.',
    );
  }

  return names;
}

function extractRootTurboRuns(scriptValue) {
  const runs = [];
  const segments = splitShellSegments(scriptValue);
  for (const segment of segments) {
    const turboRun = extractTurboRun(segment);
    if (!turboRun) {
      continue;
    }
    const filters = extractFiltersFromTurboTail(turboRun.tail);
    if (filters.length > 0) {
      runs.push({ task: turboRun.task, filters });
    }
  }
  return runs;
}

function isPathFilter(filterTarget) {
  return (
    filterTarget.startsWith('./') ||
    filterTarget.startsWith('../') ||
    filterTarget.startsWith('/')
  );
}

function isNegatedFilter(filterTarget) {
  return filterTarget.startsWith('!');
}

function failWith(errors, message) {
  errors.push(message);
  reportErrorsAndExit(errors);
}

function formatPath(path) {
  return path.replace(ROOT, '.');
}
