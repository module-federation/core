# Vitest Migration Deltas

Use this reference when the current framework is Vitest.

## Source of truth

Use the official guide for exact field/API mappings:

https://rstest.rs/guide/migration/vitest.md

When local docs are available, prefer the checked-out source, for example `website/docs/en/guide/migration/vitest.mdx`.

## High-signal deltas

- Scripts: `vitest run` / `vitest --run` -> `rstest`; plain Rstest already runs once and exits. Watch mode is `rstest --watch` or `rstest watch`.
- Config imports: `defineConfig` comes from `@rstest/core`; `defineWorkspace` is removed; use the `projects` field.
- Projects: use `defineInlineProject({ name, ... })` only when the `dependency-install-gate.md` capability gate allows it; otherwise use plain named objects. Use `defineProject` for top-level project config exports.
- Config shape: remove Vitest's `test` wrapper and move fields to the Rstest top level. Map exact fields through the official guide.
- Coverage: add a capability-supported Rstest coverage package and use `coverage.reporters` (plural). Replace `@vitest/coverage-*` only during cleanup after the Rstest scope is green.
- Reporters: replace Vitest-only reporters; import third-party reporter classes instead of passing incompatible names.
- Setup: replace `@testing-library/jest-dom/vitest` with matcher registration via `expect.extend(...)` from `@rstest/core`.
- Globals/APIs: imports from `vitest` -> `@rstest/core`; `vi.<api>` / `vitest.<api>` -> `rs.<api>`. Avoid mixing `vi` and `rs` in a migrated file.
- Mocks: `rs.mock('./module')` looks for `__mocks__`; use newer helpers/options such as `{ mock: true }` or `{ spy: true }` only when the `dependency-install-gate.md` capability gate allows them. Otherwise use explicit factories or manual mocks.
- Async mock factories: Rstest does not support returning an async function when mocking a module value. Migrate Vitest patterns that await the actual module inside the factory to static `importActual` imports plus a synchronous factory.
- CJS mocking: use `rs.mockRequire()` / `rs.doMockRequire()` for `require()` paths.

## Build config

- Rstest uses Rsbuild/Rspack instead of Vite/Rollup. Translate Vite `define` to `source.define`, externalization to `output.externals`, and plugins to compatible adapters/Rsbuild plugins before rewriting tests.

## Vitest-specific enforcement

1. Delete scope-local `vitest.config.*` and truly legacy `vitest.setup.*` only after the migrated scope is green. If a setup file was rewritten and is still referenced by Rstest `setupFiles`, rename or copy it to a Rstest-owned name such as `rstest.setup.*` before deleting the legacy Vitest-named file. Drop shared `vitest.workspace.*`, root shared config, and `@vitest/*` devDeps only after no scope still uses Vitest.
2. Do not re-record Vitest snapshots just to update headers. Vitest and Rstest snapshot files are byte-compatible below the header line; run `-u` only for expected body diffs.
3. Do not carry the Vite mental model into Rstest. Prefer adapters and Rsbuild/Rspack config translations over custom test rewrites.
