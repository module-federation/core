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

## R1 selective provider increment — 2026-09-10

Core base: merged #5049 (`2ed88f573`). Companion Rspack base:
`8e63776c7a5fa47665fac96f16316f874a18b806`, branch `fix/mf-selective-cache`.
This increment implements optional selective provider cleanup and transitive
static parents, not adapter lifecycle or production acceptance.

Commands executed in core:

```sh
pnpm exec turbo run build --filter=@module-federation/runtime-tools
pnpm --filter @module-federation/webpack-bundler-runtime run test
pnpm --filter @module-federation/runtime-core exec rstest run
node --test tools/ssr-cache/baseline.test.cjs
SSR_CACHE_EXPECT_NATIVE=1 SSR_CACHE_RSPACK_ENTRY=/Users/bytedance/outter/rspack/packages/rspack/dist/index.js node --test tools/ssr-cache/baseline.test.cjs
SSR_CACHE_EXPECT_NATIVE=1 SSR_CACHE_RSPACK_ENTRY=/Users/bytedance/outter/rspack/packages/rspack/dist/index.js SSR_CACHE_MODERN_ENTRY=/Users/bytedance/work/modern.js/packages/server/core/dist/cjs/adapters/node/index.js node --test tools/ssr-cache/baseline.test.cjs
NODE_OPTIONS='--require=/tmp/mf-selective-local-rspack.cjs' TURBO_ENV_MODE=loose pnpm run ci:local --only=e2e-modern-ssr
pnpm exec prettier --check .
python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --output /tmp/mf-selective-changeset-status.json
git diff --check
```

The temporary Modern resolver hook used Node 24 `registerHooks` to resolve both
`@rspack/core` and `@rspack-canary/core` to the local built entry. The equivalent,
portable hook and invocation are now documented in README. An earlier CJS-only
`Module._resolveFilename` hook did not affect Rslib ESM imports: its shared-cache
failure was against the old compiler, not the new selective implementation.

Commands executed in Rspack:

```sh
pnpm run build:binding:dev
# From tests/rspack-test, separately (the filter matches literal text):
pnpm run test:base -- -t configCases/container/mf-clear-cache-metadata
pnpm run test:base -- -t configCases/container/mf-selective-provider-cache
# From Rspack root:
rustfmt --edition 2024 --check crates/rspack_plugin_mf/src/container/container_entry_module.rs crates/rspack_plugin_mf/src/container/remote_runtime_module.rs
git diff --check
```

- Runtime-tools build: 6/6 tasks successful; bundler package 111/111 tests;
  runtime-core 138/138 tests. An initial test matrix typo was corrected before
  the full runtime-core rerun; no snapshots changed.
- Installed old canary: 7 passes, 5 known TODOs, 2 explicit skips (selective
  capability absent and Modern entry omitted), no failures.
- New compiler artifact matrix: 18 passes, 3 stale-adapter TODOs, 1 Modern skip.
  With the built Modern entry: 19 passes, 3 TODOs, no skips/failures. Covers
  shared strict identity, retained lazy dependency identity, non-shared payload
  WeakRef GC, concatenation and minified deterministic numeric IDs. Reacquired
  static parents update without the diagnostic parent plugin.
- Native Rspack targeted runs both pass (each runner reports 404 passes plus
  filtered/skipped cases; this is not a claim that the full compiler suite ran).
  Regressions include cyclic/multiple-parent metadata and first lazy execution
  after cleanup, followed by another cleanup and identity check.
- Full Modern SSR CI with the corrected hook: shared-cache spec **passes**,
  including the unchanged `nonSharedPayloadCollected` assertion. Remote-cache
  spec **fails at line 51**, `v1Runtime.captured === true`; the earlier replacement
  and no-remove-error assertions pass. This same capture failure was recorded
  in R0 and remains unresolved. No assertion was weakened; the CI job is not green.
  Existing React/Helmet type/version warnings also remain.
- Changeset parsing/planning passes; entries are patch releases only for
  runtime-core and webpack-bundler-runtime (fixed groups may expand the plan).
  Full-repo Prettier still fails on 683 pre-existing/generated files; only
  changed files are formatted. Rspack has no local Prettier binary, so its
  touched JS was formatted using the existing core binary.

Full compiler suites and other CI jobs were skipped in favor of the two targeted
compiler cases, affected packages' complete tests and Modern SSR integration.
Streaming/drain/production-serve/long-running memory tests remain later roadmap
gates, not skipped proof of implemented behavior. No package publication ran.

## Unreleased-provider contract correction — 2026-09-10

The user confirmed that this cache API has not shipped. The previous increment's
legacy-provider fallback and compatibility test matrix are therefore removed.
Shared-preserving cleanup directly calls the selective method; a missing method
is an error, not successful cleanup with a retained full cache. Generic remote
entry types remain optional because not every container participates in this
cleanup path. Shared payload GC no longer skips for a missing capability.

Commands rerun:

```sh
pnpm exec turbo run build --filter=@module-federation/runtime-tools
pnpm --filter @module-federation/runtime-core exec rstest run
pnpm --filter @module-federation/webpack-bundler-runtime run test
SSR_CACHE_EXPECT_NATIVE=1 SSR_CACHE_RSPACK_ENTRY=/Users/bytedance/outter/rspack/packages/rspack/dist/index.js SSR_CACHE_MODERN_ENTRY=/Users/bytedance/work/modern.js/packages/server/core/dist/cjs/adapters/node/index.js node --test tools/ssr-cache/baseline.test.cjs
node --test tools/ssr-cache/baseline.test.cjs
SSR_CACHE_RSPACK_ENTRY=/Users/bytedance/outter/rspack/packages/rspack/dist/index.js NODE_OPTIONS="--require=$PWD/tools/ssr-cache/local-rspack-hook.cjs" TURBO_ENV_MODE=loose pnpm run ci:local --only=e2e-modern-ssr
pnpm exec prettier --check .
python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --output /tmp/mf-no-compat-changeset.json
```

Build: 6/6 successful; runtime-core 134/134; bundler runtime 109/109. The six
removed cases tested the discarded compatibility path. New compiler/Modern
artifact matrix remains 19 passes, 3 existing adapter TODOs, no skips/failures.
The installed older canary negative check now exits 1 with a missing selective
method error, confirming it is no longer silently accepted. Changeset planning
passes. Full-repo formatting still reports 683 unrelated/generated files.

Rspack changes in this correction are documentation only; its native suite was
not repeated. Other CI jobs remain outside this focused correction. No publish.

The full Modern SSR CI rerun passes both remote-cache and shared-cache specs.
The previously recorded capture failure did not reproduce; this correction does
not claim to fix its intermittent cause. Changed-file Prettier and
`git diff --check` pass. Adapter lifecycle TODOs remain open.

## R1 adapter lifecycle — 2026-09-10

