import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  computeE2ESuiteDecisions,
  isAppNameAffected,
  parseAffectedPackages,
} from './ci-e2e-affected.mjs';
import { E2E_SUITE_DEFINITIONS, E2E_SUITES } from './ci-e2e-suites.mjs';
import { createLocalE2EHelpers } from './ci-local-e2e.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '../..');
const CLI_PATH = join(SCRIPT_DIR, 'ci-is-affected.mjs');

test('maps affected packages to their E2E suites', () => {
  const decisions = computeE2ESuiteDecisions({
    affectedPackageNames: new Set([
      '@module-federation/modern-js',
      'runtime-host',
    ]),
    changedFiles: ['packages/runtime/src/index.ts'],
  });

  assert.equal(decisions.modern, true);
  assert.equal(decisions.runtime, true);
  assert.equal(decisions.router, false);
});

test('treats a suite workflow as input to only that suite', () => {
  const decisions = computeE2ESuiteDecisions({
    affectedPackageNames: new Set(),
    changedFiles: ['.github/workflows/e2e-router.yml'],
  });

  assert.deepEqual(
    Object.entries(decisions)
      .filter(([, shouldRun]) => shouldRun)
      .map(([suiteName]) => suiteName),
    ['router'],
  );
});

test('treats the Metro workflow as input to only the Metro suite', () => {
  const decisions = computeE2ESuiteDecisions({
    affectedPackageNames: new Set(),
    changedFiles: ['.github/workflows/e2e-metro.yml'],
  });

  assert.deepEqual(
    Object.entries(decisions)
      .filter(([, shouldRun]) => shouldRun)
      .map(([suiteName]) => suiteName),
    ['metro'],
  );
});

test('runs every suite for shared E2E policy changes', () => {
  const decisions = computeE2ESuiteDecisions({
    affectedPackageNames: new Set(),
    changedFiles: ['tools/scripts/ci-e2e-affected.mjs'],
  });

  assert.deepEqual(
    decisions,
    Object.fromEntries(Object.keys(E2E_SUITES).map((suite) => [suite, true])),
  );
});

test('gates every parent E2E suite in the parent workflow', () => {
  const workflow = readFileSync(
    join(ROOT, '.github/workflows/build-and-test.yml'),
    'utf8',
  );

  for (const [suiteName, definition] of Object.entries(E2E_SUITE_DEFINITIONS)) {
    if (definition.parentWorkflow === false) {
      continue;
    }
    assert.match(
      workflow,
      new RegExp(`e2e_suites\\)\\.${suiteName} \\}\\}`),
      `missing parent gate for ${suiteName}`,
    );
  }
});

test('matches scoped affected packages by unscoped app name', () => {
  assert.equal(
    isAppNameAffected(['modern-js'], new Set(['@module-federation/modern-js'])),
    true,
  );
});

test('parses supported Turbo package output shapes', () => {
  assert.deepEqual(
    [...parseAffectedPackages('[{"name":"runtime-host"}]')],
    ['runtime-host'],
  );
  assert.deepEqual(
    [
      ...parseAffectedPackages(
        '{"packages":{"@module-federation/modern-js":{"path":"packages/modernjs"}}}',
      ),
    ],
    ['@module-federation/modern-js'],
  );
  assert.deepEqual(
    [
      ...parseAffectedPackages(
        '{"packageManager":"pnpm9","packages":{"count":0,"items":[]}}',
      ),
    ],
    [],
  );
});

test('rejects malformed Turbo output so callers can fail open', () => {
  assert.throws(
    () => parseAffectedPackages('not json'),
    /Unable to locate JSON payload in Turbo output/,
  );
  assert.throws(
    () => parseAffectedPackages('{"version":"2.9"}'),
    /unsupported schema/,
  );
  assert.throws(
    () => parseAffectedPackages('[{"version":"2.9"}]'),
    /unsupported package entry/,
  );
  assert.throws(
    () => parseAffectedPackages('{"items":[{"version":"2.9"}]}'),
    /unsupported package entry/,
  );
});

