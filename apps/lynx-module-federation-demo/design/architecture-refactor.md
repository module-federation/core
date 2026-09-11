# Lynx Federation Architecture Refactor Design

## Status

Approved in the Codex task on 2026-07-20.
Stored with the tracked Lynx demo design artifacts because repository `/docs`
is generated output.

## Objective

Refactor the Lynx Module Federation implementation and demos until the
architecture is direct, testable, and maintainable without changing the
already-proven behavior:

- no eager shares;
- native Lynx, iOS, Web, and Node-compatible manifest loading;
- standalone Catalog and federated host flows;
- `asyncStartup` transport;
- native split and single-chunk remote bundles;
- `publicPath: 'auto'` on Web and resolved absolute native origins;
- real Web and iOS E2E coverage;
- optimized CI with retained diagnostics.

The refactor must address every finding from the thermonuclear review and keep
the PR's public API and emitted artifact contracts stable.

## Constraints

- Prefer public Lynx/Rspeedy APIs. A private adapter is permitted only when no
  exported configuration surface exists, and then it must be isolated,
  version-bounded, and compatibility-tested.
- Preserve synchronous Lynx lazy-bundle thenable semantics. Converting the
  official thenable to a native Promise is not behavior-preserving.
- Keep compilation-scoped data out of compiler/plugin-instance state.
- Do not add eager shares, new runtime dependencies, broad ATS exceptions, or
  generated-source assertions to application E2E tests.
- Use test-driven development: every behavior change starts with a test that
  fails for the intended reason.

## Considered Approaches

### 1. Minimal patches

Fix the stale manifest URL, double-load guard, and destructive test output, but
leave the existing plugin boundaries intact.

Rejected because it preserves hidden cross-plugin state and the complicated
lazy-load settlement model. It would make CI green without meeting the
maintainability objective.

### 2. Boundary refactor (selected)

Keep the proven compiler/runtime behavior, but make ownership explicit at each
boundary: public Rspeedy chain configuration, atomic manifest records,
per-compilation bundle state, one lazy-load controller, transactional React
state, isolated test output, and focused test harnesses.

Selected because it deletes incidental coupling while preserving externally
observable behavior and allows each change to be proved independently.

### 3. Single monolithic federation coordinator

Replace the matcher, asset, manifest, and external bundle plugins with one
large plugin.

Rejected because hook ordering would be more visible but responsibilities
would become less modular, and the rewrite risk is disproportionate to the
identified problems.

## Architecture

### Public Lynx cache-event configuration

Rspeedy registers the exported `LynxCacheEventsPlugin` in the bundler chain as
`lynx:cache-events`. The federation adapter will configure that slot inside
`modifyBundlerChain` using the exported plugin and
`LynxCacheEventsPluginOptions`:

```ts
chain.plugin('lynx:cache-events').use(LynxCacheEventsPlugin, [
  { setupListTransformer: () => [] },
]);
```

This replaces `disableRemoteEntryEventCaching`, which currently reads a
protected `.options` field and reconstructs an already-instantiated plugin.
The public chain configuration is applied only for remote-bundle environments.
An adapter test will assert both the chain slot and options. No private API
fallback is required by the current Lynx/Rspeedy release.

### Atomic manifest cache records

`SnapshotHandler` will replace its parallel manifest and resolved-URL maps with
one record:

```ts
interface ManifestCacheRecord {
  manifest: Manifest;
  resolvedUrl: string;
}
```

The record is committed only after `Response.json()` succeeds. A manifest
returned by `errorLoadRemote` uses the requested manifest URL unless that hook
eventually gains an explicit resolved URL contract. Cache clearing and
in-flight loading invalidation will be one `clearManifestCache` operation, so
remote removal cannot clear half the state.

The SDK option will be renamed from the ambiguous `manifestUrl` to
`resolvedManifestUrl`. `generateSnapshotFromManifest` will derive one local
`publicPathUrl = resolvedManifestUrl ?? version` without a non-null assertion.

Tests will cover:

- redirected manifest success;
- failed JSON parsing followed by a response with an empty URL;
- `errorLoadRemote` manifest recovery after a redirected failure;
- cache invalidation and remote re-registration.

### Per-compilation remote-bundle state

Compilation data will move into a typed state object:

```ts
interface RemoteBundleCompilationState {
  discardedTemplateAssets: Set<string>;
  lazyBundleAssets: Set<string>;
  lazyBundleAssetByExpose: Map<string, string>;
  pairedBundleChunks: Set<string>;
  sourceAssets: AssetSnapshot[];
}
```

A small `RemoteBundleCompilationStateStore` owns a
`WeakMap<Compilation, RemoteBundleCompilationState>` and creates a fresh state
for each compilation. The chunk matcher, paired-assets phase, and external
bundle encoder receive the store and access state with the active
`Compilation`. They no longer share mutable arrays/maps/sets created in
`configureRemoteBundle`, and `externalBundle` no longer retains `sourceAssets`
at compiler scope.

The existing plugins remain separate because their responsibilities are
distinct:

- chunk matcher: identify lazy bundles and emit runtime matcher code;
- paired-assets plugin: rewrite paired background/main-thread assets;
- external-bundle plugin: snapshot, encode, preserve, and delete assets.

A two-compilation watch-mode test will prove that the second compilation does
not observe assets from the first.

### Explicit lazy-chunk load controller

`loadLazyChunk` currently combines tuple slots, `active`, `insideLoader`, an
`ImmediateLazyLoad` box, a timeout, and a competing installation promise.
These responsibilities will move into one internal controller with explicit
states:

```ts
type LazyChunkLoadState =
  | { kind: 'loading' }
  | { kind: 'waiting-consumes'; chunk: LynxChunk; consumes: Promise<void> }
  | { kind: 'installed'; chunk: LynxChunk }
  | { kind: 'failed'; error: unknown };
```

The controller owns the installed-chunk tuple, activity generation, timeout,
settlement, and rollback. It invokes the official `PromiseLike.then` directly,
so a synchronous Lynx thenable still installs modules and returns a
synchronously-observable thenable when no consumes are pending. All stale
completion checks are centralized in the controller rather than spread across
callbacks.

Existing behavioral tests remain authoritative. The 901-line suite will be
split into:

- `runtimeSectionLoading.test.ts`;
- `runtimeLazyBundleLoading.test.ts`;
- `runtimeChunkUrl.test.ts`;
- a small shared `runtimeChunkLoading.testUtils.ts`.

### Transactional demo load state

`useFederatedCatalog` will use one discriminated load state for the components,
error, shared-state proof, and readiness result. An `inFlightRef` stores the
single active load promise. Repeated taps return that promise instead of
starting another import or mutating the shared singleton twice.

The import/validation transaction will live in a small framework-independent
`catalogLoadController.ts`. The React hook owns rendering state and delegates
deduplication and retry to that controller, so transaction behavior can be
tested without a component renderer or React lifecycle mocks.

The transaction commits ready components and singleton evidence together. A
failed retry clears stale component data before the next transaction. Activity
and user-selected filtering remain separate UI concerns.

Tests will prove rapid repeated calls share one import operation, failed loads
do not retain partial modules, and retry succeeds cleanly.

### Isolated E2E output and shared server support

`native-dev-server.mjs` will never rename or delete the canonical `dist`.
Build configs will accept an environment-provided output root, and the test
will build into a temporary directory removed in `finally`.

Web and iOS harnesses will share a focused `test/support/artifact-server.mjs`
that owns static file serving, request recording, readiness polling, and clean
shutdown. Scenario assertions remain in their platform-specific runners.

The Metro emulator partition size will be defined once as an environment value
and used for both AVD creation and the explicit emulator CLI flag.

### Native iOS resource boundary

The 396-line Objective-C fetcher will be decomposed around testable ownership:

- `OrbitResourceURLResolver`: absolute/relative URL resolution, local-file
  containment, and allowed local-network policy;
- `OrbitResourceStore`: bounded path cache and atomic data persistence;
- `OrbitResourceDownloader`: response-size enforcement, cancellation, and
  temporary-file lifecycle;
- `OrbitResourceFetcher`: Lynx protocol adaptation and orchestration only.

The production fetcher will depend on those collaborators. A new
`OrbitControlTests` target will exercise URL traversal/symlink rejection,
relative URL resolution, cache replacement and byte limits, oversized download
cancellation, and cleanup. The real UI tests remain the end-to-end proof that
the assembled fetcher loads standalone and federated bundles.

The existing single Release `xcodebuild` invocation will include the
`OrbitControlTests` target as well as the three `OrbitControlUITests`, retaining
one compile while making the native boundary tests mandatory in CI.

`ios-project.mjs` will retain structural policy checks for project wiring and
ATS configuration, but it will stop treating source-code regexes as behavioral
tests.

### Artifact tests and compatibility wrapper

Compiler-internal emitted-source assertions belong in `packages/lynx` tests,
where the adapter contract is controlled. Demo artifact tests will assert
public outputs: manifest fields, file existence, bundle counts, HTTP loading,
and runtime behavior. They will not depend on minifier text or wrapper order.

The Rspack-canary Rspeedy wrapper remains isolated behind package scripts. The
README will document why it exists, the pinned upstream compatibility
constraint, and the condition for deleting it.

## Error Handling and Invariants

- Failed manifest parsing never publishes resolved-URL metadata.
- Cache invalidation removes the manifest record and in-flight load together.
- Each Rspack `Compilation` receives fresh mutable state.
- A lazy load settles or rolls back exactly once; stale generations cannot
  mutate the chunk table.
- Repeated UI load requests share one in-flight transaction.
- Tests never move, overwrite, or delete canonical build artifacts.
- Native resource paths remain inside the allowed root after symlink
  resolution, and downloads exceeding 64 MiB are cancelled and discarded.

## Verification

Each task will use red-green-refactor and the narrowest relevant test first.
The completed branch must pass:

- runtime-core and SDK targeted regression tests;
- all `@module-federation/lynx` unit, type, build, and lint checks;
- demo project policy and artifact tests;
- local `e2e-lynx` parity including real Web E2E;
- real GitHub macOS Lynx iOS E2E and both Metro platform jobs;
- repository formatting and `git diff --check`;
- a fresh thermonuclear correctness and code-quality audit;
- every latest-head PR check.

## Completion Criteria

The refactor is complete only when:

1. Every thermonuclear finding is removed or superseded by stronger evidence.
2. No production file crosses 1,000 lines and the 901-line test is decomposed.
3. No private Lynx plugin state is accessed.
4. Manifest URL metadata and compilation state are atomic and lifecycle-safe.
5. Lazy loading preserves synchronous thenables, timeout/retry, consumes, and
   stale-load behavior with clearer state ownership.
6. Demo and native fetch behavior have direct tests rather than regex proxies.
7. Local and real-platform CI are green on the final commit.
