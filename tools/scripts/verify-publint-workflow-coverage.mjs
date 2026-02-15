#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const PACKAGES_DIR = join(ROOT, 'packages');
const BUILD_AND_TEST_WORKFLOW = join(
  ROOT,
  '.github/workflows/build-and-test.yml',
);
const BUILD_METRO_WORKFLOW = join(ROOT, '.github/workflows/build-metro.yml');
const CI_LOCAL_SCRIPT = join(ROOT, 'tools/scripts/ci-local.mjs');
const MIN_EXPECTED_PACKAGE_COUNT = Number.parseInt(
  process.env.MIN_EXPECTED_PACKAGE_COUNT ?? '30',
  10,
);
const VERIFY_STEP_NAME = 'Verify Publint Workflow Coverage';

const REQUIRED_PATTERNS = {
  buildAndTestLoop: [
    /for pkg in packages\/\*; do/,
    /\[\[ "\$pkg" != packages\/metro-\* \]\]/,
    /npx publint "\$pkg"/,
  ],
  buildMetroLoop: [/for pkg in packages\/metro-\*; do/, /npx publint "\$pkg"/],
  verifyStepRun: [/node tools\/scripts\/verify-publint-workflow-coverage\.mjs/],
  ciLocal: {
    verifyRslibStepCount: {
      pattern: /step\('Verify Package Rslib Publint Wiring'/g,
      minCount: 2,
      description: 'Verify Package Rslib Publint Wiring step entries',
    },
    verifyWorkflowStepCount: {
      pattern: /step\('Verify Publint Workflow Coverage'/g,
      minCount: 2,
      description: 'Verify Publint Workflow Coverage step entries',
    },
    nonMetroPublintLoop: {
      pattern:
        /for pkg in packages\/\*; do[\s\S]*?\[\[ "\$pkg" != packages\/metro-\* \]\]/,
      minCount: 1,
      description: 'non-metro publint loop',
    },
    metroPublintLoop: {
      pattern: /for pkg in packages\/metro-\*; do/,
      minCount: 1,
      description: 'metro publint loop',
    },
  },
};

function main() {
  process.chdir(ROOT);

  const issues = [];
  if (!existsSync(PACKAGES_DIR)) {
    issues.push(`packages directory not found: ${PACKAGES_DIR}`);
  }
  if (!existsSync(BUILD_AND_TEST_WORKFLOW)) {
    issues.push(`missing workflow: ${BUILD_AND_TEST_WORKFLOW}`);
  }
  if (!existsSync(BUILD_METRO_WORKFLOW)) {
    issues.push(`missing workflow: ${BUILD_METRO_WORKFLOW}`);
  }
  if (!existsSync(CI_LOCAL_SCRIPT)) {
    issues.push(`missing ci-local script: ${CI_LOCAL_SCRIPT}`);
  }
  if (issues.length > 0) {
    fail(issues);
  }

  const packageDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(PACKAGES_DIR, name, 'package.json')));

  const metroPackageDirs = packageDirs.filter((name) =>
    name.startsWith('metro-'),
  );
  const nonMetroPackageDirs = packageDirs.filter(
    (name) => !name.startsWith('metro-'),
  );

  if (
    Number.isFinite(MIN_EXPECTED_PACKAGE_COUNT) &&
    MIN_EXPECTED_PACKAGE_COUNT > 0 &&
    packageDirs.length < MIN_EXPECTED_PACKAGE_COUNT
  ) {
    issues.push(
      `expected at least ${MIN_EXPECTED_PACKAGE_COUNT} packages with package.json, found ${packageDirs.length}`,
    );
  }

  if (metroPackageDirs.length === 0) {
    issues.push('expected at least one metro package in packages/* scope');
  }
  if (nonMetroPackageDirs.length === 0) {
    issues.push('expected at least one non-metro package in packages/* scope');
  }

  const buildAndTestWorkflow = readWorkflow(BUILD_AND_TEST_WORKFLOW, issues);
  const buildMetroWorkflow = readWorkflow(BUILD_METRO_WORKFLOW, issues);
  const ciLocalText = readText(CI_LOCAL_SCRIPT, issues);

  const buildAndTestLoop = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: 'Check Package Publishing Compatibility',
    issues,
  });
  const buildMetroLoop = readRunCommand({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: 'Check Package Publishing Compatibility',
    issues,
  });
  const buildAndTestVerifyStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: VERIFY_STEP_NAME,
    issues,
  });
  const buildMetroVerifyStep = readRunCommand({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: VERIFY_STEP_NAME,
    issues,
  });

  assertPatterns({
    text: buildAndTestLoop,
    workflowName: 'build-and-test',
    label: 'publint loop',
    patterns: REQUIRED_PATTERNS.buildAndTestLoop,
    issues,
  });
  assertPatterns({
    text: buildMetroLoop,
    workflowName: 'build-metro',
    label: 'publint loop',
    patterns: REQUIRED_PATTERNS.buildMetroLoop,
    issues,
  });
  assertPatterns({
    text: buildAndTestVerifyStep,
    workflowName: 'build-and-test',
    label: VERIFY_STEP_NAME,
    patterns: REQUIRED_PATTERNS.verifyStepRun,
    issues,
  });
  assertPatterns({
    text: buildMetroVerifyStep,
    workflowName: 'build-metro',
    label: VERIFY_STEP_NAME,
    patterns: REQUIRED_PATTERNS.verifyStepRun,
    issues,
  });
  assertPatternCount({
    text: ciLocalText,
    pattern: REQUIRED_PATTERNS.ciLocal.verifyRslibStepCount.pattern,
    minCount: REQUIRED_PATTERNS.ciLocal.verifyRslibStepCount.minCount,
    description: REQUIRED_PATTERNS.ciLocal.verifyRslibStepCount.description,
    issues,
  });
  assertPatternCount({
    text: ciLocalText,
    pattern: REQUIRED_PATTERNS.ciLocal.verifyWorkflowStepCount.pattern,
    minCount: REQUIRED_PATTERNS.ciLocal.verifyWorkflowStepCount.minCount,
    description: REQUIRED_PATTERNS.ciLocal.verifyWorkflowStepCount.description,
    issues,
  });
  assertPatternCount({
    text: ciLocalText,
    pattern: REQUIRED_PATTERNS.ciLocal.nonMetroPublintLoop.pattern,
    minCount: REQUIRED_PATTERNS.ciLocal.nonMetroPublintLoop.minCount,
    description: REQUIRED_PATTERNS.ciLocal.nonMetroPublintLoop.description,
    issues,
  });
  assertPatternCount({
    text: ciLocalText,
    pattern: REQUIRED_PATTERNS.ciLocal.metroPublintLoop.pattern,
    minCount: REQUIRED_PATTERNS.ciLocal.metroPublintLoop.minCount,
    description: REQUIRED_PATTERNS.ciLocal.metroPublintLoop.description,
    issues,
  });

  const coveredInBuildAndTest = new Set(nonMetroPackageDirs);
  const coveredInBuildMetro = new Set(metroPackageDirs);
  const uncovered = packageDirs.filter(
    (name) =>
      !coveredInBuildAndTest.has(name) && !coveredInBuildMetro.has(name),
  );

  if (uncovered.length > 0) {
    issues.push(`uncovered packages: ${uncovered.join(', ')}`);
  }

  if (issues.length > 0) {
    fail(issues);
  }

  console.log(
    `[verify-publint-workflow-coverage] Verified publint scope coverage for ${packageDirs.length} packages (${nonMetroPackageDirs.length} non-metro + ${metroPackageDirs.length} metro).`,
  );
}

