# Rsbuild Rstest Federation Apps E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real Rsbuild host and remote apps whose application source is tested end to end with Rstest federation, wire them into the existing Node E2E suite, and ship PR #4920.

**Architecture:** Two private top-level vanilla TypeScript Rsbuild apps mirror the repository's create-module-federation consumer/provider template structure. Turbo builds a Node-target CommonJS federation remote, then Rstest compiles and executes host application functions that use separate static and dynamic remote imports; no browser automation or server is involved.

**Tech Stack:** Node.js 24, pnpm 10.28.0, Turborepo, Rsbuild 2.1.4, Rstest 0.11.4+, `@module-federation/rsbuild-plugin`, and `@module-federation/rstest`.

## Global Constraints

- Work only in `/fast/projects/core/.worktrees/rstest-auto-enable` on branch `codex/rstest-auto-enable`; abort if either differs.
- Use only Luna and Terra implementation agents, with the primary agent reviewing and verifying their work.
- Preserve all existing `packages/rstest` tests; the apps add complementary E2E coverage.
- Create exactly two private top-level workspace apps: `rstest-federation-host` and `rstest-federation-remote`.
- Model the apps after `packages/create-module-federation/templates/consumer-rsbuild-ts` and `provider-rsbuild-ts`, simplified to vanilla TypeScript.
- Build the remote through Rsbuild's Node target to `apps/rstest-federation-remote/dist/remoteEntry.cjs`.
- Share one host federation options object between `rsbuild.config.ts` and `rstest.config.ts`.
- In Rstest, use `federation(hostFederationOptions)` with no manual top-level `federation: true`, host runtime plugin, library type, remote type, or async-startup override.
- Use different `./static-value` and `./dynamic-value` exposures with distinct literal return values.
- Rstest is the E2E runner. Do not add Playwright, Cypress, browser automation, React, HTML, a dev server, or port management.
- Reuse the existing Node E2E workflow and generic Turbo tasks; do not add a root task or new workflow.
- Follow red-green TDD for app behavior and CI selection.
- Update `pnpm-lock.yaml` with pnpm only.
- Do not merge until local verification passes, the pushed head is green, review threads are resolved, and branch protection is satisfied.

---

## File Map

**Create**

- `apps/rstest-federation-remote/package.json`
- `apps/rstest-federation-remote/module-federation.config.ts`
- `apps/rstest-federation-remote/rsbuild.config.ts`
- `apps/rstest-federation-remote/src/index.ts`
- `apps/rstest-federation-remote/src/static-value.ts`
- `apps/rstest-federation-remote/src/dynamic-value.ts`
- `apps/rstest-federation-host/package.json`
- `apps/rstest-federation-host/module-federation.config.ts`
- `apps/rstest-federation-host/rsbuild.config.ts`
- `apps/rstest-federation-host/rstest.config.ts`
- `apps/rstest-federation-host/src/index.ts`
- `apps/rstest-federation-host/tests/static-remote.test.ts`
- `apps/rstest-federation-host/tests/dynamic-remote.test.ts`

**Modify**

- `pnpm-lock.yaml`
- `tools/scripts/ci-e2e-suites.mjs`
- `tools/scripts/ci-is-affected.test.mjs`
- `tools/scripts/run-node-e2e.mjs`

---

### Task 1: Build the Rsbuild host/remote apps and Rstest E2E

**Files:**

- Create all files under `apps/rstest-federation-remote/`
- Create all files under `apps/rstest-federation-host/`
- Modify `pnpm-lock.yaml`

**Interfaces:**

- Produces `rstest-federation-remote#build`, emitting `dist/remoteEntry.cjs`.
- Produces `rstest-federation-host#e2e`, running two Rstest federation tests.
- The host declares `rstest-federation-remote: workspace:*`, so Turbo's `e2e` dependency graph builds the remote first.

- [ ] **Step 1: Verify the exact worktree**

Run:

```bash
pwd -P
git branch --show-current
git status --short --branch
```

Expected: `/fast/projects/core/.worktrees/rstest-auto-enable`, branch `codex/rstest-auto-enable`, no unrelated changes.

- [ ] **Step 2: Create the remote Rsbuild package and options**

Create `apps/rstest-federation-remote/package.json`:

```json
{
  "name": "rstest-federation-remote",
  "version": "0.0.0",
  "private": true,
  "description": "Rsbuild remote for Rstest federation E2E.",
  "scripts": {
    "build": "rsbuild build --environment node"
  },
  "devDependencies": {
    "@module-federation/node": "workspace:*",
    "@module-federation/rsbuild-plugin": "workspace:*",
    "@rsbuild/core": "2.1.4",
    "typescript": "6.0.3"
  }
}
```

Create `apps/rstest-federation-remote/module-federation.config.ts`:

```ts
import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

export default createModuleFederationConfig({
  name: 'rstest_federation_remote',
  filename: 'remoteEntry.cjs',
  exposes: {
    './dynamic-value': './src/dynamic-value.ts',
    './static-value': './src/static-value.ts',
  },
  dts: false,
  manifest: false,
  dev: false,
});
```

