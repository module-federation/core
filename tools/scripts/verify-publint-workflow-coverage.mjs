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
const BUILD_AND_TEST_WORKFLOW_NAME = 'Build Affected Packages';
const BUILD_METRO_WORKFLOW_NAME = 'Build Metro Packages';
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
const CHECKOUT_STEP_NAME = 'Checkout Repository';
const CACHE_TOOL_DOWNLOADS_STEP_NAME = 'Cache Tool Downloads';
const WORKFLOW_SETUP_PNPM_STEP_NAME = 'Setup pnpm';
const WORKFLOW_SETUP_NODE_STEP_NAME = 'Setup Node.js 20';
const REMOVE_CACHED_NODE_MODULES_STEP_NAME = 'Remove cached node_modules';
const WORKFLOW_SET_PLAYWRIGHT_CACHE_STATUS_STEP_NAME =
  'Set Playwright cache status';
const WORKFLOW_SET_NX_SHA_STEP_NAME = 'Set Nx SHA';
const WORKFLOW_INSTALL_PLAYWRIGHT_STEP_NAME = 'Install Playwright Browsers';
const WORKFLOW_INSTALL_CYPRESS_STEP_NAME = 'Install Cypress';
const BUILD_AND_TEST_BUILD_STEP_NAME = 'Run Build for All';
const BUILD_AND_TEST_WARM_CACHE_STEP_NAME = 'Warm Nx Cache';
const BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME = 'Run Affected Test';
const BUILD_AND_TEST_FORMAT_STEP_NAME = 'Check Code Format';
const WORKFLOW_PRINT_CPU_STEP_NAME = 'Print Number of CPU Cores';
const BUILD_METRO_BUILD_STEP_NAME = 'Build All Required Packages';
const BUILD_METRO_TEST_STEP_NAME = 'Test Metro Packages';
const BUILD_METRO_TEST_RETRY_ACTION = 'nick-fields/retry@v3';
const BUILD_METRO_LINT_STEP_NAME = 'Lint Metro Packages';
const WORKFLOW_INSTALL_STEP_NAME = 'Install Dependencies';
const CI_LOCAL_INSTALL_STEP_NAME = 'Install dependencies';
const CI_LOCAL_OPTIONAL_CLEAN_STEP_NAME = 'Optional clean node_modules/.nx';
const CI_LOCAL_INSTALL_CYPRESS_STEP_NAME = 'Install Cypress';
const CI_LOCAL_FORMAT_STEP_NAME = 'Check code format';
const CI_LOCAL_PRINT_CPU_STEP_NAME = 'Print number of CPU cores';
const INSTALL_DEPENDENCIES_COMMAND = 'pnpm install --frozen-lockfile';
const INSTALL_DEPENDENCIES_HELPER_NAME = 'installDependencies';
const INSTALL_DEPENDENCIES_RETRY_CLEANUP_PATH =
  'packages/assemble-release-plan/dist/changesets-assemble-release-plan.esm.js';
const CHECKOUT_ACTION = 'actions/checkout@v5';
const CACHE_ACTION = 'actions/cache@v5';
const CACHE_TOOL_DOWNLOADS_KEY =
  "${{ runner.os }}-toolcache-${{ hashFiles('pnpm-lock.yaml') }}";
const CACHE_TOOL_DOWNLOADS_RESTORE_KEYS = '${{ runner.os }}-toolcache-\n';
const SETUP_PNPM_ACTION = 'pnpm/action-setup@v4';
const SETUP_NODE_ACTION = 'actions/setup-node@v6';
const SET_NX_SHA_ACTION = 'nrwl/nx-set-shas@v4';
const REMOVE_CACHED_NODE_MODULES_COMMAND = 'rm -rf node_modules .nx';
const INSTALL_PLAYWRIGHT_BROWSERS_COMMAND =
  'pnpm exec playwright install --force';
const INSTALL_CYPRESS_COMMAND = 'npx cypress install';
const BUILD_AND_TEST_FORMAT_COMMAND = 'npx nx format:check';
const PRINT_CPU_COMMAND = 'nproc';
const CI_LOCAL_OPTIONAL_CLEAN_COMMAND = 'rm -rf node_modules .nx';
const BUILD_AND_TEST_JOB_TIMEOUT_MINUTES = 30;
const BUILD_METRO_JOB_TIMEOUT_MINUTES = 15;
const BUILD_AND_TEST_AFFECTED_TEST_TIMEOUT_MINUTES = 10;
const BUILD_METRO_REUSABLE_WORKFLOW_PATH =
  './.github/workflows/build-metro.yml';
const E2E_METRO_REUSABLE_WORKFLOW_PATH = './.github/workflows/e2e-metro.yml';
const WORKFLOW_PERMISSION_READ = 'read';
const WORKFLOW_PERMISSION_WRITE = 'write';
const BUILD_AND_TEST_CONCURRENCY_GROUP =
  '${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}';
const CHECKOUT_INSTALL_JOB_NAME = 'checkout-install';
const BUILD_METRO_JOB_NAME = 'build-metro';
const E2E_METRO_JOB_NAME = 'e2e-metro';
const UBUNTU_LATEST_RUNNER = 'ubuntu-latest';
const LOCAL_REUSABLE_WORKFLOW_PREFIX = './.github/workflows/';
const INHERITED_JOB_SECRETS_VALUE = 'inherit';
const CI_LOCAL_BUILD_AND_TEST_WARM_CACHE_STEP_NAME = 'Warm Nx cache';
const CI_LOCAL_BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME = 'Run affected tests';
const CI_LOCAL_BUILD_METRO_TEST_STEP_NAME = 'Test metro packages';
const CI_LOCAL_BUILD_METRO_LINT_STEP_NAME = 'Lint metro packages';
const CI_LOCAL_PUBLINT_STEP_NAME =
  'Check package publishing compatibility (publint)';
const LEGACY_VERIFY_STEP_NAMES = [
  'Verify Package Rslib Publint Wiring',
  'Verify Publint Workflow Coverage',
];