function fail(issues) {
  console.error(
    `[verify-publint-workflow-coverage] Found ${issues.length} issue(s):`,
  );
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

function readWorkflow(path, issues) {
  try {
    return yaml.load(readFileSync(path, 'utf8'));
  } catch (error) {
    issues.push(`failed to parse workflow ${path}: ${error.message}`);
    return null;
  }
}

function readText(path, issues) {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    issues.push(`failed to read ${path}: ${error.message}`);
    return '';
  }
}

function readRunCommand({ workflow, workflowName, jobName, stepName, issues }) {
  const step = workflow?.jobs?.[jobName]?.steps?.find(
    (candidate) => candidate?.name === stepName,
  );
  if (!step) {
    issues.push(
      `${workflowName} workflow is missing step "${stepName}" in job "${jobName}"`,
    );
    return '';
  }
  if (typeof step.run !== 'string' || step.run.trim().length === 0) {
    issues.push(
      `${workflowName} workflow step "${stepName}" in job "${jobName}" is missing a run command`,
    );
    return '';
  }
  return step.run;
}

function assertPatterns({ text, workflowName, label, patterns, issues }) {
  for (const pattern of patterns) {
    if (!pattern.test(text)) {
      issues.push(
        `${workflowName} workflow ${label} is missing required pattern: ${pattern}`,
      );
    }
  }
}

function assertPatternCount({ text, pattern, minCount, description, issues }) {
  const matches = text.match(pattern);
  const count = matches ? matches.length : 0;
  if (count < minCount) {
    issues.push(
      `ci-local script is missing ${description}: expected at least ${minCount}, found ${count}`,
    );
  }
}

main();
