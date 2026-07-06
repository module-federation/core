# Jest Migration Deltas

Use this reference when the current framework is Jest.

## Source of truth

Use the official guide for exact field/API mappings:

https://rstest.rs/guide/migration/jest.md

When local docs are available, prefer the checked-out source, for example `website/docs/en/guide/migration/jest.mdx`.

## High-signal deltas

- Scripts: `jest` -> `rstest`; `--watch` / `--watchAll` -> `rstest --watch`; `--runInBand` -> `--pool.maxWorkers 1` only when supported, otherwise config `pool.maxWorkers: 1`; Jest `-w` means workers, but Rstest `-w` means watch.
- Config: create `rstest.config.ts` with `defineConfig` from `@rstest/core`. Map every important Jest field through the official guide; do not silently drop unknown fields.
- Transforms: remove `preset`, `ts-jest`, and most `transform` config where possible. Rstest uses SWC by default; use version-supported SWC/output/Rsbuild plugin config only when needed.
- Setup: merge Jest `setupFiles` and `setupFilesAfterEnv` into Rstest `setupFiles` because Rstest setup runs after framework registration.
- Globals/APIs: `@jest/globals` -> `@rstest/core`; `jest.<api>` -> `rs.<api>`. If globals remain, set `globals: true` and add `@rstest/core/globals` types.
- Async tests: `done` callback tests are unsupported; convert to Promise or `async` / `await`.
- Hooks: `beforeEach` / `beforeAll` return values are cleanup functions in Rstest. Wrap setup-only arrow expressions in braces when needed.
- Environment: `testEnvironmentOptions` becomes `testEnvironment: { name, options }`. File-level env comments are latest-only; older targets should split env-specific files into config/projects.
- CJS mocking: use `rs.mockRequire()` for code paths using `require()`.
- Coverage: install a Rstest provider supported by the target version. Jest `babel` maps to Istanbul; Jest `v8` maps to V8 only when the `dependency-install-gate.md` capability gate allows it.

## Jest-specific enforcement

1. Delete scope-local `jest.config.*`, `jest.setup.*`, and companion `jest.*.ts` only after the migrated scope is green. Drop shared Jest devDeps only after no scope still uses Jest.
2. Defer snapshot re-recording until all non-snapshot failures are fixed. Jest `:` snapshot key separators become Rstest `>`, so early `rstest -u` creates noisy churn.
3. Review snapshot diffs by body, not key churn. Separator-only key renames are formatting; body changes are behavior signals.
