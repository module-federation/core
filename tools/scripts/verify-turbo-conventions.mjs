#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const ROOT_PACKAGE_JSON_PATH = resolve(ROOT, 'package.json');
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
  if (rootPackageJson) {
    checkRootScripts(rootPackageJsonPath, rootPackageJson, errors);
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

function checkRootScripts(path, pkgJson, errors) {
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

function failWith(errors, message) {
  errors.push(message);
  reportErrorsAndExit(errors);
}

function formatPath(path) {
  return path.replace(ROOT, '.');
}
