# Rstest Federation Example E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real example under `apps/` that proves Rstest can execute static and dynamic Module Federation imports, run it in the existing Node E2E suite, and ship PR #4920.

**Architecture:** A private `apps/rstest-federation-e2e` workspace app builds a real CommonJS remote during Rstest global setup and consumes two separate exposures through the documented direct `federation({...})` API. The existing Node E2E suite selects and runs the app through Turbo; focused package coverage remains unchanged.

**Tech Stack:** Node.js 24, pnpm 10.28.0, Turborepo, Rstest 0.11.4+, Rsbuild/Rspack, `@module-federation/rstest`, GitHub Actions.

## Global Constraints

- Work only in `/fast/projects/core/.worktrees/rstest-auto-enable` on `codex/rstest-auto-enable`.
- Preserve all existing package-level Rstest tests; the app is complementary coverage.
- Use one private workspace package named exactly `rstest-federation-e2e`.
- Use the direct `federation({ name, remotes })` API with no manual Rstest `federation: true`, host runtime plugin, library type, remote type, or async-startup override.
- Build a real CommonJS remote during global setup and remove generated output during teardown.
- Use separate `./static-value` and `./dynamic-value` exposures with distinct literal results.
- Reuse the existing Node E2E workflow and generic Turbo `e2e` task; do not add a root task or a new workflow.
- Follow strict red-green TDD for both the app behavior and CI selection.
- Use pnpm only and update `pnpm-lock.yaml` through `pnpm install`.
- Do not merge until local verification passes, the pushed head is green, review threads are resolved, and branch protection is satisfied.

---

## File Map

**Create**

- `apps/rstest-federation-e2e/package.json` — private workspace app metadata and `e2e` task.
- `apps/rstest-federation-e2e/rstest.config.ts` — public plugin configuration and global setup.
- `apps/rstest-federation-e2e/remote/build-remote.ts` — real Rspack compiler lifecycle and cleanup.
- `apps/rstest-federation-e2e/remote/entry.js` — empty remote entry module.
- `apps/rstest-federation-e2e/remote/static-value.js` — statically imported exposure.
- `apps/rstest-federation-e2e/remote/dynamic-value.js` — dynamically imported exposure.
- `apps/rstest-federation-e2e/tests/static-remote.test.ts` — static federation assertion.
- `apps/rstest-federation-e2e/tests/dynamic-remote.test.ts` — dynamic federation assertion.

**Modify**

- `pnpm-lock.yaml` — register the new workspace package.
- `tools/scripts/ci-e2e-suites.mjs` — include the app in the Node suite.
- `tools/scripts/ci-is-affected.test.mjs` — prove affected selection.
- `tools/scripts/run-node-e2e.mjs` — execute both Node E2E test packages.

---

### Task 1: Build the self-contained Rstest federation example

**Files:**

- Create: `apps/rstest-federation-e2e/package.json`
- Create: `apps/rstest-federation-e2e/rstest.config.ts`
- Create: `apps/rstest-federation-e2e/remote/build-remote.ts`
- Create: `apps/rstest-federation-e2e/remote/entry.js`
- Create: `apps/rstest-federation-e2e/remote/static-value.js`
- Create: `apps/rstest-federation-e2e/remote/dynamic-value.js`
- Create: `apps/rstest-federation-e2e/tests/static-remote.test.ts`
- Create: `apps/rstest-federation-e2e/tests/dynamic-remote.test.ts`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: built workspace packages `@module-federation/rstest`, `@module-federation/enhanced`, and `@module-federation/node`.
- Produces: workspace package `rstest-federation-e2e` with `e2e` script.
- Produces: remote exposures `fixture-remote/static-value` and `fixture-remote/dynamic-value`.

- [ ] **Step 1: Create the private app package**

Create `apps/rstest-federation-e2e/package.json`:

```json
{
  "name": "rstest-federation-e2e",
  "private": true,
  "description": "Rstest Module Federation end-to-end example.",
  "scripts": {
    "e2e": "pnpm exec rstest run -c rstest.config.ts"
  },
  "devDependencies": {
    "@module-federation/enhanced": "workspace:*",
    "@module-federation/node": "workspace:*",
    "@module-federation/rstest": "workspace:*",
    "@rsbuild/core": "2.1.4",
    "@rstest/core": "^0.11.4"
  }
}
```

- [ ] **Step 2: Create the real remote builder**

Create `apps/rstest-federation-e2e/remote/build-remote.ts`:

