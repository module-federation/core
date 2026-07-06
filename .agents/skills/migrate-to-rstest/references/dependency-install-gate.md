# Dependency Install Gate

Use this reference when running the dependency install gate step of the migration workflow.

## Quick path

Use the repo's native package manager; do not add a detector package. Pick it from `packageManager`, then lock files (`pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `npm-shrinkwrap.json`, `bun.lock`, `bun.lockb`), then CI/workspace hints.

After adding `@rstest/core`, verify through a local-only path: e.g. `pnpm exec rstest -h`, a migrated test script, or `./node_modules/.bin/rstest -h` for npm-only repos. Avoid commands that can fetch a remote `rstest` package.

## Dependency decisions

Install only what the migrated scope needs: `@rstest/core`, one capability-supported coverage provider if coverage is enabled, and an adapter only when the existing Rsbuild/Rslib/Rspack config and peer ranges support it.

Keep Jest/Vitest and legacy coverage packages until the migrated scope is green. Remove them only during cleanup and only if no other scope still uses them. Do not add multiple Rstest coverage providers for one final scope unless the repo intentionally keeps multiple coverage modes.

## Version and capability gate

Before debugging test failures, choose a compatible Rstest line and avoid latest-only config on older targets:

- Latest Rstest needs Node `^20.19.0 || >=22.12.0` and the Rsbuild/Rspack 2.x ecosystem. For Rsbuild/Rspack 1.x or older Node projects, use a compatible older line such as Rstest 0.8.x unless the user accepts a toolchain upgrade.
- If the target line lacks a needed feature, either use the fallback or ask whether to upgrade first.
- Prefer config-level fallbacks on older targets: plain project objects, `output.externals`/aliases/manual config, Istanbul coverage, config/projects for env splits, explicit/manual mocks, config `pool.maxWorkers`, or manual Rspack config.
- Treat `defineInlineProject`, `output.bundleDependencies`, `detectAsyncLeaks`, V8 coverage, file-level env comments, newer mock helpers, CLI `--pool.maxWorkers`, and `@rstest/adapter-rspack` as latest-line features unless target docs/types prove support.
- Choose Rsbuild plugins and Rstest adapters by peer dependency compatibility, not package-name major equality. In monorepos, check root and package-level overrides/resolutions, lockfile entries, and nested package managers for duplicate majors.

Inspect with the repo-native manager across workspaces (for example `pnpm -r list ... --depth Infinity`, or `npm ls --all` plus filtering). If errors mention config schema, plugin hooks, compiler mismatch, missing plugin APIs, or peer conflicts, fix dependency versions first; do not rewrite tests to hide toolchain skew.

## Blocked mode

If install/check fails, stop broad edits. Do not mix package managers or fake a migration without a runnable local `rstest` binary unless the user accepts a config-only patch.

Report the failed command, error class, chosen package-manager signal, files already changed, next command, and resume point.
