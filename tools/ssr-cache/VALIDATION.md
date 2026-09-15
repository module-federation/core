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
## R4 static entry ownership and Modern selective publication (2026-09-11)

MF worktree: `/private/tmp/mf-r4-static-update`; companion Modern worktree:
`/private/tmp/modern-r4-static-update`. Rspack preview:
`2.2.3-canary-76e8f696-20260911033013`. Public opt-in and scope contracts are in
`packages/modernjs-v3/README.md`; Modern artifact commands and detailed results are
in `packages/server/core/SSR_REQUEST_COORDINATION.md` in the companion branch.

MF commands:

```sh
pnpm exec turbo run build --filter=@module-federation/modern-js-v3
pnpm --filter @module-federation/modern-js-v3 build
pnpm --filter @module-federation/modern-js-v3 test
pnpm exec prettier --check .
python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --output /tmp/r4-changeset-status.json
git diff --check
```

Final package build and declarations pass; 31 tests pass, including per-instance
replacement retry after registration failure. Repository-wide formatting passes.
The initial compiler-plugin build rejected a literal runtime stage and nullable
chunk ID; the implementation now uses RuntimeModule.STAGE_ATTACH and excludes null
IDs. An initial sandboxed Rstest invocation could not bind its local listener
(EPERM); the authorized rerun passes. The package build reports its existing
root-export Publint module-type warning; this change does not alter package exports.

Companion Modern server-core reports 49 passing tests, with server-core and
prod-server dependency builds passing. Real Rspack/Modern HTTP artifact tests pass:
static selective update (1), numeric IDs/minification (1), module-concatenation
fallback (1), existing application HTTP regression (3), and production dynamic MF
regression (1). The static fixture includes standalone loaders, shared ancestor
entries, retained unrelated module identity, pending producer drain, cross-entry
rewrites, HTML cache isolation, failed publication recovery and dynamic fallback.

The optimized concatenated fixture exposes incomplete native ancestry to some
entry roots in this preview. Its asserted result is application rebuilding with
`incomplete-parent-closure`, not selective success. All updates retain the HTTP
server and listening port. Default dynamic/mixed mode rebuilds the whole app;
static-only mode requires the explicit ownership contract and complete graph.

Full framework/builder E2E, browser hydration/Cypress, sustained-load and resource
soak checks are not claimed; they remain R6 acceptance. RSC is explicitly outside
scope. R5's generic API migration is not implemented by this Modern-only adapter.
No workflow or publication behavior changes; no publish commands were run.
The R4 changeset names only modern-js-v3 (minor); fixed release groups can expand
the eventual release plan. Earlier #5060 changesets belong to the prerequisite.


## Published concatenation fix preview (2026-09-14)