```ts
import { rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { rspack, type Rspack } from '@rsbuild/core';

const require = createRequire(import.meta.url);
const remoteDirectory = import.meta.dirname;
const outputDirectory = path.resolve(remoteDirectory, 'dist');

const runCompiler = async (compiler: Rspack.Compiler): Promise<void> => {
  try {
    await new Promise<void>((resolve, reject) => {
      compiler.run((error, stats) => {
        if (error) {
          reject(error);
          return;
        }
        if (!stats || stats.hasErrors()) {
          reject(
            new Error(
              stats?.toString({ all: false, errors: true }) ??
                'Rspack completed without stats.',
            ),
          );
          return;
        }
        resolve();
      });
    });
  } finally {
    await new Promise<void>((resolve, reject) => {
      compiler.close((error) => (error ? reject(error) : resolve()));
    });
  }
};

export const setup = async (): Promise<void> => {
  await rm(outputDirectory, { force: true, recursive: true });

  const compiler = rspack({
    context: remoteDirectory,
    entry: './entry.js',
    mode: 'development',
    output: {
      chunkFilename: '[name].cjs',
      filename: '[name].cjs',
      path: outputDirectory,
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'rstest_fixture_remote',
        filename: 'remoteEntry.cjs',
        library: { type: 'commonjs-module' },
        exposes: {
          './dynamic-value': './dynamic-value.js',
          './static-value': './static-value.js',
        },
        dts: false,
        manifest: false,
        dev: false,
        runtimePlugins: [
          require.resolve('@module-federation/node/runtimePlugin'),
        ],
        experiments: {
          asyncStartup: true,
          optimization: { target: 'node' },
        },
      }),
    ],
    target: 'async-node',
  });

  try {
    await runCompiler(compiler);
  } catch (error) {
    await rm(outputDirectory, { force: true, recursive: true });
    throw error;
  }
};

export const teardown = async (): Promise<void> => {
  await rm(outputDirectory, { force: true, recursive: true });
};
```

- [ ] **Step 3: Create distinct remote modules and tests**

Create `remote/entry.js`:

```js
export {};
```

Create `remote/static-value.js`:

```js
export default function getStaticValue() {
  return 'static value from the Rstest federation remote';
}
```

Create `remote/dynamic-value.js`:

```js
export default function getDynamicValue() {
  return 'dynamic value from the Rstest federation remote';
}
```

Create `tests/static-remote.test.ts`:

```ts
import { expect, it } from '@rstest/core';
import getStaticValue from 'fixture-remote/static-value';

it('loads a real federated exposure through a static import', () => {
  expect(getStaticValue()).toBe(
    'static value from the Rstest federation remote',
  );
});
```

Create `tests/dynamic-remote.test.ts`:

```ts
import { expect, it } from '@rstest/core';

it('loads a different real federated exposure through a dynamic import', async () => {
  const remote = await import('fixture-remote/dynamic-value');

  expect(remote.default()).toBe(
    'dynamic value from the Rstest federation remote',
  );
});
```

- [ ] **Step 4: Create the initial config without the plugin**

Create `rstest.config.ts` with the real setup and tests but intentionally omit `plugins`:

```ts
import path from 'node:path';
import { defineConfig } from '@rstest/core';

const appDirectory = import.meta.dirname;

export default defineConfig({
  globalSetup: [path.resolve(appDirectory, 'remote/build-remote.ts')],
  include: [path.resolve(appDirectory, 'tests/*.test.ts')],
  testEnvironment: 'node',
  testTimeout: 30_000,
});
```

- [ ] **Step 5: Install and verify the behavioral test is red**

Run:

```bash
pnpm install --frozen-lockfile
```

Expected: FAIL because the new workspace package is absent from the frozen lockfile.

Run:

```bash
pnpm install
pnpm run build:packages
pnpm --filter rstest-federation-e2e run e2e
```

Expected: the E2E command FAILS resolving `fixture-remote/static-value` or `fixture-remote/dynamic-value`, proving the tests require federation wiring.

- [ ] **Step 6: Add the minimum direct plugin configuration**

Update `rstest.config.ts`:

```ts
import path from 'node:path';
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';

const appDirectory = import.meta.dirname;

export default defineConfig({
  globalSetup: [path.resolve(appDirectory, 'remote/build-remote.ts')],
  include: [path.resolve(appDirectory, 'tests/*.test.ts')],
  testEnvironment: 'node',
  testTimeout: 30_000,
  plugins: [
    federation({
      name: 'rstest_e2e_host',
      remotes: {
        'fixture-remote': `commonjs ${path.resolve(
          appDirectory,
          'remote/dist/remoteEntry.cjs',
        )}`,
      },
    }),
  ],
});
```

- [ ] **Step 7: Verify the app is green**

Run:

```bash
pnpm --filter rstest-federation-e2e run e2e
```

Expected: 2 test files and 2 tests pass with no unresolved import, compiler, or teardown errors.

- [ ] **Step 8: Commit Task 1**

```bash
git add apps/rstest-federation-e2e pnpm-lock.yaml
git commit -m "test(rstest): add federation e2e example"
```

---

### Task 2: Wire the example into Node E2E selection and execution

**Files:**