test('translates local affected exit codes without hiding errors', async (t) => {
  for (const { code, expected } of [
    { code: 0, expected: true },
    { code: 1, expected: false },
  ]) {
    await t.test(`exit ${code}`, async () => {
      const { checkAffectedStep } = createHelpersReturning({ code });
      const ctx = { env: {}, state: {} };

      await checkAffectedStep(['runtime-host']).run(ctx);

      assert.equal(ctx.state.shouldRun, expected);
    });
  }

  await t.test('unexpected exit', async () => {
    const { checkAffectedStep } = createHelpersReturning({ code: 2 });

    await assert.rejects(
      checkAffectedStep(['runtime-host']).run({ env: {}, state: {} }),
      /unexpected code 2/,
    );
  });
});

test('uses suite-aware selection for local E2E jobs', async () => {
  const calls = [];
  const helpers = createLocalE2EHelpers({
    formatExit: ({ code }) => `code ${code}`,
    runCommand: async (command, args) => {
      calls.push([command, args]);
      return { code: 0 };
    },
    runPackagesBuild: async () => {},
    step: (label, run) => ({ label, run }),
  });

  const [, affectedStep] = helpers.e2eSetupSteps('router');
  await affectedStep.run({ env: {}, state: {} });

  assert.deepEqual(calls, [
    ['node', ['tools/scripts/ci-is-affected.mjs', '--e2eSuite=router']],
  ]);
});

test('combines a Metro suite selector with its app override', async () => {
  const calls = [];
  const helpers = createLocalE2EHelpers({
    formatExit: ({ code }) => `code ${code}`,
    runCommand: async (command, args) => {
      calls.push([command, args]);
      return { code: 0 };
    },
    runPackagesBuild: async () => {},
    step: (label, run) => ({ label, run }),
  });

  await helpers
    .checkAffectedStep(['custom-metro-app'], 'metro')
    .run({ env: {}, state: {} });

  assert.deepEqual(calls, [
    [
      'node',
      [
        'tools/scripts/ci-is-affected.mjs',
        '--appName=custom-metro-app',
        '--e2eSuite=metro',
      ],
    ],
  ]);
});

test('rejects unknown suites with an error exit', () => {
  const result = runCli(['--e2eSuite=unknown']);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /Unknown e2e suite/);
});

test('requires GITHUB_OUTPUT for all-suite output mode', () => {
  const env = { ...process.env };
  delete env.GITHUB_OUTPUT;
  const result = runCli(
    ['--githubOutputAll=e2e_suites', '--base=HEAD', '--head=HEAD'],
    env,
  );

  assert.equal(result.status, 2);
  assert.match(result.stderr, /GITHUB_OUTPUT is not set/);
});

test('writes a single fail-open decision to GITHUB_OUTPUT', () => {
  const outputPath = createOutputPath();
  const result = runCli(
    [
      '--e2eSuite=modern',
      '--githubOutput=run_e2e',
      '--base=HEAD',
      '--head=HEAD',
    ],
    { ...process.env, GITHUB_OUTPUT: outputPath },
  );

  assert.equal(result.status, 0);
  assert.equal(readFileSync(outputPath, 'utf8'), 'run_e2e=true\n');
});

test('writes all fail-open decisions as one JSON output', () => {
  const outputPath = createOutputPath();
  const result = runCli(
    ['--githubOutputAll=e2e_suites', '--base=HEAD', '--head=HEAD'],
    { ...process.env, GITHUB_OUTPUT: outputPath },
  );

  assert.equal(result.status, 0);
  const output = readFileSync(outputPath, 'utf8').trim();
  const [name, json] = output.split('=', 2);
  assert.equal(name, 'e2e_suites');
  assert.deepEqual(
    JSON.parse(json),
    Object.fromEntries(Object.keys(E2E_SUITES).map((suite) => [suite, true])),
  );
});

function runCli(args, env = process.env) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env,
  });
}

function createOutputPath() {
  return join(mkdtempSync(join(tmpdir(), 'ci-is-affected-')), 'output');
}

function createHelpersReturning(result) {
  return createLocalE2EHelpers({
    formatExit: ({ code }) => `code ${code}`,
    runCommand: async () => result,
    runPackagesBuild: async () => {},
    step: (label, run) => ({ label, run }),
  });
}
