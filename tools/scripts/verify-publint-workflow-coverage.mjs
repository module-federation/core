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
const EXPECTED_BUILD_AND_TEST_WORKFLOW_FIELDS = [
  'name',
  'permissions',
  'on',
  'concurrency',
  'jobs',
];
const EXPECTED_BUILD_METRO_WORKFLOW_FIELDS = [
  'name',
  'on',
  'permissions',
  'jobs',
];
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
const RUN_WITH_RETRY_HELPER_NAME = 'runWithRetry';
const FORMAT_MATRIX_JOB_NAME_HELPER_NAME = 'formatMatrixJobName';
const FORMAT_JOB_LIST_ENTRY_HELPER_NAME = 'formatJobListEntry';
const GET_SELECTABLE_JOB_NAMES_HELPER_NAME = 'getSelectableJobNames';
const SHOULD_RUN_JOB_HELPER_NAME = 'shouldRunJob';
const LIST_JOBS_HELPER_NAME = 'listJobs';
const PARSE_ARGS_HELPER_NAME = 'parseArgs';
const VALIDATE_ARGS_HELPER_NAME = 'validateArgs';
const PRINT_PARITY_HELPER_NAME = 'printParity';
const PRINT_HELP_HELPER_NAME = 'printHelp';
const CI_LOCAL_MAIN_HELPER_NAME = 'main';
const PREFLIGHT_HELPER_NAME = 'preflight';
const DETECT_PNPM_VERSION_HELPER_NAME = 'detectPnpmVersion';
const READ_ROOT_PACKAGE_JSON_HELPER_NAME = 'readRootPackageJson';
const RESOLVE_EXPECTED_NODE_MAJOR_HELPER_NAME = 'resolveExpectedNodeMajor';
const RESOLVE_EXPECTED_PNPM_VERSION_HELPER_NAME = 'resolveExpectedPnpmVersion';
const RUN_COMMAND_HELPER_NAME = 'runCommand';
const RUN_SHELL_HELPER_NAME = 'runShell';
const SLEEP_HELPER_NAME = 'sleep';
const CI_IS_AFFECTED_HELPER_NAME = 'ciIsAffected';
const LOG_STEP_SKIP_HELPER_NAME = 'logStepSkip';
const FORMAT_EXIT_HELPER_NAME = 'formatExit';
const RUN_JOB_HELPER_NAME = 'runJob';
const STEP_HELPER_NAME = 'step';
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
const BUILD_AND_TEST_COLD_BUILD_COMMAND =
  'npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4 --skip-nx-cache';
const BUILD_AND_TEST_WARM_BUILD_COMMAND =
  'npx nx run-many --targets=build --projects=tag:type:pkg --parallel=4';
const BUILD_METRO_BUILD_COMMAND =
  'npx nx run-many --targets=build --projects=tag:type:pkg,tag:type:metro --parallel=4 --skip-nx-cache';
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
const EXPECTED_BUILD_AND_TEST_CONCURRENCY_FIELDS = [
  'group',
  'cancel-in-progress',
];
const CHECKOUT_INSTALL_JOB_NAME = 'checkout-install';
const BUILD_METRO_JOB_NAME = 'build-metro';
const E2E_METRO_JOB_NAME = 'e2e-metro';
const UBUNTU_LATEST_RUNNER = 'ubuntu-latest';
const EXPECTED_BUILD_AND_TEST_PULL_REQUEST_TRIGGER_FIELDS = ['branches'];
const EXPECTED_BUILD_AND_TEST_PUSH_TRIGGER_FIELDS = ['branches'];
const EXPECTED_BUILD_METRO_WORKFLOW_CALL_TRIGGER_FIELDS = [];
const LOCAL_REUSABLE_WORKFLOW_PREFIX = './.github/workflows/';
const INHERITED_JOB_SECRETS_VALUE = 'inherit';
const EXPECTED_BUILD_AND_TEST_REUSABLE_JOBS = {
  [BUILD_METRO_JOB_NAME]: {
    uses: './.github/workflows/build-metro.yml',
    needs: [],
    secrets: INHERITED_JOB_SECRETS_VALUE,
  },
  'e2e-modern': {
    uses: './.github/workflows/e2e-modern.yml',
    needs: [CHECKOUT_INSTALL_JOB_NAME],
    secrets: INHERITED_JOB_SECRETS_VALUE,
  },
  'e2e-runtime': {
    uses: './.github/workflows/e2e-runtime.yml',
    needs: [CHECKOUT_INSTALL_JOB_NAME],
    secrets: INHERITED_JOB_SECRETS_VALUE,
  },
  'e2e-manifest': {
    uses: './.github/workflows/e2e-manifest.yml',
    needs: [CHECKOUT_INSTALL_JOB_NAME],
    secrets: INHERITED_JOB_SECRETS_VALUE,
  },
  'e2e-node': {
    uses: './.github/workflows/e2e-node.yml',
    needs: [CHECKOUT_INSTALL_JOB_NAME],
    secrets: INHERITED_JOB_SECRETS_VALUE,
  },
  'e2e-next-dev': {
    uses: './.github/workflows/e2e-next-dev.yml',
    needs: [CHECKOUT_INSTALL_JOB_NAME],
    secrets: INHERITED_JOB_SECRETS_VALUE,
  },
  'e2e-next-prod': {
    uses: './.github/workflows/e2e-next-prod.yml',
    needs: [CHECKOUT_INSTALL_JOB_NAME],
    secrets: INHERITED_JOB_SECRETS_VALUE,
  },
  'e2e-treeshake': {
    uses: './.github/workflows/e2e-treeshake.yml',
    needs: [CHECKOUT_INSTALL_JOB_NAME],
    secrets: INHERITED_JOB_SECRETS_VALUE,
  },
  'e2e-modern-ssr': {
    uses: './.github/workflows/e2e-modern-ssr.yml',
    needs: [CHECKOUT_INSTALL_JOB_NAME],
    secrets: INHERITED_JOB_SECRETS_VALUE,
  },
  'e2e-router': {
    uses: './.github/workflows/e2e-router.yml',
    needs: [CHECKOUT_INSTALL_JOB_NAME],
    secrets: INHERITED_JOB_SECRETS_VALUE,
  },
  [E2E_METRO_JOB_NAME]: {
    uses: './.github/workflows/e2e-metro.yml',
    needs: [CHECKOUT_INSTALL_JOB_NAME, BUILD_METRO_JOB_NAME],
    secrets: INHERITED_JOB_SECRETS_VALUE,
  },
};
const EXPECTED_BUILD_AND_TEST_REUSABLE_JOB_PERMISSIONS = {
  [E2E_METRO_JOB_NAME]: {
    contents: WORKFLOW_PERMISSION_READ,
    actions: WORKFLOW_PERMISSION_READ,
    checks: WORKFLOW_PERMISSION_WRITE,
    'pull-requests': WORKFLOW_PERMISSION_WRITE,
  },
};
const EXPECTED_BUILD_AND_TEST_REUSABLE_JOB_FIELDS = {
  [BUILD_METRO_JOB_NAME]: ['uses', 'secrets'],
  'e2e-modern': ['needs', 'uses', 'secrets'],
  'e2e-runtime': ['needs', 'uses', 'secrets'],
  'e2e-manifest': ['needs', 'uses', 'secrets'],
  'e2e-node': ['needs', 'uses', 'secrets'],
  'e2e-next-dev': ['needs', 'uses', 'secrets'],
  'e2e-next-prod': ['needs', 'uses', 'secrets'],
  'e2e-treeshake': ['needs', 'uses', 'secrets'],
  'e2e-modern-ssr': ['needs', 'uses', 'secrets'],
  'e2e-router': ['needs', 'uses', 'secrets'],
  [E2E_METRO_JOB_NAME]: ['permissions', 'needs', 'uses', 'secrets'],
};
const CI_LOCAL_BUILD_AND_TEST_WARM_CACHE_STEP_NAME = 'Warm Nx cache';
const CI_LOCAL_BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME = 'Run affected tests';
const CI_LOCAL_BUILD_METRO_TEST_STEP_NAME = 'Test metro packages';
const CI_LOCAL_BUILD_METRO_LINT_STEP_NAME = 'Lint metro packages';
const CI_LOCAL_PUBLINT_STEP_NAME =
  'Check package publishing compatibility (publint)';
