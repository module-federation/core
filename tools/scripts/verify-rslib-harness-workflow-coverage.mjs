#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const BUILD_AND_TEST_WORKFLOW_PATH = resolve(
  ROOT,
  '.github/workflows/build-and-test.yml',
);
const CI_LOCAL_PATH = resolve(ROOT, 'tools/scripts/ci-local.mjs');
const PACKAGE_JSON_PATH = resolve(ROOT, 'package.json');

const REQUIRED_PACKAGE_SCRIPTS = ['test:rslib-harness', 'verify:rslib-harness'];
const REQUIRED_WORKFLOW_STEPS = [
  {
    name: 'Run Rslib Harness Tests',
    runPattern: /pnpm run test:rslib-harness/,
  },
  {
    name: 'Verify Rslib Harness Coverage',
    runPattern: /pnpm run verify:rslib-harness/,
  },
];

function fail(message) {
  console.error(`[verify-rslib-harness-workflow-coverage] ${message}`);
  process.exit(1);
}

function readYaml(path) {
  try {
    return yaml.load(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(
      `Failed to read/parse YAML file ${path}: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(
      `Failed to read/parse JSON file ${path}: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}

function assertFileExists(path) {
  if (!existsSync(path)) {
    fail(`Required file does not exist: ${path}`);
  }
}

function assertPackageScripts(packageJson) {
  const scripts = packageJson?.scripts ?? {};
  const missing = REQUIRED_PACKAGE_SCRIPTS.filter(
    (scriptName) => typeof scripts[scriptName] !== 'string',
  );

  if (missing.length > 0) {
    fail(
      `Missing required package scripts: ${missing.join(', ')} in ${PACKAGE_JSON_PATH}`,
    );
  }
}

function assertWorkflowSteps(workflow) {
  const steps = workflow?.jobs?.['checkout-install']?.steps;
  if (!Array.isArray(steps)) {
    fail(
      `Unable to locate checkout-install steps in ${BUILD_AND_TEST_WORKFLOW_PATH}`,
    );
  }

  for (const requiredStep of REQUIRED_WORKFLOW_STEPS) {
    const step = steps.find(
      (candidate) => candidate?.name === requiredStep.name,
    );
    if (!step) {
      fail(
        `Missing workflow step "${requiredStep.name}" in ${BUILD_AND_TEST_WORKFLOW_PATH}`,
      );
    }

    if (
      typeof step.run !== 'string' ||
      !requiredStep.runPattern.test(step.run)
    ) {
      fail(
        `Workflow step "${requiredStep.name}" does not match expected run command pattern ${requiredStep.runPattern}`,
      );
    }
  }
}

function assertCiLocalSteps(ciLocalText) {
  for (const requiredStep of REQUIRED_WORKFLOW_STEPS) {
    const escapedStepName = requiredStep.name.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
    const stepRegex = new RegExp(`step\\('${escapedStepName}'`, 'g');
    const matches = ciLocalText.match(stepRegex) ?? [];
    if (matches.length < 2) {
      fail(
        `Expected ci-local to include step "${requiredStep.name}" in both build-and-test and build-metro jobs (found ${matches.length}).`,
      );
    }
  }
}

function main() {
  process.chdir(ROOT);

  assertFileExists(PACKAGE_JSON_PATH);
  assertFileExists(BUILD_AND_TEST_WORKFLOW_PATH);
  assertFileExists(CI_LOCAL_PATH);

  const packageJson = readJson(PACKAGE_JSON_PATH);
  const workflow = readYaml(BUILD_AND_TEST_WORKFLOW_PATH);
  const ciLocalText = readFileSync(CI_LOCAL_PATH, 'utf8');

  assertPackageScripts(packageJson);
  assertWorkflowSteps(workflow);
  assertCiLocalSteps(ciLocalText);

  console.log(
    '[verify-rslib-harness-workflow-coverage] Verified harness checks in package scripts, GitHub workflow, and ci-local jobs.',
  );
}

main();
