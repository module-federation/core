# R0 validation — 2026-09-10

This is a regression baseline, not production acceptance. Runtime sources were
not changed. R1–R6 remain open, as does the existing E2E failure below.

Source baselines:

- Core: `7d503c1868cf64445e0f22c9c61a7cb09393ae22`
- Local Rspack: `8e63776c7a5fa47665fac96f16316f874a18b806` (built version 2.2.2)
- Local Modern: `46967f66c044572cbd0c7b66a82dd4012220695c`
- Installed Rspack: `2.2.3-canary-8e63776c-20260908113208`
- Node 24.18.1, pnpm 10.28.0

## Commands and outcomes

```sh
pnpm exec turbo run build --filter=@module-federation/runtime-tools
node --test tools/ssr-cache/baseline.test.cjs
SSR_CACHE_STRICT=1 node --test tools/ssr-cache/baseline.test.cjs
SSR_CACHE_RSPACK_ENTRY=/Users/bytedance/outter/rspack/packages/rspack/dist/index.js SSR_CACHE_MODERN_ENTRY=/Users/bytedance/work/modern.js/packages/server/core/dist/cjs/adapters/node/index.js node --test tools/ssr-cache/baseline.test.cjs
pnpm --filter @module-federation/webpack-bundler-runtime run test -- clearCache.spec.ts
pnpm run ci:local --only=e2e-modern-ssr
pnpm exec prettier --check tools/ssr-cache
pnpm exec prettier --check .
node --check tools/ssr-cache/baseline.test.cjs
node --check tools/ssr-cache/fixture.cjs
node --check tools/ssr-cache/modern-fixture.cjs
git diff --check
```

- Runtime-tools and dependency builds: 6/6 successful.
- Installed Rspack baseline: 4 passes, 7 known-defect TODOs, 1 explicit Modern
  skip because no Modern entry path was supplied. No unexpected failures.
- Local Rspack + Modern: 5 passes, 7 known-defect TODOs, no skips or unexpected
  failures. The HTTP test verifies publication with the same server/PID/port.
- Strict mode exits 1, as intended: all seven desired-behavior assertions become
  blocking failures (Node also counts their four parent tests as failed).
- Existing clearCache Jest tests: 6/6 pass.
- Modern SSR CI: package build 44/44 succeeds; Cypress shared-cache spec passes.
  `remove-remote-cache.cy.js:51` fails because `v1Runtime.captured` is false.
  The preceding v2 payload and absence-of-remove-error assertions pass. The capture
  failure is not diagnosed or fixed by R0, and the CI job must not be called green.
- Changed-file formatting, JavaScript syntax and diff whitespace checks pass.
  Repository-wide Prettier fails on 683 files, including generated website output,
  generated playground source and a pre-existing modified bridge source. R0 does
  not reformat unrelated files.

The first CI attempt was interrupted after sandbox DNS failures during dependency
installation. `pnpm install --frozen-lockfile` was rerun with network access and
completed; no lockfile changes. A concurrent first Jest attempt during dependency
recreation could not resolve jsdom; the rerun above passes. The first Modern HTTP
probe hit sandbox `listen EPERM`; rerunning with local-listener permission passes.

Full React stream/abort/hydration, production serve under a supervisor, memory/GC
stability, shared lazy dependencies and multi-entry graph completeness are not
covered by R0. They remain the explicit R1–R6 acceptance tasks. Other CI jobs were
not run because this change adds a focused SSR baseline and contracts, not runtime
behavior. No changeset or package publication is needed for these tooling/docs-only
changes. The baseline is a documented explicit command, not yet a CI gate.