- [ ] **Step 3: Create the remote Rsbuild config and source**

Create `apps/rstest-federation-remote/rsbuild.config.ts`:

```ts
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import federationOptions from './module-federation.config';

export default defineConfig({
  environments: {
    node: {
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        cleanDistPath: true,
        distPath: {
          root: 'dist',
        },
        target: 'node',
      },
    },
  },
  plugins: [
    pluginModuleFederation(federationOptions, {
      environment: 'node',
      target: 'node',
    }),
  ],
});
```

Create `src/index.ts`:

```ts
export {};
```

Create `src/static-value.ts`:

```ts
export default function getStaticValue(): string {
  return 'static value from the Rsbuild federation remote';
}
```

Create `src/dynamic-value.ts`:

```ts
export default function getDynamicValue(): string {
  return 'dynamic value from the Rsbuild federation remote';
}
```

- [ ] **Step 4: Create the host package and shared options**

Create `apps/rstest-federation-host/package.json`:

```json
{
  "name": "rstest-federation-host",
  "version": "0.0.0",
  "private": true,
  "description": "Rsbuild host tested through Rstest federation E2E.",
  "scripts": {
    "build": "rsbuild build --environment node",
    "e2e": "pnpm exec rstest run -c rstest.config.ts"
  },
  "devDependencies": {
    "@module-federation/rsbuild-plugin": "workspace:*",
    "@module-federation/rstest": "workspace:*",
    "@rsbuild/core": "2.1.4",
    "@rstest/core": "^0.11.4",
    "rstest-federation-remote": "workspace:*",
    "typescript": "6.0.3"
  }
}
```

Create `apps/rstest-federation-host/module-federation.config.ts`:

```ts
import path from 'node:path';
import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

const remoteEntryPath = path.resolve(
  import.meta.dirname,
  '../rstest-federation-remote/dist/remoteEntry.cjs',
);

export default createModuleFederationConfig({
  name: 'rstest_federation_host',
  remotes: {
    rstestRemote: `commonjs ${remoteEntryPath}`,
  },
  dts: false,
  manifest: false,
  dev: false,
});
```

- [ ] **Step 5: Create the host Rsbuild config and application source**

Create `apps/rstest-federation-host/rsbuild.config.ts`:

```ts
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import federationOptions from './module-federation.config';

export default defineConfig({
  environments: {
    node: {
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        cleanDistPath: true,
        distPath: {
          root: 'dist',
        },
        target: 'node',
      },
    },
  },
  plugins: [
    pluginModuleFederation(federationOptions, {
      environment: 'node',
      target: 'node',
    }),
  ],
});
```

Create `apps/rstest-federation-host/src/index.ts`:

```ts
import getStaticValue from 'rstestRemote/static-value';

export const readStaticRemote = (): string => getStaticValue();

export const readDynamicRemote = async (): Promise<string> => {
  const remote = await import('rstestRemote/dynamic-value');

  return remote.default();
};
```

- [ ] **Step 6: Create the application-level Rstest assertions**

Create `apps/rstest-federation-host/tests/static-remote.test.ts`:

```ts
import { expect, it } from '@rstest/core';
import { readStaticRemote } from '../src/index';

it('executes a static federated import from the Rsbuild host app', () => {
  expect(readStaticRemote()).toBe(
    'static value from the Rsbuild federation remote',
  );
});
```

Create `apps/rstest-federation-host/tests/dynamic-remote.test.ts`:

```ts
import { expect, it } from '@rstest/core';
import { readDynamicRemote } from '../src/index';

it('executes a dynamic federated import from the Rsbuild host app', async () => {
  await expect(readDynamicRemote()).resolves.toBe(
    'dynamic value from the Rsbuild federation remote',
  );
});
```

- [ ] **Step 7: Create the initial Rstest config without federation**

Create `apps/rstest-federation-host/rstest.config.ts`:

```ts
import path from 'node:path';
import { defineConfig } from '@rstest/core';

const appDirectory = import.meta.dirname;

export default defineConfig({
  include: [path.resolve(appDirectory, 'tests/*.test.ts')],
  testEnvironment: 'node',
  testTimeout: 30_000,
});
```

- [ ] **Step 8: Update the workspace lock and prove the test is red**

Run:

```bash
pnpm install
pnpm run build:packages
pnpm exec turbo run e2e --filter=rstest-federation-host --force
```

Expected: Turbo builds `rstest-federation-remote`; the host E2E then fails resolving `rstestRemote/static-value` or `rstestRemote/dynamic-value` because the Rstest plugin is absent.

- [ ] **Step 9: Add the minimum Rstest federation plugin**

Replace `rstest.config.ts` with:

```ts
import path from 'node:path';
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';
import federationOptions from './module-federation.config';

const appDirectory = import.meta.dirname;

export default defineConfig({
  include: [path.resolve(appDirectory, 'tests/*.test.ts')],
  testEnvironment: 'node',
  testTimeout: 30_000,
  plugins: [federation(federationOptions)],
});
```

- [ ] **Step 10: Prove the app E2E is green**

Run:

```bash
pnpm exec turbo run e2e --filter=rstest-federation-host --force
```

Expected: remote build passes; 2 Rstest files and 2 tests pass.

- [ ] **Step 11: Commit Task 1**

```bash
git add apps/rstest-federation-host apps/rstest-federation-remote pnpm-lock.yaml
git commit -m "test(rstest): add rsbuild federation e2e apps"
```

---

### Task 2: Select and run the Rstest apps in Node E2E CI

**Files:**

- Modify `tools/scripts/ci-is-affected.test.mjs`
- Modify `tools/scripts/ci-e2e-suites.mjs`
- Modify `tools/scripts/run-node-e2e.mjs`

**Interfaces:**

- Consumes `rstest-federation-host#e2e` and `rstest-federation-remote#build`.
- Produces Node suite affected selection for both apps.
- Runs the Rstest-only app E2E before the existing server-based Node topology.

- [ ] **Step 1: Add a failing affected-selection test**

Add:

```js
test('maps the Rstest federation apps only to the Node E2E suite', () => {
  for (const appName of [
    'rstest-federation-host',
    'rstest-federation-remote',
  ]) {
    const decisions = computeE2ESuiteDecisions({
      affectedPackageNames: new Set([appName]),
      changedFiles: [`apps/${appName}/package.json`],
    });

    assert.deepEqual(
      Object.entries(decisions)
        .filter(([, shouldRun]) => shouldRun)
        .map(([suiteName]) => suiteName),
      ['node'],
    );
  }
});
```

- [ ] **Step 2: Prove affected selection is red**

Run:

```bash
node --test tools/scripts/ci-is-affected.test.mjs
```

Expected: FAIL because neither app is registered in the Node suite.

- [ ] **Step 3: Register both apps**

Add to `E2E_SUITE_DEFINITIONS.node.appNames`:

```js
'rstest-federation-host',
'rstest-federation-remote',
```

- [ ] **Step 4: Add the Rstest E2E command to the Node runner**

Add near the existing `E2E_CMD`:

```js
const RSTEST_E2E_CMD = [
  'pnpm',
  'exec',
  'turbo',
  'run',
  'e2e',
  '--filter=rstest-federation-host',
  '--force',
];
```

At the start of `main()`, before port cleanup or server startup, add:

```js
console.log('\n[node-e2e] Running Rstest federation app E2E');
await spawnWithPromise(RSTEST_E2E_CMD[0], RSTEST_E2E_CMD.slice(1)).promise;
```

Do not add `--only`; the generic Turbo `e2e` task must build the remote dependency.

- [ ] **Step 5: Prove affected selection is green**

Run:

```bash
node --test tools/scripts/ci-is-affected.test.mjs
```

Expected: all tests pass.

- [ ] **Step 6: Prove the runner's Rstest command is green**

Run:

```bash
pnpm exec turbo run e2e --filter=rstest-federation-host --force
```

Expected: the remote build and two Rstest E2E tests pass without Playwright, Cypress, ports, or servers.

- [ ] **Step 7: Commit Task 2**

```bash
git add tools/scripts/ci-is-affected.test.mjs tools/scripts/ci-e2e-suites.mjs tools/scripts/run-node-e2e.mjs
git commit -m "ci(rstest): run rsbuild apps in node e2e"
```

---

### Task 3: Verify, review, push, and merge

**Files:** Verify the complete PR diff; modify only for scoped defects found by tests or review.

- [ ] **Step 1: Run focused verification**

```bash
pnpm exec turbo run e2e --filter=rstest-federation-host --force
pnpm --filter @module-federation/rstest run build
pnpm --filter @module-federation/rstest run test
pnpm --filter @module-federation/rstest run lint
node --test tools/scripts/ci-is-affected.test.mjs
pnpm exec prettier --check .
```

Expected: every command exits 0.

- [ ] **Step 2: Run Node E2E CI parity**

```bash
pnpm run ci:local --only=e2e-node
```

Expected: the Rstest app E2E and existing Node topology both pass.

- [ ] **Step 3: Run package CI parity**

```bash
pnpm run ci:local --only=build-and-test
```

Expected: install, format, CI policy tests, Turbo checks, package builds, Publint, and affected package tests pass.

- [ ] **Step 4: Final review**

```bash
git status --short --branch
git diff --check origin/main...HEAD
git diff --stat origin/main...HEAD
gh pr checks 4920 --repo module-federation/core --json name,bucket,state,workflow,link
```

Expected: clean worktree, intended diff only, and no untriaged failure.

- [ ] **Step 5: Push**

```bash
git push origin codex/rstest-auto-enable
```

- [ ] **Step 6: Wait for current-head GitHub checks and review protection**

Recheck head SHA, unresolved review threads, review decision, mergeability, and checks until green or a real blocker is proven.

- [ ] **Step 7: Merge PR #4920 without bypassing protection**

Use the repository-supported merge method only after protection is satisfied.

- [ ] **Step 8: Confirm**

```bash
gh pr view 4920 --repo module-federation/core --json state,mergedAt,mergeCommit,url
```

Expected: `MERGED`, with non-null merge timestamp and commit.
