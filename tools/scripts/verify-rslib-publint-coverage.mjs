#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const PACKAGES_DIR = join(ROOT, 'packages');
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

  const issues = [];
  let rslibConfigCount = 0;

  for (const entry of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageDir = join(PACKAGES_DIR, entry.name);
    const packageJsonPath = join(packageDir, 'package.json');
    const rslibConfigPath = join(packageDir, 'rslib.config.ts');
    if (!existsSync(packageJsonPath) || !existsSync(rslibConfigPath)) {
      continue;
    }

    rslibConfigCount += 1;
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
    `[verify-rslib-publint-coverage] Verified ${rslibConfigCount} package rslib configs with pluginPublint wiring.`,
  );
}

main();
