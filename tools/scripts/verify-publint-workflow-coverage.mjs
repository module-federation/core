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
const ROOT_PACKAGE_JSON = join(ROOT, 'package.json');
const MIN_EXPECTED_PACKAGE_COUNT = Number.parseInt(
  process.env.MIN_EXPECTED_PACKAGE_COUNT ?? '30',
  10,
);
const VERIFY_STEP_NAME = 'Verify Publint Coverage Guards';

const REQUIRED_PATTERNS = {
  buildAndTestLoop: [
    /for pkg in packages\/\*; do/,
    /\[\[ "\$pkg" != packages\/metro-\* \]\]/,
    /npx publint "\$pkg"/,
  ],
  buildMetroLoop: [/for pkg in packages\/metro-\*; do/, /npx publint "\$pkg"/],
  buildAndTestBuildStep: [
    /npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4 --skip-nx-cache/,
    /npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4/,
  ],
  buildMetroBuildStep: [
    /npx nx run-many --targets=build --projects=tag:type:pkg,tag:type:metro --parallel=4 --skip-nx-cache/,
  ],
  verifyStepRun: [/pnpm verify:publint:coverage/],
  ciLocal: {
    verifyCoverageStepCount: {
      pattern: /step\('Verify Publint Coverage Guards'/g,
      minCount: 2,
      description: 'Verify Publint Coverage Guards step entries',
    },
    verifyCoverageCommandCount: {
      pattern: /runCommand\('pnpm', \['verify:publint:coverage'\], ctx\)/g,
      minCount: 2,
      description: 'verify:publint:coverage command entries',
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
  if (!existsSync(ROOT_PACKAGE_JSON)) {
    issues.push(`missing package manifest: ${ROOT_PACKAGE_JSON}`);
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
  const packageJson = readJson(ROOT_PACKAGE_JSON, issues);
  const verifyPublintCoverageCommand =
    packageJson?.scripts?.['verify:publint:coverage'];

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
  const buildAndTestBuildStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: 'Run Build for All',
    issues,
  });
  const buildMetroBuildStep = readRunCommand({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: 'Build All Required Packages',
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
    text: buildAndTestBuildStep,
    workflowName: 'build-and-test',
    label: 'build command',
    patterns: REQUIRED_PATTERNS.buildAndTestBuildStep,
    issues,
  });
  assertPatterns({
    text: buildMetroBuildStep,
    workflowName: 'build-metro',
    label: 'build command',
    patterns: REQUIRED_PATTERNS.buildMetroBuildStep,
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
    pattern: REQUIRED_PATTERNS.ciLocal.verifyCoverageStepCount.pattern,
    minCount: REQUIRED_PATTERNS.ciLocal.verifyCoverageStepCount.minCount,
    description: REQUIRED_PATTERNS.ciLocal.verifyCoverageStepCount.description,
    issues,
  });
  assertPatternCount({
    text: ciLocalText,
    pattern: REQUIRED_PATTERNS.ciLocal.verifyCoverageCommandCount.pattern,
    minCount: REQUIRED_PATTERNS.ciLocal.verifyCoverageCommandCount.minCount,
    description:
      REQUIRED_PATTERNS.ciLocal.verifyCoverageCommandCount.description,
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
  assertPatterns({
    text: verifyPublintCoverageCommand ?? '',
    workflowName: 'package.json',
    label: 'verify:publint:coverage script',
    patterns: [
      /node tools\/scripts\/verify-rslib-publint-coverage\.mjs/,
      /node tools\/scripts\/verify-publint-workflow-coverage\.mjs/,
    ],
    issues,
  });
  const ciLocalBuildMetroStep = extractStepBlock({
    text: ciLocalText,
    label: 'Build all required packages',
    issues,
  });
  const ciLocalBuildAndTestJob = extractJobBlock({
    text: ciLocalText,
    jobName: 'build-and-test',
    issues,
  });
  const ciLocalBuildMetroJob = extractJobBlock({
    text: ciLocalText,
    jobName: 'build-metro',
    issues,
  });
  const ciLocalBuildAndTestVerifyStep = extractStepBlock({
    text: ciLocalBuildAndTestJob,
    label: VERIFY_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-and-test job',
  });
  const ciLocalBuildMetroVerifyStep = extractStepBlock({
    text: ciLocalBuildMetroJob,
    label: VERIFY_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-metro job',
  });
  assertPatterns({
    text: ciLocalBuildMetroStep,
    workflowName: 'ci-local',
    label: 'build-metro build step',
    patterns: [
      /--targets=build/,
      /--projects=tag:type:pkg,tag:type:metro/,
      /--skip-nx-cache/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalBuildAndTestVerifyStep,
    workflowName: 'ci-local build-and-test',
    label: VERIFY_STEP_NAME,
    patterns: [/runCommand\('pnpm', \['verify:publint:coverage'\], ctx\)/],
    issues,
  });
  assertPatterns({
    text: ciLocalBuildMetroVerifyStep,
    workflowName: 'ci-local build-metro',
    label: VERIFY_STEP_NAME,
    patterns: [/runCommand\('pnpm', \['verify:publint:coverage'\], ctx\)/],
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

function readJson(path, issues) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    issues.push(`failed to parse JSON ${path}: ${error.message}`);
    return null;
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

function extractStepBlock({
  text,
  label,
  issues,
  sourceLabel = 'ci-local script',
}) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const stepRegex = new RegExp(`step\\('${escapedLabel}'[\\s\\S]*?\\),\\n`);
  const match = text.match(stepRegex);
  if (!match) {
    issues.push(`${sourceLabel} is missing step "${label}"`);
    return '';
  }
  return match[0];
}

function extractJobBlock({ text, jobName, issues }) {
  const jobMatches = Array.from(text.matchAll(/\bname:\s*'([^']+)'/g)).map(
    (match) => ({
      name: match[1],
      index: match.index,
    }),
  );
  const jobIndex = jobMatches.findIndex((job) => job.name === jobName);
  if (jobIndex === -1) {
    issues.push(`ci-local script is missing job "${jobName}"`);
    return '';
  }

  const start = jobMatches[jobIndex].index;
  const end = jobMatches[jobIndex + 1]?.index ?? text.length;
  return text.slice(start, end);
}

main();