Upgrade root Rspack core/CLI aliases and workspace overrides to
`2.2.3-canary-fde17bab-20260911103204`; pnpm regenerates the lockfile. MF base:
`d33266f95`; merged Modern base: `27ec9d9c50` (#8866). No local compiler override
is used. The installed package version was checked with
`node -p "require('@rspack/core/package.json').version"`.

Commands from `/private/tmp/mf-r4-static-update`:

```sh
pnpm install --no-frozen-lockfile
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=@module-federation/modern-js-v3
pnpm --filter @module-federation/modern-js-v3 test
SSR_CACHE_STRICT=1 SSR_CACHE_EXPECT_NATIVE=1 SSR_CACHE_MODERN_ENTRY=/private/tmp/modern-r4-static-update/packages/server/core/dist/cjs/adapters/node/index.js node --test tools/ssr-cache/baseline.test.cjs
pnpm exec prettier --check .
git diff --check
```

From `/private/tmp/modern-r4-static-update`, using its merged test:

```sh
SSR_STATIC_OPTIMIZE=1 SSR_CACHE_MF_ROOT=/private/tmp/mf-r4-static-update node --test packages/server/core/tests/application.static-mf.test.cjs
SSR_STATIC_NUMERIC=1 SSR_CACHE_MF_ROOT=/private/tmp/mf-r4-static-update node --test packages/server/core/tests/application.static-mf.test.cjs
SSR_CACHE_MF_ROOT=/private/tmp/mf-r4-static-update node --test packages/server/core/tests/application.static-mf.test.cjs
```

All 20 build tasks pass, package tests 31/31, native baseline 23/23 and all three
Modern artifact variants pass. The concatenated production artifact now requires
actual selective success, including affected page/loader refresh and retained
unrelated traffic/identity. Frozen installation, full formatting and whitespace
checks pass. No new changeset: root development dependencies and documentation
only, with no publishable package source behavior change. Full Cypress/browser,
workspace test and sustained-load matrices were not rerun for this preview pin;
R6 acceptance remains open. RSC remains excluded. No package publication occurs.

## R5 explicit update API and revisions (2026-09-14)

Core base `4f9c26058` (#5072), Modern base `27ec9d9c50` (#8866), both on the
`feat/mf-ssr-clear-cache` integration line. Published Rspack remains
`2.2.3-canary-fde17bab-20260911103204`; no local compiler override.

Commands run from the isolated MF worktree:

```sh
pnpm exec turbo run build --filter=@module-federation/modern-js-v3
pnpm --filter @module-federation/runtime-core test
pnpm --filter @module-federation/runtime test
pnpm --filter @module-federation/webpack-bundler-runtime test
pnpm --filter @module-federation/modern-js-v3 test
pnpm exec turbo run test --filter=@module-federation/runtime-core --filter=@module-federation/runtime --filter=@module-federation/webpack-bundler-runtime --filter=@module-federation/modern-js-v3 --force
SSR_CACHE_STRICT=1 SSR_CACHE_EXPECT_NATIVE=1 SSR_CACHE_MODERN_ENTRY=/private/tmp/modern-r4-static-update/packages/server/core/dist/cjs/adapters/node/index.js node --test tools/ssr-cache/baseline.test.cjs
pnpm run e2e:node
pnpm run e2e:runtime
pnpm run e2e:modern:ssr
pnpm exec prettier --check .
git diff --check
python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --verbose
```

Final results: all 20 build tasks; runtime-core 147, runtime 94, bundler 128,
Modern adapter 35 tests passed. The forced Turbo run passed all 24 build/test
tasks; the subsequently added ownership test passed in the final Modern suite.
Strict native artifacts passed 23 tests. Node E2E passed 1 test, runtime browser
E2E passed 26, Modern SSR cache/retained-shared browser E2E passed both tests.
Prettier and whitespace checks passed. Changesets parsed the breaking migration;
the fixed release group expands the resulting plan to 3.0.0.

Modern companion regression commands, from its isolated worktree:

```sh
pnpm exec biome format --write packages/server/core/tests/application.static-mf.test.cjs
pnpm exec biome check packages/server/core/tests/application.static-mf.test.cjs
SSR_STATIC_OPTIMIZE=1 SSR_CACHE_MF_ROOT=/private/tmp/mf-r4-static-update node --test packages/server/core/tests/application.static-mf.test.cjs
SSR_STATIC_NUMERIC=1 SSR_CACHE_MF_ROOT=/private/tmp/mf-r4-static-update node --test packages/server/core/tests/application.static-mf.test.cjs
SSR_CACHE_MF_ROOT=/private/tmp/mf-r4-static-update node --test packages/server/core/tests/application.static-mf.test.cjs
NODE_ENV=production SSR_CACHE_RSPACK_ENTRY=/private/tmp/mf-r4-static-update/node_modules/@rspack/core/dist/index.js SSR_CACHE_MF_ROOT=/private/tmp/mf-r4-static-update node --test packages/server/core/tests/application.mf.test.cjs
NODE_ENV=production node --test packages/server/core/tests/application.http.test.cjs
```

Three static artifact variants passed (1 each), production MF passed 1, production
HTTP passed 3. The static fixture now checks pending/applied revision deduplication,
stale message rejection, and a batch containing a replacement and an unknown
remote, with exactly one new application generation. The existing held-producer,
page/loader, unaffected request/cache/identity, and stable server address assertions
remain active. Modern changes are tests only; no server behavior or changeset.

Initial failures were test expectations using relative URLs in jsdom and conflating
resource generations with revisions; both expectations were corrected. Rstest
initially hit sandbox EPERM on its loopback listener and passed with test network
permissions. Existing Modern package export-condition/type warnings and the E2E
nested-remote DTS generation warning remain non-fatal; they are not new failures.

Worktree rules require direct Turbo/package scripts instead of the aggregate
ci:local wrapper. The matching E2E job scripts above were run. Unrelated workspace,
Metro, Next and builder matrices were not run because they are outside this change.
Full Modern framework/hydration combinations and sustained load/heap stabilization,
including production capacity/timeout/health policy tuning, remain R6 acceptance;
the passing browser cache fixtures do not close that stage. RSC/native ESM
application roots remain excluded. No package publish or merge commands were run.

## R6 production acceptance — 2026-09-14

Bases: MF `656f7d03b` (merged #5074), Modern `7175a07b52` (merged #8868), both
on `feat/mf-ssr-clear-cache`. Node 24.18.1, core pnpm 10.28.0, Modern pnpm 10.13.1.
The production fixture uses real Modern 3.9.0 app-tools/runtime/server builds,
React 19.2.8, Cypress bundled Chromium, and the **published** Rspack
`2.2.3-canary-fde17bab-20260911103204`. Its compiler hook resolves that installed
package, not a locally modified compiler.

Two acceptance failures were reproduced and fixed:

- Updating server remotes without pinning browser startup produced React hydration
  error #425 in an initial React 18/Modern 3.5 probe. The new explicit public release
  mapping passes new-v2 HTML and delayed-v1 HTML hydration and click behavior with
  the current Modern 3.9/React 19 combination. Private server targets are excluded.
- Whole-app rebuilds recreated bundled React server renderers. A heap snapshot found
  a `previousDispatcher` chain retaining old renderers, pages and loader/request
  closures. Before the fix, post-GC heap grew from 36.6 MiB at cycle 10 to 88.7 MiB
  at cycle 70. Plugin lists, MF instances and adapter counts were stable; they were
  not the retention source. Server cache-update builds now keep React, React DOM
  and its server renderer singleton-shared. Explicit non-singleton configurations
  are rejected. No React internals or arbitrary application globals are cleared.

The committed production fixture passes real stream-shell draining, loader/action,
client cancellation with unresolved loader producer work, removal of cancelled
queued waiters, a 16-request queue with
503 overflow/admission timeout, drain timeout before mutation, request-side update
reentry rejection, validation failure with unavailable readiness and live liveness,
explicit full recovery, runtime-only remote registration/consumption, and stable
listener address/PID. Limits of 500 ms admission and 1000 ms drain are **test
settings**, not universal deployment defaults. An action rejected while queued
does not execute or replay; a normal action request executes successfully.

A 300-cycle run issues 2400 SSR requests (eight concurrent requests per cycle), in
addition to the lifecycle/browser checks. Every HTML response's remote version
matches its embedded public release. Forced-GC observations:

| Cycle | Heap MiB | RSS MiB | Active native resources |
| --- | --- | --- | --- |
| 20 | 33.06 | 193.66 | 2 servers, 20 sockets |
| 70 | 34.24 | 209.92 | 2 servers, 20 sockets |
| 100 | 34.39 | 222.75 | 2 servers, 20 sockets |
| 200 | 34.58 | 228.12 | 2 servers, 18 sockets |
| 300 | 34.81 | 234.61 | 2 servers, 18 sockets |

The post-warm-up heap peak is 34.81 MiB, below the fixture's +8 MiB regression
budget. Two logical MF instances and two host bindings remain, with zero pending or
active requests at each sample. RSS includes V8/native allocator retention and is
reported independently; the test does not equate RSS with live JS heap or prove
unbounded production stability.

After 20 warm-up cycles, measured update p50/p95/max (milliseconds):

| Stage | p50 | p95 | max |
| --- | --- | --- | --- |
| queue | 0.09 | 0.15 | 0.34 |
| analyze | 0.01 | 0.02 | 0.04 |
| drain | 0.00 | 0.00 | 0.01 |
| clear | 1.61 | 1.94 | 2.86 |
| rebuild | 6.76 | 9.01 | 11.48 |
| total | 8.47 | 10.77 | 14.44 |

The soak has no deliberately held old requests; its near-zero drain times are not
latency promises. Separate barrier tests cover held streams and cancellation.

Commands run from the isolated MF worktree:

```sh
pnpm exec turbo run build --filter=@module-federation/modern-js-v3
pnpm --filter @module-federation/modern-js-v3 exec rstest run
NODE_ENV=production SSR_CACHE_MODERN_ROOT=/private/tmp/modern-r4-static-update node --expose-gc tools/ssr-cache/production.cjs
NODE_ENV=production SSR_CACHE_MODERN_ROOT=/private/tmp/modern-r4-static-update SSR_CACHE_PRODUCTION_CYCLES=300 node --expose-gc tools/ssr-cache/production.cjs
pnpm exec prettier --check .
node --check tools/ssr-cache/production.cjs
node --check tools/ssr-cache/production-fixture.cjs
git diff --check
pnpm exec changeset status --output /tmp/r6-changeset-status.json
```

Build: 20/20 tasks succeed. Modern MF tests: 40/40 pass. Full-repository Prettier
passes. The changeset scope is only `@module-federation/modern-js-v3` (minor).
Formatting used `pnpm exec prettier --write` on the changed files. The changeset
scope helper is run against `origin/feat/mf-ssr-clear-cache` with Python 3.9's
postponed annotations, as in earlier stages.

Commands run from the companion Modern worktree:

```sh
pnpm exec biome check --write packages/server/core/tests/application.static-mf.test.cjs
SSR_CACHE_MF_ROOT=/private/tmp/mf-r4-static-update node --test packages/server/core/tests/application.static-mf.test.cjs
SSR_CACHE_MF_ROOT=/private/tmp/mf-r4-static-update SSR_STATIC_NUMERIC=1 node --test packages/server/core/tests/application.static-mf.test.cjs
SSR_CACHE_MF_ROOT=/private/tmp/mf-r4-static-update SSR_STATIC_OPTIMIZE=1 node --test packages/server/core/tests/application.static-mf.test.cjs
```

All three static artifact variants pass (readable, numeric IDs, numeric + minified
+ concatenated). An initial run used unsupported `SSR_CACHE_*` optimization flags;
that only reran the default variant and is **not** counted as optimized coverage.
The subsequent commands above use the actual test switches. Only the expected
result assertion changes in Modern to verify the newly added timing fields; no
Modern runtime behavior changes in this increment.

Probe corrections: the first native `fetch` Suspense request was treated as a bot
and waited for all content, so the harness now sends a real browser User-Agent and
an explicit timeout. Cypress success is verified by exact test/pass/failure counts;
its Node API does not return a `status: finished` property. These initial harness
failures are not reported as passing production runs.

Not run: the aggregate `ci:local` runner (worktree rules require package/direct
commands); unrelated Metro/Next/router/devtools pipelines; external process-manager
and CDN lifecycle tests. The actual production server preserves PID/port, but this
does not certify a particular supervisor configuration. Native ESM roots and RSC
remain excluded. Arbitrary global side effects are not undone. A final run against
newly published MF/Modern preview packages, after these changes merge, is still a
release gate: local-source success is not certification of an unpublished package
combination. No publish command was run.

## R6 published-package gate closed — 2026-09-14

The user published MF `0.0.0-feat-mf-ssr-clear-cache-20260914081229` and Modern
`0.0.0-canary-20260914082926` after merging #5075 / Modern #8870. Both package
families were installed from npm into `/private/tmp/mf-ssr-published-20260914`,
with no workspace package links. Rspack is pinned through the published
`npm:@rspack-canary/core@2.2.3-canary-fde17bab-20260911103204` alias, including
transitive compiler dependencies. React/React DOM 19.2.8 and TypeScript 5.9.3 are
installed there. The exact installation manifest is in `README.md`.

**The final published combination passes.** The production CLI, renderer/runtime,
server-core, prod-server, MF adapter and compiler resolve inside the independent
installation's pnpm store. `packages.json` records their versions and real paths.
MF's internal package dependencies use the same MF preview version; Modern's
internal package dependencies use the same Modern preview version. Repository
sources supply only the harness, Cypress and compiler selection hook. No local
MF/Modern `dist` implementation is used in these acceptance runs.

The real production build/server run passes browser hydration of current and
delayed-old HTML; React stream draining; loader/action handling; cancelled active
producer tracking; cancelled queued waiter removal; queue overflow and admission
expiry; drain timeout before mutation; request-side update reentry rejection;
runtime-only remote registration/load; failed publication, liveness/readiness and
explicit recovery. An action rejected while queued does not execute. Listener PID
and port remain unchanged.

300 updates with eight concurrent SSR requests each pass (2400 requests after the
lifecycle checks). Every response's server release matches its public HTML mapping.
Post-GC heap remains within the regression budget; two MF instances/two host
bindings remain stable and idle active/pending request counts are zero:

| Cycle | Heap MiB | RSS MiB | Active native resources |
| --- | --- | --- | --- |
| 20 | 33.36 | 197.91 | 2 servers, 20 sockets |
| 100 | 34.64 | 211.67 | 2 servers, 20 sockets |
| 200 | 34.76 | 226.78 | 2 servers, 18 sockets |
| 300 | 34.92 | 227.98 | 2 servers, 18 sockets |

All three published static artifact variants pass, including independent-entry
traffic during selective updates, preserved unrelated modules, revisions, recovery,
and shared/concatenated ownership. The companion Modern test source is copied
unchanged; all modules under test are published packages.

Commands run:

```sh
# In the isolated installation (manifest recorded in README.md):
pnpm install --no-frozen-lockfile
# In the MF test worktree:
NODE_ENV=production SSR_CACHE_PACKAGES_ROOT=/private/tmp/mf-ssr-published-20260914 SSR_CACHE_PRODUCTION_CYCLES=300 node --expose-gc tools/ssr-cache/production.cjs
SSR_CACHE_PACKAGES_ROOT=/private/tmp/mf-ssr-published-20260914 SSR_CACHE_MODERN_ROOT=/private/tmp/modern-r4-static-update node tools/ssr-cache/published-static.cjs
pnpm exec prettier --check .
node --check tools/ssr-cache/production.cjs
node --check tools/ssr-cache/production-fixture.cjs
node --check tools/ssr-cache/published-static.cjs
git diff --check
```

The install uses an explicit npm registry in the isolated `.npmrc`. Initial setup
incorrectly requested the canary under `@rspack/core` directly; correcting the
alias to `@rspack-canary/core` resolved that installation error. The first copied
static fixture lacked the published runtime-tools dependency context in its
synthetic layout, causing a module-resolution failure before compilation. Adding
that package's actual dependency directory to the temporary layout fixed the
harness; no published package was patched. The committed helper includes this
mapping, and all three variants were rerun successfully.

No package implementation changes or changeset are needed for this gate: the
committed changes only add published-package harness resolution and acceptance
records. Package builds/unit tests were not rerun because rebuilding from source
would not validate the published artifacts; the full production and static
artifact matrices were used instead. The worktree uses direct commands rather
than the aggregate `ci:local` runner. Unrelated CI pipelines, external CDN retention
and a particular deployment supervisor remain outside this acceptance scope.
The bounded resource test does not certify arbitrary business side effects or
infinite uptime; CommonJS application roots and ordinary HTML SSR remain the
supported scope, with RSC/native ESM excluded. Those are documented boundaries,
not unclosed defects in this package combination.

## E2E ownership and CI integration — 2026-09-14

The production acceptance scenarios are end-to-end tests. Keeping their executable
entry under `tools/ssr-cache` without normal E2E integration was incomplete. They
now belong to the private `modernjs-ssr-cache-updates` application under
`apps/modernjs-ssr/cache-updates/e2e`. Historical command paths above describe the
runs actually performed; use the application's README for current commands.

The Cypress hydration spec is a checked-in `release.cy.cjs`, and the native static
artifact test is checked in as `static.test.cjs`. Neither normal E2E nor published
acceptance requires another Modern source checkout. Normal runs use workspace MF
code with fixed Modern canary dependencies; published runs accept an independent
installation through `SSR_CACHE_PACKAGES_ROOT`. The production fixture retains
mixed-consumption/full-application mode, while the separate three-mode native
suite verifies selective updates and independent-entry traffic.

`pnpm run e2e:modern:ssr:cache` runs all new scenarios. The existing
`pnpm run e2e:modern:ssr` preserves manifest and legacy-cache checks, then runs this
new suite. The GitHub Modern SSR workflow now calls that same root command, as the
local CI parity runner already does. Affected-suite detection includes the new
private application and the shared compiler-selection hook.

Commands executed:

```sh
corepack enable
pnpm install --lockfile-only --ignore-scripts
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=@module-federation/modern-js-v3
pnpm run e2e:modern:ssr:cache
pnpm run e2e:modern:ssr
SSR_CACHE_PACKAGES_ROOT=/private/tmp/mf-ssr-published-20260914 pnpm run e2e:modern:ssr:cache
node --test tools/scripts/ci-is-affected.test.mjs
pnpm exec prettier --check .
node --check apps/modernjs-ssr/cache-updates/e2e/production.cjs
node --check apps/modernjs-ssr/cache-updates/e2e/production-fixture.cjs
node --check apps/modernjs-ssr/cache-updates/e2e/static.cjs
node --check apps/modernjs-ssr/cache-updates/e2e/static.test.cjs
node --check apps/modernjs-ssr/cache-updates/e2e/release.cy.cjs
git diff --check
```

Results: 20 dependency/package builds pass; the complete root E2E command exits 0
with both legacy Cypress specs passing, three static modes passing and the new
hydration/production suite passing. The published-package mode also passes.
Each new E2E run includes 70 updates/560 requests and the existing lifecycle/fault
matrix. All 19 affected-routing checks and whole-repository formatting pass.
Existing dev TypeScript diagnostics and non-TTY Chrome messages appeared during
the legacy run but did not fail either spec or the command; they are not silently
reported as fixed. A transient attempt to require selective mode for the mixed
production fixture was reverted; that fixture intentionally tests full rebuilding,
and selective behavior is asserted by the native static E2E suite.

The pnpm-generated lockfile includes the new Modern preview dependency graph and
its peer-resolution changes. It was verified by frozen installation and the full
Modern SSR E2E run. No publishable implementation changes or changeset are required.
The aggregate `ci:local` wrapper was not run in this worktree; its exact E2E command
was used. Unrelated Metro/Next/router suites, external supervisor/CDN deployment
checks and the already-completed 300-cycle acceptance were not repeated for this
E2E ownership migration. No packages were published.

## Manual production E2E demo (2026-09-14)

Added a persistent `--demo` mode to the same production runner and documented it
in `apps/modernjs-ssr/README.md`. It builds immutable v1/v2 providers, serves the
host on loopback port 3058 and assets on 3059, and exposes a local control page.
The page reports actual update results and application status. This fixture uses
whole-application mode; selective-entry behavior remains covered by the three
native static E2E variants.

Validation commands:

- `pnpm --filter modernjs-ssr-cache-updates run demo`: started and retained for
  manual use; GET /__status confirms the live production application.
- `pnpm run e2e:modern:ssr:cache`: passed all three static artifact variants,
  Cypress hydration, lifecycle checks and 70 updates / 560 concurrent requests.
- `node` with
  `require('cypress').run({project:'/tmp/ssr-demo-browser',browser:'electron',headless:true})`:
  one browser smoke scenario passed. It clicks the embedded hydrated v1 counter,
  updates via the real control button, checks old-page retention, requests and
  clicks v2, checks unchanged PID/serving state and increased generation, switches
  back to v1, and checks invalid version rejection. The first smoke attempt
  clicked before hydration; adding the fixture's data-hydrated wait fixed the
  test race without changing application behavior.
- `pnpm exec prettier --check .`: passed.
- `node --check apps/modernjs-ssr/cache-updates/e2e/production.cjs` and
  `git diff --check`: passed.

The full legacy Modern SSR job was not repeated for this increment: the preceding
entry above records its pass, and no legacy app/runner or workflow changed here.
Package builds, package unit tests and published-package acceptance were not
repeated: no implementation/dependencies changed; the existing built workspace
packages were exercised through the production fixture. No changeset is needed
for this private demo and documentation.


## Unified SSR playground (2026-09-15)

Replaced the earlier one-page manual control demo with a unified functionality
page and a memory page. Two real Modern production MPA hosts run in separate
processes; each has entry A (remote metronome) and independent entry B (local
palette). The dynamic host registers and loads a separately built palette
provider at runtime. Immutable v1/v2 assets remain available for old hydration.

The independent Node traffic process arms a real loader barrier, waits for loader
entry and Modern draining, sends real requests, consumes complete responses and
reports results. Static entry A queues while B completes; both queue for the
dynamic host. Server queue/active counters and loader events are not simulated.
Memory samples come from the selected SSR PID, with bounded observation buffers.
No auto-GC or periodic memory sampling occurs in ordinary mode.

Evidence and checks:

- `pnpm run e2e:modern:ssr`: passed (exit 0). Includes legacy manifest/cache
  regressions, three static artifact modes, production hydration/lifecycle and
  70-update/560-request soak, plus the new playground.
- `node apps/modernjs-ssr/cache-updates/e2e/playground.cjs`: passed. Three Cypress
  scenarios verify SSR HTML, both releases and old-page interaction, browser and
  server dynamic loading, traffic UI and GC sample UI. HTTP assertions verify
  selective/full gating before loader entry, unchanged PID, recovery, actual
  queue-full/timeouts (503), and a 20-update memory experiment.
- `pnpm install --frozen-lockfile --ignore-scripts`: validates the committed
  preview patch and lockfile.
- `pnpm exec prettier --check .`: passed after formatting the ignored generated
  `packages/playground/src/generated/bridgeRuntimeFiles.ts` from installation.
  No change to that generated file is committed.
- Syntax checks for the playground scripts and `git diff --check`: passed.
- Cypress desktop, mobile and memory screenshots were reviewed; mobile document
  width is also asserted by the browser test.

The actual integration exposed a Modern runtime bug: a ready callback re-entered
pipeline setup after a lazy remote resolved, causing React to reject a second
pipe and abort subsequent all-ready SSR responses. The fix is
[Modern #8872](https://github.com/web-infra-dev/modern.js/pull/8872), targeting
`feat/mf-ssr-clear-cache`. This checkout uses the same guard as a pnpm-managed
patch to the pinned preview. This is patched-preview acceptance; the unmodified
preview does **not** pass the new dynamic SSR scenario.

Modern verification (companion worktree):

- `pnpm --filter @modern-js/runtime exec rstest tests/ssr/streamLifecycle.test.tsx`:
  18/18 pass.
- Removing the guard and running the new targeted test with `-t 'pipes once'`
  fails with an aborted stream; the fixed source was restored. An initial
  plain repeated-lazy test did not reproduce callback re-entry with Modern's
  unit-test React version, so the regression deterministically re-enters the
  callback while retaining real React streaming. The cross-project E2E reproduces
  the original failure naturally.
- `pnpm --filter @modern-js/runtime run build`: passed.
- `pnpm exec biome check` on both changed TypeScript files and
  `git diff --check`: passed.

Other findings are explicit fixture constraints, not claimed runtime fixes:
server splitChunks is disabled because the default shared-entry output failed
MPA SSR initialization in this preview; workspace MF outputs are materialized
under temporary node_modules so linked MF internals are not classified as
business dynamic calls. Dynamic registrations use the actual provider name.

Earlier Node fs/chunk errors came from registering a provider under an unrelated
name; the fixture now uses provider name `lab_palette`. Early browser smoke
failures also exposed a disabled-button race and stale iframe references, both
corrected without weakening the SSR assertion.

Unrelated package unit suites, other framework integrations and the full Modern
monorepo build were skipped because no MF implementation changed and the Modern
fix is confined to Node stream startup. Heap snapshot file generation was not
automated because it pauses the host and creates large artifacts; the manual
command/UI is documented. Existing legacy fixtures remain regression-only until
their distinct nested/manifest/shared semantics are migrated; their UI is no
longer part of the manual walkthrough. No MF changeset is required for private
test tooling; the Modern runtime PR includes its patch changeset.


### Traffic demo usability correction (2026-09-15)

The original default sent 20 requests while requiring manual release of the old
loader. With a three-second admission timeout, a user reading the UI would often
see 503 responses before releasing it. The UI also discarded the visible queue
count on completion and reported only `rejected`.

Default traffic now sends 12 new requests and releases automatically after about
1.4 seconds. Real coordinator queue observations and lifecycle events remain
visible, response rows retain Modern's rejection message, and the right preview
refreshes after a successful update. Explicit overflow, timeout and custom manual
presets retain failure/debugging coverage. No Modern queue limits were relaxed.

Validation commands from `/private/tmp/mf-r4-static-update`:

- `pnpm --filter modernjs-ssr-cache-updates run e2e:playground`: passed (three
  browser scenarios and existing HTTP/memory checks). The first sandboxed attempt
  failed to bind loopback with EPERM; rerunning with local-port permission passed.
- `pnpm run e2e:modern:ssr`: passed, including all existing suites and the expanded
  playground assertions. Both static/dynamic automatic runs return 13 HTTP 200s
  (12 new plus one held), queue peak is nonzero, A returns the target version and
  the PID stays unchanged. Dynamic overflow produces 16 queue-full 503s; timeout
  produces 12 wait-timeout 503s. Cypress also verifies the default requires no
  release click and that the timeout reason appears in the UI.
- `pnpm exec prettier --check .`: passed.
- `node --check apps/modernjs-ssr/cache-updates/playground/traffic.cjs`,
  `node --check apps/modernjs-ssr/cache-updates/playground/start.cjs`, and
  `node --check apps/modernjs-ssr/cache-updates/playground/app.js`: passed.
- `git diff --check`: passed.

Logs: `/tmp/lab-traffic-fix-test.log`, `/tmp/lab-traffic-full.log`,
`/tmp/lab-traffic-format.log`. Traffic, desktop, memory and mobile screenshots were
captured by Cypress; the traffic results screenshot was visually inspected.

The `ci:local` wrapper was skipped in accordance with the worktree rule; its
matching Modern SSR package entry was executed directly. Unrelated package unit
suites, dependency reinstall and other framework jobs were skipped because this
correction changes private demo tooling only, with no dependency/runtime changes.
No release or changeset is needed for this correction.
