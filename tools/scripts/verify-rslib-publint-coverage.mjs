#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const PACKAGES_DIR = join(ROOT, 'packages');
const ROOT_PACKAGE_JSON = join(ROOT, 'package.json');
const REQUIRED_IMPORT = "from 'rsbuild-plugin-publint'";
const REQUIRED_CALL = 'pluginPublint()';
const MIN_EXPECTED_RSLIB_PACKAGES = Number.parseInt(
  process.env.MIN_EXPECTED_RSLIB_PACKAGES ?? '16',
  10,
);

function main() {
  process.chdir(ROOT);

  if (!existsSync(PACKAGES_DIR)) {
    console.error(
      `[verify-rslib-publint-coverage] packages directory not found at ${PACKAGES_DIR}`,
    );
    process.exit(1);
  }

  if (!existsSync(ROOT_PACKAGE_JSON)) {
    console.error(
      `[verify-rslib-publint-coverage] package.json not found at ${ROOT_PACKAGE_JSON}`,
    );
    process.exit(1);
  }

  const issues = [];
  const rootPackageJson = readJson(ROOT_PACKAGE_JSON, issues);
  const hasRootPublintDependency = Boolean(
    rootPackageJson?.devDependencies?.['rsbuild-plugin-publint'] ||
      rootPackageJson?.dependencies?.['rsbuild-plugin-publint'],
  );
  if (!hasRootPublintDependency) {
    issues.push(
      'root package.json is missing rsbuild-plugin-publint dependency',
    );
  }

  let rslibConfigCount = 0;
  let rslibScriptCount = 0;
  const rslibConfigPackages = new Set();
  const rslibScriptPackages = new Set();

  for (const entry of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageDir = join(PACKAGES_DIR, entry.name);
    const packageJsonPath = join(packageDir, 'package.json');
    const rslibConfigPath = join(packageDir, 'rslib.config.ts');
    if (!existsSync(packageJsonPath)) {
      continue;
    }

    const packageJson = readJson(packageJsonPath, issues);
    if (hasRslibBuildScript(packageJson)) {
      rslibScriptCount += 1;
      rslibScriptPackages.add(entry.name);
      if (!existsSync(rslibConfigPath)) {
        issues.push(
          `${entry.name}: has rslib build script but no rslib.config.ts`,
        );
      }
    }

    if (!existsSync(rslibConfigPath)) {
      continue;
    }

    rslibConfigCount += 1;
    rslibConfigPackages.add(entry.name);
    const text = readFileSync(rslibConfigPath, 'utf8');
    if (!text.includes(REQUIRED_IMPORT)) {
      issues.push(
        `${entry.name}: missing pluginPublint import from rsbuild-plugin-publint`,
      );
    }
    if (!text.includes(REQUIRED_CALL)) {
      issues.push(`${entry.name}: missing pluginPublint() in plugins array`);
    }
  }

  if (
    Number.isFinite(MIN_EXPECTED_RSLIB_PACKAGES) &&
    MIN_EXPECTED_RSLIB_PACKAGES > 0 &&
    rslibConfigCount < MIN_EXPECTED_RSLIB_PACKAGES
  ) {
    issues.push(
      `expected at least ${MIN_EXPECTED_RSLIB_PACKAGES} package rslib configs, found ${rslibConfigCount}`,
    );
  }

  const scriptPackagesMissingCoverage = Array.from(rslibScriptPackages).filter(
    (name) => !rslibConfigPackages.has(name),
  );
  if (scriptPackagesMissingCoverage.length > 0) {
    issues.push(
      `rslib script packages missing rslib coverage: ${scriptPackagesMissingCoverage.join(', ')}`,
    );
  }

  if (issues.length > 0) {
    console.error(
      `[verify-rslib-publint-coverage] Found ${issues.length} issue(s):`,
    );
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log(
    `[verify-rslib-publint-coverage] Verified ${rslibConfigCount} package rslib configs with pluginPublint wiring (${rslibScriptCount} package scripts use rslib build).`,
  );
}

function readJson(path, issues) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    issues.push(`failed to parse JSON ${path}: ${error.message}`);
    return null;
  }
}

function hasRslibBuildScript(packageJson) {
  if (!packageJson?.scripts || typeof packageJson.scripts !== 'object') {
    return false;
  }
  return Object.values(packageJson.scripts).some(
    (script) => typeof script === 'string' && /\brslib\s+build\b/.test(script),
  );
}

main();
