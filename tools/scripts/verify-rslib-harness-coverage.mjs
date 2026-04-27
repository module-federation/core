#!/usr/bin/env node
import { existsSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import { resolveProjects } from '../../scripts/rslib-harness.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const HARNESS_CONFIG_PATH = join(ROOT, 'rslib.harness.config.mjs');
const RSLIB_CONFIG_GLOBS = [
  'packages/*/rslib.config.{mjs,ts,js,cjs,mts,cts}',
  'apps/**/rslib.config.{mjs,ts,js,cjs,mts,cts}',
];
const EXPECTED_MIN_CONFIGS = Number.parseInt(
  process.env.MIN_EXPECTED_RSLIB_HARNESS_PROJECTS ?? '20',
  10,
);

function getCanonicalPath(value) {
  try {
    return realpathSync(value);
  } catch {
    return resolve(value);
  }
}

async function main() {
  process.chdir(ROOT);

  if (!existsSync(HARNESS_CONFIG_PATH)) {
    throw new Error(`Harness config not found at ${HARNESS_CONFIG_PATH}`);
  }

  const expectedConfigs = fg
    .sync(RSLIB_CONFIG_GLOBS, {
      cwd: ROOT,
      absolute: true,
      dot: true,
      onlyFiles: true,
      unique: true,
      followSymbolicLinks: false,
      ignore: ['**/node_modules/**', '**/dist/**'],
    })
    .map(getCanonicalPath)
    .sort((a, b) => a.localeCompare(b));

  if (
    Number.isFinite(EXPECTED_MIN_CONFIGS) &&
    EXPECTED_MIN_CONFIGS > 0 &&
    expectedConfigs.length < EXPECTED_MIN_CONFIGS
  ) {
    throw new Error(
      `Expected at least ${EXPECTED_MIN_CONFIGS} rslib configs, found ${expectedConfigs.length}.`,
    );
  }

  const resolvedProjects = await resolveProjects({
    harnessConfigPath: HARNESS_CONFIG_PATH,
    rootDir: ROOT,
    projectFilters: [],
  });

  const resolvedConfigSet = new Set(
    resolvedProjects
      .map((project) => project.configFile)
      .filter(Boolean)
      .map(getCanonicalPath),
  );

  const missingConfigs = expectedConfigs.filter(
    (configPath) => !resolvedConfigSet.has(configPath),
  );

  if (missingConfigs.length > 0) {
    const prettyMissing = missingConfigs
      .map((configPath) => `- ${configPath.replace(`${ROOT}/`, '')}`)
      .join('\n');
    throw new Error(
      `Harness is missing ${missingConfigs.length} rslib config(s):\n${prettyMissing}`,
    );
  }

  console.log(
    `[verify-rslib-harness-coverage] Verified ${resolvedProjects.length} harness projects covering ${expectedConfigs.length} rslib config(s).`,
  );
}

main().catch((error) => {
  console.error(
    `[verify-rslib-harness-coverage] ${error instanceof Error ? error.message : error}`,
  );
  process.exit(1);
});
