# Local CI job map

Use `pnpm run ci:local --list` if you need to refresh this list from the repo.

## Core jobs

- `build-and-test`
  - Full package-oriented CI parity job.
  - Includes install, Cypress install, changed-file format check, Turbo/publint verification, package build, and affected package tests.
  - Use for shared runtime, plugin, CI, packaging, publint, or broad package changes.

- `build-metro`
  - Metro-specific parity job.
  - Use for `packages/metro*` and related Metro workflow changes.

- `bundle-size`
  - Bundle-size measurement workflow parity.
  - Use for bundle-size collection or reporting logic.

- `devtools`
  - Devtools workflow parity job.
  - Use for `packages/chrome-devtools`, Playwright/devtools setup, and devtools workflow changes.

## E2E jobs

- `e2e-modern`
- `e2e-runtime`
- `e2e-manifest`
- `e2e-node`
- `e2e-next-dev`
- `e2e-next-prod`
- `e2e-treeshake`
- `e2e-modern-ssr`
- `e2e-router`
- `metro-affected-check`
- `metro-android-e2e`
- `metro-ios-e2e`
- `e2e-shared-tree-shaking`

Use the smallest job that matches the app/runtime surface you changed.

## CI-only local skips

- `actionlint`
  - Listed for parity, but skipped because the GitHub-only action does not fully execute locally.

- `bundle-size-comment`
  - Listed for parity, but skipped locally because it depends on GitHub workflow-run artifacts.

## Helpful commands

List jobs:

```bash
pnpm run ci:local --list
```

Run one job:

```bash
pnpm run ci:local --only=build-and-test
```

Run multiple jobs:

```bash
pnpm run ci:local --only=build-and-test,bundle-size
```

Run a smaller non-`ci:local` package check:

```bash
pnpm exec turbo run build --filter=@module-federation/<pkg>
pnpm exec turbo run test --filter=@module-federation/<pkg> --force
```
