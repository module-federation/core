# SSR cache update: R0 contract and regression baseline

Status: implementation contract for the RFC, not an implemented update API.
[RFC and roadmap](https://bytedance.larkoffice.com/docx/I8VZdLKxPoI85NxNTkrcX2Zmnuf).

## Run the baseline

From the repository root, with Node 24 and the lockfile's pnpm version:

```sh
pnpm exec turbo run build --filter=@module-federation/runtime-tools
SSR_CACHE_RSPACK_ENTRY=/absolute/path/to/rspack/packages/rspack/dist/index.js node --test tools/ssr-cache/baseline.test.cjs
```

Without an override the runner resolves the installed `@rspack/core`. The
lockfile pins `2.2.3-canary-76e8f696-20260911033013`, which includes the required
selective cleanup method; a local compiler override is no longer required.
To validate a local Rspack build, set `SSR_CACHE_RSPACK_ENTRY` to its absolute
`packages/rspack/dist/index.js` path. The test reports the resolved path and
version; a local build's version alone does not identify its commit.

Set `SSR_CACHE_MODERN_ENTRY` to a built Modern
`packages/server/core/dist/cjs/adapters/node/index.js` to also run the resource
publication HTTP test. Without it, that test is explicitly **skipped**, not passed.
No dependency or lockfile is rewritten. Each compiler case runs in its own Node
process and owns a temporary directory, removed on completion. Application
rebuilds within each case remain in the same process.

Known failures execute as Node test TODOs. They assert the desired behavior, not
that stale behavior is correct. An unexpected pass fails the parent test so the
TODO must be removed. To turn all known failures into blocking failures:

```sh
SSR_CACHE_STRICT=1 node --test tools/ssr-cache/baseline.test.cjs
```

A successful baseline run with TODOs is **not** production acceptance. When fixing
a defect, remove its TODO and keep its desired-behavior assertion. These tests are
an explicit development command; this change does not alter the CI workflows.

| Case                 | What is exercised                                   | Current expectation                                                            |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| plain                | Static multi-level consumers across emitted chunks  | Page updates with the companion Rspack parent metadata                         |
| concat               | Same graph with module concatenation                | Page updates; saved function remains old                                       |
| parents              | Diagnostic JS plugin supplies missing parent edges  | Page updates; unrelated module executes once                                   |
| shared               | Real provider singleton consumed by host            | Host invalidation, shared strict identity and retained lazy dependency pass    |
| all non-shared cases | Drop application CJS cache, then update again       | Dynamic reference refreshes; disposed adapter is not called on the next update |
| Modern (opt-in)      | Real production resource plugin and one HTTP server | Recreate resource state to publish new manifest; PID/port unchanged            |

The `parents` plugin and manual page invalidation in the fixture
are diagnostic interventions, not the proposed production implementation. The
fixture temporarily uses remove + register to exercise existing code; this does
not specify atomic update semantics. No test here proves complete React streaming,
HTTP remote transport, hydration compatibility, native ESM unloading, cyclic or
multi-entry graph completeness, general shared lazy dependency coverage, or stable heap
usage. Those remain R1–R6 work.

## Cross-layer ownership

| Owner                        | Required responsibilities                                                                              | Must not assume                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Modern coordinator           | Admission/drain, affected entry mapping, runtime lifecycle, publication, recovery, applied revision    | Clearing MF caches replaces renderer/loader/lazy references               |
| MF runtime                   | Explicit remote configuration update and owned cache cleanup; report errors                            | It can drain arbitrary Node callers or undo business side effects         |
| Bundler adapter              | Attach current bundler, invalidate owned execution state, generation checks, detach wrappers/listeners | A same-name MF plugin installation replaces an old closure                |
| Rspack                       | Generic module/parent/chunk metadata and MF cache primitives                                           | Chunk identity is equivalent to a Modern route                            |
| Modern JS compilation plugin | Map compilation metadata to application entries and indicate completeness                              | Dynamically computed remote identifiers can always be resolved statically |

## MF instance and adapter lifetime (R0 decision)

For a Modern-owned logical host, keep the MF instance across application rebuilds.
A persistent control plane owns its authoritative remote configuration and its
consumed shared records. An application generation owns its bundler adapters and
rendering resources. Do not create a fresh same-name instance on every rebuild:
that alone neither releases global records nor preserves shared identity.

One application can own multiple hosts/bundlers, including separate loader
bundles. Track each explicitly; a single global `currentBundler` pointer is not a
valid contract. Do not detach adapters belonging to another still-live owner.

An adapter attachment returns an idempotent disposer. Its identity is the actual
bundler runtime plus owner/generation, not the plugin name. Register callbacks and
wrappers once per attachment. Detach must remove its listeners, unregister its
routing, release captured bundler references, and restore only wrappers it still
owns (never overwrite a later third-party wrapper). Repeated attach of the same
live binding must not stack wrappers. A disposed generation cannot write results
into the current generation. Existing already-returned exports are not rewritten.

During rebuild, drain first; use old adapters while their caches still need
cleanup; detach before discarding the old runtime; initialize new bundles from the
control plane's latest configuration; attach and validate new bindings before
publication. Generated startup configuration must not silently overwrite an
accepted dynamic update. A failed rebuild may leave no serving generation; retain
the control plane needed to retry. This ordering must be validated in R1/R3.

Consumed shared exports must retain strict object identity, including dependencies
needed for later lazy work. The provider must supply selective invalidation of execution caches outside
the shared dependency closure; host consumer invalidation must still occur.
This unreleased implementation requires matching host/provider builds. Do not promise full provider GC or mutate an in-use shared singleton into a
new version. Shared preservation is a correctness requirement, not just a loaded
flag. Changes to an in-use shared dependency outside this contract must be reported
as unsupported, not silently treated as an ordinary remote update.

## Update operation and revision contract (R0 decision)

Names below describe internal semantics, not final public TypeScript API names.

- `operationId` identifies a request for update. A retry can be related to its
  original operation; it is not permission to apply the same mutation twice.
- A normalized target configuration is retained separately from the last serving
  configuration. `appliedRevision` advances only after Modern has validated and
  published a serving runtime. Clearing MF caches alone cannot advance it.
- Revision ordering is local to an application/worker. Do not compare opaque
  remote version strings lexically. External sources with ordering use an explicit
  source revision; otherwise accepted operations are serialized in arrival order.
- Resolve every caller's Promise with its own outcome. Do not silently merge
  distinct updates or report all callers successful because the last update worked.
- Validate the whole requested remote set before destructive changes. Multi-remote
  failure after mutation is not transactional rollback; recovery requires a rebuild
  from a complete retained target configuration.
- `registerRemotes` registers previously unknown remotes. Existing registration
  updates use the explicit asynchronous update API; `force` is deprecated with a
  documented migration. Adapter attach is distinct from user registration.

An update result exposes operation ID, requested revision, applied revision,
selected mode/scope and fallback reason. A failure additionally exposes phase,
original cause, whether destructive mutation began, whether the application is
still serving, and whether retry/rebuild is possible. The phase progression is:

```text
validate → analyze → close admission → drain → mutate → rebuild → validate runtime → publish → reopen
```

Validation/analysis failure leaves the old runtime available. Drain timeout does
not prove old work stopped: abandon before mutation and reopen the old generation.
After destructive mutation, failure must not reopen partially modified state.
Retry rebuild under the closed gate, with bounded waiting and explicit failure.
No universal rollback of arbitrary JavaScript side effects is promised.

## Impact analysis and request admission (R0 decision)

Start with generic module/dependency/chunk metadata, then map the affected closure
to Modern resources and entry ownership. Static **consumption** must be traceable;
static registration alone is insufficient. Missing graph edges, dynamic/mixed
consumption, or inseparable shared application context require widening scope.
If whole-application rebuild is itself unsupported, fail explicitly.

A request acquires a lease on an eligible serving generation before running any
application loader/render/action. Checking admission, selecting the generation
and registering the lease must be coordinated. The closed gate's Promise is only
a notification: waking requests recheck admission, including after another update
has started. Do not capture an old handler before waiting.

Old leases finish without awaiting the update that drains them. A request-context
attempt to await its own update is rejected. Release once on real task completion;
returning a Response, sending a stream shell, or receiving client close alone is
not proof that rendering work has settled. R2 must establish completion/abort
handshakes, including application-owned async work.

Waiters have individual cancellation/deadlines and a capacity bound. Timeout/full
queue returns 503, optionally Retry-After; disconnect removes the waiter, not the
shared update. Handle request bodies/backpressure while waiting and do not replay
side-effecting actions. Liveness/static traffic independent of the runtime can
continue; readiness policy must distinguish a bounded update from a dead process.
Thresholds are configurable and selected from R6 load measurements.

## Remaining stage gates

R0 chooses the ownership and externally observable contracts above. Shared
identity, selective provider reclamation, static parent closure and explicit
adapter disposal now pass the local artifact baseline. This does not implement
Modern admission/drain or its application-generation owner. R2 must establish
stream termination; R3/R4 must integrate resource ownership and safe publication.
Arbitrary globals, unregistered tasks, native ESM registry eviction and
deployment-owned worker rotation remain explicit boundaries.

## R1 selective provider cleanup and transitive parents

With the companion Rspack branch `fix/mf-selective-cache`, enhanced containers
export `__webpack_clear_exposed_cache__`. It removes execution-cache entries
outside the forward dependency closure of declared and consumed shared modules,
including async dependencies. MF requires this method when the provider
must be retained for shared use. Host and provider must use the matching
unreleased cache implementation; there is no legacy-provider fallback.
The existing full-cache method keeps its behavior.

This is conservative: modules also reachable from shared cannot be released,
module factories and the shared provider runtime remain, and arbitrary business
references/global side effects are not removed. Clearing execution cache does
not replace already-returned functions. The capability is compiler-owned, with
no Modern-specific routing or request coordination in Rspack.

The companion compiler also emits transitive static parent edges. Native tests
cover cycles and multiple parents; the artifact matrix covers concatenation,
deterministic numeric IDs and minification. Require these new capabilities with:

```sh
SSR_CACHE_EXPECT_NATIVE=1 SSR_CACHE_RSPACK_ENTRY=/absolute/path/to/rspack/packages/rspack/dist/index.js node --test tools/ssr-cache/baseline.test.cjs
```

This mode removes the parent-closure TODOs and requires non-shared payload GC,
shared strict identity and retained lazy dependency identity. The three stale
adapter assertions now pass with explicit disposal before application rebuild. Selective cleanup is always required. The earlier `8e63776c` canary predates this capability; the current pinned
`76e8f696` preview includes it.

For the existing full Modern SSR CI job, use the Node 24 resolver hook so both
ESM and CJS toolchains load the local compiler (no lockfile or symlink changes):

```sh
SSR_CACHE_RSPACK_ENTRY=/absolute/path/to/rspack/packages/rspack/dist/index.js NODE_OPTIONS="--require=$PWD/tools/ssr-cache/local-rspack-hook.cjs" TURBO_ENV_MODE=loose pnpm run ci:local --only=e2e-modern-ssr
```

Verify the provider container exports the new method in the emitted artifact;
merely finding its name inside bundled MF runtime call sites is insufficient.
The later CI investigation below explains the remote-cache runtime-capture
failure and the shared-cache development-mode GC failure. The explicit adapter
lifecycle below closes the stale-binding baseline; it does not alone complete
Modern ownership or R2–R6.

## R1 adapter lifecycle

`installClearCache({ webpackRequire, instance })` returns an idempotent disposer
when an instance is available. The same handle is also exposed as
`webpackRequire.federation.disposeClearCache`. Repeated installation of the same
live bundler/instance returns the same handle; attempting to change its owner
without detaching fails. Bootstrap still installs the adapter automatically.

The application owner must drain old work before calling the disposer, then
release its old application references, rebuild and validate before publication.
Disposal rejects while known cache cleanup/barriers are pending. It does not
claim to drain arbitrary renders, loaders or business tasks. Saved clear entry
points reject after disposal; saved idempotent disposers do not retain a bundler.

A symbol-keyed registry on each MF instance coordinates every attached bundler,
including adapters installed by separate bundled copies. The removal plugin
captures no bundler and dispatches to that instance's live bindings. It starts
all cleanups and waits for all outcomes before propagating a failure. Removal of
one binding does not detach another owner. The temporary force-registration path
also updates all live mappings; its API replacement remains a later task.

Instance load/register wrappers and the createScript listener are installed once
per registry. The last detach restores exact original methods/descriptors and
removes its listener. A subsequently installed third-party wrapper is preserved;
an old empty registry remains a pass-through if such a wrapper still references
it. The unused moduleCache.set generation marker/wrapper was removed.

The baseline now uses the production disposer before dropping CJS cache. It no
longer manually replaces the removeRemote plugin. With the companion compiler
and Modern entry, the current strict artifact invocation reports 13 checks with
zero TODOs/skips, including the separate WeakRef check retaining the disposer and
saved clear function. Repeated installation and cross-copy/multiple-binding cases
are covered separately by the bundler-runtime unit suite.

The WeakRef test proves adapter-owned references are released, not that all
application bundles are collectable: the retained MF control plane, active shared
providers and business exports may still reference bundled code. Modern must
supply application ownership and request/stream drain; production serve,
long-running memory stability and end-to-end recovery remain later stage gates.

## Dynamic registration/provider identity regression (R3 integration)

The Modern production-generation test exposed a gap in the original identity
assertion: the host's cached shared module could hide a provider factory whose
execution cache had been cleared. With registration name `dynamic` and provider
container name `v1`, both runtime-core and bundler cleanup matched only the
registration name against `Shared.from`. The bundler path also lacked metadata
for dynamically registered remotes, which are absent from compiler remoteInfos.

The repair resolves names from runtime registrations and loaded-container
metadata, uses provider/global names for shared ownership, and keeps registration
names separate for host cache invalidation. Regression cases cover retained or
already-detached provider runtimes, loading shared factories, and both compiler
and runtime registration metadata. Modern's companion production test requires
host and new-provider shared references to remain strictly identical through
v1/v2/v3 application rebuilds and failed-generation recovery.

Validation on Node 24.18.1 / local Rspack 2.2.2:

```sh
pnpm --filter @module-federation/runtime-core exec rstest run __tests__/register-remotes.spec.ts
pnpm --filter @module-federation/runtime-core test
pnpm --filter @module-federation/webpack-bundler-runtime test --runInBand __tests__/clearCache.spec.ts
pnpm --filter @module-federation/webpack-bundler-runtime test --runInBand
pnpm exec turbo run build --filter=@module-federation/runtime-tools
SSR_CACHE_STRICT=1 SSR_CACHE_RSPACK_ENTRY=/Users/bytedance/outter/rspack/packages/rspack/dist/index.js SSR_CACHE_MODERN_ENTRY=/Users/bytedance/work/modern.js/packages/server/core/dist/cjs/adapters/node/index.js node --test tools/ssr-cache/baseline.test.cjs
pnpm exec prettier --check .
pnpm exec prettier --check packages/runtime-core/src/remote/index.ts packages/runtime-core/__tests__/register-remotes.spec.ts packages/webpack-bundler-runtime/src/clearCache.ts packages/webpack-bundler-runtime/__tests__/clearCache.spec.ts tools/ssr-cache/README.md
pnpm exec changeset status
git diff --check
```

Runtime-core: 138 passed. Bundler runtime: 122 passed. The full formatting gate
reports 683 existing/generated or unrelated dirty files; these are not rewritten.
The touched-file gate is checked separately. Full Cypress/browser hydration and
load/heap endurance tests are not run for this repair; the real Modern production
artifact test and the strict compiler baseline complement package tests. No release.

## PR #5053: Modern SSR CI investigation

The failing job had three independent causes:

- The failing revision pinned Rspack `8e63776c`, before #15614. Its provider does not export
  `__webpack_clear_exposed_cache__`, so removing an actively shared provider
  returns HTTP 500. The matching implementation is required; the unreleased
  contract has no legacy-provider fallback. The follow-up pins the published
  `2.2.3-canary-76e8f696-20260911033013` core, CLI and native bindings, removing
  this dependency blocker.
- The first browser visit starts lazy compilation. Modern's repack handler clears
  SSR module caches, resetting the probe's module-local WeakRef and snapshots
  before the update request. The host fixture now compiles eagerly. Its original
  cross-request assertions remain unchanged.
- React development elements can retain an initialization Error in `_debugStack`.
  A failed run's heap snapshot showed `antd -> defaultEmptyImg -> _debugStack ->
CallSiteInfo -> exposed module -> nonSharedPayload`. This is a reference outside
  federation caches; GC success depended on development reloads and stack capture.
  The shared-provider fixture now bundles production dependencies even when
  served by `rslib mf-dev`. It still requires shared availability and non-shared
  payload collection, without claiming development debug-stack reclamation.

Validation commands for this CI repair:

```sh
# Reproduces the two original CI failures with the installed compiler.
pnpm run ci:local --only=e2e-modern-ssr

# Use the matching built compiler until its preview package can be pinned.
SSR_CACHE_RSPACK_ENTRY=/absolute/path/to/rspack/packages/rspack/dist/index.js NODE_OPTIONS="--require=$PWD/tools/ssr-cache/local-rspack-hook.cjs" TURBO_ENV_MODE=loose pnpm run ci:local --only=e2e-modern-ssr
SSR_CACHE_RSPACK_ENTRY=/absolute/path/to/rspack/packages/rspack/dist/index.js NODE_OPTIONS="--require=$PWD/tools/ssr-cache/local-rspack-hook.cjs" TURBO_ENV_MODE=loose pnpm run e2e:modern:ssr
pnpm exec prettier --check apps/modernjs-ssr/host/modern.config.ts apps/modernjs-ssr/another_remote/rslib.config.ts tools/ssr-cache/README.md
git diff --check
```

The full parity attempt built the packages but exposed the debug-stack GC failure;
subsequent E2E runs exercise the same workflow command after the fixture fixes.
The final clean-start run with the local Rspack build passed both Cypress specs
(2/2, no skipped tests); changed-file formatting and whitespace checks passed.
This repair changes only private test fixtures and documentation, so no additional
package tests or changeset are needed. The unrelated CI matrix is not rerun
locally; its original #5053 jobs passed. Long-running memory endurance remains R6.

### Published preview validation in an isolated worktree

The root dependencies and overrides now agree on
`2.2.3-canary-76e8f696-20260911033013`. pnpm regenerated the lockfile, including
platform bindings and dependent peer snapshots. No local Rspack resolver hook or
`SSR_CACHE_RSPACK_ENTRY` override was used for these checks:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm install --no-frozen-lockfile
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter='./packages/**'
CI=true pnpm run e2e:modern:ssr
SSR_CACHE_STRICT=1 SSR_CACHE_EXPECT_NATIVE=1 node --test tools/ssr-cache/baseline.test.cjs
pnpm exec prettier --check package.json pnpm-lock.yaml tools/ssr-cache/README.md
git diff --check
```

Results: 44 package build tasks passed; both Cypress SSR specs passed; the native
artifact baseline passed 22 tests, with no failures or TODOs. Its one Modern
application-rebuild integration test was skipped because this isolated worktree
does not supply a separate built Modern checkout. The worktree uses direct Turbo
and package scripts as required by AGENTS.md. The rest of the platform E2E matrix
is left to GitHub CI; this dependency update adds no package implementation.
