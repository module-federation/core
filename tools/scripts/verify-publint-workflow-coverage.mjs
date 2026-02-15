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
const VERIFY_RSLIB_COVERAGE_SCRIPT = join(
  ROOT,
  'tools/scripts/verify-rslib-publint-coverage.mjs',
);
const VERIFY_WORKFLOW_COVERAGE_SCRIPT = join(
  ROOT,
  'tools/scripts/verify-publint-workflow-coverage.mjs',
);
const MIN_EXPECTED_PACKAGE_COUNT = Number.parseInt(
  process.env.MIN_EXPECTED_PACKAGE_COUNT ?? '30',
  10,
);
const VERIFY_STEP_NAME = 'Verify Publint Coverage Guards';
const TEMPLATE_VERIFY_STEP_NAME = 'Verify Rslib Template Publint Wiring';
const PUBLINT_STEP_NAME = 'Check Package Publishing Compatibility';
const BUILD_AND_TEST_BUILD_STEP_NAME = 'Run Build for All';
const BUILD_METRO_BUILD_STEP_NAME = 'Build All Required Packages';
const WORKFLOW_INSTALL_STEP_NAME = 'Install Dependencies';
const CI_LOCAL_INSTALL_STEP_NAME = 'Install dependencies';
const LEGACY_VERIFY_STEP_NAMES = [
  'Verify Package Rslib Publint Wiring',
  'Verify Publint Workflow Coverage',
];

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
  templateVerifyStepRun: [
    /node packages\/create-module-federation\/scripts\/verify-rslib-templates\.mjs/,
  ],
  ciLocalTemplateVerifyStepRun: [
    /runCommand\(\s*'node',\s*\[\s*'packages\/create-module-federation\/scripts\/verify-rslib-templates\.mjs',\s*\],\s*ctx,\s*\)/,
  ],
  ciLocal: {
    templateVerifyStepCount: {
      pattern: /step\('Verify Rslib Template Publint Wiring'/g,
      minCount: 2,
      description: 'Verify Rslib Template Publint Wiring step entries',
    },
    templateVerifyCommandCount: {
      pattern:
        /runCommand\(\s*'node',\s*\[\s*'packages\/create-module-federation\/scripts\/verify-rslib-templates\.mjs',\s*\],\s*ctx,\s*\)/g,
      minCount: 2,
      description: 'verify-rslib-templates command entries',
    },
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
    legacyVerifyPackageStep: {
      pattern: /step\('Verify Package Rslib Publint Wiring'/,
      minCount: 0,
      description: 'legacy Verify Package Rslib Publint Wiring step',
    },
    legacyVerifyWorkflowStep: {
      pattern: /step\('Verify Publint Workflow Coverage'/,
      minCount: 0,
      description: 'legacy Verify Publint Workflow Coverage step',
    },
  },
  staleExclusions: [
    /\[\[ "\$pkg" != packages\/assemble-release-plan \]\]/,
    /\[\[ "\$pkg" != packages\/chrome-devtools \]\]/,
    /\[\[ "\$pkg" != packages\/core \]\]/,
    /\[\[ "\$pkg" != packages\/modernjs \]\]/,
    /\[\[ "\$pkg" != packages\/metro-core \]\]/,
    /\[\[ "\$pkg" != packages\/metro-plugin-rnef \]\]/,
    /\[\[ "\$pkg" != packages\/metro-plugin-rnc-cli \]\]/,
  ],
  exactCommandCounts: {
    buildAndTestColdBuild: {
      pattern:
        /^\s*npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4 --skip-nx-cache\s*$/gm,
      expectedCount: 1,
      description: 'build-and-test cold build command',
    },
    buildAndTestWarmBuild: {
      pattern:
        /^\s*npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4\s*$/gm,
      expectedCount: 1,
      description: 'build-and-test warm build command',
    },
    buildMetroBuild: {
      pattern:
        /^\s*npx nx run-many --targets=build --projects=tag:type:pkg,tag:type:metro --parallel=4 --skip-nx-cache\s*$/gm,
      expectedCount: 1,
      description: 'build-metro build command',
    },
    publintLoopCommand: {
      pattern: /^\s*npx publint "\$pkg"\s*$/gm,
      expectedCount: 1,
      description: 'publint command',
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
  if (!existsSync(VERIFY_RSLIB_COVERAGE_SCRIPT)) {
    issues.push(`missing coverage script: ${VERIFY_RSLIB_COVERAGE_SCRIPT}`);
  }
  if (!existsSync(VERIFY_WORKFLOW_COVERAGE_SCRIPT)) {
    issues.push(`missing coverage script: ${VERIFY_WORKFLOW_COVERAGE_SCRIPT}`);
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
    stepName: PUBLINT_STEP_NAME,
    issues,
  });
  const buildMetroLoop = readRunCommand({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: PUBLINT_STEP_NAME,
    issues,
  });
  const buildAndTestBuildStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: BUILD_AND_TEST_BUILD_STEP_NAME,
    issues,
  });
  const buildMetroBuildStep = readRunCommand({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: BUILD_METRO_BUILD_STEP_NAME,
    issues,
  });
  const buildAndTestVerifyStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: VERIFY_STEP_NAME,
    issues,
  });
  const buildAndTestTemplateVerifyStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: TEMPLATE_VERIFY_STEP_NAME,
    issues,
  });
  const buildMetroVerifyStep = readRunCommand({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: VERIFY_STEP_NAME,
    issues,
  });
  const buildMetroTemplateVerifyStep = readRunCommand({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: TEMPLATE_VERIFY_STEP_NAME,
    issues,
  });

  assertWorkflowStepOrder({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    orderedStepNames: [
      WORKFLOW_INSTALL_STEP_NAME,
      TEMPLATE_VERIFY_STEP_NAME,
      VERIFY_STEP_NAME,
      BUILD_AND_TEST_BUILD_STEP_NAME,
      PUBLINT_STEP_NAME,
    ],
    issues,
  });
  assertWorkflowStepOrder({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    orderedStepNames: [
      WORKFLOW_INSTALL_STEP_NAME,
      TEMPLATE_VERIFY_STEP_NAME,
      VERIFY_STEP_NAME,
      BUILD_METRO_BUILD_STEP_NAME,
      PUBLINT_STEP_NAME,
    ],
    issues,
  });
  assertWorkflowMissingSteps({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    forbiddenStepNames: LEGACY_VERIFY_STEP_NAMES,
    issues,
  });
  assertWorkflowMissingSteps({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    forbiddenStepNames: LEGACY_VERIFY_STEP_NAMES,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_INSTALL_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: TEMPLATE_VERIFY_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: VERIFY_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: WORKFLOW_INSTALL_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: TEMPLATE_VERIFY_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: VERIFY_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: BUILD_AND_TEST_BUILD_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: PUBLINT_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: BUILD_METRO_BUILD_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: PUBLINT_STEP_NAME,
    issues,
  });

  assertPatterns({
    text: buildAndTestLoop,
    workflowName: 'build-and-test',
    label: 'publint loop',
    patterns: REQUIRED_PATTERNS.buildAndTestLoop,
    issues,
  });
  assertLoopExclusions({
    text: buildAndTestLoop,
    sourceLabel: 'build-and-test workflow publint loop',
    expectedExclusions: ['packages/metro-*'],
    issues,
  });
  assertForbiddenPatterns({
    text: buildAndTestLoop,
    workflowName: 'build-and-test',
    label: 'publint loop',
    patterns: REQUIRED_PATTERNS.staleExclusions,
    issues,
  });
  assertRegexCount({
    text: buildAndTestLoop,
    pattern: REQUIRED_PATTERNS.exactCommandCounts.publintLoopCommand.pattern,
    expectedCount:
      REQUIRED_PATTERNS.exactCommandCounts.publintLoopCommand.expectedCount,
    description:
      REQUIRED_PATTERNS.exactCommandCounts.publintLoopCommand.description,
    sourceLabel: 'build-and-test workflow publint loop',
    issues,
  });
  assertPatterns({
    text: buildMetroLoop,
    workflowName: 'build-metro',
    label: 'publint loop',
    patterns: REQUIRED_PATTERNS.buildMetroLoop,
    issues,
  });
  assertLoopExclusions({
    text: buildMetroLoop,
    sourceLabel: 'build-metro workflow publint loop',
    expectedExclusions: [],
    issues,
  });
  assertForbiddenPatterns({
    text: buildMetroLoop,
    workflowName: 'build-metro',
    label: 'publint loop',
    patterns: REQUIRED_PATTERNS.staleExclusions,
    issues,
  });
  assertRegexCount({
    text: buildMetroLoop,
    pattern: REQUIRED_PATTERNS.exactCommandCounts.publintLoopCommand.pattern,
    expectedCount:
      REQUIRED_PATTERNS.exactCommandCounts.publintLoopCommand.expectedCount,
    description:
      REQUIRED_PATTERNS.exactCommandCounts.publintLoopCommand.description,
    sourceLabel: 'build-metro workflow publint loop',
    issues,
  });
  assertPatterns({
    text: buildAndTestBuildStep,
    workflowName: 'build-and-test',
    label: 'build command',
    patterns: REQUIRED_PATTERNS.buildAndTestBuildStep,
    issues,
  });
  assertForbiddenPatterns({
    text: buildAndTestBuildStep,
    workflowName: 'build-and-test',
    label: 'build command',
    patterns: [/tag:type:metro/],
    issues,
  });
  assertRegexCount({
    text: buildAndTestBuildStep,
    pattern: REQUIRED_PATTERNS.exactCommandCounts.buildAndTestColdBuild.pattern,
    expectedCount:
      REQUIRED_PATTERNS.exactCommandCounts.buildAndTestColdBuild.expectedCount,
    description:
      REQUIRED_PATTERNS.exactCommandCounts.buildAndTestColdBuild.description,
    sourceLabel: 'build-and-test workflow build command',
    issues,
  });
  assertRegexCount({
    text: buildAndTestBuildStep,
    pattern: REQUIRED_PATTERNS.exactCommandCounts.buildAndTestWarmBuild.pattern,
    expectedCount:
      REQUIRED_PATTERNS.exactCommandCounts.buildAndTestWarmBuild.expectedCount,
    description:
      REQUIRED_PATTERNS.exactCommandCounts.buildAndTestWarmBuild.description,
    sourceLabel: 'build-and-test workflow build command',
    issues,
  });
  assertPatterns({
    text: buildMetroBuildStep,
    workflowName: 'build-metro',
    label: 'build command',
    patterns: REQUIRED_PATTERNS.buildMetroBuildStep,
    issues,
  });
  assertRegexCount({
    text: buildMetroBuildStep,
    pattern: REQUIRED_PATTERNS.exactCommandCounts.buildMetroBuild.pattern,
    expectedCount:
      REQUIRED_PATTERNS.exactCommandCounts.buildMetroBuild.expectedCount,
    description:
      REQUIRED_PATTERNS.exactCommandCounts.buildMetroBuild.description,
    sourceLabel: 'build-metro workflow build command',
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
  assertPatterns({
    text: buildAndTestTemplateVerifyStep,
    workflowName: 'build-and-test',
    label: TEMPLATE_VERIFY_STEP_NAME,
    patterns: REQUIRED_PATTERNS.templateVerifyStepRun,
    issues,
  });
  assertPatterns({
    text: buildMetroTemplateVerifyStep,
    workflowName: 'build-metro',
    label: TEMPLATE_VERIFY_STEP_NAME,
    patterns: REQUIRED_PATTERNS.templateVerifyStepRun,
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildAndTestVerifyStep,
    sourceLabel: `build-and-test workflow "${VERIFY_STEP_NAME}" step`,
    expectedCommand: 'pnpm verify:publint:coverage',
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildMetroVerifyStep,
    sourceLabel: `build-metro workflow "${VERIFY_STEP_NAME}" step`,
    expectedCommand: 'pnpm verify:publint:coverage',
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildAndTestTemplateVerifyStep,
    sourceLabel: `build-and-test workflow "${TEMPLATE_VERIFY_STEP_NAME}" step`,
    expectedCommand:
      'node packages/create-module-federation/scripts/verify-rslib-templates.mjs',
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildMetroTemplateVerifyStep,
    sourceLabel: `build-metro workflow "${TEMPLATE_VERIFY_STEP_NAME}" step`,
    expectedCommand:
      'node packages/create-module-federation/scripts/verify-rslib-templates.mjs',
    issues,
  });
  assertPatternCount({
    text: ciLocalText,
    pattern: REQUIRED_PATTERNS.ciLocal.templateVerifyStepCount.pattern,
    minCount: REQUIRED_PATTERNS.ciLocal.templateVerifyStepCount.minCount,
    description: REQUIRED_PATTERNS.ciLocal.templateVerifyStepCount.description,
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalText,
    workflowName: 'ci-local',
    label: 'publint configuration',
    patterns: REQUIRED_PATTERNS.staleExclusions,
    issues,
  });
  assertPatternCount({
    text: ciLocalText,
    pattern: REQUIRED_PATTERNS.ciLocal.templateVerifyCommandCount.pattern,
    minCount: REQUIRED_PATTERNS.ciLocal.templateVerifyCommandCount.minCount,
    description:
      REQUIRED_PATTERNS.ciLocal.templateVerifyCommandCount.description,
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
  assertPatternCount({
    text: ciLocalText,
    pattern: REQUIRED_PATTERNS.ciLocal.legacyVerifyPackageStep.pattern,
    minCount: REQUIRED_PATTERNS.ciLocal.legacyVerifyPackageStep.minCount,
    description: REQUIRED_PATTERNS.ciLocal.legacyVerifyPackageStep.description,
    issues,
  });
  assertPatternCount({
    text: ciLocalText,
    pattern: REQUIRED_PATTERNS.ciLocal.legacyVerifyWorkflowStep.pattern,
    minCount: REQUIRED_PATTERNS.ciLocal.legacyVerifyWorkflowStep.minCount,
    description: REQUIRED_PATTERNS.ciLocal.legacyVerifyWorkflowStep.description,
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
  assertOrderedPatterns({
    text: verifyPublintCoverageCommand ?? '',
    sourceLabel: 'package.json verify:publint:coverage script',
    orderedPatterns: [
      /node tools\/scripts\/verify-rslib-publint-coverage\.mjs/,
      /node tools\/scripts\/verify-publint-workflow-coverage\.mjs/,
    ],
    issues,
  });
  assertExactCommandSequence({
    command: verifyPublintCoverageCommand ?? '',
    sourceLabel: 'package.json verify:publint:coverage script',
    expectedCommands: [
      'node tools/scripts/verify-rslib-publint-coverage.mjs',
      'node tools/scripts/verify-publint-workflow-coverage.mjs',
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
  const ciLocalBuildAndTestTemplateVerifyStep = extractStepBlock({
    text: ciLocalBuildAndTestJob,
    label: TEMPLATE_VERIFY_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-and-test job',
  });
  const ciLocalBuildMetroVerifyStep = extractStepBlock({
    text: ciLocalBuildMetroJob,
    label: VERIFY_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-metro job',
  });
  const ciLocalBuildMetroTemplateVerifyStep = extractStepBlock({
    text: ciLocalBuildMetroJob,
    label: TEMPLATE_VERIFY_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-metro job',
  });
  const ciLocalBuildAndTestColdBuildStep = extractStepBlock({
    text: ciLocalBuildAndTestJob,
    label: 'Build packages (cold cache)',
    issues,
    sourceLabel: 'ci-local build-and-test job',
  });
  const ciLocalBuildAndTestWarmBuildStep = extractStepBlock({
    text: ciLocalBuildAndTestJob,
    label: 'Build packages (warm cache)',
    issues,
    sourceLabel: 'ci-local build-and-test job',
  });
  assertPatterns({
    text: ciLocalBuildAndTestJob,
    workflowName: 'ci-local build-and-test',
    label: 'publint loop',
    patterns: [REQUIRED_PATTERNS.ciLocal.nonMetroPublintLoop.pattern],
    issues,
  });
  assertLoopExclusions({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test publint loop',
    expectedExclusions: ['packages/metro-*'],
    issues,
  });
  assertPatterns({
    text: ciLocalBuildMetroJob,
    workflowName: 'ci-local build-metro',
    label: 'publint loop',
    patterns: [REQUIRED_PATTERNS.ciLocal.metroPublintLoop.pattern],
    issues,
  });
  assertLoopExclusions({
    text: ciLocalBuildMetroJob,
    sourceLabel: 'ci-local build-metro publint loop',
    expectedExclusions: [],
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildAndTestJob,
    workflowName: 'ci-local build-and-test',
    label: 'publint loop',
    patterns: [REQUIRED_PATTERNS.ciLocal.metroPublintLoop.pattern],
    issues,
  });
  assertRegexCount({
    text: ciLocalBuildAndTestJob,
    pattern: REQUIRED_PATTERNS.exactCommandCounts.publintLoopCommand.pattern,
    expectedCount:
      REQUIRED_PATTERNS.exactCommandCounts.publintLoopCommand.expectedCount,
    description:
      REQUIRED_PATTERNS.exactCommandCounts.publintLoopCommand.description,
    sourceLabel: 'ci-local build-and-test publint loop',
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildMetroJob,
    workflowName: 'ci-local build-metro',
    label: 'publint loop',
    patterns: [REQUIRED_PATTERNS.ciLocal.nonMetroPublintLoop.pattern],
    issues,
  });
  assertRegexCount({
    text: ciLocalBuildMetroJob,
    pattern: REQUIRED_PATTERNS.exactCommandCounts.publintLoopCommand.pattern,
    expectedCount:
      REQUIRED_PATTERNS.exactCommandCounts.publintLoopCommand.expectedCount,
    description:
      REQUIRED_PATTERNS.exactCommandCounts.publintLoopCommand.description,
    sourceLabel: 'ci-local build-metro publint loop',
    issues,
  });
  assertPatterns({
    text: ciLocalBuildAndTestColdBuildStep,
    workflowName: 'ci-local build-and-test',
    label: 'build (cold cache) step',
    patterns: [
      /--targets=build/,
      /--projects=tag:type:pkg/,
      /--parallel=4/,
      /--skip-nx-cache/,
    ],
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildAndTestColdBuildStep,
    workflowName: 'ci-local build-and-test',
    label: 'build (cold cache) step',
    patterns: [/tag:type:metro/],
    issues,
  });
  assertPatterns({
    text: ciLocalBuildAndTestWarmBuildStep,
    workflowName: 'ci-local build-and-test',
    label: 'build (warm cache) step',
    patterns: [/--targets=build/, /--projects=tag:type:pkg/, /--parallel=4/],
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildAndTestWarmBuildStep,
    workflowName: 'ci-local build-and-test',
    label: 'build (warm cache) step',
    patterns: [/--skip-nx-cache/, /tag:type:metro/],
    issues,
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
    text: ciLocalBuildAndTestTemplateVerifyStep,
    workflowName: 'ci-local build-and-test',
    label: TEMPLATE_VERIFY_STEP_NAME,
    patterns: REQUIRED_PATTERNS.ciLocalTemplateVerifyStepRun,
    issues,
  });
  assertPatterns({
    text: ciLocalBuildMetroVerifyStep,
    workflowName: 'ci-local build-metro',
    label: VERIFY_STEP_NAME,
    patterns: [/runCommand\('pnpm', \['verify:publint:coverage'\], ctx\)/],
    issues,
  });
  assertPatterns({
    text: ciLocalBuildMetroTemplateVerifyStep,
    workflowName: 'ci-local build-metro',
    label: TEMPLATE_VERIFY_STEP_NAME,
    patterns: REQUIRED_PATTERNS.ciLocalTemplateVerifyStepRun,
    issues,
  });
  assertStepOrderInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    orderedStepLabels: [
      CI_LOCAL_INSTALL_STEP_NAME,
      TEMPLATE_VERIFY_STEP_NAME,
      VERIFY_STEP_NAME,
      'Build packages (cold cache)',
      'Check package publishing compatibility (publint)',
    ],
    issues,
  });
  assertStepOrderInText({
    text: ciLocalBuildMetroJob,
    sourceLabel: 'ci-local build-metro job',
    orderedStepLabels: [
      CI_LOCAL_INSTALL_STEP_NAME,
      TEMPLATE_VERIFY_STEP_NAME,
      VERIFY_STEP_NAME,
      'Build all required packages',
      'Check package publishing compatibility (publint)',
    ],
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    stepLabel: CI_LOCAL_INSTALL_STEP_NAME,
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    stepLabel: TEMPLATE_VERIFY_STEP_NAME,
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    stepLabel: VERIFY_STEP_NAME,
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildMetroJob,
    sourceLabel: 'ci-local build-metro job',
    stepLabel: CI_LOCAL_INSTALL_STEP_NAME,
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildMetroJob,
    sourceLabel: 'ci-local build-metro job',
    stepLabel: TEMPLATE_VERIFY_STEP_NAME,
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildMetroJob,
    sourceLabel: 'ci-local build-metro job',
    stepLabel: VERIFY_STEP_NAME,
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    stepLabel: 'Build packages (cold cache)',
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    stepLabel: 'Check package publishing compatibility (publint)',
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildMetroJob,
    sourceLabel: 'ci-local build-metro job',
    stepLabel: 'Build all required packages',
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildMetroJob,
    sourceLabel: 'ci-local build-metro job',
    stepLabel: 'Check package publishing compatibility (publint)',
    expectedCount: 1,
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

function assertWorkflowStepOrder({
  workflow,
  workflowName,
  jobName,
  orderedStepNames,
  issues,
}) {
  const steps = workflow?.jobs?.[jobName]?.steps;
  if (!Array.isArray(steps)) {
    issues.push(
      `${workflowName} workflow job "${jobName}" is missing a valid steps array`,
    );
    return;
  }

  let previousIndex = -1;
  for (const stepName of orderedStepNames) {
    const currentIndex = steps.findIndex((step) => step?.name === stepName);
    if (currentIndex === -1) {
      issues.push(
        `${workflowName} workflow job "${jobName}" is missing ordered step "${stepName}"`,
      );
      return;
    }
    if (currentIndex <= previousIndex) {
      issues.push(
        `${workflowName} workflow job "${jobName}" step "${stepName}" appears out of order`,
      );
      return;
    }
    previousIndex = currentIndex;
  }
}

function assertSingleWorkflowStep({
  workflow,
  workflowName,
  jobName,
  stepName,
  issues,
}) {
  const steps = workflow?.jobs?.[jobName]?.steps;
  if (!Array.isArray(steps)) {
    return;
  }

  const count = steps.filter((step) => step?.name === stepName).length;
  if (count !== 1) {
    issues.push(
      `${workflowName} workflow job "${jobName}" must contain exactly one "${stepName}" step, found ${count}`,
    );
  }
}

function assertWorkflowMissingSteps({
  workflow,
  workflowName,
  jobName,
  forbiddenStepNames,
  issues,
}) {
  const steps = workflow?.jobs?.[jobName]?.steps;
  if (!Array.isArray(steps)) {
    return;
  }

  for (const stepName of forbiddenStepNames) {
    if (steps.some((step) => step?.name === stepName)) {
      issues.push(
        `${workflowName} workflow job "${jobName}" contains forbidden legacy step "${stepName}"`,
      );
    }
  }
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

function assertForbiddenPatterns({
  text,
  workflowName,
  label,
  patterns,
  issues,
}) {
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      issues.push(
        `${workflowName} workflow ${label} contains forbidden stale exclusion pattern: ${pattern}`,
      );
    }
  }
}

function assertStepOrderInText({
  text,
  sourceLabel,
  orderedStepLabels,
  issues,
}) {
  let previousIndex = -1;
  for (const stepLabel of orderedStepLabels) {
    const currentIndex = text.indexOf(`step('${stepLabel}'`);
    if (currentIndex === -1) {
      issues.push(`${sourceLabel} is missing ordered step "${stepLabel}"`);
      return;
    }
    if (currentIndex <= previousIndex) {
      issues.push(`${sourceLabel} step "${stepLabel}" appears out of order`);
      return;
    }
    previousIndex = currentIndex;
  }
}

function assertOrderedPatterns({ text, sourceLabel, orderedPatterns, issues }) {
  let previousIndex = -1;
  for (const pattern of orderedPatterns) {
    const matchIndex = text.search(pattern);
    if (matchIndex === -1) {
      issues.push(
        `${sourceLabel} is missing required ordered pattern: ${pattern}`,
      );
      return;
    }
    if (matchIndex <= previousIndex) {
      issues.push(`${sourceLabel} has pattern out of order: ${pattern}`);
      return;
    }
    previousIndex = matchIndex;
  }
}

function assertExactCommandSequence({
  command,
  sourceLabel,
  expectedCommands,
  issues,
}) {
  const normalizedCommand = normalizeWhitespace(command);
  if (normalizedCommand.includes(';')) {
    issues.push(`${sourceLabel} should not use ';' separators`);
    return;
  }

  const actualCommands = normalizedCommand
    .split('&&')
    .map((segment) => normalizeWhitespace(segment))
    .filter(Boolean);
  const normalizedExpected = expectedCommands.map((segment) =>
    normalizeWhitespace(segment),
  );

  if (
    actualCommands.length !== normalizedExpected.length ||
    actualCommands.some((value, index) => value !== normalizedExpected[index])
  ) {
    issues.push(
      `${sourceLabel} has unexpected command sequence: expected [${normalizedExpected.join(
        ' && ',
      )}] but found [${actualCommands.join(' && ')}]`,
    );
  }
}

function assertLoopExclusions({
  text,
  sourceLabel,
  expectedExclusions,
  issues,
}) {
  const exclusionRegex = /\[\[\s*"\$pkg"\s*!=\s*([^\]]+?)\s*\]\]/g;
  const exclusions = [];
  for (const match of text.matchAll(exclusionRegex)) {
    const raw = (match[1] ?? '').trim();
    const normalized = raw.replace(/^['"]|['"]$/g, '');
    exclusions.push(normalized);
  }

  const uniqueExclusions = Array.from(new Set(exclusions));
  const sortedExpected = [...expectedExclusions].sort();
  const sortedActual = [...uniqueExclusions].sort();
  if (
    sortedActual.length !== sortedExpected.length ||
    sortedActual.some((value, index) => value !== sortedExpected[index])
  ) {
    issues.push(
      `${sourceLabel} has unexpected exclusion set: expected [${sortedExpected.join(
        ', ',
      )}] but found [${sortedActual.join(', ')}]`,
    );
  }
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function assertExactSingleLineCommand({
  commandText,
  sourceLabel,
  expectedCommand,
  issues,
}) {
  const lines = commandText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length !== 1) {
    issues.push(
      `${sourceLabel} must contain exactly one command line, found ${lines.length}`,
    );
    return;
  }

  const normalizedActual = normalizeWhitespace(lines[0]);
  const normalizedExpected = normalizeWhitespace(expectedCommand);
  if (normalizedActual !== normalizedExpected) {
    issues.push(
      `${sourceLabel} has unexpected command: expected "${normalizedExpected}" but found "${normalizedActual}"`,
    );
  }
}

function assertRegexCount({
  text,
  pattern,
  expectedCount,
  description,
  sourceLabel,
  issues,
}) {
  const matches = text.match(pattern);
  const count = matches ? matches.length : 0;
  if (count !== expectedCount) {
    issues.push(
      `${sourceLabel} has unexpected ${description} count: expected ${expectedCount}, found ${count}`,
    );
  }
}

function assertStepCountInText({
  text,
  sourceLabel,
  stepLabel,
  expectedCount,
  issues,
}) {
  const escapedLabel = stepLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const count = (text.match(new RegExp(`step\\('${escapedLabel}'`, 'g')) || [])
    .length;
  if (count !== expectedCount) {
    issues.push(
      `${sourceLabel} must contain exactly ${expectedCount} "${stepLabel}" step(s), found ${count}`,
    );
  }
}

function assertPatternCount({ text, pattern, minCount, description, issues }) {
  const matches = text.match(pattern);
  const count = matches ? matches.length : 0;
  if (minCount === 0) {
    if (count > 0) {
      issues.push(
        `ci-local script contains forbidden ${description}: expected exactly 0, found ${count}`,
      );
    }
    return;
  }
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
  const topLevelJobNamePattern = /^ {4}name:\s*'([^']+)'/gm;
  const jobMatches = Array.from(text.matchAll(topLevelJobNamePattern)).map(
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
