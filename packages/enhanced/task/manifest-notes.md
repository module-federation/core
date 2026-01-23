# Manifest Notes (Sharded Request)

# Request Parts Index

Source: task/request.md
Total lines: 141
Total parts: 1

Each part is a slice of the original request. Line ranges are 1-based and inclusive.

- task/request.md (lines 1-141): request

## Part Notes

## Part: task/request.md
Lines: 1-141
- "migrate the enhanced package tests from Jest to Rstest."
- "All enhanced package tests run under Rstest via `enhanced:rstest`."
- "Nx target `enhanced:test` uses Rstest and no longer depends on Jest/Vitest."
- "Jest-only helpers/configs in `packages/enhanced` are removed or unused."
- "Switch `packages/enhanced/project.json` `test` target to Rstest: `rstest run -c packages/enhanced/rstest.config.ts` (match CLI usage)."
- "Replace or remove `test:jest` and `test:experiments` targets, or rewrite them as Rstest equivalents (for example, separate includes/projects)."
- "Keep `enhanced:rstest` in the root `package.json` as the user-facing entry point and ensure it uses `rstest run` (or `rstest`) consistently."
- "Include unit and compiler tests (not just ConfigTestCases): `test/**/*.test.ts`, `test/**/*.spec.ts`, `test/**/*.rstest.ts` (keep existing Rstest cases)"
- "Exclude non-Rstest variants to prevent duplicate runs: `test/**/*.vitest.ts`, `test/**/*.basictest.js` (Jest-only), `test/**/*.embedruntime.js` (Jest-only)"
- "Consider Rstest `projects` to separate long-running config-case tests from fast unit tests (different `testTimeout`, `include`, etc)."
- "Add `setupFiles` to reapply `test/setupTestFramework.js` logic (custom matchers and debug hooks)."
- "If cleaning `packages/enhanced/test/js` is still required, move it to `globalSetup` or a pretest script instead of Jest config."
- "Map Jest-only APIs to Rstest equivalents" with core mappings including "`jest.fn` -> `rs.fn` (from `@rstest/core`)", "`jest.spyOn` -> `rs.spyOn`", "`jest.mock` -> `rs.mock`", and "`jest.requireActual` -> `await rs.importActual(...)`".
- "Known gaps to rework: `jest.isolateModules` has no direct Rstest equivalent; use `rs.resetModules` + dynamic `import()` and refactor those tests."
- "Rstest does not support `done` callbacks in tests. Convert to async/Promise style (return a Promise or `async` function)."
- "Decide between explicit imports (`import { describe, it, expect, rs }`) vs `globals: true`. The current `rstest.config.ts` uses `globals: true`."
- "If keeping globals, update `packages/enhanced/tsconfig.spec.json` to include `@rstest/core/globals` and remove `jest` types."
- "Replace `jest.Mock`, `jest.MockedFunction`, etc. with Rstest types (`Mock`, `MockInstance`) from `@rstest/core`."
- "Drop or ignore `packages/enhanced/jest.config.ts`, `packages/enhanced/jest.embed.ts`, and `packages/enhanced/test/patch-node-env.js` once no tests rely on them."
- "Rework `packages/enhanced/test/helpers/createLazyTestEnv.js`, which depends on `JEST_STATE_SYMBOL`."
- "Run `pnpm enhanced:rstest` and check for parity with the old Jest suite."
- "Use `rstest list --filesOnly -c packages/enhanced/rstest.config.ts` to verify include/exclude patterns."
