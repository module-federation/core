# SSR cache update: R0 contract and regression baseline

Status: implementation contract for the RFC, not an implemented update API.
[RFC and roadmap](https://bytedance.larkoffice.com/docx/I8VZdLKxPoI85NxNTkrcX2Zmnuf).

## Run the baseline

From the repository root, with Node 24 and the lockfile's pnpm version:

```sh
pnpm exec turbo run build --filter=@module-federation/runtime-tools
node --test tools/ssr-cache/baseline.test.cjs
```

The default uses the installed `@rspack/core` (currently the lockfile's canary).
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

| Case                 | What is exercised                                   | Current expectation                                                                                      |
| -------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| plain                | Static multi-level consumers across emitted chunks  | Reacquired page remains stale: TODO                                                                      |
| concat               | Same graph with module concatenation                | Page updates; saved function remains old                                                                 |
| parents              | Diagnostic JS plugin supplies missing parent edges  | Page updates; unrelated module executes once                                                             |
| shared               | Real provider singleton consumed by host            | Host invalidation, shared strict identity and retained lazy dependency pass; parent closure remains TODO |
| all non-shared cases | Drop application CJS cache, then update again       | Dynamic reference refreshes; old adapter still called: TODO                                              |
| Modern (opt-in)      | Real production resource plugin and one HTTP server | Recreate resource state to publish new manifest; PID/port unchanged                                      |

The `parents` plugin and manual page invalidation/hook rebinding in the fixture
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
needed for later lazy work. The implementation may retain a provider runtime when
safe selective invalidation is unavailable; host consumer invalidation must still
occur. Do not promise full provider GC or mutate an in-use shared singleton into a
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

R0 chooses the ownership and externally observable contracts above. The first R1
fix separates host invalidation from provider cache retention, and covers shared
identity plus a retained lazy dependency in real artifacts. It conservatively
retains the provider execution cache while shared remains in use or loading; it
does not claim selective provider GC. Parent closure and adapter disposal remain
open. R1 must prove
shared dependency retention and adapter disposal; R2 must prove stream termination;
R3/R4 must implement Modern resource ownership and safe publication. None is marked
implemented by this document. Arbitrary globals, unregistered tasks, native ESM
registry eviction and deployment-owned worker rotation remain explicit boundaries.

## R1 selective provider cleanup and transitive parents

With the companion Rspack branch `fix/mf-selective-cache`, enhanced containers
export `__webpack_clear_exposed_cache__`. It removes execution-cache entries
outside the forward dependency closure of declared and consumed shared modules,
including async dependencies. MF calls this optional method when the provider
must be retained for shared use. Older containers keep their execution cache.
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
adapter TODOs remain. Without the native flag the installed older canary is still
supported, and unsupported selective GC is explicitly skipped.

For the existing full Modern SSR CI job, use the Node 24 resolver hook so both
ESM and CJS toolchains load the local compiler (no lockfile or symlink changes):

```sh
SSR_CACHE_RSPACK_ENTRY=/absolute/path/to/rspack/packages/rspack/dist/index.js NODE_OPTIONS="--require=$PWD/tools/ssr-cache/local-rspack-hook.cjs" TURBO_ENV_MODE=loose pnpm run ci:local --only=e2e-modern-ssr
```

Verify the provider container exports the new method in the emitted artifact;
merely finding its name inside bundled MF runtime call sites is insufficient.
The Modern shared-cache spec now passes with this compiler. The separate
remote-cache runtime-capture assertion still intermittently fails; the full CI
job is not accepted as green. Adapter lifetime and R2–R6 are still open.