const REQUIRED_PATTERNS = {
  buildAndTestLoop: [
    /for pkg in packages\/\*; do/,
    /if \[ -f "\$pkg\/package\.json" \]/,
    /\[\[ "\$pkg" != packages\/metro-\* \]\]/,
    /echo "Checking \$pkg\.\.\."/,
    /npx publint "\$pkg"/,
  ],
  buildMetroLoop: [
    /for pkg in packages\/metro-\*; do/,
    /if \[ -f "\$pkg\/package\.json" \]/,
    /echo "Checking \$pkg\.\.\."/,
    /npx publint "\$pkg"/,
  ],
  buildAndTestBuildStep: [
    /npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4 --skip-nx-cache/,
    /npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4/,
  ],
  buildAndTestWarmCacheStep: [
    /npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4/,
  ],
  buildMetroBuildStep: [
    /npx nx run-many --targets=build --projects=tag:type:pkg,tag:type:metro --parallel=4 --skip-nx-cache/,
  ],
  buildAndTestAffectedTestStep: [
    /npx nx affected -t test --parallel=3 --exclude='\*,!tag:type:pkg'/,
  ],
  buildMetroTestStep: [
    /npx nx affected -t test --parallel=2 --exclude='\*,!tag:type:metro'/,
  ],
  buildMetroLintStep: [
    /npx nx run-many --targets=lint --projects=tag:type:metro --parallel=2/,
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
    buildAndTestRunManyCommands: {
      pattern: /^\s*npx nx run-many\s+/gm,
      expectedCount: 2,
      description: 'build-and-test run-many command',
    },
    buildMetroBuild: {
      pattern:
        /^\s*npx nx run-many --targets=build --projects=tag:type:pkg,tag:type:metro --parallel=4 --skip-nx-cache\s*$/gm,
      expectedCount: 1,
      description: 'build-metro build command',
    },
    buildMetroRunManyCommands: {
      pattern: /^\s*npx nx run-many\s+/gm,
      expectedCount: 1,
      description: 'build-metro run-many command',
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

  const metroPackageDirsByTag = [];
  const packagePackageDirsByTag = [];
  const metroPackageDirsByPrefix = packageDirs.filter((name) =>
    name.startsWith('metro-'),
  );
  for (const packageName of packageDirs) {
    const projectJsonPath = join(PACKAGES_DIR, packageName, 'project.json');
    if (!existsSync(projectJsonPath)) {
      issues.push(`missing project manifest for package ${packageName}`);
      continue;
    }

    const projectJson = readJson(projectJsonPath, issues);
    if (!projectJson) {
      continue;
    }

    const tags = projectJson.tags;
    if (tags !== undefined && !Array.isArray(tags)) {
      issues.push(
        `package ${packageName} project.json has invalid tags field (expected array)`,
      );
      continue;
    }

    const hasPackageTag = Array.isArray(tags) && tags.includes('type:pkg');
    const hasMetroTag = Array.isArray(tags) && tags.includes('type:metro');
    if (hasPackageTag && hasMetroTag) {
      issues.push(
        `package ${packageName} project.json must not include both type:pkg and type:metro tags`,
      );
      continue;
    }
    if (!hasPackageTag && !hasMetroTag) {
      issues.push(
        `package ${packageName} project.json must include exactly one of type:pkg or type:metro tags`,
      );
      continue;
    }

    if (hasMetroTag) {
      metroPackageDirsByTag.push(packageName);
      continue;
    }

    packagePackageDirsByTag.push(packageName);
  }

  const metroByTagSet = new Set(metroPackageDirsByTag);
  const metroByPrefixSet = new Set(metroPackageDirsByPrefix);
  const metroTaggedButNotPrefixed = metroPackageDirsByTag.filter(
    (name) => !metroByPrefixSet.has(name),
  );
  const metroPrefixedButNotTagged = metroPackageDirsByPrefix.filter(
    (name) => !metroByTagSet.has(name),
  );
  if (metroTaggedButNotPrefixed.length > 0) {
    issues.push(
      `packages tagged type:metro must be prefixed with "metro-": ${metroTaggedButNotPrefixed.join(', ')}`,
    );
  }
  if (metroPrefixedButNotTagged.length > 0) {
    issues.push(
      `packages prefixed with "metro-" must have type:metro tag: ${metroPrefixedButNotTagged.join(', ')}`,
    );
  }

  const metroPackageDirs = [...metroByTagSet];
  const nonMetroPackageDirs = [...new Set(packagePackageDirsByTag)];

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
  const ciLocalInstallDependenciesHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: INSTALL_DEPENDENCIES_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
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
  const buildAndTestInstallCypressStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_INSTALL_CYPRESS_STEP_NAME,
    issues,
  });
  const buildAndTestInstallPlaywrightStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_INSTALL_PLAYWRIGHT_STEP_NAME,
    issues,
  });
  const buildAndTestPlaywrightCacheStatusStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_SET_PLAYWRIGHT_CACHE_STATUS_STEP_NAME,
    issues,
  });
  const buildAndTestPrintCpuStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_PRINT_CPU_STEP_NAME,
    issues,
  });
  const buildAndTestFormatStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: BUILD_AND_TEST_FORMAT_STEP_NAME,
    issues,
  });
  const buildAndTestInstallStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_INSTALL_STEP_NAME,
    issues,
  });
  const buildAndTestRemoveCachedNodeModulesStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: REMOVE_CACHED_NODE_MODULES_STEP_NAME,
    issues,
  });
  const buildMetroInstallStep = readRunCommand({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: WORKFLOW_INSTALL_STEP_NAME,
    issues,
  });
  const buildAndTestCheckoutStep = readWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: CHECKOUT_STEP_NAME,
    issues,
  });
  const buildMetroCheckoutStep = readWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: CHECKOUT_STEP_NAME,
    issues,
  });
  const buildAndTestCacheToolsStep = readWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: CACHE_TOOL_DOWNLOADS_STEP_NAME,
    issues,
  });
  const buildMetroCacheToolsStep = readWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: CACHE_TOOL_DOWNLOADS_STEP_NAME,
    issues,
  });
  const buildAndTestSetupPnpmStep = readWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_SETUP_PNPM_STEP_NAME,
    issues,
  });
  const buildMetroSetupPnpmStep = readWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: WORKFLOW_SETUP_PNPM_STEP_NAME,
    issues,
  });
  const buildAndTestSetupNodeStep = readWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_SETUP_NODE_STEP_NAME,
    issues,
  });
  const buildMetroSetupNodeStep = readWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: WORKFLOW_SETUP_NODE_STEP_NAME,
    issues,
  });
  const buildAndTestSetNxShaStep = readWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_SET_NX_SHA_STEP_NAME,
    issues,
  });
  const buildMetroSetNxShaStep = readWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: WORKFLOW_SET_NX_SHA_STEP_NAME,
    issues,
  });
  const buildMetroBuildStep = readRunCommand({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: BUILD_METRO_BUILD_STEP_NAME,
    issues,
  });
  const buildAndTestAffectedTestStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME,
    issues,
  });
  const buildAndTestAffectedTestStepConfig = readWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME,
    issues,
  });
  const buildAndTestWarmCacheStep = readRunCommand({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: BUILD_AND_TEST_WARM_CACHE_STEP_NAME,
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
  const buildMetroTestStepCommand = readStepWithCommand({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: BUILD_METRO_TEST_STEP_NAME,
    issues,
  });
  const buildMetroTestStep = readWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: BUILD_METRO_TEST_STEP_NAME,
    issues,
  });
  const buildMetroLintStepCommand = readRunCommand({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: BUILD_METRO_LINT_STEP_NAME,
    issues,
  });

  assertWorkflowStepOrder({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    orderedStepNames: [
      CHECKOUT_STEP_NAME,
      CACHE_TOOL_DOWNLOADS_STEP_NAME,
      WORKFLOW_SETUP_PNPM_STEP_NAME,
      WORKFLOW_SETUP_NODE_STEP_NAME,
      REMOVE_CACHED_NODE_MODULES_STEP_NAME,
      WORKFLOW_SET_PLAYWRIGHT_CACHE_STATUS_STEP_NAME,
      WORKFLOW_SET_NX_SHA_STEP_NAME,
      WORKFLOW_INSTALL_STEP_NAME,
      WORKFLOW_INSTALL_PLAYWRIGHT_STEP_NAME,
      WORKFLOW_INSTALL_CYPRESS_STEP_NAME,
      BUILD_AND_TEST_FORMAT_STEP_NAME,
      TEMPLATE_VERIFY_STEP_NAME,
      VERIFY_STEP_NAME,
      WORKFLOW_PRINT_CPU_STEP_NAME,
      BUILD_AND_TEST_BUILD_STEP_NAME,
      PUBLINT_STEP_NAME,
      BUILD_AND_TEST_WARM_CACHE_STEP_NAME,
      BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME,
    ],
    issues,
  });
  assertWorkflowStepOrder({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    orderedStepNames: [
      CHECKOUT_STEP_NAME,
      CACHE_TOOL_DOWNLOADS_STEP_NAME,
      WORKFLOW_SETUP_PNPM_STEP_NAME,
      WORKFLOW_SETUP_NODE_STEP_NAME,
      WORKFLOW_SET_NX_SHA_STEP_NAME,
      WORKFLOW_INSTALL_STEP_NAME,
      TEMPLATE_VERIFY_STEP_NAME,
      VERIFY_STEP_NAME,
      BUILD_METRO_BUILD_STEP_NAME,
      BUILD_METRO_TEST_STEP_NAME,
      BUILD_METRO_LINT_STEP_NAME,
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
  assertWorkflowTriggerExists({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    triggerName: 'workflow_call',
    issues,
  });
  assertWorkflowName({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    expectedName: BUILD_AND_TEST_WORKFLOW_NAME,
    issues,
  });
  assertWorkflowName({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    expectedName: BUILD_METRO_WORKFLOW_NAME,
    issues,
  });
  assertWorkflowTriggersExact({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    expectedTriggers: ['workflow_call'],
    issues,
  });
  assertWorkflowTriggersExact({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    expectedTriggers: ['pull_request', 'push'],
    issues,
  });
  assertWorkflowTriggerBranchesInclude({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    triggerName: 'pull_request',
    expectedBranches: ['main', '**'],
    issues,
  });
  assertWorkflowTriggerBranchesExact({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    triggerName: 'pull_request',
    expectedBranches: ['main', '**'],
    issues,
  });
  assertWorkflowTriggerBranchesInclude({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    triggerName: 'push',
    expectedBranches: ['main'],
    issues,
  });
  assertWorkflowTriggerBranchesExact({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    triggerName: 'push',
    expectedBranches: ['main'],
    issues,
  });
  assertWorkflowConcurrencyConfig({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    expectedGroup: BUILD_AND_TEST_CONCURRENCY_GROUP,
    expectedCancelInProgress: true,
    issues,
  });
  assertWorkflowPermission({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    permissionName: 'contents',
    expectedValue: WORKFLOW_PERMISSION_READ,
    issues,
  });
  assertWorkflowPermission({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    permissionName: 'actions',
    expectedValue: WORKFLOW_PERMISSION_READ,
    issues,
  });
  assertWorkflowPermission({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    permissionName: 'contents',
    expectedValue: WORKFLOW_PERMISSION_READ,
    issues,
  });
  assertWorkflowPermission({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    permissionName: 'actions',
    expectedValue: WORKFLOW_PERMISSION_READ,
    issues,
  });
  assertWorkflowJobTimeout({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    expectedTimeoutMinutes: BUILD_AND_TEST_JOB_TIMEOUT_MINUTES,
    issues,
  });
  assertWorkflowJobRunner({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: CHECKOUT_INSTALL_JOB_NAME,
    expectedRunner: UBUNTU_LATEST_RUNNER,
    issues,
  });
  assertWorkflowJobTimeout({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    expectedTimeoutMinutes: BUILD_METRO_JOB_TIMEOUT_MINUTES,
    issues,
  });
  assertWorkflowJobRunner({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: BUILD_METRO_JOB_NAME,
    expectedRunner: UBUNTU_LATEST_RUNNER,
    issues,
  });
  assertWorkflowStepNumericProperty({
    step: buildAndTestAffectedTestStepConfig,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME,
    propertyName: 'timeout-minutes',
    expectedValue: BUILD_AND_TEST_AFFECTED_TEST_TIMEOUT_MINUTES,
    issues,
  });
  assertReusableWorkflowJobUses({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: BUILD_METRO_JOB_NAME,
    expectedUses: BUILD_METRO_REUSABLE_WORKFLOW_PATH,
    issues,
  });
  assertReusableWorkflowJobUses({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: E2E_METRO_JOB_NAME,
    expectedUses: E2E_METRO_REUSABLE_WORKFLOW_PATH,
    issues,
  });
  assertReusableWorkflowJobsUseInheritedSecrets({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    reusableWorkflowPrefix: LOCAL_REUSABLE_WORKFLOW_PREFIX,
    expectedSecretsValue: INHERITED_JOB_SECRETS_VALUE,
    issues,
  });
  assertReusableWorkflowJobsNeedCheckoutInstall({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    reusableWorkflowPrefix: LOCAL_REUSABLE_WORKFLOW_PREFIX,
    checkoutInstallJobName: CHECKOUT_INSTALL_JOB_NAME,
    excludeJobNames: [BUILD_METRO_JOB_NAME],
    issues,
  });
  assertWorkflowJobNeedsIncludes({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: E2E_METRO_JOB_NAME,
    expectedNeeds: [CHECKOUT_INSTALL_JOB_NAME, BUILD_METRO_JOB_NAME],
    issues,
  });
  assertWorkflowJobNeedsExact({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: E2E_METRO_JOB_NAME,
    expectedNeeds: [CHECKOUT_INSTALL_JOB_NAME, BUILD_METRO_JOB_NAME],
    issues,
  });
  assertWorkflowJobPermission({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: E2E_METRO_JOB_NAME,
    permissionName: 'contents',
    expectedValue: WORKFLOW_PERMISSION_READ,
    issues,
  });
  assertWorkflowJobPermission({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: E2E_METRO_JOB_NAME,
    permissionName: 'actions',
    expectedValue: WORKFLOW_PERMISSION_READ,
    issues,
  });
  assertWorkflowJobPermission({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: E2E_METRO_JOB_NAME,
    permissionName: 'checks',
    expectedValue: WORKFLOW_PERMISSION_WRITE,
    issues,
  });
  assertWorkflowJobPermission({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: E2E_METRO_JOB_NAME,
    permissionName: 'pull-requests',
    expectedValue: WORKFLOW_PERMISSION_WRITE,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: CHECKOUT_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: CACHE_TOOL_DOWNLOADS_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_SETUP_PNPM_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_SETUP_NODE_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: REMOVE_CACHED_NODE_MODULES_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_SET_PLAYWRIGHT_CACHE_STATUS_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_SET_NX_SHA_STEP_NAME,
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
    stepName: WORKFLOW_INSTALL_CYPRESS_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_INSTALL_PLAYWRIGHT_STEP_NAME,
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
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: BUILD_AND_TEST_FORMAT_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_PRINT_CPU_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: CHECKOUT_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: CACHE_TOOL_DOWNLOADS_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: WORKFLOW_SETUP_PNPM_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: WORKFLOW_SETUP_NODE_STEP_NAME,
    issues,
  });
  assertWorkflowMissingSteps({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    forbiddenStepNames: [REMOVE_CACHED_NODE_MODULES_STEP_NAME],
    issues,
  });
  assertWorkflowMissingSteps({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    forbiddenStepNames: [
      WORKFLOW_SET_PLAYWRIGHT_CACHE_STATUS_STEP_NAME,
      WORKFLOW_INSTALL_PLAYWRIGHT_STEP_NAME,
      WORKFLOW_INSTALL_CYPRESS_STEP_NAME,
      WORKFLOW_PRINT_CPU_STEP_NAME,
    ],
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: WORKFLOW_SET_NX_SHA_STEP_NAME,
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
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: BUILD_AND_TEST_WARM_CACHE_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME,
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
    stepName: BUILD_METRO_TEST_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: BUILD_METRO_LINT_STEP_NAME,
    issues,
  });
  assertSingleWorkflowStep({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: PUBLINT_STEP_NAME,
    issues,
  });
  assertActionStepConfig({
    step: buildAndTestCheckoutStep,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: CHECKOUT_STEP_NAME,
    expectedUses: CHECKOUT_ACTION,
    expectedWith: { 'fetch-depth': 0 },
    issues,
  });
  assertActionStepConfig({
    step: buildMetroCheckoutStep,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: CHECKOUT_STEP_NAME,
    expectedUses: CHECKOUT_ACTION,
    expectedWith: { 'fetch-depth': 0 },
    issues,
  });
  assertActionStepConfig({
    step: buildAndTestCacheToolsStep,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: CACHE_TOOL_DOWNLOADS_STEP_NAME,
    expectedUses: CACHE_ACTION,
    expectedWith: {
      path: '~/.cache',
      key: CACHE_TOOL_DOWNLOADS_KEY,
      'restore-keys': CACHE_TOOL_DOWNLOADS_RESTORE_KEYS,
    },
    issues,
  });
  assertActionStepConfig({
    step: buildMetroCacheToolsStep,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: CACHE_TOOL_DOWNLOADS_STEP_NAME,
    expectedUses: CACHE_ACTION,
    expectedWith: {
      path: '~/.cache',
      key: CACHE_TOOL_DOWNLOADS_KEY,
      'restore-keys': CACHE_TOOL_DOWNLOADS_RESTORE_KEYS,
    },
    issues,
  });
  assertActionStepConfig({
    step: buildAndTestSetupPnpmStep,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_SETUP_PNPM_STEP_NAME,
    expectedUses: SETUP_PNPM_ACTION,
    issues,
  });
  assertActionStepConfig({
    step: buildMetroSetupPnpmStep,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: WORKFLOW_SETUP_PNPM_STEP_NAME,
    expectedUses: SETUP_PNPM_ACTION,
    issues,
  });
  assertActionStepConfig({
    step: buildAndTestSetupNodeStep,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_SETUP_NODE_STEP_NAME,
    expectedUses: SETUP_NODE_ACTION,
    expectedWith: {
      'node-version': '20',
      cache: 'pnpm',
      'cache-dependency-path': '**/pnpm-lock.yaml',
    },
    issues,
  });
  assertActionStepConfig({
    step: buildMetroSetupNodeStep,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: WORKFLOW_SETUP_NODE_STEP_NAME,
    expectedUses: SETUP_NODE_ACTION,
    expectedWith: {
      'node-version': '20',
      cache: 'pnpm',
      'cache-dependency-path': '**/pnpm-lock.yaml',
    },
    issues,
  });
  assertActionStepConfig({
    step: buildAndTestSetNxShaStep,
    workflowName: 'build-and-test',
    jobName: 'checkout-install',
    stepName: WORKFLOW_SET_NX_SHA_STEP_NAME,
    expectedUses: SET_NX_SHA_ACTION,
    issues,
  });
  assertActionStepConfig({
    step: buildMetroSetNxShaStep,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: WORKFLOW_SET_NX_SHA_STEP_NAME,
    expectedUses: SET_NX_SHA_ACTION,
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildAndTestInstallStep,
    sourceLabel: `build-and-test workflow "${WORKFLOW_INSTALL_STEP_NAME}" step`,
    expectedCommand: INSTALL_DEPENDENCIES_COMMAND,
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildAndTestRemoveCachedNodeModulesStep,
    sourceLabel: `build-and-test workflow "${REMOVE_CACHED_NODE_MODULES_STEP_NAME}" step`,
    expectedCommand: REMOVE_CACHED_NODE_MODULES_COMMAND,
    issues,
  });
  assertPatterns({
    text: buildAndTestPlaywrightCacheStatusStep,
    workflowName: 'build-and-test',
    label: WORKFLOW_SET_PLAYWRIGHT_CACHE_STATUS_STEP_NAME,
    patterns: [
      /if \[ -d "\$HOME\/\.cache\/ms-playwright" \] \|\| \[ -d "\$HOME\/\.cache\/Cypress" \]; then/,
      /echo "PLAYWRIGHT_CACHE_HIT=true" >> "\$GITHUB_ENV"/,
      /echo "PLAYWRIGHT_CACHE_HIT=false" >> "\$GITHUB_ENV"/,
    ],
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildAndTestInstallPlaywrightStep,
    sourceLabel: `build-and-test workflow "${WORKFLOW_INSTALL_PLAYWRIGHT_STEP_NAME}" step`,
    expectedCommand: INSTALL_PLAYWRIGHT_BROWSERS_COMMAND,
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildAndTestInstallCypressStep,
    sourceLabel: `build-and-test workflow "${WORKFLOW_INSTALL_CYPRESS_STEP_NAME}" step`,
    expectedCommand: INSTALL_CYPRESS_COMMAND,
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildMetroInstallStep,
    sourceLabel: `build-metro workflow "${WORKFLOW_INSTALL_STEP_NAME}" step`,
    expectedCommand: INSTALL_DEPENDENCIES_COMMAND,
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildAndTestFormatStep,
    sourceLabel: `build-and-test workflow "${BUILD_AND_TEST_FORMAT_STEP_NAME}" step`,
    expectedCommand: BUILD_AND_TEST_FORMAT_COMMAND,
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildAndTestPrintCpuStep,
    sourceLabel: `build-and-test workflow "${WORKFLOW_PRINT_CPU_STEP_NAME}" step`,
    expectedCommand: PRINT_CPU_COMMAND,
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
  assertRegexCount({
    text: buildAndTestBuildStep,
    pattern:
      REQUIRED_PATTERNS.exactCommandCounts.buildAndTestRunManyCommands.pattern,
    expectedCount:
      REQUIRED_PATTERNS.exactCommandCounts.buildAndTestRunManyCommands
        .expectedCount,
    description:
      REQUIRED_PATTERNS.exactCommandCounts.buildAndTestRunManyCommands
        .description,
    sourceLabel: 'build-and-test workflow build command',
    issues,
  });
  assertPatterns({
    text: buildAndTestAffectedTestStep,
    workflowName: 'build-and-test',
    label: 'affected test command',
    patterns: REQUIRED_PATTERNS.buildAndTestAffectedTestStep,
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildAndTestAffectedTestStep,
    sourceLabel: `build-and-test workflow "${BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME}" step`,
    expectedCommand:
      "npx nx affected -t test --parallel=3 --exclude='*,!tag:type:pkg'",
    issues,
  });
  assertPatterns({
    text: buildAndTestWarmCacheStep,
    workflowName: 'build-and-test',
    label: 'warm cache command',
    patterns: REQUIRED_PATTERNS.buildAndTestWarmCacheStep,
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildAndTestWarmCacheStep,
    sourceLabel: `build-and-test workflow "${BUILD_AND_TEST_WARM_CACHE_STEP_NAME}" step`,
    expectedCommand:
      'npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4',
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
  assertRegexCount({
    text: buildMetroBuildStep,
    pattern:
      REQUIRED_PATTERNS.exactCommandCounts.buildMetroRunManyCommands.pattern,
    expectedCount:
      REQUIRED_PATTERNS.exactCommandCounts.buildMetroRunManyCommands
        .expectedCount,
    description:
      REQUIRED_PATTERNS.exactCommandCounts.buildMetroRunManyCommands
        .description,
    sourceLabel: 'build-metro workflow build command',
    issues,
  });
  assertPatterns({
    text: buildMetroTestStepCommand,
    workflowName: 'build-metro',
    label: 'test command',
    patterns: REQUIRED_PATTERNS.buildMetroTestStep,
    issues,
  });
  assertPatterns({
    text: buildMetroLintStepCommand,
    workflowName: 'build-metro',
    label: 'lint command',
    patterns: REQUIRED_PATTERNS.buildMetroLintStep,
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildMetroTestStepCommand,
    sourceLabel: `build-metro workflow "${BUILD_METRO_TEST_STEP_NAME}" step`,
    expectedCommand:
      "npx nx affected -t test --parallel=2 --exclude='*,!tag:type:metro'",
    issues,
  });
  assertRetryActionStepConfig({
    step: buildMetroTestStep,
    workflowName: 'build-metro',
    jobName: 'build-metro',
    stepName: BUILD_METRO_TEST_STEP_NAME,
    expectedUses: BUILD_METRO_TEST_RETRY_ACTION,
    expectedMaxAttempts: 2,
    expectedTimeoutMinutes: 5,
    issues,
  });
  assertExactSingleLineCommand({
    commandText: buildMetroLintStepCommand,
    sourceLabel: `build-metro workflow "${BUILD_METRO_LINT_STEP_NAME}" step`,
    expectedCommand:
      'npx nx run-many --targets=lint --projects=tag:type:metro --parallel=2',
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
  assertRegexCount({
    text: ciLocalText,
    pattern: /function installDependencies\(/g,
    expectedCount: 1,
    description: 'installDependencies helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertPatterns({
    text: ciLocalInstallDependenciesHelper,
    workflowName: 'ci-local',
    label: 'installDependencies helper',
    patterns: [
      /pnpm install --frozen-lockfile/,
      /pnpm install failed; cleaning assemble-release-plan preconstruct links and retrying once/,
      /rm -f packages\/assemble-release-plan\/dist\/changesets-assemble-release-plan\.esm\.js/,
      /\|\|/,
    ],
    issues,
  });
  assertRegexCount({
    text: ciLocalInstallDependenciesHelper,
    pattern: /pnpm install --frozen-lockfile/g,
    expectedCount: 2,
    description: 'pnpm install --frozen-lockfile command',
    sourceLabel: 'ci-local installDependencies helper',
    issues,
  });
  assertPatterns({
    text: ciLocalInstallDependenciesHelper,
    workflowName: 'ci-local',
    label: 'installDependencies helper',
    patterns: [
      new RegExp(
        `rm -f ${INSTALL_DEPENDENCIES_RETRY_CLEANUP_PATH.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      ),
    ],
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalInstallDependenciesHelper,
    workflowName: 'ci-local',
    label: 'installDependencies helper',
    patterns: [/--no-frozen-lockfile/, /pnpm install --force/],
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
  const ciLocalBuildAndTestOptionalCleanStep = extractStepBlock({
    text: ciLocalBuildAndTestJob,
    label: CI_LOCAL_OPTIONAL_CLEAN_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-and-test job',
  });
  const ciLocalBuildAndTestInstallStep = extractStepBlock({
    text: ciLocalBuildAndTestJob,
    label: CI_LOCAL_INSTALL_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-and-test job',
  });
  const ciLocalBuildAndTestInstallCypressStep = extractStepBlock({
    text: ciLocalBuildAndTestJob,
    label: CI_LOCAL_INSTALL_CYPRESS_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-and-test job',
  });
  const ciLocalBuildAndTestFormatStep = extractStepBlock({
    text: ciLocalBuildAndTestJob,
    label: CI_LOCAL_FORMAT_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-and-test job',
  });
  const ciLocalBuildAndTestPrintCpuStep = extractStepBlock({
    text: ciLocalBuildAndTestJob,
    label: CI_LOCAL_PRINT_CPU_STEP_NAME,
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
  const ciLocalBuildMetroInstallStep = extractStepBlock({
    text: ciLocalBuildMetroJob,
    label: CI_LOCAL_INSTALL_STEP_NAME,
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
  const ciLocalBuildAndTestWarmCacheStep = extractStepBlock({
    text: ciLocalBuildAndTestJob,
    label: CI_LOCAL_BUILD_AND_TEST_WARM_CACHE_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-and-test job',
  });
  const ciLocalBuildAndTestAffectedTestStep = extractStepBlock({
    text: ciLocalBuildAndTestJob,
    label: CI_LOCAL_BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-and-test job',
  });
  const ciLocalBuildMetroTestStep = extractStepBlock({
    text: ciLocalBuildMetroJob,
    label: CI_LOCAL_BUILD_METRO_TEST_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-metro job',
  });
  const ciLocalBuildMetroLintStep = extractStepBlock({
    text: ciLocalBuildMetroJob,
    label: CI_LOCAL_BUILD_METRO_LINT_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-metro job',
  });
  const ciLocalBuildAndTestPublintStep = extractStepBlock({
    text: ciLocalBuildAndTestJob,
    label: CI_LOCAL_PUBLINT_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-and-test job',
  });
  const ciLocalBuildMetroPublintStep = extractStepBlock({
    text: ciLocalBuildMetroJob,
    label: CI_LOCAL_PUBLINT_STEP_NAME,
    issues,
    sourceLabel: 'ci-local build-metro job',
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
  assertSingleFunctionInvocationInStep({
    stepBlock: ciLocalBuildAndTestPublintStep,
    sourceLabel: `ci-local build-and-test ${CI_LOCAL_PUBLINT_STEP_NAME} step`,
    functionName: 'runShell',
    expectedInvocationRegex:
      /runShell\(\s*`[\s\S]*?for pkg in packages\/\*; do[\s\S]*?\[\[ "\$pkg" != packages\/metro-\* \]\][\s\S]*?npx publint "\$pkg"[\s\S]*?`,\s*ctx,\s*\)/,
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildAndTestPublintStep,
    workflowName: 'ci-local build-and-test',
    label: CI_LOCAL_PUBLINT_STEP_NAME,
    patterns: [/runCommand\(/],
    issues,
  });
  assertSingleFunctionInvocationInStep({
    stepBlock: ciLocalBuildMetroPublintStep,
    sourceLabel: `ci-local build-metro ${CI_LOCAL_PUBLINT_STEP_NAME} step`,
    functionName: 'runShell',
    expectedInvocationRegex:
      /runShell\(\s*`[\s\S]*?for pkg in packages\/metro-\*; do[\s\S]*?npx publint "\$pkg"[\s\S]*?`,\s*ctx,\s*\)/,
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildMetroPublintStep,
    workflowName: 'ci-local build-metro',
    label: CI_LOCAL_PUBLINT_STEP_NAME,
    patterns: [/runCommand\(/],
    issues,
  });
  assertPatterns({
    text: ciLocalBuildAndTestOptionalCleanStep,
    workflowName: 'ci-local build-and-test',
    label: CI_LOCAL_OPTIONAL_CLEAN_STEP_NAME,
    patterns: [
      /process\.env\.CI_LOCAL_CLEAN === 'true'/,
      /\[ci:local\] Skipping cache clean \(set CI_LOCAL_CLEAN=true to enable\)\./,
    ],
    issues,
  });
  assertSingleFunctionInvocationInStep({
    stepBlock: ciLocalBuildAndTestOptionalCleanStep,
    sourceLabel: `ci-local build-and-test ${CI_LOCAL_OPTIONAL_CLEAN_STEP_NAME} step`,
    functionName: 'runShell',
    expectedInvocationRegex: new RegExp(
      `runShell\\(\\s*'${CI_LOCAL_OPTIONAL_CLEAN_COMMAND.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',\\s*ctx\\s*\\)`,
    ),
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildAndTestOptionalCleanStep,
    workflowName: 'ci-local build-and-test',
    label: CI_LOCAL_OPTIONAL_CLEAN_STEP_NAME,
    patterns: [/runCommand\(/],
    issues,
  });
  assertSingleFunctionInvocationInStep({
    stepBlock: ciLocalBuildAndTestInstallStep,
    sourceLabel: 'ci-local build-and-test Install dependencies step',
    functionName: 'installDependencies',
    expectedInvocationRegex: /installDependencies\(\s*ctx\s*\)/,
    issues,
  });
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildAndTestInstallCypressStep,
    sourceLabel: `ci-local build-and-test ${CI_LOCAL_INSTALL_CYPRESS_STEP_NAME} step`,
    expectedInvocationRegex:
      /runCommand\(\s*'npx',\s*\[\s*'cypress',\s*'install',?\s*\],\s*ctx\s*\)/,
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildAndTestInstallCypressStep,
    workflowName: 'ci-local build-and-test',
    label: CI_LOCAL_INSTALL_CYPRESS_STEP_NAME,
    patterns: [/runShell\(/],
    issues,
  });
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildAndTestFormatStep,
    sourceLabel: `ci-local build-and-test ${CI_LOCAL_FORMAT_STEP_NAME} step`,
    expectedInvocationRegex:
      /runCommand\(\s*'npx',\s*\[\s*'nx',\s*'format:check',?\s*\],\s*ctx\s*\)/,
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildAndTestFormatStep,
    workflowName: 'ci-local build-and-test',
    label: CI_LOCAL_FORMAT_STEP_NAME,
    patterns: [/runShell\(/],
    issues,
  });
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildAndTestPrintCpuStep,
    sourceLabel: `ci-local build-and-test ${CI_LOCAL_PRINT_CPU_STEP_NAME} step`,
    expectedInvocationRegex: /runCommand\(\s*'nproc',\s*\[\s*\],\s*ctx\s*\)/,
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildAndTestPrintCpuStep,
    workflowName: 'ci-local build-and-test',
    label: CI_LOCAL_PRINT_CPU_STEP_NAME,
    patterns: [/runShell\(/],
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildAndTestInstallStep,
    workflowName: 'ci-local build-and-test',
    label: CI_LOCAL_INSTALL_STEP_NAME,
    patterns: [/runCommand\(/, /runShell\(/],
    issues,
  });
  assertSingleFunctionInvocationInStep({
    stepBlock: ciLocalBuildMetroInstallStep,
    sourceLabel: 'ci-local build-metro Install dependencies step',
    functionName: 'installDependencies',
    expectedInvocationRegex: /installDependencies\(\s*ctx\s*\)/,
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildMetroInstallStep,
    workflowName: 'ci-local build-metro',
    label: CI_LOCAL_INSTALL_STEP_NAME,
    patterns: [/runCommand\(/, /runShell\(/],
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
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildAndTestColdBuildStep,
    sourceLabel: 'ci-local build-and-test build (cold cache) step',
    expectedInvocationRegex:
      /runCommand\(\s*'npx',\s*\[[\s\S]*?'run-many'[\s\S]*?'--targets=build'[\s\S]*?'--projects=tag:type:pkg'[\s\S]*?'--parallel=4'[\s\S]*?'--skip-nx-cache'[\s\S]*?\],\s*ctx,\s*\)/,
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
    text: ciLocalBuildAndTestAffectedTestStep,
    workflowName: 'ci-local build-and-test',
    label: CI_LOCAL_BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME,
    patterns: [/'affected'/, /'--parallel=3'/, /'--exclude=\*,!tag:type:pkg'/],
    issues,
  });
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildAndTestAffectedTestStep,
    sourceLabel: `ci-local build-and-test ${CI_LOCAL_BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME} step`,
    expectedInvocationRegex:
      /runCommand\(\s*'npx',\s*\[[\s\S]*?'affected'[\s\S]*?'--parallel=3'[\s\S]*?'--exclude=\*,!tag:type:pkg'[\s\S]*?\],\s*ctx,\s*\)/,
    issues,
  });
  assertPatterns({
    text: ciLocalBuildAndTestWarmCacheStep,
    workflowName: 'ci-local build-and-test',
    label: CI_LOCAL_BUILD_AND_TEST_WARM_CACHE_STEP_NAME,
    patterns: [/'run-many'/, /'--projects=tag:type:pkg'/, /'--parallel=4'/],
    issues,
  });
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildAndTestWarmCacheStep,
    sourceLabel: `ci-local build-and-test ${CI_LOCAL_BUILD_AND_TEST_WARM_CACHE_STEP_NAME} step`,
    expectedInvocationRegex:
      /runCommand\(\s*'npx',\s*\[[\s\S]*?'run-many'[\s\S]*?'--targets=build'[\s\S]*?'--projects=tag:type:pkg'[\s\S]*?'--parallel=4'[\s\S]*?\],\s*ctx,\s*\)/,
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBuildAndTestWarmCacheStep,
    workflowName: 'ci-local build-and-test',
    label: CI_LOCAL_BUILD_AND_TEST_WARM_CACHE_STEP_NAME,
    patterns: [/'--skip-nx-cache'/, /'tag:type:metro'/],
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
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildMetroStep,
    sourceLabel: 'ci-local build-metro build step',
    expectedInvocationRegex:
      /runCommand\(\s*'npx',\s*\[[\s\S]*?'run-many'[\s\S]*?'--targets=build'[\s\S]*?'--projects=tag:type:pkg,tag:type:metro'[\s\S]*?'--parallel=4'[\s\S]*?'--skip-nx-cache'[\s\S]*?\],\s*ctx,\s*\)/,
    issues,
  });
  assertPatterns({
    text: ciLocalBuildMetroTestStep,
    workflowName: 'ci-local build-metro',
    label: CI_LOCAL_BUILD_METRO_TEST_STEP_NAME,
    patterns: [
      /'affected'/,
      /'--parallel=2'/,
      /'--exclude=\*,!tag:type:metro'/,
    ],
    issues,
  });
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildMetroTestStep,
    sourceLabel: `ci-local build-metro ${CI_LOCAL_BUILD_METRO_TEST_STEP_NAME} step`,
    expectedInvocationRegex:
      /runCommand\(\s*'npx',\s*\[[\s\S]*?'affected'[\s\S]*?'--parallel=2'[\s\S]*?'--exclude=\*,!tag:type:metro'[\s\S]*?\],\s*ctx,\s*\)/,
    issues,
  });
  assertSingleFunctionInvocationInStep({
    stepBlock: ciLocalBuildMetroTestStep,
    sourceLabel: `ci-local build-metro ${CI_LOCAL_BUILD_METRO_TEST_STEP_NAME} step`,
    functionName: 'runWithRetry',
    expectedInvocationRegex:
      /runWithRetry\(\{\s*label:\s*'metro affected tests',\s*attempts:\s*2,\s*run:\s*\(\)\s*=>[\s\S]*?runCommand\(/,
    issues,
  });
  assertPatterns({
    text: ciLocalBuildMetroLintStep,
    workflowName: 'ci-local build-metro',
    label: CI_LOCAL_BUILD_METRO_LINT_STEP_NAME,
    patterns: [
      /'run-many'/,
      /'--targets=lint'/,
      /'--projects=tag:type:metro'/,
      /'--parallel=2'/,
    ],
    issues,
  });
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildMetroLintStep,
    sourceLabel: `ci-local build-metro ${CI_LOCAL_BUILD_METRO_LINT_STEP_NAME} step`,
    expectedInvocationRegex:
      /runCommand\(\s*'npx',\s*\[[\s\S]*?'run-many'[\s\S]*?'--targets=lint'[\s\S]*?'--projects=tag:type:metro'[\s\S]*?'--parallel=2'[\s\S]*?\],\s*ctx,\s*\)/,
    issues,
  });
  assertPatterns({
    text: ciLocalBuildAndTestVerifyStep,
    workflowName: 'ci-local build-and-test',
    label: VERIFY_STEP_NAME,
    patterns: [/runCommand\('pnpm', \['verify:publint:coverage'\], ctx\)/],
    issues,
  });
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildAndTestVerifyStep,
    sourceLabel: 'ci-local build-and-test Verify Publint Coverage Guards step',
    expectedInvocationRegex:
      /runCommand\('pnpm', \['verify:publint:coverage'\], ctx\)/,
    issues,
  });
  assertPatterns({
    text: ciLocalBuildAndTestTemplateVerifyStep,
    workflowName: 'ci-local build-and-test',
    label: TEMPLATE_VERIFY_STEP_NAME,
    patterns: REQUIRED_PATTERNS.ciLocalTemplateVerifyStepRun,
    issues,
  });
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildAndTestTemplateVerifyStep,
    sourceLabel:
      'ci-local build-and-test Verify Rslib Template Publint Wiring step',
    expectedInvocationRegex:
      /runCommand\(\s*'node',\s*\[\s*'packages\/create-module-federation\/scripts\/verify-rslib-templates\.mjs',\s*\],\s*ctx,\s*\)/,
    issues,
  });
  assertPatterns({
    text: ciLocalBuildMetroVerifyStep,
    workflowName: 'ci-local build-metro',
    label: VERIFY_STEP_NAME,
    patterns: [/runCommand\('pnpm', \['verify:publint:coverage'\], ctx\)/],
    issues,
  });
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildMetroVerifyStep,
    sourceLabel: 'ci-local build-metro Verify Publint Coverage Guards step',
    expectedInvocationRegex:
      /runCommand\('pnpm', \['verify:publint:coverage'\], ctx\)/,
    issues,
  });
  assertPatterns({
    text: ciLocalBuildMetroTemplateVerifyStep,
    workflowName: 'ci-local build-metro',
    label: TEMPLATE_VERIFY_STEP_NAME,
    patterns: REQUIRED_PATTERNS.ciLocalTemplateVerifyStepRun,
    issues,
  });
  assertSingleRunCommandInvocationInStep({
    stepBlock: ciLocalBuildMetroTemplateVerifyStep,
    sourceLabel:
      'ci-local build-metro Verify Rslib Template Publint Wiring step',
    expectedInvocationRegex:
      /runCommand\(\s*'node',\s*\[\s*'packages\/create-module-federation\/scripts\/verify-rslib-templates\.mjs',\s*\],\s*ctx,\s*\)/,
    issues,
  });
  assertStepOrderInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    orderedStepLabels: [
      CI_LOCAL_OPTIONAL_CLEAN_STEP_NAME,
      CI_LOCAL_INSTALL_STEP_NAME,
      CI_LOCAL_INSTALL_CYPRESS_STEP_NAME,
      CI_LOCAL_FORMAT_STEP_NAME,
      TEMPLATE_VERIFY_STEP_NAME,
      VERIFY_STEP_NAME,
      CI_LOCAL_PRINT_CPU_STEP_NAME,
      'Build packages (cold cache)',
      CI_LOCAL_PUBLINT_STEP_NAME,
      CI_LOCAL_BUILD_AND_TEST_WARM_CACHE_STEP_NAME,
      CI_LOCAL_BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME,
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
      CI_LOCAL_BUILD_METRO_TEST_STEP_NAME,
      CI_LOCAL_BUILD_METRO_LINT_STEP_NAME,
      CI_LOCAL_PUBLINT_STEP_NAME,
    ],
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    stepLabel: CI_LOCAL_OPTIONAL_CLEAN_STEP_NAME,
    expectedCount: 1,
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
    stepLabel: CI_LOCAL_FORMAT_STEP_NAME,
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    stepLabel: CI_LOCAL_INSTALL_CYPRESS_STEP_NAME,
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    stepLabel: CI_LOCAL_PRINT_CPU_STEP_NAME,
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
    stepLabel: CI_LOCAL_OPTIONAL_CLEAN_STEP_NAME,
    expectedCount: 0,
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
    stepLabel: CI_LOCAL_FORMAT_STEP_NAME,
    expectedCount: 0,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildMetroJob,
    sourceLabel: 'ci-local build-metro job',
    stepLabel: CI_LOCAL_INSTALL_CYPRESS_STEP_NAME,
    expectedCount: 0,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildMetroJob,
    sourceLabel: 'ci-local build-metro job',
    stepLabel: CI_LOCAL_PRINT_CPU_STEP_NAME,
    expectedCount: 0,
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
    stepLabel: CI_LOCAL_PUBLINT_STEP_NAME,
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    stepLabel: CI_LOCAL_BUILD_AND_TEST_WARM_CACHE_STEP_NAME,
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    stepLabel: CI_LOCAL_BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME,
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
    stepLabel: CI_LOCAL_BUILD_METRO_TEST_STEP_NAME,
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildMetroJob,
    sourceLabel: 'ci-local build-metro job',
    stepLabel: CI_LOCAL_BUILD_METRO_LINT_STEP_NAME,
    expectedCount: 1,
    issues,
  });
  assertStepCountInText({
    text: ciLocalBuildMetroJob,
    sourceLabel: 'ci-local build-metro job',
    stepLabel: CI_LOCAL_PUBLINT_STEP_NAME,
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
  const step = readWorkflowStep({
    workflow,
    workflowName,
    jobName,
    stepName,
    issues,
  });
  if (!step) {
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

function readWorkflowStep({
  workflow,
  workflowName,
  jobName,
  stepName,
  issues,
}) {
  const step = workflow?.jobs?.[jobName]?.steps?.find(
    (candidate) => candidate?.name === stepName,
  );
  if (!step) {
    issues.push(
      `${workflowName} workflow is missing step "${stepName}" in job "${jobName}"`,
    );
    return null;
  }

  return step;
}

function readStepWithCommand({
  workflow,
  workflowName,
  jobName,
  stepName,
  issues,
}) {
  const step = readWorkflowStep({
    workflow,
    workflowName,
    jobName,
    stepName,
    issues,
  });
  if (!step) {
    return '';
  }

  const command = step?.with?.command;
  if (typeof command !== 'string' || command.trim().length === 0) {
    issues.push(
      `${workflowName} workflow step "${stepName}" in job "${jobName}" is missing with.command`,
    );
    return '';
  }

  return command;
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

function assertSingleRunCommandInvocationInStep({
  stepBlock,
  sourceLabel,
  expectedInvocationRegex,
  issues,
}) {
  const invocationCount = (stepBlock.match(/runCommand\(/g) || []).length;
  if (invocationCount !== 1) {
    issues.push(
      `${sourceLabel} must contain exactly one runCommand(...) invocation, found ${invocationCount}`,
    );
    return;
  }

  if (!expectedInvocationRegex.test(stepBlock)) {
    issues.push(
      `${sourceLabel} is missing expected runCommand invocation: ${expectedInvocationRegex}`,
    );
  }
}

function assertSingleFunctionInvocationInStep({
  stepBlock,
  sourceLabel,
  functionName,
  expectedInvocationRegex,
  issues,
}) {
  const escapedFunctionName = functionName.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );
  const invocationCount = (
    stepBlock.match(new RegExp(`${escapedFunctionName}\\(`, 'g')) || []
  ).length;
  if (invocationCount !== 1) {
    issues.push(
      `${sourceLabel} must contain exactly one ${functionName}(...) invocation, found ${invocationCount}`,
    );
    return;
  }

  if (!expectedInvocationRegex.test(stepBlock)) {
    issues.push(
      `${sourceLabel} is missing expected ${functionName}(...) invocation: ${expectedInvocationRegex}`,
    );
  }
}

function assertRetryActionStepConfig({
  step,
  workflowName,
  jobName,
  stepName,
  expectedUses,
  expectedMaxAttempts,
  expectedTimeoutMinutes,
  issues,
}) {
  if (!step) {
    return;
  }

  if (step.run !== undefined) {
    issues.push(
      `${workflowName} workflow step "${stepName}" in job "${jobName}" should not define run when using ${expectedUses}`,
    );
  }

  if (step.uses !== expectedUses) {
    issues.push(
      `${workflowName} workflow step "${stepName}" in job "${jobName}" must use ${expectedUses}, found ${String(step.uses)}`,
    );
  }

  const maxAttempts = Number(step?.with?.max_attempts);
  if (maxAttempts !== expectedMaxAttempts) {
    issues.push(
      `${workflowName} workflow step "${stepName}" in job "${jobName}" must set with.max_attempts=${expectedMaxAttempts}, found ${String(step?.with?.max_attempts)}`,
    );
  }

  const timeoutMinutes = Number(step?.with?.timeout_minutes);
  if (timeoutMinutes !== expectedTimeoutMinutes) {
    issues.push(
      `${workflowName} workflow step "${stepName}" in job "${jobName}" must set with.timeout_minutes=${expectedTimeoutMinutes}, found ${String(step?.with?.timeout_minutes)}`,
    );
  }
}

function assertActionStepConfig({
  step,
  workflowName,
  jobName,
  stepName,
  expectedUses,
  expectedWith = {},
  issues,
}) {
  if (!step) {
    return;
  }

  if (step.run !== undefined) {
    issues.push(
      `${workflowName} workflow step "${stepName}" in job "${jobName}" should not define run when using ${expectedUses}`,
    );
  }

  if (step.uses !== expectedUses) {
    issues.push(
      `${workflowName} workflow step "${stepName}" in job "${jobName}" must use ${expectedUses}, found ${String(step.uses)}`,
    );
  }

  for (const [key, expectedValue] of Object.entries(expectedWith)) {
    const actualValue = step?.with?.[key];
    if (actualValue !== expectedValue) {
      issues.push(
        `${workflowName} workflow step "${stepName}" in job "${jobName}" must set with.${key}=${String(
          expectedValue,
        )}, found ${String(actualValue)}`,
      );
    }
  }
}

function assertWorkflowTriggerExists({
  workflow,
  workflowName,
  triggerName,
  issues,
}) {
  const triggers = workflow?.on;
  if (!triggers || typeof triggers !== 'object' || !(triggerName in triggers)) {
    issues.push(
      `${workflowName} workflow must declare trigger "${triggerName}"`,
    );
  }
}

function assertWorkflowName({ workflow, workflowName, expectedName, issues }) {
  const actualName = workflow?.name;
  if (actualName !== expectedName) {
    issues.push(
      `${workflowName} workflow name must be "${expectedName}", found "${String(actualName)}"`,
    );
  }
}

function assertWorkflowTriggersExact({
  workflow,
  workflowName,
  expectedTriggers,
  issues,
}) {
  const triggers = workflow?.on;
  if (!triggers || typeof triggers !== 'object') {
    issues.push(`${workflowName} workflow must define trigger configuration`);
    return;
  }

  const actualTriggers = Object.keys(triggers).sort();
  const sortedExpected = [...expectedTriggers].sort();
  if (
    actualTriggers.length !== sortedExpected.length ||
    actualTriggers.some((value, index) => value !== sortedExpected[index])
  ) {
    issues.push(
      `${workflowName} workflow must define triggers [${sortedExpected.join(
        ', ',
      )}], found [${actualTriggers.join(', ')}]`,
    );
  }
}

function assertWorkflowTriggerBranchesInclude({
  workflow,
  workflowName,
  triggerName,
  expectedBranches,
  issues,
}) {
  const triggerConfig = workflow?.on?.[triggerName];
  const branches = triggerConfig?.branches;
  if (!Array.isArray(branches)) {
    issues.push(
      `${workflowName} workflow trigger "${triggerName}" must define a branches array`,
    );
    return;
  }

  for (const expectedBranch of expectedBranches) {
    if (!branches.includes(expectedBranch)) {
      issues.push(
        `${workflowName} workflow trigger "${triggerName}" branches must include "${expectedBranch}"`,
      );
    }
  }
}

function assertWorkflowTriggerBranchesExact({
  workflow,
  workflowName,
  triggerName,
  expectedBranches,
  issues,
}) {
  const triggerConfig = workflow?.on?.[triggerName];
  const branches = triggerConfig?.branches;
  if (!Array.isArray(branches)) {
    issues.push(
      `${workflowName} workflow trigger "${triggerName}" must define a branches array`,
    );
    return;
  }

  const sortedActual = [...branches].sort();
  const sortedExpected = [...expectedBranches].sort();
  if (
    sortedActual.length !== sortedExpected.length ||
    sortedActual.some((value, index) => value !== sortedExpected[index])
  ) {
    issues.push(
      `${workflowName} workflow trigger "${triggerName}" must define branches [${sortedExpected.join(
        ', ',
      )}], found [${sortedActual.join(', ')}]`,
    );
  }
}

function assertWorkflowConcurrencyConfig({
  workflow,
  workflowName,
  expectedGroup,
  expectedCancelInProgress,
  issues,
}) {
  const group = workflow?.concurrency?.group;
  if (group !== expectedGroup) {
    issues.push(
      `${workflowName} workflow concurrency.group must be "${expectedGroup}", found "${String(group)}"`,
    );
  }

  const cancelInProgress = workflow?.concurrency?.['cancel-in-progress'];
  if (cancelInProgress !== expectedCancelInProgress) {
    issues.push(
      `${workflowName} workflow concurrency.cancel-in-progress must be ${String(
        expectedCancelInProgress,
      )}, found ${String(cancelInProgress)}`,
    );
  }
}

function assertWorkflowPermission({
  workflow,
  workflowName,
  permissionName,
  expectedValue,
  issues,
}) {
  const actualValue = workflow?.permissions?.[permissionName];
  if (actualValue !== expectedValue) {
    issues.push(
      `${workflowName} workflow permissions.${permissionName} must be "${expectedValue}", found "${String(actualValue)}"`,
    );
  }
}

function assertWorkflowJobPermission({
  workflow,
  workflowName,
  jobName,
  permissionName,
  expectedValue,
  issues,
}) {
  const permissionValue =
    workflow?.jobs?.[jobName]?.permissions?.[permissionName];
  if (permissionValue !== expectedValue) {
    issues.push(
      `${workflowName} workflow job "${jobName}" permissions.${permissionName} must be "${expectedValue}", found "${String(permissionValue)}"`,
    );
  }
}

function assertWorkflowJobRunner({
  workflow,
  workflowName,
  jobName,
  expectedRunner,
  issues,
}) {
  const actualRunner = workflow?.jobs?.[jobName]?.['runs-on'];
  if (actualRunner !== expectedRunner) {
    issues.push(
      `${workflowName} workflow job "${jobName}" must set runs-on=${expectedRunner}, found ${String(
        actualRunner,
      )}`,
    );
  }
}

function assertWorkflowJobTimeout({
  workflow,
  workflowName,
  jobName,
  expectedTimeoutMinutes,
  issues,
}) {
  const timeoutMinutes = Number(workflow?.jobs?.[jobName]?.['timeout-minutes']);
  if (timeoutMinutes !== expectedTimeoutMinutes) {
    issues.push(
      `${workflowName} workflow job "${jobName}" must set timeout-minutes=${expectedTimeoutMinutes}, found ${String(
        workflow?.jobs?.[jobName]?.['timeout-minutes'],
      )}`,
    );
  }
}

function assertWorkflowStepNumericProperty({
  step,
  workflowName,
  jobName,
  stepName,
  propertyName,
  expectedValue,
  issues,
}) {
  if (!step) {
    return;
  }

  const actualValue = Number(step?.[propertyName]);
  if (actualValue !== expectedValue) {
    issues.push(
      `${workflowName} workflow step "${stepName}" in job "${jobName}" must set ${propertyName}=${expectedValue}, found ${String(step?.[propertyName])}`,
    );
  }
}

function assertReusableWorkflowJobUses({
  workflow,
  workflowName,
  jobName,
  expectedUses,
  issues,
}) {
  const job = workflow?.jobs?.[jobName];
  if (!job) {
    issues.push(`${workflowName} workflow is missing job "${jobName}"`);
    return;
  }

  if (job.uses !== expectedUses) {
    issues.push(
      `${workflowName} workflow job "${jobName}" must use "${expectedUses}", found "${String(job.uses)}"`,
    );
  }
}

function assertReusableWorkflowJobsUseInheritedSecrets({
  workflow,
  workflowName,
  reusableWorkflowPrefix,
  expectedSecretsValue,
  issues,
}) {
  const jobs = workflow?.jobs;
  if (!jobs || typeof jobs !== 'object') {
    issues.push(`${workflowName} workflow is missing jobs configuration`);
    return;
  }

  for (const [jobName, jobConfig] of Object.entries(jobs)) {
    if (
      typeof jobConfig?.uses !== 'string' ||
      !jobConfig.uses.startsWith(reusableWorkflowPrefix)
    ) {
      continue;
    }

    if (jobConfig.secrets !== expectedSecretsValue) {
      issues.push(
        `${workflowName} workflow job "${jobName}" must set secrets: ${expectedSecretsValue}`,
      );
    }
  }
}

function assertReusableWorkflowJobsNeedCheckoutInstall({
  workflow,
  workflowName,
  reusableWorkflowPrefix,
  checkoutInstallJobName,
  excludeJobNames,
  issues,
}) {
  const excluded = new Set(excludeJobNames);
  const jobs = workflow?.jobs;
  if (!jobs || typeof jobs !== 'object') {
    issues.push(`${workflowName} workflow is missing jobs configuration`);
    return;
  }

  for (const [jobName, jobConfig] of Object.entries(jobs)) {
    if (excluded.has(jobName)) {
      continue;
    }
    if (
      typeof jobConfig?.uses !== 'string' ||
      !jobConfig.uses.startsWith(reusableWorkflowPrefix)
    ) {
      continue;
    }

    const needs = readWorkflowJobNeeds(jobConfig);
    if (!needs.includes(checkoutInstallJobName)) {
      issues.push(
        `${workflowName} workflow job "${jobName}" must include "${checkoutInstallJobName}" in needs`,
      );
    }
  }
}

function assertWorkflowJobNeedsExact({
  workflow,
  workflowName,
  jobName,
  expectedNeeds,
  issues,
}) {
  const job = workflow?.jobs?.[jobName];
  if (!job) {
    issues.push(`${workflowName} workflow is missing job "${jobName}"`);
    return;
  }

  const actualNeeds = readWorkflowJobNeeds(job);
  const sortedActual = [...actualNeeds].sort();
  const sortedExpected = [...expectedNeeds].sort();
  if (
    sortedActual.length !== sortedExpected.length ||
    sortedActual.some((value, index) => value !== sortedExpected[index])
  ) {
    issues.push(
      `${workflowName} workflow job "${jobName}" must have needs [${sortedExpected.join(
        ', ',
      )}], found [${sortedActual.join(', ')}]`,
    );
  }
}

function assertWorkflowJobNeedsIncludes({
  workflow,
  workflowName,
  jobName,
  expectedNeeds,
  issues,
}) {
  const job = workflow?.jobs?.[jobName];
  if (!job) {
    issues.push(`${workflowName} workflow is missing job "${jobName}"`);
    return;
  }

  const needs = readWorkflowJobNeeds(job);
  for (const expectedNeed of expectedNeeds) {
    if (!needs.includes(expectedNeed)) {
      issues.push(
        `${workflowName} workflow job "${jobName}" must include "${expectedNeed}" in needs`,
      );
    }
  }
}

function readWorkflowJobNeeds(job) {
  if (Array.isArray(job?.needs)) {
    return job.needs;
  }
  if (typeof job?.needs === 'string') {
    return [job.needs];
  }
  return [];
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

function extractFunctionBlock({
  text,
  functionName,
  issues,
  sourceLabel = 'script',
}) {
  const functionAnchor = `function ${functionName}(`;
  const startIndex = text.indexOf(functionAnchor);
  if (startIndex === -1) {
    issues.push(`${sourceLabel} is missing function "${functionName}"`);
    return '';
  }

  const blockStart = text.indexOf('{', startIndex);
  if (blockStart === -1) {
    issues.push(
      `${sourceLabel} function "${functionName}" is missing opening brace`,
    );
    return '';
  }

  const endIndex = findBraceBlockEndIndex(text, blockStart);
  if (endIndex === -1) {
    issues.push(
      `${sourceLabel} function "${functionName}" could not be parsed`,
    );
    return '';
  }

  return text.slice(startIndex, endIndex + 1);
}

function extractStepBlock({
  text,
  label,
  issues,
  sourceLabel = 'ci-local script',
}) {
  const stepAnchor = `step('${label}'`;
  const startIndex = text.indexOf(stepAnchor);
  if (startIndex === -1) {
    issues.push(`${sourceLabel} is missing step "${label}"`);
    return '';
  }

  const endIndex = findStepCallEndIndex(text, startIndex);
  if (endIndex === -1) {
    issues.push(`${sourceLabel} step "${label}" could not be parsed`);
    return '';
  }

  return text.slice(startIndex, endIndex + 1);
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

function findStepCallEndIndex(text, startIndex) {
  let depth = 0;
  let hasOpened = false;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateString = false;
  let escapeNext = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (inSingleQuote) {
      if (char === '\\') {
        escapeNext = true;
      } else if (char === "'") {
        inSingleQuote = false;
      }
      continue;
    }

    if (inDoubleQuote) {
      if (char === '\\') {
        escapeNext = true;
      } else if (char === '"') {
        inDoubleQuote = false;
      }
      continue;
    }

    if (inTemplateString) {
      if (char === '\\') {
        escapeNext = true;
      } else if (char === '`') {
        inTemplateString = false;
      }
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      continue;
    }
    if (char === '"') {
      inDoubleQuote = true;
      continue;
    }
    if (char === '`') {
      inTemplateString = true;
      continue;
    }

    if (char === '(') {
      depth += 1;
      hasOpened = true;
      continue;
    }

    if (char === ')') {
      if (!hasOpened) {
        continue;
      }

      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function findBraceBlockEndIndex(text, startIndex) {
  let depth = 0;
  let hasOpened = false;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateString = false;
  let escapeNext = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (inSingleQuote) {
      if (char === '\\') {
        escapeNext = true;
      } else if (char === "'") {
        inSingleQuote = false;
      }
      continue;
    }

    if (inDoubleQuote) {
      if (char === '\\') {
        escapeNext = true;
      } else if (char === '"') {
        inDoubleQuote = false;
      }
      continue;
    }

    if (inTemplateString) {
      if (char === '\\') {
        escapeNext = true;
      } else if (char === '`') {
        inTemplateString = false;
      }
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      continue;
    }
    if (char === '"') {
      inDoubleQuote = true;
      continue;
    }
    if (char === '`') {
      inTemplateString = true;
      continue;
    }

    if (char === '{') {
      depth += 1;
      hasOpened = true;
      continue;
    }

    if (char === '}') {
      if (!hasOpened) {
        continue;
      }

      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

main();
