#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PACKAGES_DIR = join(process.cwd(), 'packages');
const REQUIRED_IMPORT = "from 'rsbuild-plugin-publint'";
const REQUIRED_CALL = 'pluginPublint()';

function main() {
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