Core base: `3b53e9619` (merged #5051). The adapter is explicitly disposed before
application CJS cache is dropped; no diagnostic replacement of the runtime plugin
is used. Actual Modern request draining and rebuilding remain framework work.

Commands executed:

```sh
pnpm exec turbo run build --filter=@module-federation/runtime-tools
pnpm --filter @module-federation/webpack-bundler-runtime run test
SSR_CACHE_STRICT=1 SSR_CACHE_EXPECT_NATIVE=1 SSR_CACHE_RSPACK_ENTRY=/Users/bytedance/outter/rspack/packages/rspack/dist/index.js SSR_CACHE_MODERN_ENTRY=/Users/bytedance/work/modern.js/packages/server/core/dist/cjs/adapters/node/index.js node --test tools/ssr-cache/baseline.test.cjs
SSR_CACHE_RSPACK_ENTRY=/Users/bytedance/outter/rspack/packages/rspack/dist/index.js NODE_OPTIONS="--require=$PWD/tools/ssr-cache/local-rspack-hook.cjs" TURBO_ENV_MODE=loose pnpm run ci:local --only=e2e-modern-ssr
pnpm exec prettier --check .
pnpm exec prettier --check packages/webpack-bundler-runtime/src/clearCache.ts packages/webpack-bundler-runtime/src/init.ts packages/webpack-bundler-runtime/src/types.ts packages/webpack-bundler-runtime/__tests__/clearCache.spec.ts tools/ssr-cache .changeset/dispose-bundler-cache-adapters.md
python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --output /tmp/mf-adapter-changeset.json
git diff --check
```

- Build: 6/6 tasks successful. An intermediate const/let edit error was corrected
  before final build/test runs. Full bundler suite: 116/116 tests, 10 suites.
- Strict native/Modern artifact baseline: **23/23 pass, no TODOs, skips or
  failures**. The three previous stale-adapter assertions now pass for plain,
  concatenated and diagnostic-parent variants. Shared identity/GC continues to
  pass. A new child-process WeakRef test retains the disposer and saved clear
  function while proving the disposed adapter no longer retains its runtime.
- Unit coverage includes repeated attach/dispose, exact method restoration,
  listener removal, separate bundled copies, multiple owners, preserving later
  third-party wrappers, pending-cleanup detach rejection, starting all live
  cleanups and waiting for errors, and updating only live registration mappings.
- Full Modern SSR CI passes both existing remote-cache and shared-cache specs.
  The emitted host was checked for the final all-binding cleanup and request-key
  filtering logic. Earlier capture instability did not reproduce and is not
  claimed fixed. Existing React/Helmet warnings remain.
- Changed-file formatting, changeset planning and diff checks pass. Full-repo
  Prettier still fails on 683 pre-existing/generated files. The new changeset
  lists only webpack-bundler-runtime; fixed groups may broaden the release plan.
- No Rust/compiler change in this increment, so native Rspack suites were not
  repeated. Runtime-core sources are unchanged; its standalone suite was not
  repeated. Other CI jobs were skipped in favor of the affected package's full
  tests and Modern SSR integration. No package publication was performed.

The GC check concerns adapter-owned references, not complete collection of an
arbitrary old application bundle. Persistent MF instances, shared providers and
saved business exports can still retain bundled code. Callers must drain work
before disposal. Actual Modern production serve, stream/abort, long-running heap
stability and rebuild recovery remain later acceptance gates.

## Resolved provider identity repair — 2026-09-11

Base: `97ef36f3c` (merged #5053). Independent worktree, Node 24.18.1,
pnpm 10.28.0, published Rspack `2.2.3-canary-76e8f696-20260911033013`.

The new cases distinguish registration, provider and container-global identities.
Temporarily restoring the base `clearCache.ts` and `remote/index.ts` against the
new tests produced **5 bundler failures and 4 runtime-core failures**. These
include both settled/in-flight shared providers, present/removed provider
instances, and an unrelated business global named after the registration.
Restoring the repair makes those tests pass.

Validation commands (from the isolated core worktree):

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=@module-federation/runtime-tools
pnpm --filter @module-federation/sdk test
pnpm --filter @module-federation/webpack-bundler-runtime test --runInBand
pnpm --filter @module-federation/runtime-core test
pnpm --filter @module-federation/runtime-core exec rstest
SSR_CACHE_STRICT=1 SSR_CACHE_EXPECT_NATIVE=1 node --test tools/ssr-cache/baseline.test.cjs
SSR_CACHE_STRICT=1 SSR_CACHE_EXPECT_NATIVE=1 SSR_CACHE_MODERN_ENTRY=/Users/bytedance/work/modern.js/packages/server/core/dist/cjs/adapters/node/index.js node --test tools/ssr-cache/baseline.test.cjs
pnpm exec prettier --check .
git diff --check
python3 .codex/skills/changeset-pr/scripts/inspect_changeset_scope.py --base origin/feat/mf-ssr-clear-cache --file .changeset/ssr-resolved-provider-identity.md
python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --output /tmp/mf-provider-changeset-status.json
```

Results: all 6 build tasks passed; SDK 69 passed with its existing disabled DOM
link-reuse test unchanged; bundler-runtime 127 passed; runtime-core 143 passed.
The final runtime-core command omits the package script's snapshot-update flag.
Native Rspack baseline: 22 passed with the optional Modern test initially omitted;
with the existing built Modern entry supplied, **23 passed, no skips or TODOs**.
Repository-wide formatting and whitespace checks passed.
The scope helper requires deferred annotations on this machine’s Python 3.9;
its first direct invocation failed before inspection. Running the unchanged
helper with Python’s `__future__.annotations` compiler flag passed. Changesets
status also passed.

One initial Jest run started before its runtime dependency build finished and
could not resolve that package; rerunning after the build passed. SDK assertions
initially rejected the newly retained snapshot field; expected fixtures were
updated explicitly. No other snapshots were changed. The red/green runs restored
all repaired sources in a `finally` block.

A separate Modern worktree was installed and its existing server-core tests ran
while examining entry-scoped coordination (first attempt hit sandbox listener
EPERM; the permitted rerun passed). No Modern implementation change is included:
the exploratory scope draft is not an accepted R4 implementation.

The full browser/Cypress and unrelated package/E2E matrices were not rerun for
this focused metadata/cleanup repair; targeted package tests and native
Rspack/Modern HTTP regressions cover the changed behavior. Production hydration,
entry-scope completeness and long-running resource acceptance remain R4–R6.
No publish command was run. Changesets lists the three changed packages; fixed
release groups can expand the eventual release plan.


### Removal-hook ordering follow-up (2026-09-11)

PR #5060 review identified that a user hook can delete moduleCache before the
bundler cache hook. Capture a copy of resolved remoteInfo at the start of runtime
removal, pass it through the hook payload, and prefer it during bundler target
resolution. Registration-named business globals remain untouched even when the
cache entry is already absent. The runtime regression verifies the later hook sees
the captured identity after the first hook clears the cache; the bundler regression
verifies actual resolved-container clearing and business-global retention.

Commands from `/private/tmp/mf-5060-review`:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=@module-federation/runtime-tools
pnpm --filter @module-federation/runtime-core test
pnpm --filter @module-federation/webpack-bundler-runtime test
SSR_CACHE_STRICT=1 SSR_CACHE_EXPECT_NATIVE=1 SSR_CACHE_MODERN_ENTRY=/private/tmp/modern-r4-static-update/packages/server/core/dist/cjs/adapters/node/index.js node --test tools/ssr-cache/baseline.test.cjs
pnpm exec prettier --check .
python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --output /tmp/5060-changeset-status.json
git diff --check
```

All six dependency build tasks pass; runtime-core 143/143 and bundler-runtime
128/128 pass. Full browser/E2E matrices and unrelated packages are not rerun for
this hook-payload repair; native artifact checks complement the package regressions.
SDK behavior did not change in this follow-up, so its earlier 69-pass result was
not rerun. No publish command is used.