- Modify: `tools/scripts/ci-is-affected.test.mjs`
- Modify: `tools/scripts/ci-e2e-suites.mjs`
- Modify: `tools/scripts/run-node-e2e.mjs`

**Interfaces:**

- Consumes: Task 1 workspace package `rstest-federation-e2e#e2e`.
- Produces: Node suite selection for the affected app.
- Produces: one Turbo E2E command that runs `node-host-e2e` and `rstest-federation-e2e`.

- [ ] **Step 1: Add a failing CI-selection test**

Add to `tools/scripts/ci-is-affected.test.mjs`:

```js
test('maps the Rstest federation example only to the Node E2E suite', () => {
  const decisions = computeE2ESuiteDecisions({
    affectedPackageNames: new Set(['rstest-federation-e2e']),
    changedFiles: ['apps/rstest-federation-e2e/rstest.config.ts'],
  });

  assert.deepEqual(
    Object.entries(decisions)
      .filter(([, shouldRun]) => shouldRun)
      .map(([suiteName]) => suiteName),
    ['node'],
  );
});
```

- [ ] **Step 2: Verify CI selection is red**

Run:

```bash
node --test tools/scripts/ci-is-affected.test.mjs
```

Expected: FAIL because `rstest-federation-e2e` is not in the Node suite.

- [ ] **Step 3: Register the app in the Node suite**

Add the exact package name to `E2E_SUITE_DEFINITIONS.node.appNames` in `tools/scripts/ci-e2e-suites.mjs`:

```js
'rstest-federation-e2e',
```

- [ ] **Step 4: Run both Node E2E test packages**

Update `E2E_CMD` in `tools/scripts/run-node-e2e.mjs`:

```js
const E2E_CMD = [
  'pnpm',
  'exec',
  'turbo',
  'run',
  'e2e',
  '--filter=node-host-e2e',
  '--filter=rstest-federation-e2e',
  '--only',
];
```

- [ ] **Step 5: Verify CI selection is green**

Run:

```bash
node --test tools/scripts/ci-is-affected.test.mjs
```

Expected: all tests pass.

- [ ] **Step 6: Verify the combined Turbo target**

Run:

```bash
pnpm exec turbo run e2e --filter=rstest-federation-e2e --only --force
```

Expected: the app's 2 tests pass.

- [ ] **Step 7: Commit Task 2**

```bash
git add tools/scripts/ci-is-affected.test.mjs tools/scripts/ci-e2e-suites.mjs tools/scripts/run-node-e2e.mjs
git commit -m "ci(rstest): run federation example in node e2e"
```

---

### Task 3: Validate, review, push, and merge

**Files:**

- Verify: all files changed by Tasks 1 and 2 and the full PR diff.
- Modify only if verification or review finds a scoped defect.

**Interfaces:**

- Consumes: the complete Task 1 and Task 2 commits.
- Produces: green local verification, pushed PR head, green GitHub checks, and merged PR #4920.

- [ ] **Step 1: Run focused app and package verification**

```bash
pnpm --filter rstest-federation-e2e run e2e
pnpm --filter @module-federation/rstest run build
pnpm --filter @module-federation/rstest run test
pnpm --filter @module-federation/rstest run lint
```

Expected: every command exits 0.

- [ ] **Step 2: Run format and CI-selection verification**

```bash
pnpm exec prettier --check .
node --test tools/scripts/ci-is-affected.test.mjs
```

Expected: both commands exit 0.

- [ ] **Step 3: Run Node E2E CI parity**

```bash
pnpm run ci:local --only=e2e-node
```

Expected: the affected gate selects the Node suite and the existing topology plus the new Rstest app pass.

- [ ] **Step 4: Run package CI parity**

```bash
pnpm run ci:local --only=build-and-test
```

Expected: install, format, affected-policy tests, Turbo checks, package builds, Publint, and affected package tests pass.

- [ ] **Step 5: Review the final branch**

```bash
git status --short --branch
git diff --check origin/main...HEAD
git diff --stat origin/main...HEAD
gh pr checks 4920 --repo module-federation/core --json name,bucket,state,workflow,link
```

Expected: clean worktree, no whitespace errors, intended diff only, and no untriaged local/GitHub failure.

- [ ] **Step 6: Push and wait for current-head checks**

```bash
git push origin codex/rstest-auto-enable
```

Recheck PR head, unresolved review threads, review decision, mergeability, and checks until the pushed SHA is green or a real blocker is identified.

- [ ] **Step 7: Merge PR #4920**

Use the repository-supported merge method only after branch protection is satisfied. Do not bypass protection or merge with pending/failing checks.

- [ ] **Step 8: Confirm merged state**

```bash
gh pr view 4920 --repo module-federation/core --json state,mergedAt,mergeCommit,url
```

Expected: `state` is `MERGED` with non-null `mergedAt` and `mergeCommit`.