const CI_LOCAL_BUNDLE_SIZE_JOB_NAME = 'bundle-size';
const LEGACY_VERIFY_STEP_NAMES = [
  'Verify Package Rslib Publint Wiring',
  'Verify Publint Workflow Coverage',
];
const EXPECTED_CI_LOCAL_BUILD_AND_TEST_STEP_LABELS = [
  CI_LOCAL_OPTIONAL_CLEAN_STEP_NAME,
  CI_LOCAL_INSTALL_STEP_NAME,
  CI_LOCAL_INSTALL_CYPRESS_STEP_NAME,
  CI_LOCAL_FORMAT_STEP_NAME,
  TEMPLATE_VERIFY_STEP_NAME,
  VERIFY_STEP_NAME,
  CI_LOCAL_PRINT_CPU_STEP_NAME,
  'Build packages (cold cache)',
  'Build packages (warm cache)',
  CI_LOCAL_PUBLINT_STEP_NAME,
  CI_LOCAL_BUILD_AND_TEST_WARM_CACHE_STEP_NAME,
  CI_LOCAL_BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME,
];
const EXPECTED_CI_LOCAL_BUILD_METRO_STEP_LABELS = [
  CI_LOCAL_INSTALL_STEP_NAME,
  TEMPLATE_VERIFY_STEP_NAME,
  VERIFY_STEP_NAME,
  'Build all required packages',
  CI_LOCAL_BUILD_METRO_TEST_STEP_NAME,
  CI_LOCAL_BUILD_METRO_LINT_STEP_NAME,
  CI_LOCAL_PUBLINT_STEP_NAME,
];
const EXPECTED_BUILD_AND_TEST_STEP_LABELS = [
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
];
const EXPECTED_BUILD_METRO_STEP_LABELS = [
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
];
const STEP_FIELDS_NAME_RUN = ['name', 'run'];
const STEP_FIELDS_NAME_USES = ['name', 'uses'];
const STEP_FIELDS_NAME_USES_WITH = ['name', 'uses', 'with'];
const STEP_FIELDS_NAME_TIMEOUT_RUN = ['name', 'timeout-minutes', 'run'];
const EXPECTED_RETRY_STEP_WITH_FIELDS = [
  'max_attempts',
  'timeout_minutes',
  'command',
];
const EXPECTED_BUILD_AND_TEST_STEP_FIELDS = {
  [CHECKOUT_STEP_NAME]: STEP_FIELDS_NAME_USES_WITH,
  [CACHE_TOOL_DOWNLOADS_STEP_NAME]: STEP_FIELDS_NAME_USES_WITH,
  [WORKFLOW_SETUP_PNPM_STEP_NAME]: STEP_FIELDS_NAME_USES,
  [WORKFLOW_SETUP_NODE_STEP_NAME]: STEP_FIELDS_NAME_USES_WITH,
  [REMOVE_CACHED_NODE_MODULES_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [WORKFLOW_SET_PLAYWRIGHT_CACHE_STATUS_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [WORKFLOW_SET_NX_SHA_STEP_NAME]: STEP_FIELDS_NAME_USES,
  [WORKFLOW_INSTALL_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [WORKFLOW_INSTALL_PLAYWRIGHT_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [WORKFLOW_INSTALL_CYPRESS_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [BUILD_AND_TEST_FORMAT_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [TEMPLATE_VERIFY_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [VERIFY_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [WORKFLOW_PRINT_CPU_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [BUILD_AND_TEST_BUILD_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [PUBLINT_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [BUILD_AND_TEST_WARM_CACHE_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME]: STEP_FIELDS_NAME_TIMEOUT_RUN,
};
const EXPECTED_BUILD_METRO_STEP_FIELDS = {
  [CHECKOUT_STEP_NAME]: STEP_FIELDS_NAME_USES_WITH,
  [CACHE_TOOL_DOWNLOADS_STEP_NAME]: STEP_FIELDS_NAME_USES_WITH,
  [WORKFLOW_SETUP_PNPM_STEP_NAME]: STEP_FIELDS_NAME_USES,
  [WORKFLOW_SETUP_NODE_STEP_NAME]: STEP_FIELDS_NAME_USES_WITH,
  [WORKFLOW_SET_NX_SHA_STEP_NAME]: STEP_FIELDS_NAME_USES,
  [WORKFLOW_INSTALL_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [TEMPLATE_VERIFY_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [VERIFY_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [BUILD_METRO_BUILD_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [BUILD_METRO_TEST_STEP_NAME]: STEP_FIELDS_NAME_USES_WITH,
  [BUILD_METRO_LINT_STEP_NAME]: STEP_FIELDS_NAME_RUN,
  [PUBLINT_STEP_NAME]: STEP_FIELDS_NAME_RUN,
};
const EXPECTED_BUILD_AND_TEST_JOB_NAMES = [
  CHECKOUT_INSTALL_JOB_NAME,
  'e2e-modern',
  'e2e-runtime',
  'e2e-manifest',
  'e2e-node',
  'e2e-next-dev',
  'e2e-next-prod',
  'e2e-treeshake',
  'e2e-modern-ssr',
  'e2e-router',
  E2E_METRO_JOB_NAME,
  BUILD_METRO_JOB_NAME,
];
const EXPECTED_BUILD_METRO_JOB_NAMES = [BUILD_METRO_JOB_NAME];
const EXPECTED_BUILD_AND_TEST_JOB_ORDER = [
  CHECKOUT_INSTALL_JOB_NAME,
  'e2e-modern',
  'e2e-runtime',
  'e2e-manifest',
  'e2e-node',
  'e2e-next-dev',
  'e2e-next-prod',
  'e2e-treeshake',
  'e2e-modern-ssr',
  'e2e-router',
  E2E_METRO_JOB_NAME,
  BUILD_METRO_JOB_NAME,
];
const EXPECTED_BUILD_METRO_JOB_ORDER = [BUILD_METRO_JOB_NAME];
const EXPECTED_BUILD_AND_TEST_NON_REUSABLE_JOBS = [CHECKOUT_INSTALL_JOB_NAME];
const EXPECTED_BUILD_AND_TEST_REUSABLE_JOB_NAMES = [
  'e2e-modern',
  'e2e-runtime',
  'e2e-manifest',
  'e2e-node',
  'e2e-next-dev',
  'e2e-next-prod',
  'e2e-treeshake',
  'e2e-modern-ssr',
  'e2e-router',
  E2E_METRO_JOB_NAME,
  BUILD_METRO_JOB_NAME,
];
const EXPECTED_BUILD_METRO_NON_REUSABLE_JOBS = [BUILD_METRO_JOB_NAME];
const EXPECTED_BUILD_METRO_REUSABLE_JOB_NAMES = [];
const EXPECTED_BUILD_AND_TEST_CHECKOUT_INSTALL_JOB_FIELDS = [
  'runs-on',
  'timeout-minutes',
  'steps',
];
const EXPECTED_BUILD_METRO_JOB_FIELDS = ['runs-on', 'timeout-minutes', 'steps'];
const EXPECTED_CI_LOCAL_JOB_PREFIX = ['build-and-test', 'build-metro'];
const EXPECTED_CI_LOCAL_JOB_NAMES = [
  'build-and-test',
  'build-metro',
  'e2e-modern',
  'e2e-runtime',
  'e2e-manifest',
  'e2e-node',
  'e2e-next-dev',
  'e2e-next-prod',
  'e2e-treeshake',
  'e2e-modern-ssr',
  'e2e-router',
  'e2e-shared-tree-shaking',
  'devtools',
  'bundle-size',
  'actionlint',
  'bundle-size-comment',
];
const EXPECTED_CI_LOCAL_SKIPPED_JOBS = [
  { name: 'actionlint', reason: 'GitHub-only action; run via CI.' },
  { name: 'bundle-size-comment', reason: 'GitHub-only action; run via CI.' },
];
const EXPECTED_CI_LOCAL_PRINT_HELP_LINES = [
  'Usage: node tools/scripts/ci-local.mjs [options]',
  '',
  'Options:',
  '  --list                  List available jobs',
  '  --only=<jobs>           Run only specific comma-separated jobs (repeatable)',
  '  --print-parity          Print derived node/pnpm parity settings',
  '  --strict-parity         Fail when node/pnpm parity is mismatched',
  '  --help                  Show this help message',
  '',
  'Examples:',
  '  node tools/scripts/ci-local.mjs --only=build-metro',
  '  node tools/scripts/ci-local.mjs --only=build-metro --only=actionlint',
  '  node tools/scripts/ci-local.mjs --list --only=build-metro',
  '  node tools/scripts/ci-local.mjs --print-parity',
  '  node tools/scripts/ci-local.mjs --strict-parity --only=build-and-test',
];
const EXPECTED_CI_LOCAL_PRINT_PARITY_STRING_LINES = ['ci:local parity config:'];
const EXPECTED_CI_LOCAL_PRINT_PARITY_TEMPLATE_LINES = [
  '- repo root: ${ROOT}',
  '- expected node major: ${EXPECTED_NODE_MAJOR}',
  "- expected pnpm version: ${EXPECTED_PNPM_VERSION ?? 'unconfigured'}",
  '- current node: ${process.versions.node}',
  '- current pnpm: ${currentPnpmVersion}',
];
const EXPECTED_CI_LOCAL_LIST_JOBS_STRING_LINES = [
  'ci:local job list:',
  '(no matching jobs)',
  '\\nUse --only=job1,job2 to run a subset.',
];
const EXPECTED_CI_LOCAL_LIST_JOBS_TEMPLATE_LINES = [
  "[ci:local] Listing filtered jobs: ${Array.from(onlyJobs).join(', ')}",
  '- ${formatJobListEntry({ name: entryName })}',
  '- ${formatJobListEntry(job)}',
  '[ci:local] Matched ${listedCount} of ${selectableJobNames.size} selectable jobs.',
  '[ci:local] Listed ${listedCount} selectable jobs.',
];
const EXPECTED_CI_LOCAL_PARSE_ARGS_OPTION_COMPARISONS = [
  '--list',
  '--help',
  '-h',
  '--only',
  '--print-parity',
  '--strict-parity',
];
const EXPECTED_CI_LOCAL_PARSE_ARGS_RESULT_KEYS = [
  'help',
  'list',
  'only',
  'onlyTokens',
  'printParity',
  'strictParity',
  'errors',
  'unknownArgs',
];
const EXPECTED_CI_LOCAL_VALIDATE_ARGS_ISSUE_MESSAGES = [
  "Unknown option(s): ${args.unknownArgs.join(', ')}. Use --help to see supported flags.",
  'The --only option requires at least one job name (use --list to inspect available jobs).',
  "Unknown job(s) in --only: ${unknownJobNames.join(', ')}. Use --list to inspect available jobs.",
];
const EXPECTED_CI_LOCAL_TOP_LEVEL_FUNCTION_NAMES = [
  'main',
  'preflight',
  'runJob',
  'step',
  'shouldRunJob',
  'listJobs',
  'printParity',
  'printHelp',
  'parseArgs',
  'validateArgs',
  'formatMatrixJobName',
  'formatJobListEntry',
  'getSelectableJobNames',
  'runCommand',
  'runShell',
  'installDependencies',
  'detectPnpmVersion',
  'readRootPackageJson',
  'resolveExpectedNodeMajor',
  'resolveExpectedPnpmVersion',
  'runWithRetry',
  'sleep',
  'ciIsAffected',
  'logStepSkip',
  'formatExit',
];
const EXPECTED_CI_LOCAL_STEP_COUNTS_BY_JOB = {
  'build-and-test': 12,
  'build-metro': 7,
  'e2e-modern': 5,
  'e2e-runtime': 5,
  'e2e-manifest': 6,
  'e2e-node': 5,
  'e2e-next-dev': 5,
  'e2e-next-prod': 5,
  'e2e-treeshake': 5,
  'e2e-modern-ssr': 5,
  'e2e-router': 5,
  'e2e-shared-tree-shaking': 6,
  devtools: 8,
  'bundle-size': 8,
  actionlint: 0,
  'bundle-size-comment': 0,
};
const EXPECTED_CI_LOCAL_STEP_LABELS_BY_JOB = {
  'build-and-test': [
    'Optional clean node_modules/.nx',
    'Install dependencies',
    'Install Cypress',
    'Check code format',
    'Verify Rslib Template Publint Wiring',
    'Verify Publint Coverage Guards',
    'Print number of CPU cores',
    'Build packages (cold cache)',
    'Build packages (warm cache)',
    'Check package publishing compatibility (publint)',
    'Warm Nx cache',
    'Run affected tests',
  ],
  'build-metro': [
    'Install dependencies',
    'Verify Rslib Template Publint Wiring',
    'Verify Publint Coverage Guards',
    'Build all required packages',
    'Test metro packages',
    'Lint metro packages',
    'Check package publishing compatibility (publint)',
  ],
  'e2e-modern': [
    'Install dependencies',
    'Install Cypress',
    'Build packages',
    'Check CI conditions',
    'E2E Test for ModernJS',
  ],
  'e2e-runtime': [
    'Install dependencies',
    'Install Cypress',
    'Build packages',
    'Check CI conditions',
    'E2E Test for Runtime Demo',
  ],
  'e2e-manifest': [
    'Install dependencies',
    'Install Cypress',
    'Build packages',
    'Check CI conditions',
    'E2E Test for Manifest Demo (dev)',
    'E2E Test for Manifest Demo (prod)',
  ],
  'e2e-node': [
    'Install dependencies',
    'Install Cypress',
    'Build packages',
    'Check CI conditions',
    'E2E Node Federation',
  ],
  'e2e-next-dev': [
    'Install dependencies',
    'Install Cypress',
    'Build packages',
    'Check CI conditions',
    'E2E Test for Next.js Dev',
  ],
  'e2e-next-prod': [
    'Install dependencies',
    'Install Cypress',
    'Build packages',
    'Check CI conditions',
    'E2E Test for Next.js Prod',
  ],
  'e2e-treeshake': [
    'Install dependencies',
    'Build packages',
    'Check CI conditions',
    'E2E Treeshake Server',
    'E2E Treeshake Frontend',
  ],
  'e2e-modern-ssr': [
    'Install dependencies',
    'Install Cypress',
    'Build packages',
    'Check CI conditions',
    'E2E Test for ModernJS SSR',
  ],
  'e2e-router': [
    'Install dependencies',
    'Install Cypress',
    'Build packages',
    'Check CI conditions',
    'E2E Test for Router',
  ],
  'e2e-shared-tree-shaking': [
    'Install dependencies',
    'Install Cypress',
    'Build packages',
    'Check CI conditions',
    'E2E Shared Tree Shaking (runtime-infer)',
    'E2E Shared Tree Shaking (server-calc)',
  ],
  devtools: [
    'Install dependencies',
    'Install Cypress',
    'Build packages',
    'Install xvfb',
    'E2E Chrome Devtools Dev',
    'E2E Chrome Devtools Prod',
    'Kill devtools ports',
    'Skip pkill -f node',
  ],
  'bundle-size': [
    'Install dependencies',
    'Build packages (current)',
    'Measure bundle sizes (current)',
    'Prepare base worktree',
    'Install dependencies (base)',
    'Build packages (base)',
    'Measure bundle sizes (base)',
    'Compare bundle sizes',
  ],
  actionlint: [],
  'bundle-size-comment': [],
};
const EXPECTED_CI_LOCAL_FIRST_STEP_LABEL_BY_JOB = {
  'build-and-test': CI_LOCAL_OPTIONAL_CLEAN_STEP_NAME,
  'build-metro': CI_LOCAL_INSTALL_STEP_NAME,
  'e2e-modern': CI_LOCAL_INSTALL_STEP_NAME,
  'e2e-runtime': CI_LOCAL_INSTALL_STEP_NAME,
  'e2e-manifest': CI_LOCAL_INSTALL_STEP_NAME,
  'e2e-node': CI_LOCAL_INSTALL_STEP_NAME,
  'e2e-next-dev': CI_LOCAL_INSTALL_STEP_NAME,
  'e2e-next-prod': CI_LOCAL_INSTALL_STEP_NAME,
  'e2e-treeshake': CI_LOCAL_INSTALL_STEP_NAME,
  'e2e-modern-ssr': CI_LOCAL_INSTALL_STEP_NAME,
  'e2e-router': CI_LOCAL_INSTALL_STEP_NAME,
  'e2e-shared-tree-shaking': CI_LOCAL_INSTALL_STEP_NAME,
  devtools: CI_LOCAL_INSTALL_STEP_NAME,
  'bundle-size': CI_LOCAL_INSTALL_STEP_NAME,
};
const EXPECTED_CI_LOCAL_LAST_STEP_LABEL_BY_JOB = {
  'build-and-test': CI_LOCAL_BUILD_AND_TEST_AFFECTED_TEST_STEP_NAME,
  'build-metro': CI_LOCAL_PUBLINT_STEP_NAME,
  'e2e-modern': 'E2E Test for ModernJS',
  'e2e-runtime': 'E2E Test for Runtime Demo',
  'e2e-manifest': 'E2E Test for Manifest Demo (prod)',
  'e2e-node': 'E2E Node Federation',
  'e2e-next-dev': 'E2E Test for Next.js Dev',
  'e2e-next-prod': 'E2E Test for Next.js Prod',
  'e2e-treeshake': 'E2E Treeshake Frontend',
  'e2e-modern-ssr': 'E2E Test for ModernJS SSR',
  'e2e-router': 'E2E Test for Router',
  'e2e-shared-tree-shaking': 'E2E Shared Tree Shaking (server-calc)',
  devtools: 'Skip pkill -f node',
  'bundle-size': 'Compare bundle sizes',
};
const EXPECTED_CI_LOCAL_ENV_ENTRIES_BY_JOB = {
  'build-and-test': [],
  'build-metro': [],
  'e2e-modern': ['SKIP_DEVTOOLS_POSTINSTALL=true'],
  'e2e-runtime': ['SKIP_DEVTOOLS_POSTINSTALL=true'],
  'e2e-manifest': ['SKIP_DEVTOOLS_POSTINSTALL=true'],
  'e2e-node': ['SKIP_DEVTOOLS_POSTINSTALL=true'],
  'e2e-next-dev': [
    'SKIP_DEVTOOLS_POSTINSTALL=true',
    'NEXT_PRIVATE_LOCAL_WEBPACK=true',
  ],
  'e2e-next-prod': ['SKIP_DEVTOOLS_POSTINSTALL=true'],
  'e2e-treeshake': ['SKIP_DEVTOOLS_POSTINSTALL=true'],
  'e2e-modern-ssr': ['SKIP_DEVTOOLS_POSTINSTALL=true'],
  'e2e-router': ['SKIP_DEVTOOLS_POSTINSTALL=true'],
  'e2e-shared-tree-shaking': ['SKIP_DEVTOOLS_POSTINSTALL=true'],
  devtools: ['PLAYWRIGHT_BROWSERS_PATH=0'],
  'bundle-size': [],
  actionlint: [],
  'bundle-size-comment': [],
};
const EXPECTED_CI_LOCAL_PREFLIGHT_WARN_TEMPLATE_LINES = [
  '[ci:local] Warning: running with Node ${process.versions.node}. CI runs with Node ${EXPECTED_NODE_MAJOR}.',
  '[ci:local] For closest parity run: source "$HOME/.nvm/nvm.sh" && nvm use ${EXPECTED_NODE_MAJOR} && corepack enable && corepack prepare pnpm@${pnpmVersionForHint} --activate',
  '[ci:local] Warning: running with pnpm ${pnpmVersion}. CI parity target is pnpm ${EXPECTED_PNPM_VERSION}.',
  '[ci:local] For closest parity run: corepack enable && corepack prepare pnpm@${EXPECTED_PNPM_VERSION} --activate',
];
const EXPECTED_CI_LOCAL_READ_ROOT_PACKAGE_JSON_WARN_TEMPLATE_LINES = [
  '[ci:local] Unable to read package.json for parity hints: ${error.message}',
];
const EXPECTED_CI_LOCAL_RESOLVE_EXPECTED_NODE_MAJOR_WARN_TEMPLATE_LINES = [
  '[ci:local] Invalid CI_LOCAL_EXPECTED_NODE_MAJOR "${overrideMajor}", falling back to package metadata.',
  '[ci:local] Unable to parse node engine range "${engineRange}", defaulting to Node ${DEFAULT_EXPECTED_NODE_MAJOR}.',
];
const EXPECTED_CI_LOCAL_JOB_FIELDS_BY_NAME = {
  'build-and-test': ['name', 'steps'],
  'build-metro': ['name', 'steps'],
  'e2e-modern': ['name', 'env', 'steps'],
  'e2e-runtime': ['name', 'env', 'steps'],
  'e2e-manifest': ['name', 'env', 'steps'],
  'e2e-node': ['name', 'env', 'steps'],
  'e2e-next-dev': ['name', 'env', 'steps'],
  'e2e-next-prod': ['name', 'env', 'steps'],
  'e2e-treeshake': ['name', 'env', 'steps'],
  'e2e-modern-ssr': ['name', 'env', 'steps'],
  'e2e-router': ['name', 'env', 'steps'],
  'e2e-shared-tree-shaking': ['name', 'env', 'steps'],
  devtools: ['name', 'env', 'steps'],
  'bundle-size': ['name', 'steps', 'cleanup'],
  actionlint: ['name', 'skipReason'],
  'bundle-size-comment': ['name', 'skipReason'],
};

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
  const ciLocalRunWithRetryHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: RUN_WITH_RETRY_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalFormatMatrixJobNameHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: FORMAT_MATRIX_JOB_NAME_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalFormatJobListEntryHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: FORMAT_JOB_LIST_ENTRY_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalGetSelectableJobNamesHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: GET_SELECTABLE_JOB_NAMES_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalShouldRunJobHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: SHOULD_RUN_JOB_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalListJobsHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: LIST_JOBS_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalParseArgsHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: PARSE_ARGS_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalValidateArgsHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: VALIDATE_ARGS_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalPrintParityHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: PRINT_PARITY_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalPrintHelpHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: PRINT_HELP_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalMainHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: CI_LOCAL_MAIN_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalPreflightHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: PREFLIGHT_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalDetectPnpmVersionHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: DETECT_PNPM_VERSION_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalReadRootPackageJsonHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: READ_ROOT_PACKAGE_JSON_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalResolveExpectedNodeMajorHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: RESOLVE_EXPECTED_NODE_MAJOR_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalResolveExpectedPnpmVersionHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: RESOLVE_EXPECTED_PNPM_VERSION_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalRunCommandHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: RUN_COMMAND_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalRunShellHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: RUN_SHELL_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalSleepHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: SLEEP_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalCiIsAffectedHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: CI_IS_AFFECTED_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalLogStepSkipHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: LOG_STEP_SKIP_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalFormatExitHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: FORMAT_EXIT_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalRunJobHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: RUN_JOB_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const ciLocalStepHelper = extractFunctionBlock({
    text: ciLocalText,
    functionName: STEP_HELPER_NAME,
    issues,
    sourceLabel: 'ci-local script',
  });
  const packageJson = readJson(ROOT_PACKAGE_JSON, issues);
  const verifyPublintCoverageCommand =
    packageJson?.scripts?.['verify:publint:coverage'];
  const ciLocalTopLevelJobNames = readCiLocalTopLevelJobNames(ciLocalText);
  const ciLocalTopLevelSkippedJobs =
    readCiLocalTopLevelSkippedJobs(ciLocalText);

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

  assertWorkflowJobsExact({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    expectedJobNames: EXPECTED_BUILD_AND_TEST_JOB_NAMES,
    issues,
  });
  assertWorkflowJobOrder({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    expectedJobOrder: EXPECTED_BUILD_AND_TEST_JOB_ORDER,
    issues,
  });
  assertWorkflowJobsExact({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    expectedJobNames: EXPECTED_BUILD_METRO_JOB_NAMES,
    issues,
  });
  assertWorkflowJobOrder({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    expectedJobOrder: EXPECTED_BUILD_METRO_JOB_ORDER,
    issues,
  });
  assertWorkflowJobKindsExact({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    expectedNonReusableJobs: EXPECTED_BUILD_AND_TEST_NON_REUSABLE_JOBS,
    expectedReusableJobs: EXPECTED_BUILD_AND_TEST_REUSABLE_JOB_NAMES,
    issues,
  });
  assertWorkflowJobKindsExact({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    expectedNonReusableJobs: EXPECTED_BUILD_METRO_NON_REUSABLE_JOBS,
    expectedReusableJobs: EXPECTED_BUILD_METRO_REUSABLE_JOB_NAMES,
    issues,
  });
  assertArrayPrefix({
    values: ciLocalTopLevelJobNames,
    sourceLabel: 'ci-local job definitions',
    expectedPrefix: EXPECTED_CI_LOCAL_JOB_PREFIX,
    issues,
  });
  assertArrayExact({
    values: ciLocalTopLevelJobNames,
    sourceLabel: 'ci-local job definitions',
    expectedValues: EXPECTED_CI_LOCAL_JOB_NAMES,
    issues,
  });
  for (const [jobName, expectedFields] of Object.entries(
    EXPECTED_CI_LOCAL_JOB_FIELDS_BY_NAME,
  )) {
    const ciLocalJobBlock = extractJobBlock({
      text: ciLocalText,
      jobName,
      issues,
    });
    const actualFields = readCiLocalTopLevelJobFieldNames(ciLocalJobBlock);
    assertArrayExact({
      values: actualFields,
      sourceLabel: `ci-local job "${jobName}" field definitions`,
      expectedValues: expectedFields,
      issues,
    });
    const actualEnvEntries = readCiLocalEnvEntriesFromJobBlock(ciLocalJobBlock);
    const expectedEnvEntries =
      EXPECTED_CI_LOCAL_ENV_ENTRIES_BY_JOB[jobName] ?? [];
    assertArrayExact({
      values: actualEnvEntries,
      sourceLabel: `ci-local job "${jobName}" env entries`,
      expectedValues: expectedEnvEntries,
      issues,
    });

    const ciLocalStepLabels =
      readCiLocalStepLabelsFromJobBlock(ciLocalJobBlock);
    const expectedStepLabels = EXPECTED_CI_LOCAL_STEP_LABELS_BY_JOB[jobName];
    assertArrayExact({
      values: ciLocalStepLabels,
      sourceLabel: `ci-local job "${jobName}" step labels`,
      expectedValues: expectedStepLabels,
      issues,
    });
    const expectedStepCount = EXPECTED_CI_LOCAL_STEP_COUNTS_BY_JOB[jobName];
    if (ciLocalStepLabels.length !== expectedStepCount) {
      issues.push(
        `ci-local job "${jobName}" must define ${expectedStepCount} step entries, found ${ciLocalStepLabels.length}`,
      );
    }
    assertUniqueValues({
      values: ciLocalStepLabels,
      sourceLabel: `ci-local job "${jobName}" step labels uniqueness`,
      issues,
    });
    const expectedFirstStepLabel =
      EXPECTED_CI_LOCAL_FIRST_STEP_LABEL_BY_JOB[jobName];
    if (
      expectedFirstStepLabel &&
      ciLocalStepLabels[0] !== expectedFirstStepLabel
    ) {
      issues.push(
        `ci-local job "${jobName}" must start with "${expectedFirstStepLabel}", found "${String(ciLocalStepLabels[0])}"`,
      );
    }
    const expectedLastStepLabel =
      EXPECTED_CI_LOCAL_LAST_STEP_LABEL_BY_JOB[jobName];
    if (
      expectedLastStepLabel &&
      ciLocalStepLabels[ciLocalStepLabels.length - 1] !== expectedLastStepLabel
    ) {
      issues.push(
        `ci-local job "${jobName}" must end with "${expectedLastStepLabel}", found "${String(
          ciLocalStepLabels[ciLocalStepLabels.length - 1],
        )}"`,
      );
    }
  }
  assertCiLocalSkippedJobsExact({
    actualSkippedJobs: ciLocalTopLevelSkippedJobs,
    expectedSkippedJobs: EXPECTED_CI_LOCAL_SKIPPED_JOBS,
    sourceLabel: 'ci-local skipped job definitions',
    issues,
  });
  assertUniqueValues({
    values: ciLocalTopLevelJobNames,
    sourceLabel: 'ci-local job definitions',
    issues,
  });
  assertWorkflowJobFieldsExact({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: CHECKOUT_INSTALL_JOB_NAME,
    expectedFields: EXPECTED_BUILD_AND_TEST_CHECKOUT_INSTALL_JOB_FIELDS,
    issues,
  });
  assertWorkflowJobFieldsExact({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: BUILD_METRO_JOB_NAME,
    expectedFields: EXPECTED_BUILD_METRO_JOB_FIELDS,
    issues,
  });
  assertReusableWorkflowReferencesResolve({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    reusableWorkflowPrefix: LOCAL_REUSABLE_WORKFLOW_PREFIX,
    issues,
  });
  assertReusableWorkflowJobsForbiddenFields({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    reusableWorkflowPrefix: LOCAL_REUSABLE_WORKFLOW_PREFIX,
    forbiddenFieldNames: ['steps', 'runs-on'],
    issues,
  });
  assertReusableWorkflowReferencesResolve({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    reusableWorkflowPrefix: LOCAL_REUSABLE_WORKFLOW_PREFIX,
    issues,
  });
  assertReusableWorkflowJobsForbiddenFields({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    reusableWorkflowPrefix: LOCAL_REUSABLE_WORKFLOW_PREFIX,
    forbiddenFieldNames: ['steps', 'runs-on'],
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
  assertWorkflowStepNamesExact({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: CHECKOUT_INSTALL_JOB_NAME,
    expectedStepNames: EXPECTED_BUILD_AND_TEST_STEP_LABELS,
    issues,
  });
  assertWorkflowStepNamesExact({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    jobName: BUILD_METRO_JOB_NAME,
    expectedStepNames: EXPECTED_BUILD_METRO_STEP_LABELS,
    issues,
  });
  for (const [stepName, expectedFields] of Object.entries(
    EXPECTED_BUILD_AND_TEST_STEP_FIELDS,
  )) {
    assertWorkflowStepFieldsExact({
      workflow: buildAndTestWorkflow,
      workflowName: 'build-and-test',
      jobName: CHECKOUT_INSTALL_JOB_NAME,
      stepName,
      expectedFields,
      issues,
    });
  }
  for (const [stepName, expectedFields] of Object.entries(
    EXPECTED_BUILD_METRO_STEP_FIELDS,
  )) {
    assertWorkflowStepFieldsExact({
      workflow: buildMetroWorkflow,
      workflowName: 'build-metro',
      jobName: BUILD_METRO_JOB_NAME,
      stepName,
      expectedFields,
      issues,
    });
  }
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
  assertObjectKeysExact({
    objectValue: buildAndTestWorkflow,
    sourceLabel: 'build-and-test workflow',
    expectedKeys: EXPECTED_BUILD_AND_TEST_WORKFLOW_FIELDS,
    issues,
  });
  assertWorkflowName({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    expectedName: BUILD_METRO_WORKFLOW_NAME,
    issues,
  });
  assertObjectKeysExact({
    objectValue: buildMetroWorkflow,
    sourceLabel: 'build-metro workflow',
    expectedKeys: EXPECTED_BUILD_METRO_WORKFLOW_FIELDS,
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
  assertObjectKeysExact({
    objectValue: buildAndTestWorkflow?.on?.pull_request,
    sourceLabel: 'build-and-test workflow on.pull_request',
    expectedKeys: EXPECTED_BUILD_AND_TEST_PULL_REQUEST_TRIGGER_FIELDS,
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
  assertObjectKeysExact({
    objectValue: buildAndTestWorkflow?.on?.push,
    sourceLabel: 'build-and-test workflow on.push',
    expectedKeys: EXPECTED_BUILD_AND_TEST_PUSH_TRIGGER_FIELDS,
    issues,
  });
  assertObjectKeysExact({
    objectValue: buildMetroWorkflow?.on?.workflow_call,
    sourceLabel: 'build-metro workflow on.workflow_call',
    expectedKeys: EXPECTED_BUILD_METRO_WORKFLOW_CALL_TRIGGER_FIELDS,
    allowNullishWhenExpectingNoKeys: true,
    issues,
  });
  assertWorkflowConcurrencyConfig({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    expectedGroup: BUILD_AND_TEST_CONCURRENCY_GROUP,
    expectedCancelInProgress: true,
    issues,
  });
  assertObjectKeysExact({
    objectValue: buildAndTestWorkflow?.concurrency,
    sourceLabel: 'build-and-test workflow concurrency',
    expectedKeys: EXPECTED_BUILD_AND_TEST_CONCURRENCY_FIELDS,
    issues,
  });
  assertWorkflowConcurrencyAbsent({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
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
  assertWorkflowPermissionsExact({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    expectedPermissions: {
      contents: WORKFLOW_PERMISSION_READ,
      actions: WORKFLOW_PERMISSION_READ,
    },
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
  assertWorkflowPermissionsExact({
    workflow: buildMetroWorkflow,
    workflowName: 'build-metro',
    expectedPermissions: {
      contents: WORKFLOW_PERMISSION_READ,
      actions: WORKFLOW_PERMISSION_READ,
    },
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
  assertReusableWorkflowJobConfigs({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    reusableWorkflowPrefix: LOCAL_REUSABLE_WORKFLOW_PREFIX,
    expectedJobs: EXPECTED_BUILD_AND_TEST_REUSABLE_JOBS,
    expectedJobOrder: EXPECTED_BUILD_AND_TEST_REUSABLE_JOB_NAMES,
    issues,
  });
  assertReusableWorkflowJobFieldsExact({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    reusableWorkflowPrefix: LOCAL_REUSABLE_WORKFLOW_PREFIX,
    expectedFieldsByJob: EXPECTED_BUILD_AND_TEST_REUSABLE_JOB_FIELDS,
    issues,
  });
  assertReusableWorkflowJobPermissionOverrides({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    reusableWorkflowPrefix: LOCAL_REUSABLE_WORKFLOW_PREFIX,
    expectedPermissionsByJob: EXPECTED_BUILD_AND_TEST_REUSABLE_JOB_PERMISSIONS,
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
  assertWorkflowJobPermissionsExact({
    workflow: buildAndTestWorkflow,
    workflowName: 'build-and-test',
    jobName: E2E_METRO_JOB_NAME,
    expectedPermissions: {
      contents: WORKFLOW_PERMISSION_READ,
      actions: WORKFLOW_PERMISSION_READ,
      checks: WORKFLOW_PERMISSION_WRITE,
      'pull-requests': WORKFLOW_PERMISSION_WRITE,
    },
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
  assertExactCommandLines({
    commandText: buildAndTestBuildStep,
    sourceLabel: `build-and-test workflow "${BUILD_AND_TEST_BUILD_STEP_NAME}" step`,
    expectedCommands: [
      BUILD_AND_TEST_COLD_BUILD_COMMAND,
      BUILD_AND_TEST_WARM_BUILD_COMMAND,
    ],
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
  assertExactSingleLineCommand({
    commandText: buildMetroBuildStep,
    sourceLabel: `build-metro workflow "${BUILD_METRO_BUILD_STEP_NAME}" step`,
    expectedCommand: BUILD_METRO_BUILD_COMMAND,
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
  const ciLocalTopLevelFunctionNames =
    readTopLevelFunctionDeclarationNames(ciLocalText);
  assertArrayExact({
    values: ciLocalTopLevelFunctionNames,
    expectedValues: EXPECTED_CI_LOCAL_TOP_LEVEL_FUNCTION_NAMES,
    sourceLabel: 'ci-local top-level function declarations',
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
  assertRegexCount({
    text: ciLocalText,
    pattern: /async function runWithRetry\(/g,
    expectedCount: 1,
    description: 'runWithRetry helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function formatMatrixJobName\(/g,
    expectedCount: 1,
    description: 'formatMatrixJobName helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function formatJobListEntry\(/g,
    expectedCount: 1,
    description: 'formatJobListEntry helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function getSelectableJobNames\(/g,
    expectedCount: 1,
    description: 'getSelectableJobNames helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function shouldRunJob\(/g,
    expectedCount: 1,
    description: 'shouldRunJob helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function listJobs\(/g,
    expectedCount: 1,
    description: 'listJobs helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function parseArgs\(/g,
    expectedCount: 1,
    description: 'parseArgs helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function parseArgs\(argv\)\s*\{/g,
    expectedCount: 1,
    description: 'parseArgs helper signature',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function validateArgs\(/g,
    expectedCount: 1,
    description: 'validateArgs helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function validateArgs\(\)\s*\{/g,
    expectedCount: 1,
    description: 'validateArgs helper signature',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function printParity\(/g,
    expectedCount: 1,
    description: 'printParity helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function printHelp\(/g,
    expectedCount: 1,
    description: 'printHelp helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /async function main\(/g,
    expectedCount: 1,
    description: 'main helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function preflight\(/g,
    expectedCount: 1,
    description: 'preflight helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function detectPnpmVersion\(/g,
    expectedCount: 1,
    description: 'detectPnpmVersion helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function readRootPackageJson\(/g,
    expectedCount: 1,
    description: 'readRootPackageJson helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function resolveExpectedNodeMajor\(/g,
    expectedCount: 1,
    description: 'resolveExpectedNodeMajor helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function resolveExpectedPnpmVersion\(/g,
    expectedCount: 1,
    description: 'resolveExpectedPnpmVersion helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function runCommand\(/g,
    expectedCount: 1,
    description: 'runCommand helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function runShell\(/g,
    expectedCount: 1,
    description: 'runShell helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function sleep\(/g,
    expectedCount: 1,
    description: 'sleep helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /async function ciIsAffected\(/g,
    expectedCount: 1,
    description: 'ciIsAffected helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function logStepSkip\(/g,
    expectedCount: 1,
    description: 'logStepSkip helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function formatExit\(/g,
    expectedCount: 1,
    description: 'formatExit helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /async function runJob\(/g,
    expectedCount: 1,
    description: 'runJob helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertRegexCount({
    text: ciLocalText,
    pattern: /function step\(/g,
    expectedCount: 1,
    description: 'step helper definition',
    sourceLabel: 'ci-local script',
    issues,
  });
  assertOrderedPatterns({
    text: ciLocalText,
    sourceLabel: 'ci-local script initialization',
    orderedPatterns: [
      /process\.env\.NX_TUI = 'false';/,
      /process\.env\.CI = process\.env\.CI \?\? 'true';/,
      /const SCRIPT_DIR = dirname\(fileURLToPath\(import\.meta\.url\)\);/,
      /const ROOT = resolve\(SCRIPT_DIR, '\.\.\/\.\.'\);/,
      /process\.chdir\(ROOT\);/,
      /const DEFAULT_EXPECTED_NODE_MAJOR = 20;/,
      /const ROOT_PACKAGE_JSON = readRootPackageJson\(\);/,
      /const EXPECTED_NODE_MAJOR = resolveExpectedNodeMajor\(ROOT_PACKAGE_JSON\);/,
      /const EXPECTED_PNPM_VERSION = resolveExpectedPnpmVersion\(ROOT_PACKAGE_JSON\);/,
      /const args = parseArgs\(process\.argv\);/,
      /const onlyJobNames = args\.only/,
      /const onlyJobs = args\.only === null \? null : new Set\(onlyJobNames\);/,
      /const jobs = \[/,
      /const selectableJobNames = getSelectableJobNames\(jobs\);/,
      /main\(\)\.catch\(\(error\) => \{/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalText,
    workflowName: 'ci-local',
    label: 'top-level only-job parsing',
    patterns: [
      /args\.only\s*\r?\n\s*\?\s*Array\.from\(/,
      /new Set\(/,
      /\.split\(','\)/,
      /\.map\(\(job\) => job\.trim\(\)\)/,
      /\.filter\(Boolean\)/,
      /:\s*\[\];/,
    ],
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
    text: ciLocalRunWithRetryHelper,
    workflowName: 'ci-local',
    label: 'runWithRetry helper',
    patterns: [
      /let lastError;/,
      /for \(let attempt = 1; attempt <= attempts; attempt \+= 1\)/,
      /if \(attempt === attempts\) \{\s*throw error;\s*\}/,
      /await sleep\(2000\);/,
      /throw lastError;/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalFormatMatrixJobNameHelper,
    workflowName: 'ci-local',
    label: 'formatMatrixJobName helper',
    patterns: [
      /const entryName = entry\.name \?\? entry\.id \?\? 'matrix';/,
      /return `\$\{jobName\} \(\$\{entryName\}\)`;/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalFormatJobListEntryHelper,
    workflowName: 'ci-local',
    label: 'formatJobListEntry helper',
    patterns: [
      /if \(!job\.skipReason\) \{\s*return job\.name;\s*\}/,
      /return `\$\{job\.name\} \[skip: \$\{job\.skipReason\}\]`;/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalGetSelectableJobNamesHelper,
    workflowName: 'ci-local',
    label: 'getSelectableJobNames helper',
    patterns: [
      /const names = new Set\(\);/,
      /for \(const job of jobList\)/,
      /names\.add\(job\.name\);/,
      /if \(job\.matrix\?\.length\) \{/,
      /for \(const entry of job\.matrix\) \{/,
      /names\.add\(formatMatrixJobName\(job\.name, entry\)\);/,
      /return names;/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalShouldRunJobHelper,
    workflowName: 'ci-local',
    label: 'shouldRunJob helper',
    patterns: [
      /if \(!onlyJobs\) \{\s*return true;\s*\}/,
      /if \(onlyJobs\.has\(job\.name\)\) \{\s*return true;\s*\}/,
      /if \(job\.matrix\?\.length\) \{/,
      /return job\.matrix\.some\(\(entry\) =>/,
      /onlyJobs\.has\(formatMatrixJobName\(job\.name, entry\)\)/,
      /return false;/,
    ],
    issues,
  });
  assertOrderedPatterns({
    text: ciLocalShouldRunJobHelper,
    sourceLabel: 'ci-local shouldRunJob helper branch flow',
    orderedPatterns: [
      /if \(!onlyJobs\) \{\s*return true;\s*\}/,
      /if \(onlyJobs\.has\(job\.name\)\) \{\s*return true;\s*\}/,
      /if \(job\.matrix\?\.length\) \{/,
      /return false;/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalListJobsHelper,
    workflowName: 'ci-local',
    label: 'listJobs helper',
    patterns: [
      /console\.log\('ci:local job list:'\);/,
      /if \(onlyJobs\) \{/,
      /Array\.from\(onlyJobs\)\.join\(', '\)/,
      /const includeAllEntries = !onlyJobs \|\| onlyJobs\.has\(job\.name\);/,
      /if \(listedCount === 0\) \{\s*console\.log\('\(no matching jobs\)'\);\s*\}/,
      /console\.log\(`- \$\{formatJobListEntry\(job\)\}`\);/,
      /console\.log\(`- \$\{formatJobListEntry\(\{ name: entryName \}\)\}`\);/,
      /console\.log\(\s*`\[ci:local\] Matched \$\{listedCount\} of \$\{selectableJobNames\.size\} selectable jobs\.`\s*,?\s*\);/,
      /console\.log\(\s*`\[ci:local\] Listed \$\{listedCount\} selectable jobs\.`\s*\);/,
      /console\.log\('\\nUse --only=job1,job2 to run a subset\.'\);/,
    ],
    issues,
  });
  const ciLocalListJobsStringLines = readConsoleLogStringLiterals(
    ciLocalListJobsHelper,
  );
  assertArrayExact({
    values: ciLocalListJobsStringLines,
    expectedValues: EXPECTED_CI_LOCAL_LIST_JOBS_STRING_LINES,
    sourceLabel: 'ci-local listJobs string log lines',
    issues,
  });
  const ciLocalListJobsTemplateLines = readConsoleLogTemplateLiterals(
    ciLocalListJobsHelper,
  );
  assertArrayExact({
    values: ciLocalListJobsTemplateLines,
    expectedValues: EXPECTED_CI_LOCAL_LIST_JOBS_TEMPLATE_LINES,
    sourceLabel: 'ci-local listJobs template log lines',
    issues,
  });
  assertPatterns({
    text: ciLocalParseArgsHelper,
    workflowName: 'ci-local',
    label: 'parseArgs helper',
    patterns: [
      /const result = \{/,
      /help: false,/,
      /list: false,/,
      /only: null,/,
      /onlyTokens: \[\],/,
      /printParity: false,/,
      /strictParity: false,/,
      /errors: \[\],/,
      /unknownArgs: \[\],/,
      /for \(let i = 2; i < argv\.length; i \+= 1\)/,
      /if \(arg === '--list'\)/,
      /if \(arg === '--help' \|\| arg === '-h'\)/,
      /if \(arg === '--only'\)/,
      /result\.errors\.push\('Missing value for --only\.'\);/,
      /if \(arg\.startsWith\('--only='\)\)/,
      /if \(arg === '--print-parity'\)/,
      /if \(arg === '--strict-parity'\)/,
      /result\.unknownArgs\.push\(arg\);/,
      /result\.only = result\.onlyTokens\.join\(','\);/,
      /delete result\.onlyTokens;/,
      /return result;/,
    ],
    issues,
  });
  assertOrderedPatterns({
    text: ciLocalParseArgsHelper,
    sourceLabel: 'ci-local parseArgs helper option flow',
    orderedPatterns: [
      /if \(arg === '--list'\)/,
      /if \(arg === '--help' \|\| arg === '-h'\)/,
      /if \(arg === '--only'\)/,
      /if \(arg\.startsWith\('--only='\)\)/,
      /if \(arg === '--print-parity'\)/,
      /if \(arg === '--strict-parity'\)/,
      /result\.unknownArgs\.push\(arg\);/,
    ],
    issues,
  });
  assertOrderedPatterns({
    text: ciLocalParseArgsHelper,
    sourceLabel: 'ci-local parseArgs helper return flow',
    orderedPatterns: [
      /if \(result\.onlyTokens\.length > 0\) \{/,
      /result\.only = result\.onlyTokens\.join\(','\);/,
      /delete result\.onlyTokens;/,
      /return result;/,
    ],
    issues,
  });
  const ciLocalParseArgsOptionComparisons = readComparedArgOptionLiterals(
    ciLocalParseArgsHelper,
  );
  assertArrayExact({
    values: ciLocalParseArgsOptionComparisons,
    expectedValues: EXPECTED_CI_LOCAL_PARSE_ARGS_OPTION_COMPARISONS,
    sourceLabel: 'ci-local parseArgs compared option checks',
    issues,
  });
  const ciLocalParseArgsResultKeys = readParseArgsResultKeys(
    ciLocalParseArgsHelper,
  );
  assertArrayExact({
    values: ciLocalParseArgsResultKeys,
    expectedValues: EXPECTED_CI_LOCAL_PARSE_ARGS_RESULT_KEYS,
    sourceLabel: 'ci-local parseArgs result object keys',
    issues,
  });
  assertPatterns({
    text: ciLocalValidateArgsHelper,
    workflowName: 'ci-local',
    label: 'validateArgs helper',
    patterns: [
      /const issues = \[\];/,
      /if \(args\.errors\.length > 0\) \{/,
      /issues\.push\(\.\.\.args\.errors\);/,
      /if \(args\.unknownArgs\.length > 0\) \{/,
      /Unknown option\(s\):/,
      /if \(args\.only !== null && onlyJobNames\.length === 0\) \{/,
      /The --only option requires at least one job name/,
      /if \(onlyJobs\) \{/,
      /const unknownJobNames = onlyJobNames\.filter/,
      /if \(unknownJobNames\.length > 0\) \{/,
      /Unknown job\(s\) in --only:/,
      /if \(issues\.length > 0\) \{/,
      /throw new Error\(`\[ci:local\] \$\{issues\.join\(' '\)\}`\);/,
    ],
    issues,
  });
  assertOrderedPatterns({
    text: ciLocalValidateArgsHelper,
    sourceLabel: 'ci-local validateArgs helper branch flow',
    orderedPatterns: [
      /if \(args\.errors\.length > 0\) \{/,
      /if \(args\.unknownArgs\.length > 0\) \{/,
      /if \(args\.only !== null && onlyJobNames\.length === 0\) \{/,
      /if \(onlyJobs\) \{/,
      /if \(issues\.length > 0\) \{/,
      /throw new Error\(`\[ci:local\] \$\{issues\.join\(' '\)\}`\);/,
    ],
    issues,
  });
  const ciLocalValidateArgsIssueMessages = readIssuesPushMessageLiterals(
    ciLocalValidateArgsHelper,
  );
  assertArrayExact({
    values: ciLocalValidateArgsIssueMessages,
    expectedValues: EXPECTED_CI_LOCAL_VALIDATE_ARGS_ISSUE_MESSAGES,
    sourceLabel: 'ci-local validateArgs issue messages',
    issues,
  });
  assertPatterns({
    text: ciLocalPrintParityHelper,
    workflowName: 'ci-local',
    label: 'printParity helper',
    patterns: [
      /const pnpmCheck = detectPnpmVersion\(\);/,
      /const currentPnpmVersion =/,
      /console\.log\('ci:local parity config:'\);/,
      /console\.log\(`- repo root: \$\{ROOT\}`\);/,
      /console\.log\(`- expected node major: \$\{EXPECTED_NODE_MAJOR\}`\);/,
      /expected pnpm version: \$\{EXPECTED_PNPM_VERSION \?\? 'unconfigured'\}/,
      /console\.log\(`- current node: \$\{process\.versions\.node\}`\);/,
      /console\.log\(`- current pnpm: \$\{currentPnpmVersion\}`\);/,
    ],
    issues,
  });
  const ciLocalPrintParityStringLines = readConsoleLogStringLiterals(
    ciLocalPrintParityHelper,
  );
  assertArrayExact({
    values: ciLocalPrintParityStringLines,
    sourceLabel: 'ci-local printParity string console.log lines',
    expectedValues: EXPECTED_CI_LOCAL_PRINT_PARITY_STRING_LINES,
    issues,
  });
  const ciLocalPrintParityTemplateLines = readConsoleLogTemplateLiterals(
    ciLocalPrintParityHelper,
  );
  assertArrayExact({
    values: ciLocalPrintParityTemplateLines,
    sourceLabel: 'ci-local printParity template console.log lines',
    expectedValues: EXPECTED_CI_LOCAL_PRINT_PARITY_TEMPLATE_LINES,
    issues,
  });
  assertPatterns({
    text: ciLocalPrintHelpHelper,
    workflowName: 'ci-local',
    label: 'printHelp helper',
    patterns: [
      /Usage: node tools\/scripts\/ci-local\.mjs \[options\]/,
      /--list\s+List available jobs/,
      /--only=<jobs>\s+Run only specific comma-separated jobs/,
      /--print-parity\s+Print derived node\/pnpm parity settings/,
      /--strict-parity\s+Fail when node\/pnpm parity is mismatched/,
      /--help\s+Show this help message/,
      /node tools\/scripts\/ci-local\.mjs --only=build-metro/,
      /node tools\/scripts\/ci-local\.mjs --strict-parity --only=build-and-test/,
    ],
    issues,
  });
  const ciLocalPrintHelpLines = readConsoleLogStringLiterals(
    ciLocalPrintHelpHelper,
  );
  assertArrayExact({
    values: ciLocalPrintHelpLines,
    sourceLabel: 'ci-local printHelp console.log lines',
    expectedValues: EXPECTED_CI_LOCAL_PRINT_HELP_LINES,
    issues,
  });
  assertOrderedPatterns({
    text: ciLocalMainHelper,
    sourceLabel: 'ci-local main helper',
    orderedPatterns: [
      /if \(args\.help\)/,
      /validateArgs\(\);/,
      /if \(args\.list\)/,
      /preflight\(\);/,
      /if \(args\.printParity\)/,
      /for \(const job of jobs\)/,
      /await runJob\(job\);/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalPreflightHelper,
    workflowName: 'ci-local',
    label: 'preflight helper',
    patterns: [
      /const nodeMajor = Number\(process\.versions\.node\.split\('\.'\)\[0\]\);/,
      /const parityIssues = \[\];/,
      /if \(nodeMajor !== EXPECTED_NODE_MAJOR\) \{/,
      /parityIssues\.push\(\s*`node \$\{process\.versions\.node\} \(expected major \$\{EXPECTED_NODE_MAJOR\}\)`/,
      /const pnpmVersionForHint = EXPECTED_PNPM_VERSION \?\? '10\.28\.0';/,
      /const pnpmCheck = detectPnpmVersion\(\);/,
      /if \(pnpmCheck\.status !== 0\) \{/,
      /pnpm not found in PATH\. Install\/activate pnpm before running ci-local\./,
      /const pnpmVersion = \(pnpmCheck\.stdout \?\? ''\)\.trim\(\);/,
      /if \(EXPECTED_PNPM_VERSION && pnpmVersion !== EXPECTED_PNPM_VERSION\) \{/,
      /parityIssues\.push\(\s*`pnpm \$\{pnpmVersion\} \(expected \$\{EXPECTED_PNPM_VERSION\}\)`/,
      /if \(args\.strictParity && parityIssues\.length > 0\) \{/,
      /Strict parity check failed:/,
      /parityIssues\.join\(';\s*'\)/,
    ],
    issues,
  });
  const ciLocalPreflightWarnTemplateLines = readConsoleWarnTemplateLiterals(
    ciLocalPreflightHelper,
  );
  assertArrayExact({
    values: ciLocalPreflightWarnTemplateLines,
    sourceLabel: 'ci-local preflight console.warn template lines',
    expectedValues: EXPECTED_CI_LOCAL_PREFLIGHT_WARN_TEMPLATE_LINES,
    issues,
  });
  assertPatterns({
    text: ciLocalDetectPnpmVersionHelper,
    workflowName: 'ci-local',
    label: 'detectPnpmVersion helper',
    patterns: [
      /return spawnSync\('pnpm', \['--version'\], \{/,
      /cwd: ROOT,/,
      /env: process\.env,/,
      /stdio: 'pipe',/,
      /encoding: 'utf-8',/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalReadRootPackageJsonHelper,
    workflowName: 'ci-local',
    label: 'readRootPackageJson helper',
    patterns: [
      /return JSON\.parse\(readFileSync\(join\(ROOT, 'package\.json'\), 'utf-8'\)\);/,
      /Unable to read package\.json for parity hints:/,
      /return null;/,
    ],
    issues,
  });
  const ciLocalReadRootPackageJsonWarnTemplateLines =
    readConsoleWarnTemplateLiterals(ciLocalReadRootPackageJsonHelper);
  assertArrayExact({
    values: ciLocalReadRootPackageJsonWarnTemplateLines,
    sourceLabel: 'ci-local readRootPackageJson console.warn template lines',
    expectedValues:
      EXPECTED_CI_LOCAL_READ_ROOT_PACKAGE_JSON_WARN_TEMPLATE_LINES,
    issues,
  });
  assertPatterns({
    text: ciLocalResolveExpectedNodeMajorHelper,
    workflowName: 'ci-local',
    label: 'resolveExpectedNodeMajor helper',
    patterns: [
      /const overrideMajor = process\.env\.CI_LOCAL_EXPECTED_NODE_MAJOR;/,
      /if \(overrideMajor\) \{/,
      /const parsedOverride = Number\.parseInt\(overrideMajor, 10\);/,
      /if \(Number\.isInteger\(parsedOverride\) && parsedOverride > 0\) \{/,
      /return parsedOverride;/,
      /Invalid CI_LOCAL_EXPECTED_NODE_MAJOR/,
      /const engineRange = packageJson\?\.engines\?\.node;/,
      /if \(typeof engineRange === 'string'\) \{/,
      /const versionMatch = engineRange\.match\(\/\\d\+\/\);/,
      /if \(versionMatch\) \{/,
      /return Number\.parseInt\(versionMatch\[0\], 10\);/,
      /Unable to parse node engine range/,
      /return DEFAULT_EXPECTED_NODE_MAJOR;/,
    ],
    issues,
  });
  const ciLocalResolveExpectedNodeMajorWarnTemplateLines =
    readConsoleWarnTemplateLiterals(ciLocalResolveExpectedNodeMajorHelper);
  assertArrayExact({
    values: ciLocalResolveExpectedNodeMajorWarnTemplateLines,
    sourceLabel:
      'ci-local resolveExpectedNodeMajor console.warn template lines',
    expectedValues:
      EXPECTED_CI_LOCAL_RESOLVE_EXPECTED_NODE_MAJOR_WARN_TEMPLATE_LINES,
    issues,
  });
  assertPatterns({
    text: ciLocalResolveExpectedPnpmVersionHelper,
    workflowName: 'ci-local',
    label: 'resolveExpectedPnpmVersion helper',
    patterns: [
      /const overrideVersion = process\.env\.CI_LOCAL_EXPECTED_PNPM_VERSION;/,
      /if \(overrideVersion\) \{\s*return overrideVersion;\s*\}/,
      /const packageManager = packageJson\?\.packageManager;/,
      /packageManager\.startsWith\('pnpm@'\)/,
      /return packageManager\.slice\('pnpm@'\.length\);/,
      /return null;/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalRunCommandHelper,
    workflowName: 'ci-local',
    label: 'runCommand helper',
    patterns: [
      /const \{ env = \{\}, cwd, allowFailure = false \} = options;/,
      /const child = spawn\(command, args, \{/,
      /stdio: 'inherit',/,
      /env,/,
      /cwd,/,
      /return new Promise\(\(resolve, reject\) => \{/,
      /child\.on\('exit', \(code, signal\) => \{/,
      /if \(code === 0\) \{\s*resolve\(\{ code, signal \}\);\s*return;\s*\}/,
      /if \(allowFailure\) \{\s*resolve\(\{ code, signal \}\);\s*return;\s*\}/,
      /`\$\{command\} \$\{args\.join\(' '\)\} exited with \$\{formatExit\(\{/,
      /child\.on\('error', reject\);/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalRunShellHelper,
    workflowName: 'ci-local',
    label: 'runShell helper',
    patterns: [/return runCommand\('bash', \['-lc', command\], options\);/],
    issues,
  });
  assertPatterns({
    text: ciLocalSleepHelper,
    workflowName: 'ci-local',
    label: 'sleep helper',
    patterns: [
      /return new Promise\(\(resolve\) => setTimeout\(resolve, ms\)\);/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalCiIsAffectedHelper,
    workflowName: 'ci-local',
    label: 'ciIsAffected helper',
    patterns: [
      /const result = await runCommand\(/,
      /'node',/,
      /'tools\/scripts\/ci-is-affected\.mjs'/,
      /`--appName=\$\{appName\}`/,
      /allowFailure: true/,
      /return result\.code === 0;/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalLogStepSkipHelper,
    workflowName: 'ci-local',
    label: 'logStepSkip helper',
    patterns: [
      /console\.log\(`\[ci:local\] \$\{ctx\.jobName\} -> Skipped: \$\{reason\}`\);/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalFormatExitHelper,
    workflowName: 'ci-local',
    label: 'formatExit helper',
    patterns: [
      /const parts = \[\];/,
      /if \(code !== null && code !== undefined\) \{/,
      /parts\.push\(`code \$\{code\}`\);/,
      /if \(signal\) \{/,
      /parts\.push\(`signal \$\{signal\}`\);/,
      /return parts\.length > 0 \? parts\.join\(', '\) : 'unknown status';/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalRunJobHelper,
    workflowName: 'ci-local',
    label: 'runJob helper',
    patterns: [
      /const skipFilter = parentCtx\.skipFilter === true;/,
      /const inheritedCtx = \{ \.\.\.parentCtx \};/,
      /delete inheritedCtx\.skipFilter;/,
      /if \(job\.skipReason\) \{/,
      /Skipping job "\$\{job\.name\}": \$\{job\.skipReason\}/,
      /if \(!skipFilter && !shouldRunJob\(job\)\) \{/,
      /if \(job\.matrix\?\.length\) \{/,
      /const runAllEntries = !onlyJobs \|\| onlyJobs\.has\(job\.name\);/,
      /const entryName = formatMatrixJobName\(job\.name, entry\);/,
      /matrix:\s*null,/,
      /name:\s*entryName,/,
      /env:\s*\{\s*\.\.\.job\.env,\s*\.\.\.entry\.env\s*\},/,
      /skipFilter:\s*true/,
      /const ctx = \{/,
      /env:\s*\{\s*\.\.\.process\.env,\s*\.\.\.job\.env\s*\},/,
      /jobName:\s*job\.name,/,
      /state:\s*\{\s*\},/,
      /for \(const jobStep of job\.steps \?\? \[\]\) \{/,
      /await jobStep\.run\(ctx\);/,
      /if \(job\.cleanup\) \{/,
      /await job\.cleanup\(ctx\);/,
      /Cleanup error for \$\{job\.name\}:/,
    ],
    issues,
  });
  assertPatterns({
    text: ciLocalStepHelper,
    workflowName: 'ci-local',
    label: 'step helper',
    patterns: [/return \{ label, run \};/],
    issues,
  });
  assertRegexCount({
    text: ciLocalRunWithRetryHelper,
    pattern: /await sleep\(2000\);/g,
    expectedCount: 1,
    description: 'runWithRetry fixed backoff sleep statement',
    sourceLabel: 'ci-local runWithRetry helper',
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
  const ciLocalBundleSizeJob = extractJobBlock({
    text: ciLocalText,
    jobName: CI_LOCAL_BUNDLE_SIZE_JOB_NAME,
    issues,
  });
  for (const skippedJob of EXPECTED_CI_LOCAL_SKIPPED_JOBS) {
    const ciLocalSkippedJobBlock = extractJobBlock({
      text: ciLocalText,
      jobName: skippedJob.name,
      issues,
    });
    assertCiLocalSkippedJobBlock({
      jobBlock: ciLocalSkippedJobBlock,
      jobName: skippedJob.name,
      expectedSkipReason: skippedJob.reason,
      issues,
    });
  }
  assertRegexCount({
    text: ciLocalBundleSizeJob,
    pattern: /cleanup:\s*async\s*\(ctx\)\s*=>\s*\{/g,
    expectedCount: 1,
    description: 'bundle-size cleanup definition',
    sourceLabel: 'ci-local bundle-size job',
    issues,
  });
  assertRegexCount({
    text: ciLocalBundleSizeJob,
    pattern: /'worktree',\s*'remove',\s*'--force',\s*ctx\.state\.basePath/g,
    expectedCount: 1,
    description: 'bundle-size cleanup worktree remove command arguments',
    sourceLabel: 'ci-local bundle-size job',
    issues,
  });
  assertPatterns({
    text: ciLocalBundleSizeJob,
    workflowName: 'ci-local bundle-size',
    label: 'cleanup block',
    patterns: [
      /cleanup:\s*async\s*\(ctx\)\s*=>\s*\{/,
      /if \(!ctx\.state\.basePath\) \{\s*return;\s*\}/,
      /await runCommand\(\s*'git',/,
      /ctx\.state\.basePath/,
    ],
    issues,
  });
  assertForbiddenPatterns({
    text: ciLocalBundleSizeJob,
    workflowName: 'ci-local bundle-size',
    label: 'cleanup block',
    patterns: [/cleanup:\s*async[\s\S]*?runShell\(/],
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
  assertStepLabelsExactInText({
    text: ciLocalBuildAndTestJob,
    sourceLabel: 'ci-local build-and-test job',
    expectedStepLabels: EXPECTED_CI_LOCAL_BUILD_AND_TEST_STEP_LABELS,
    issues,
  });
  assertStepLabelsExactInText({
    text: ciLocalBuildMetroJob,
    sourceLabel: 'ci-local build-metro job',
    expectedStepLabels: EXPECTED_CI_LOCAL_BUILD_METRO_STEP_LABELS,
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

function readCiLocalTopLevelJobNames(text) {
  return Array.from(text.matchAll(/^ {4}name:\s*'([^']+)'/gm)).map(
    (match) => match[1],
  );
}

function readCiLocalTopLevelSkippedJobs(text) {
  return Array.from(
    text.matchAll(
      /^ {4}name:\s*'([^']+)'\s*,\r?\n {4}skipReason:\s*'([^']+)'/gm,
    ),
  ).map((match) => ({
    name: match[1],
    reason: match[2],
  }));
}

function readCiLocalTopLevelJobFieldNames(jobBlock) {
  if (typeof jobBlock !== 'string' || jobBlock.trim().length === 0) {
    return [];
  }

  return Array.from(jobBlock.matchAll(/^ {4}([a-zA-Z][a-zA-Z0-9_-]*):/gm)).map(
    (match) => match[1],
  );
}

function readCiLocalStepLabelsFromJobBlock(jobBlock) {
  if (typeof jobBlock !== 'string' || jobBlock.trim().length === 0) {
    return [];
  }

  return Array.from(jobBlock.matchAll(/step\('([^']+)'/g)).map(
    (match) => match[1],
  );
}

function readCiLocalEnvEntriesFromJobBlock(jobBlock) {
  if (typeof jobBlock !== 'string' || jobBlock.trim().length === 0) {
    return [];
  }

  const envAnchorIndex = jobBlock.indexOf('\n    env:');
  if (envAnchorIndex === -1) {
    return [];
  }

  const envObjectStart = jobBlock.indexOf('{', envAnchorIndex);
  if (envObjectStart === -1) {
    return [];
  }

  const envObjectEnd = findBraceBlockEndIndex(jobBlock, envObjectStart);
  if (envObjectEnd === -1) {
    return [];
  }

  const envObjectText = jobBlock.slice(envObjectStart + 1, envObjectEnd);
  return Array.from(envObjectText.matchAll(/([A-Z0-9_]+):\s*'([^']+)'/g)).map(
    (match) => `${match[1]}=${match[2]}`,
  );
}

function readConsoleLogStringLiterals(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  return Array.from(
    text.matchAll(/console\.log\(\s*'([^']*)'\s*,?\s*\);/g),
  ).map((match) => match[1]);
}

function readConsoleLogTemplateLiterals(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  return Array.from(
    text.matchAll(/console\.log\(\s*`([\s\S]*?)`\s*,?\s*\);/g),
  ).map((match) => normalizeWhitespace(match[1]));
}

function readConsoleWarnTemplateLiterals(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  return Array.from(
    text.matchAll(/console\.warn\(\s*`([\s\S]*?)`\s*,?\s*\);/g),
  ).map((match) => normalizeWhitespace(match[1]));
}

function readComparedArgOptionLiterals(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  return Array.from(text.matchAll(/arg === '([^']+)'/g)).map(
    (match) => match[1],
  );
}

function readParseArgsResultKeys(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  const match = text.match(/const result = \{([\s\S]*?)^\s*\};/m);
  if (!match) {
    return [];
  }

  return Array.from(
    match[1].matchAll(/^\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*:/gm),
  ).map((entry) => entry[1]);
}

function readIssuesPushMessageLiterals(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  const matches = Array.from(
    text.matchAll(
      /issues\.push\(\s*(?!\.\.\.)(`[\s\S]*?`|'[\s\S]*?')\s*,?\s*\);/g,
    ),
  );

  return matches.map((match) =>
    normalizeWhitespace(match[1].slice(1, -1).trim()),
  );
}

function readTopLevelFunctionDeclarationNames(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  return Array.from(
    text.matchAll(/^(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/gm),
  ).map((match) => match[1]);
}

function assertArrayPrefix({ values, sourceLabel, expectedPrefix, issues }) {
  if (values.length < expectedPrefix.length) {
    issues.push(
      `${sourceLabel} must start with [${expectedPrefix.join(
        ', ',
      )}], found [${values.join(', ')}]`,
    );
    return;
  }

  for (let index = 0; index < expectedPrefix.length; index += 1) {
    if (values[index] !== expectedPrefix[index]) {
      issues.push(
        `${sourceLabel} must start with [${expectedPrefix.join(
          ', ',
        )}], found [${values.join(', ')}]`,
      );
      return;
    }
  }
}

function assertArrayExact({ values, sourceLabel, expectedValues, issues }) {
  if (
    values.length !== expectedValues.length ||
    values.some((value, index) => value !== expectedValues[index])
  ) {
    issues.push(
      `${sourceLabel} must match exact order [${expectedValues.join(
        ', ',
      )}], found [${values.join(', ')}]`,
    );
  }
}

function assertCiLocalSkippedJobsExact({
  actualSkippedJobs,
  expectedSkippedJobs,
  sourceLabel,
  issues,
}) {
  if (actualSkippedJobs.length !== expectedSkippedJobs.length) {
    issues.push(
      `${sourceLabel} must define ${expectedSkippedJobs.length} skipped jobs, found ${actualSkippedJobs.length}`,
    );
    return;
  }

  for (let index = 0; index < expectedSkippedJobs.length; index += 1) {
    const expected = expectedSkippedJobs[index];
    const actual = actualSkippedJobs[index];
    if (actual?.name !== expected.name || actual?.reason !== expected.reason) {
      issues.push(
        `${sourceLabel} entry #${index + 1} must be "${expected.name}" [${expected.reason}], found "${String(
          actual?.name,
        )}" [${String(actual?.reason)}]`,
      );
      return;
    }
  }
}

function assertCiLocalSkippedJobBlock({
  jobBlock,
  jobName,
  expectedSkipReason,
  issues,
}) {
  if (typeof jobBlock !== 'string' || jobBlock.trim().length === 0) {
    return;
  }

  if (!jobBlock.includes(`name: '${jobName}'`)) {
    issues.push(`ci-local skipped job "${jobName}" must define exact name`);
  }
  if (!jobBlock.includes(`skipReason: '${expectedSkipReason}'`)) {
    issues.push(
      `ci-local skipped job "${jobName}" must define skipReason "${expectedSkipReason}"`,
    );
  }

  const forbiddenMarkers = ['steps:', 'env:', 'matrix:', 'cleanup:', "step('"];
  for (const marker of forbiddenMarkers) {
    if (jobBlock.includes(marker)) {
      issues.push(
        `ci-local skipped job "${jobName}" must not define "${marker}"`,
      );
    }
  }
}

function assertUniqueValues({ values, sourceLabel, issues }) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
      continue;
    }
    seen.add(value);
  }
  if (duplicates.size > 0) {
    issues.push(
      `${sourceLabel} contains duplicate entries: ${Array.from(duplicates).join(', ')}`,
    );
  }
}

function assertWorkflowJobsExact({
  workflow,
  workflowName,
  expectedJobNames,
  issues,
}) {
  const jobs = workflow?.jobs;
  if (!jobs || typeof jobs !== 'object') {
    issues.push(`${workflowName} workflow must define jobs`);
    return;
  }

  const actualJobNames = Object.keys(jobs);
  if (
    actualJobNames.length !== expectedJobNames.length ||
    actualJobNames.some((value, index) => value !== expectedJobNames[index])
  ) {
    issues.push(
      `${workflowName} workflow jobs must be in order [${expectedJobNames.join(
        ', ',
      )}], found [${actualJobNames.join(', ')}]`,
    );
  }
}

function assertWorkflowJobOrder({
  workflow,
  workflowName,
  expectedJobOrder,
  issues,
}) {
  const jobs = workflow?.jobs;
  if (!jobs || typeof jobs !== 'object') {
    issues.push(`${workflowName} workflow must define jobs`);
    return;
  }

  const actualJobOrder = Object.keys(jobs);
  if (
    actualJobOrder.length !== expectedJobOrder.length ||
    actualJobOrder.some((value, index) => value !== expectedJobOrder[index])
  ) {
    issues.push(
      `${workflowName} workflow job order must be [${expectedJobOrder.join(
        ' -> ',
      )}], found [${actualJobOrder.join(' -> ')}]`,
    );
  }
}

function assertWorkflowJobKindsExact({
  workflow,
  workflowName,
  expectedNonReusableJobs,
  expectedReusableJobs,
  issues,
}) {
  const jobs = workflow?.jobs;
  if (!jobs || typeof jobs !== 'object') {
    issues.push(`${workflowName} workflow must define jobs`);
    return;
  }

  const nonReusableJobs = [];
  const reusableJobs = [];
  for (const [jobName, jobConfig] of Object.entries(jobs)) {
    if (typeof jobConfig?.uses === 'string') {
      reusableJobs.push(jobName);
    } else {
      nonReusableJobs.push(jobName);
    }
  }

  if (
    nonReusableJobs.length !== expectedNonReusableJobs.length ||
    nonReusableJobs.some(
      (value, index) => value !== expectedNonReusableJobs[index],
    )
  ) {
    issues.push(
      `${workflowName} workflow non-reusable jobs must be in order [${expectedNonReusableJobs.join(
        ', ',
      )}], found [${nonReusableJobs.join(', ')}]`,
    );
  }
  if (
    reusableJobs.length !== expectedReusableJobs.length ||
    reusableJobs.some((value, index) => value !== expectedReusableJobs[index])
  ) {
    issues.push(
      `${workflowName} workflow reusable jobs must be in order [${expectedReusableJobs.join(
        ', ',
      )}], found [${reusableJobs.join(', ')}]`,
    );
  }
}

function assertWorkflowJobFieldsExact({
  workflow,
  workflowName,
  jobName,
  expectedFields,
  issues,
}) {
  const job = workflow?.jobs?.[jobName];
  if (!job || typeof job !== 'object') {
    issues.push(`${workflowName} workflow is missing job "${jobName}"`);
    return;
  }

  assertObjectKeysExact({
    objectValue: job,
    sourceLabel: `${workflowName} workflow job "${jobName}"`,
    expectedKeys: expectedFields,
    issues,
  });
}

function assertReusableWorkflowReferencesResolve({
  workflow,
  workflowName,
  reusableWorkflowPrefix,
  issues,
}) {
  const jobs = workflow?.jobs;
  if (!jobs || typeof jobs !== 'object') {
    issues.push(`${workflowName} workflow must define jobs`);
    return;
  }

  for (const [jobName, jobConfig] of Object.entries(jobs)) {
    const uses = jobConfig?.uses;
    if (typeof uses !== 'string' || !uses.startsWith(reusableWorkflowPrefix)) {
      continue;
    }

    const relativePath = uses.startsWith('./') ? uses.slice(2) : uses;
    const resolvedPath = join(ROOT, relativePath);
    if (!existsSync(resolvedPath)) {
      issues.push(
        `${workflowName} workflow job "${jobName}" references missing reusable workflow file "${uses}" (${resolvedPath})`,
      );
    }
  }
}

function assertReusableWorkflowJobsForbiddenFields({
  workflow,
  workflowName,
  reusableWorkflowPrefix,
  forbiddenFieldNames,
  issues,
}) {
  const jobs = workflow?.jobs;
  if (!jobs || typeof jobs !== 'object') {
    issues.push(`${workflowName} workflow must define jobs`);
    return;
  }

  for (const [jobName, jobConfig] of Object.entries(jobs)) {
    const uses = jobConfig?.uses;
    if (typeof uses !== 'string' || !uses.startsWith(reusableWorkflowPrefix)) {
      continue;
    }

    for (const fieldName of forbiddenFieldNames) {
      if (jobConfig?.[fieldName] !== undefined) {
        issues.push(
          `${workflowName} workflow reusable job "${jobName}" must not define field "${fieldName}"`,
        );
      }
    }
  }
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

function assertWorkflowStepNamesExact({
  workflow,
  workflowName,
  jobName,
  expectedStepNames,
  issues,
}) {
  const steps = workflow?.jobs?.[jobName]?.steps;
  if (!Array.isArray(steps)) {
    issues.push(
      `${workflowName} workflow job "${jobName}" is missing a valid steps array`,
    );
    return;
  }

  const actualStepNames = steps
    .map((step) => (typeof step?.name === 'string' ? step.name : null))
    .filter(Boolean);
  if (
    actualStepNames.length !== expectedStepNames.length ||
    actualStepNames.some((value, index) => value !== expectedStepNames[index])
  ) {
    issues.push(
      `${workflowName} workflow job "${jobName}" must define exact step sequence [${expectedStepNames.join(
        ' -> ',
      )}], found [${actualStepNames.join(' -> ')}]`,
    );
  }
}

function assertWorkflowStepFieldsExact({
  workflow,
  workflowName,
  jobName,
  stepName,
  expectedFields,
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
    return;
  }

  assertObjectKeysExact({
    objectValue: step,
    sourceLabel: `${workflowName} workflow step "${stepName}" in job "${jobName}"`,
    expectedKeys: expectedFields,
    issues,
  });
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

function assertStepLabelsExactInText({
  text,
  sourceLabel,
  expectedStepLabels,
  issues,
}) {
  const actualStepLabels = Array.from(text.matchAll(/step\('([^']+)'/g)).map(
    (match) => match[1],
  );
  if (
    actualStepLabels.length !== expectedStepLabels.length ||
    actualStepLabels.some((value, index) => value !== expectedStepLabels[index])
  ) {
    issues.push(
      `${sourceLabel} must define exact step sequence [${expectedStepLabels.join(
        ' -> ',
      )}], found [${actualStepLabels.join(' -> ')}]`,
    );
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

  const uniqueExclusions = new Set(exclusions);
  if (uniqueExclusions.size !== exclusions.length) {
    issues.push(
      `${sourceLabel} must not repeat exclusions, found [${exclusions.join(', ')}]`,
    );
    return;
  }

  if (
    exclusions.length !== expectedExclusions.length ||
    exclusions.some((value, index) => value !== expectedExclusions[index])
  ) {
    issues.push(
      `${sourceLabel} has unexpected ordered exclusions: expected [${expectedExclusions.join(
        ', ',
      )}] but found [${exclusions.join(', ')}]`,
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

function assertExactCommandLines({
  commandText,
  sourceLabel,
  expectedCommands,
  issues,
}) {
  const actualCommands = commandText
    .split('\n')
    .map((line) => normalizeWhitespace(line))
    .filter((line) => line.length > 0);
  const normalizedExpected = expectedCommands.map((line) =>
    normalizeWhitespace(line),
  );
  if (
    actualCommands.length !== normalizedExpected.length ||
    actualCommands.some((value, index) => value !== normalizedExpected[index])
  ) {
    issues.push(
      `${sourceLabel} must contain exact command lines [${normalizedExpected.join(
        ' | ',
      )}], found [${actualCommands.join(' | ')}]`,
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

  assertObjectKeysExact({
    objectValue: step?.with,
    sourceLabel: `${workflowName} workflow step "${stepName}" in job "${jobName}" with`,
    expectedKeys: EXPECTED_RETRY_STEP_WITH_FIELDS,
    issues,
  });

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

  assertObjectKeysExact({
    objectValue: step?.with,
    sourceLabel: `${workflowName} workflow step "${stepName}" in job "${jobName}" with`,
    expectedKeys: Object.keys(expectedWith),
    allowNullishWhenExpectingNoKeys: true,
    issues,
  });

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

  const actualTriggers = Object.keys(triggers);
  if (
    actualTriggers.length !== expectedTriggers.length ||
    actualTriggers.some((value, index) => value !== expectedTriggers[index])
  ) {
    issues.push(
      `${workflowName} workflow must define triggers in order [${expectedTriggers.join(
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

  if (
    branches.length !== expectedBranches.length ||
    branches.some((value, index) => value !== expectedBranches[index])
  ) {
    issues.push(
      `${workflowName} workflow trigger "${triggerName}" must define branches in order [${expectedBranches.join(
        ', ',
      )}], found [${branches.join(', ')}]`,
    );
  }
}

function assertObjectKeysExact({
  objectValue,
  sourceLabel,
  expectedKeys,
  allowNullishWhenExpectingNoKeys = false,
  issues,
}) {
  if (
    allowNullishWhenExpectingNoKeys &&
    (objectValue === null || objectValue === undefined) &&
    expectedKeys.length === 0
  ) {
    return;
  }

  if (
    objectValue === null ||
    objectValue === undefined ||
    typeof objectValue !== 'object' ||
    Array.isArray(objectValue)
  ) {
    issues.push(`${sourceLabel} must be an object`);
    return;
  }

  const actualKeys = Object.keys(objectValue);
  if (
    actualKeys.length !== expectedKeys.length ||
    actualKeys.some((value, index) => value !== expectedKeys[index])
  ) {
    issues.push(
      `${sourceLabel} must define keys in order [${expectedKeys.join(
        ', ',
      )}], found [${actualKeys.join(', ')}]`,
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

function assertWorkflowConcurrencyAbsent({ workflow, workflowName, issues }) {
  if (workflow?.concurrency !== undefined) {
    issues.push(`${workflowName} workflow must not define concurrency`);
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

function assertWorkflowPermissionsExact({
  workflow,
  workflowName,
  expectedPermissions,
  issues,
}) {
  const permissions = workflow?.permissions;
  if (!permissions || typeof permissions !== 'object') {
    issues.push(
      `${workflowName} workflow is missing permissions configuration`,
    );
    return;
  }

  const actualEntries = Object.entries(permissions).map(
    ([key, value]) => `${key}:${String(value)}`,
  );
  const expectedEntries = Object.entries(expectedPermissions).map(
    ([key, value]) => `${key}:${String(value)}`,
  );
  if (
    actualEntries.length !== expectedEntries.length ||
    actualEntries.some((value, index) => value !== expectedEntries[index])
  ) {
    issues.push(
      `${workflowName} workflow permissions must be in order {${expectedEntries.join(
        ', ',
      )}}, found {${actualEntries.join(', ')}}`,
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

function assertWorkflowJobPermissionsExact({
  workflow,
  workflowName,
  jobName,
  expectedPermissions,
  issues,
}) {
  const permissions = workflow?.jobs?.[jobName]?.permissions;
  if (!permissions || typeof permissions !== 'object') {
    issues.push(
      `${workflowName} workflow job "${jobName}" is missing permissions configuration`,
    );
    return;
  }

  const actualEntries = Object.entries(permissions).map(
    ([key, value]) => `${key}:${String(value)}`,
  );
  const expectedEntries = Object.entries(expectedPermissions).map(
    ([key, value]) => `${key}:${String(value)}`,
  );
  if (
    actualEntries.length !== expectedEntries.length ||
    actualEntries.some((value, index) => value !== expectedEntries[index])
  ) {
    issues.push(
      `${workflowName} workflow job "${jobName}" permissions must be in order {${expectedEntries.join(
        ', ',
      )}}, found {${actualEntries.join(', ')}}`,
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

function assertReusableWorkflowJobConfigs({
  workflow,
  workflowName,
  reusableWorkflowPrefix,
  expectedJobs,
  expectedJobOrder,
  issues,
}) {
  const jobs = workflow?.jobs;
  if (!jobs || typeof jobs !== 'object') {
    issues.push(`${workflowName} workflow is missing jobs configuration`);
    return;
  }

  const actualReusableJobs = {};
  for (const [jobName, jobConfig] of Object.entries(jobs)) {
    if (
      typeof jobConfig?.uses !== 'string' ||
      !jobConfig.uses.startsWith(reusableWorkflowPrefix)
    ) {
      continue;
    }

    actualReusableJobs[jobName] = {
      uses: jobConfig.uses,
      needs: readWorkflowJobNeeds(jobConfig),
      secrets: jobConfig.secrets,
    };
  }

  const expectedReusableJobs = Object.fromEntries(
    Object.entries(expectedJobs).map(([jobName, config]) => [
      jobName,
      {
        uses: config.uses,
        needs: [...config.needs],
        secrets: config.secrets,
      },
    ]),
  );

  const actualJobNames = Object.keys(actualReusableJobs);
  const expectedJobNames = [...expectedJobOrder];
  if (
    actualJobNames.length !== expectedJobNames.length ||
    actualJobNames.some((value, index) => value !== expectedJobNames[index])
  ) {
    issues.push(
      `${workflowName} workflow reusable jobs must be in order [${expectedJobNames.join(
        ', ',
      )}], found [${actualJobNames.join(', ')}]`,
    );
    return;
  }

  for (const jobName of expectedJobNames) {
    const actualConfig = actualReusableJobs[jobName];
    const expectedConfig = expectedReusableJobs[jobName];
    if (actualConfig.uses !== expectedConfig.uses) {
      issues.push(
        `${workflowName} workflow job "${jobName}" must use "${expectedConfig.uses}", found "${String(
          actualConfig.uses,
        )}"`,
      );
    }
    if (actualConfig.secrets !== expectedConfig.secrets) {
      issues.push(
        `${workflowName} workflow job "${jobName}" must set secrets: ${String(
          expectedConfig.secrets,
        )}, found ${String(actualConfig.secrets)}`,
      );
    }
    if (
      actualConfig.needs.length !== expectedConfig.needs.length ||
      actualConfig.needs.some(
        (value, index) => value !== expectedConfig.needs[index],
      )
    ) {
      issues.push(
        `${workflowName} workflow job "${jobName}" must have needs in order [${expectedConfig.needs.join(
          ', ',
        )}], found [${actualConfig.needs.join(', ')}]`,
      );
    }
  }
}

function assertReusableWorkflowJobFieldsExact({
  workflow,
  workflowName,
  reusableWorkflowPrefix,
  expectedFieldsByJob,
  issues,
}) {
  const jobs = workflow?.jobs;
  if (!jobs || typeof jobs !== 'object') {
    issues.push(`${workflowName} workflow is missing jobs configuration`);
    return;
  }

  const expectedJobNames = new Set(Object.keys(expectedFieldsByJob));
  for (const [jobName, jobConfig] of Object.entries(jobs)) {
    const uses = jobConfig?.uses;
    if (typeof uses !== 'string' || !uses.startsWith(reusableWorkflowPrefix)) {
      continue;
    }

    const expectedFields = expectedFieldsByJob[jobName];
    if (!expectedFields) {
      issues.push(
        `${workflowName} workflow reusable job "${jobName}" is missing expected field schema`,
      );
      continue;
    }

    assertObjectKeysExact({
      objectValue: jobConfig,
      sourceLabel: `${workflowName} workflow reusable job "${jobName}"`,
      expectedKeys: expectedFields,
      issues,
    });

    expectedJobNames.delete(jobName);
  }

  if (expectedJobNames.size > 0) {
    issues.push(
      `${workflowName} workflow missing reusable job field expectations for: ${Array.from(
        expectedJobNames,
      ).join(', ')}`,
    );
  }
}

function assertReusableWorkflowJobPermissionOverrides({
  workflow,
  workflowName,
  reusableWorkflowPrefix,
  expectedPermissionsByJob,
  issues,
}) {
  const jobs = workflow?.jobs;
  if (!jobs || typeof jobs !== 'object') {
    issues.push(`${workflowName} workflow is missing jobs configuration`);
    return;
  }

  const expectedJobNames = new Set(Object.keys(expectedPermissionsByJob));
  for (const [jobName, jobConfig] of Object.entries(jobs)) {
    const uses = jobConfig?.uses;
    if (typeof uses !== 'string' || !uses.startsWith(reusableWorkflowPrefix)) {
      continue;
    }

    const actualPermissions = jobConfig?.permissions;
    const expectedPermissions = expectedPermissionsByJob[jobName];
    if (!expectedPermissions) {
      if (actualPermissions !== undefined) {
        issues.push(
          `${workflowName} workflow reusable job "${jobName}" must not define permissions`,
        );
      }
      continue;
    }

    const actualEntries = Object.entries(actualPermissions ?? {}).map(
      ([key, value]) => `${key}:${String(value)}`,
    );
    const expectedEntries = Object.entries(expectedPermissions).map(
      ([key, value]) => `${key}:${String(value)}`,
    );
    if (
      actualEntries.length !== expectedEntries.length ||
      actualEntries.some((value, index) => value !== expectedEntries[index])
    ) {
      issues.push(
        `${workflowName} workflow reusable job "${jobName}" permissions must be in order {${expectedEntries.join(
          ', ',
        )}}, found {${actualEntries.join(', ')}}`,
      );
    }

    expectedJobNames.delete(jobName);
  }

  if (expectedJobNames.size > 0) {
    issues.push(
      `${workflowName} workflow missing reusable job permission override expectations for: ${Array.from(
        expectedJobNames,
      ).join(', ')}`,
    );
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
  if (
    actualNeeds.length !== expectedNeeds.length ||
    actualNeeds.some((value, index) => value !== expectedNeeds[index])
  ) {
    issues.push(
      `${workflowName} workflow job "${jobName}" must have needs in order [${expectedNeeds.join(
        ', ',
      )}], found [${actualNeeds.join(', ')}]`,
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

  const parameterListStart = text.indexOf('(', startIndex);
  if (parameterListStart === -1) {
    issues.push(
      `${sourceLabel} function "${functionName}" is missing parameter list`,
    );
    return '';
  }

  const parameterListEnd = findParenthesisBlockEndIndex(
    text,
    parameterListStart,
  );
  if (parameterListEnd === -1) {
    issues.push(
      `${sourceLabel} function "${functionName}" parameter list could not be parsed`,
    );
    return '';
  }

  const blockStart = text.indexOf('{', parameterListEnd);
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
  const nextJobStart = jobMatches[jobIndex + 1]?.index ?? text.length;
  const topLevelJobEndPattern = /^ {2}\},\s*$/gm;
  topLevelJobEndPattern.lastIndex = start;
  const topLevelJobEndMatch = topLevelJobEndPattern.exec(text);
  const end =
    topLevelJobEndMatch && topLevelJobEndMatch.index < nextJobStart
      ? topLevelJobEndMatch.index + topLevelJobEndMatch[0].length
      : nextJobStart;
  return text.slice(start, end);
}

function findStepCallEndIndex(text, startIndex) {
  return findParenthesisBlockEndIndex(text, startIndex);
}

function findParenthesisBlockEndIndex(text, startIndex) {
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
