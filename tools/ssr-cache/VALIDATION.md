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

## R1 shared-lifetime increment — 2026-09-10

Base: merged R0 `bf33cf00f`. This increment fixes host/provider cleanup separation
and shared identity; **R1 is not complete**. It does not change Rspack or implement
adapter disposal. Provider-wide retention is a safe fallback, not selective GC.

Commands executed:

```sh
pnpm exec turbo run build --filter=@module-federation/runtime-tools
pnpm --filter @module-federation/webpack-bundler-runtime run test
pnpm --filter @module-federation/runtime-core exec rstest run
node --test tools/ssr-cache/baseline.test.cjs
SSR_CACHE_RSPACK_ENTRY=/Users/bytedance/outter/rspack/packages/rspack/dist/index.js SSR_CACHE_MODERN_ENTRY=/Users/bytedance/work/modern.js/packages/server/core/dist/cjs/adapters/node/index.js node --test tools/ssr-cache/baseline.test.cjs
pnpm run ci:local --only=e2e-modern-ssr
pnpm exec prettier --check packages/runtime-core/src/remote/index.ts packages/runtime-core/__tests__/register-remotes.spec.ts packages/webpack-bundler-runtime/src/clearCache.ts packages/webpack-bundler-runtime/__tests__/clearCache.spec.ts tools/ssr-cache .changeset/clean-host-retain-shared.md
pnpm exec prettier --check .
python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --output /tmp/mf-ssr-r1-changeset-status.json
git diff --check
```

- Builds: 6/6 tasks pass. Bundler package: 109/109 tests pass. Runtime-core:
  134/134 pass, including absent provider registration and pending shared loads.
  Initial sandbox Rstest invocation could not listen; rerun with listener permission
  passed after replacing existing undefined `vi.fn` usages with imported `rs.fn`
  in the touched remote-registration tests. No snapshots were updated.
- Installed-canary artifacts: 7 pass / 5 TODO / 1 explicit Modern skip. Local
  Rspack + Modern: 8 pass / 5 TODO / 0 skip. Two previous shared TODOs now pass;
  a new retained lazy-dependency identity assertion passes. The remaining TODOs
  cover transitive parent metadata and stale adapter binding.
- Modern SSR CI: remote-cache spec passes in this run, but shared-cache spec
  **fails at line 40**: `nonSharedPayloadCollected` is false. Retaining provider
  execution caches protects shared identity but also retains its unrelated
  payload. The failing memory assertion is deliberately unchanged. Selective
  provider cleanup is needed before declaring the production memory requirement
  complete. R0's runtime-capture failure did not reproduce in this run; this
  change does not claim to fix its cause.
- Changed-file formatting and diff checks pass. Full-repo formatting still reports
  683 existing/generated files, outside this patch.
- Changeset status succeeds; the patch release entries are only runtime-core and
  webpack-bundler-runtime. The repository fixed release group may expand the plan.
  The scope helper requires Python 3.10+ annotations; on this machine it was run
  with postponed annotations under Python 3.9, without modifying the helper.

General shared lazy dependency graph coverage, selective provider reclamation,
parent closure, adapter lifecycle and Modern production stream/serve/GC acceptance
remain open. Other CI jobs were not run: the affected packages' complete tests and
Modern SSR integration were selected. No publication was performed.
