# Rstest migration plan for packages/enhanced

This document captures the work needed to migrate the enhanced package tests
from Jest to Rstest. It is written against the current repo state and the
Rstest docs listed in the references section.

## Current state
- Jest configs are in `packages/enhanced/jest.config.ts` and
  `packages/enhanced/jest.embed.ts`, with Nx targets `test:jest` and
  `test:experiments` in `packages/enhanced/project.json`.
- The default `enhanced:test` target runs Vitest via
  `packages/enhanced/vitest.config.ts`.
- Rstest is already wired in `packages/enhanced/rstest.config.ts`, but only
  includes `test/ConfigTestCases.*.rstest.ts` files.
- Many unit and compiler tests under `packages/enhanced/test/**` are Jest-only
  (global `jest`, `jest.mock`, `jest.fn`, callback-style `done`, etc).

## Target state
- All enhanced package tests run under Rstest via `enhanced:rstest`.
- Nx target `enhanced:test` uses Rstest and no longer depends on Jest/Vitest.
- Jest-only helpers/configs in `packages/enhanced` are removed or unused.

## Work items

### 1) Update scripts and Nx targets
- Switch `packages/enhanced/project.json` `test` target to Rstest:
  `rstest run -c packages/enhanced/rstest.config.ts` (match CLI usage).
- Replace or remove `test:jest` and `test:experiments` targets, or rewrite
  them as Rstest equivalents (for example, separate includes/projects).
- Keep `enhanced:rstest` in the root `package.json` as the user-facing entry
  point and ensure it uses `rstest run` (or `rstest`) consistently.

### 2) Expand `rstest.config.ts` coverage
- Include unit and compiler tests (not just ConfigTestCases):
  - `test/**/*.test.ts`
  - `test/**/*.spec.ts`
  - `test/**/*.rstest.ts` (keep existing Rstest cases)
- Exclude non-Rstest variants to prevent duplicate runs:
  - `test/**/*.vitest.ts`
  - `test/**/*.basictest.js` (Jest-only)
  - `test/**/*.embedruntime.js` (Jest-only)
- Consider Rstest `projects` to separate long-running config-case tests from
  fast unit tests (different `testTimeout`, `include`, etc).
- Add `setupFiles` to reapply `test/setupTestFramework.js` logic (custom
  matchers and debug hooks).
- If cleaning `packages/enhanced/test/js` is still required, move it to
  `globalSetup` or a pretest script instead of Jest config.

### 3) Replace Jest APIs in tests
Map Jest-only APIs to Rstest equivalents and update imports where needed.

Core mappings:
- `jest.fn` -> `rs.fn` (from `@rstest/core`)
- `jest.spyOn` -> `rs.spyOn`
- `jest.mock` -> `rs.mock`
- `jest.doMock` -> `rs.doMock`
- `jest.dontMock` -> `rs.unmock` or `rs.doUnmock`
- `jest.resetModules` -> `rs.resetModules` (note: does not clear mocks)
- `jest.clearAllMocks` -> `rs.clearAllMocks`
- `jest.resetAllMocks` -> `rs.resetAllMocks`
- `jest.restoreAllMocks` -> `rs.restoreAllMocks`
- `jest.setTimeout` -> `rs.setConfig({ testTimeout })` or config `testTimeout`
- `jest.requireActual` -> `await rs.importActual(...)` or
  `import ... with { rstest: 'importActual' }`

Known gaps to rework:
- `jest.isolateModules` has no direct Rstest equivalent; use
  `rs.resetModules` + dynamic `import()` and refactor those tests.

Files to review specifically (non-exhaustive):
- `packages/enhanced/test/helpers/webpackMocks.ts`
- `packages/enhanced/test/compiler-unit/**/*.test.ts`
- `packages/enhanced/test/unit/**/*.test.ts`
- `packages/enhanced/test/ConfigTestCases.template.js`
- `packages/enhanced/test/ConfigTestCases.embedruntime.js`
- `packages/enhanced/test/ConfigTestCases.basictest.js`

### 4) Remove callback-style `done` usage
Rstest does not support `done` callbacks in tests. Convert to async/Promise
style (return a Promise or `async` function). Key files include:
- `packages/enhanced/test/warmup-webpack.js`
- `packages/enhanced/test/helpers/expectWarningFactory.js`
- `packages/enhanced/test/compiler-unit/container/HoistContainerReferencesPlugin.test.ts`
- `packages/enhanced/test/ConfigTestCases.template.js` (if still used)

Note: callback-style functions inside config-case bundles are already wrapped
in `packages/enhanced/test/ConfigTestCases.rstest.ts` and do not require
Rstest to support `done`.

### 5) TypeScript types and globals
- Decide between explicit imports (`import { describe, it, expect, rs }`)
  vs `globals: true`. The current `rstest.config.ts` uses `globals: true`.
- If keeping globals, update `packages/enhanced/tsconfig.spec.json` to include
  `@rstest/core/globals` and remove `jest` types.
- Replace `jest.Mock`, `jest.MockedFunction`, etc. with Rstest types
  (`Mock`, `MockInstance`) from `@rstest/core`.

### 6) Remove Jest-only infra
- Drop or ignore `packages/enhanced/jest.config.ts`,
  `packages/enhanced/jest.embed.ts`, and `packages/enhanced/test/patch-node-env.js`
  once no tests rely on them.
- Rework `packages/enhanced/test/helpers/createLazyTestEnv.js`, which depends on
  `JEST_STATE_SYMBOL`. Prefer avoiding this helper under Rstest or implement a
  Rstest-native alternative if still needed.

### 7) Verify behavior and parity
- Run `pnpm enhanced:rstest` and check for parity with the old Jest suite.
- Use `rstest list --filesOnly -c packages/enhanced/rstest.config.ts` to verify
  include/exclude patterns.
- Validate that custom matchers in `test/setupTestFramework.js` still work with
  Rstest's `expect.extend`.

## Suggested file-level checklist
- `packages/enhanced/project.json`: update `test` target and pre-release steps.
- `packages/enhanced/rstest.config.ts`: include patterns, setupFiles,
  globalSetup, timeouts.
- `packages/enhanced/tsconfig.spec.json`: replace Jest types with Rstest types.
- `packages/enhanced/test/setupTestFramework.js`: ensure compatibility with
  Rstest (no `done` usage).
- `packages/enhanced/test/helpers/webpackMocks.ts`: replace Jest mocks.
- `packages/enhanced/test/unit/**`: replace Jest APIs and types.
- `packages/enhanced/test/compiler-unit/**`: replace Jest APIs and types.

## References (Rstest docs)
- https://rstest.rs/llms.txt
- https://rstest.rs/guide/migration/jest.md
- https://rstest.rs/guide/basic/cli.md
- https://rstest.rs/guide/basic/configure-rstest.md
- https://rstest.rs/guide/basic/projects.md
- https://rstest.rs/config/test/include.md
- https://rstest.rs/config/test/setup-files.md
- https://rstest.rs/config/test/global-setup.md
- https://rstest.rs/config/test/globals.md
- https://rstest.rs/config/test/test-environment.md
- https://rstest.rs/api/runtime-api/test-api/expect.md
- https://rstest.rs/api/runtime-api/rstest/mock-modules.md
- https://rstest.rs/api/runtime-api/rstest/mock-functions.md
- https://rstest.rs/api/runtime-api/rstest/mock-instance.md
- https://rstest.rs/api/runtime-api/rstest/utilities.md
- https://rstest.rs/api/javascript-api/rstest-core.md
