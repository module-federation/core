# Lynx Federation Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every thermonuclear architecture finding from the Lynx Module
Federation implementation while preserving native, iOS, Web, Node, and CI
behavior.

**Architecture:** Replace private or implicit state with public, typed
boundaries: Rspeedy chain configuration for cache events, atomic manifest cache
records, per-compilation bundle state, and an explicit lazy-load controller.
Move demo and iOS behavior behind directly testable collaborators, then prove
the assembled product with existing real E2E paths.

**Tech Stack:** TypeScript, Rspack/Rspeedy, Module Federation runtime-core,
Rstest, Node ESM test runners, Objective-C/XCTest, GitHub Actions, pnpm/Turbo.

## Global Constraints

- Node.js `24`, pnpm `10.28.0`, and Turbo are required by repository CI.
- Preserve `asyncStartup`, no eager shares, and existing emitted bundle names.
- Web may use `publicPath: 'auto'`; native requires explicit
  `LYNX_REMOTE_ORIGIN`-derived origins.
- Preserve synchronous Lynx `PromiseLike` lazy-bundle behavior.
- Do not add dependencies, broad ATS exceptions, or private Lynx plugin field
  access.
- Every production behavior change starts with a test that fails for the
  intended reason.
- Keep all new production files below 1,000 lines and split the existing
  901-line runtime chunk test by responsibility.

---

## File Ownership

| File | Responsibility after refactor |
| --- | --- |
| `packages/runtime-core/src/plugins/snapshot/SnapshotHandler.ts` | Atomic requested-URL → manifest/resolved-URL cache records. |
| `packages/sdk/src/generateSnapshotFromManifest.ts` | Typed public-path base URL option. |
| `packages/lynx/src/plugin.ts` | Public Rspeedy chain configuration and adapter orchestration only. |
| `packages/lynx/src/remoteBundleCompilationState.ts` | Fresh, typed state per Rspack `Compilation`. |
| `packages/lynx/src/chunkLoadingMatcher.ts` | Template hooks and runtime matcher generation. |
| `packages/lynx/src/externalBundle.ts` | Asset snapshot/encode/delete phase using compilation state. |
| `packages/lynx/src/remoteBundle.ts` | Remote plan validation and plugin composition. |
| `packages/lynx/src/lazyChunkLoadController.ts` | Synchronous-thenable-safe lazy chunk settlement state machine. |
| `packages/lynx/src/runtimeChunkLoading.ts` | Container patch and section-vs-lazy dispatch. |
| `apps/.../src/app/catalogLoadController.ts` | Framework-independent remote-load transaction. |
| `apps/.../src/app/useFederatedCatalog.ts` | React state projection and one in-flight transaction reference. |
| `apps/.../test/support/artifact-server.mjs` | Shared static artifact serving, request tracing, and shutdown. |
| `apps/.../ios/OrbitControl/OrbitResource*.{h,m}` | Resolver, store, downloader, and Lynx protocol adapter boundaries. |

## Task 1: Make manifest URL caching atomic

**Files:**

- Modify: `packages/runtime-core/src/plugins/snapshot/SnapshotHandler.ts:75-435`
- Modify: `packages/runtime-core/src/remote/index.ts:697-716`
- Modify: `packages/runtime-core/__tests__/snapshot.spec.ts`
- Modify: `packages/sdk/src/generateSnapshotFromManifest.ts:12-82`
- Modify: `packages/sdk/__tests__/generateSnapshotFromManifest.spec.ts`

**Interfaces:**

- Consumes: requested `manifestUrl`, `Response.url`, and `errorLoadRemote`.
- Produces: `clearManifestCache(manifestUrl): void` clearing manifest record and
  in-flight work; `resolvedManifestUrl?: string` SDK option.

- [ ] **Step 1: Add failing runtime-core regressions.**

  Add tests that make the first response expose a redirect URL and fail JSON
  parsing, then recover through `errorLoadRemote` and assert the snapshot uses
  the requested URL rather than the stale redirect. Add a second test that
  removes/re-registers the remote and verifies both cache data and loading
  promise are absent.

  ```ts
  expect(snapshot.remoteEntry).toContain('requested.example');
  expect(handler.manifestCache.has(manifestUrl)).toBe(false);
  ```

- [ ] **Step 2: Run the regression tests red.**

  Run: `pnpm --filter @module-federation/runtime-core exec rstest run __tests__/snapshot.spec.ts`

  Expected: FAIL because `manifestResolvedUrlCache` is written before
  `Response.json()` succeeds.

- [ ] **Step 3: Replace parallel caches with one record.**

  Introduce:

  ```ts
  interface ManifestCacheRecord {
    manifest: Manifest;
    resolvedUrl: string;
  }
  ```

  Parse the response first, then cache `{ manifest, resolvedUrl: res.url ||
  manifestUrl }`. Cache hook-recovered manifests with `resolvedUrl:
  manifestUrl`. Make `clearManifestCache` remove the record and
  `manifestLoading[manifestUrl]`; remove the second deletion from
  `RemoteHandler.removeRemote`.

- [ ] **Step 4: Rename the SDK boundary and add its failing test.**

  Change the options shape and test it:

  ```ts
  generateSnapshotFromManifest(manifest, {
    version: 'https://requested.example/mf-manifest.json',
    resolvedManifestUrl: 'https://redirected.example/v2/mf-manifest.json',
  });
  ```

  The expected public path is `https://redirected.example/v2/`.

- [ ] **Step 5: Run the targeted tests green.**

  Run: `pnpm --filter @module-federation/runtime-core exec rstest run __tests__/snapshot.spec.ts`

  Run: `pnpm --filter @module-federation/sdk exec rstest run __tests__/generateSnapshotFromManifest.spec.ts`

  Expected: both pass, including redirect, recovery, and invalidation cases.

- [ ] **Step 6: Commit the atomic cache boundary.**

  ```bash
  git add packages/runtime-core packages/sdk
  git commit -m "fix(runtime): make manifest URL caching atomic"
  ```

## Task 2: Use the public Rspeedy cache-events configuration surface

**Files:**

- Modify: `packages/lynx/src/plugin.ts:1-183`
- Modify: `packages/lynx/src/plugin.remoteBundle.test.ts`
- Modify: `packages/lynx/src/plugin.testUtils.ts`

**Interfaces:**

- Consumes: bundler-chain plugin slot `lynx:cache-events` and exported
  `LynxCacheEventsPlugin` / `LynxCacheEventsPluginOptions`.
- Produces: remote-bundle-only `setupListTransformer: () => []` configuration
  without reading plugin instance fields.

- [ ] **Step 1: Add a failing adapter test.**

  Extend the fake bundler chain with a recorded `plugin(name).use(Plugin,
  args)` call. Assert a remote bundle config records:

  ```ts
  expect(cacheEventsUse).toEqual([
    LynxCacheEventsPlugin,
    [{ setupListTransformer: expect.any(Function) }],
  ]);
  expect(cacheEventsUse[1][0].setupListTransformer(['event'])).toEqual([]);
  ```

  Assert a non-remote host does not override the slot.

- [ ] **Step 2: Run the adapter test red.**

  Run: `pnpm --filter @module-federation/lynx exec rstest run src/plugin.remoteBundle.test.ts`

  Expected: FAIL because the current implementation mutates `config.plugins`
  after bundler-chain configuration.

- [ ] **Step 3: Configure the public chain slot.**

  Import the exported class as a value. In `modifyBundlerChain`, after the
  environment and remote-bundle checks, apply:

  ```ts
  chain.plugin('lynx:cache-events').use(LynxCacheEventsPlugin, [
    { setupListTransformer: () => [] },
  ]);
  ```

  Delete `disableRemoteEntryEventCaching`, its protected-options cast, and its
  call from `modifyRspackConfig`.

- [ ] **Step 4: Run the adapter tests green.**

  Run: `pnpm --filter @module-federation/lynx exec rstest run src/plugin.remoteBundle.test.ts`

  Expected: PASS; no test reads `.options`.

- [ ] **Step 5: Commit the public configuration boundary.**

  ```bash
  git add packages/lynx/src/plugin.ts packages/lynx/src/plugin.remoteBundle.test.ts packages/lynx/src/plugin.testUtils.ts
  git commit -m "refactor(lynx): configure cache events through rspeedy"
  ```

## Task 3: Give each compilation explicit remote-bundle state

**Files:**

- Create: `packages/lynx/src/remoteBundleCompilationState.ts`
- Modify: `packages/lynx/src/chunkLoadingMatcher.ts`
- Modify: `packages/lynx/src/externalBundle.ts`
- Modify: `packages/lynx/src/remoteBundle.ts`
- Modify: `packages/lynx/src/chunkLoadingMatcher.test.ts`
- Modify: `packages/lynx/src/plugin.remoteBundle.test.ts`

**Interfaces:**

- Produces:

  ```ts
  export interface RemoteBundleCompilationState {
    discardedTemplateAssets: Set<string>;
    lazyBundleAssets: Set<string>;
    lazyBundleAssetByExpose: Map<string, string>;
    pairedBundleChunks: Set<string>;
    sourceAssets: Array<{ content: string; name: string }>;
  }
  export const createRemoteBundleCompilationStateStore: () => {
    for(compilation: Compilation): RemoteBundleCompilationState;
  };
  ```

- [ ] **Step 1: Add a failing fresh-compilation test.**

  Drive the matcher hooks for two distinct fake compilations. Add an asset to
  the first state, then assert the second state starts with empty sets/maps and
  cannot preserve the first compilation's lazy asset.

- [ ] **Step 2: Run it red.**

  Run: `pnpm --filter @module-federation/lynx exec rstest run src/chunkLoadingMatcher.test.ts`

  Expected: FAIL because state is currently allocated in `configureRemoteBundle`
  and shared through plugin options.

- [ ] **Step 3: Create the state store and thread it through plugins.**

  Use a `WeakMap<Compilation, RemoteBundleCompilationState>`. Clear nothing
  manually at `thisCompilation`; retrieve the fresh state from the store.
  Replace mutable option fields with `stateStore`. Make the external-bundle
  process-assets hook assign `state.sourceAssets`, and make its emit hook read
  the same compilation's state. Store paired chunks in a `Set`.

- [ ] **Step 4: Preserve plugin responsibilities.**

  Keep matcher, paired-assets, and encoder plugins separate. `remoteBundle.ts`
  creates exactly one store per configured remote bundle and passes it to all
  three plugins. No plugin instance may retain compilation asset arrays.

- [ ] **Step 5: Run the focused suite green.**

  Run: `pnpm --filter @module-federation/lynx exec rstest run src/chunkLoadingMatcher.test.ts src/externalBundle.test.ts src/plugin.remoteBundle.test.ts`

  Expected: PASS, including fresh compilation state.

- [ ] **Step 6: Commit compilation state ownership.**

  ```bash
  git add packages/lynx/src/remoteBundleCompilationState.ts packages/lynx/src/chunkLoadingMatcher.ts packages/lynx/src/externalBundle.ts packages/lynx/src/remoteBundle.ts packages/lynx/src/*.test.ts
  git commit -m "refactor(lynx): isolate remote bundle compilation state"
  ```

## Task 4: Replace lazy-chunk flag soup with a controller and focused suites

**Files:**

- Create: `packages/lynx/src/lazyChunkLoadController.ts`
- Create: `packages/lynx/src/runtimeChunkLoading.testUtils.ts`
- Create: `packages/lynx/src/runtimeSectionLoading.test.ts`
- Create: `packages/lynx/src/runtimeLazyBundleLoading.test.ts`
- Create: `packages/lynx/src/runtimeChunkUrl.test.ts`
- Modify: `packages/lynx/src/runtimeChunkLoading.ts`
- Delete: `packages/lynx/src/runtimeChunkLoading.test.ts`

**Interfaces:**

- Consumes: `LynxChunk`, `InstalledChunk`, `installChunkAfterConsumes`, and
  `loadWithTimeout`.
- Produces:

  ```ts
  export const createLazyChunkLoadController = (args: {
    chunkKey: string;
    installedChunks: Record<string, InstalledChunk | undefined>;
    timeout: number;
  }) => ({ load(request: string): ChunkPromise });
  ```

- [ ] **Step 1: Split existing tests without changing assertions.**

  Move section-load tests to `runtimeSectionLoading.test.ts`, lazy thenable/
  consumes/retry/timeout tests to `runtimeLazyBundleLoading.test.ts`, and URL
  cases to `runtimeChunkUrl.test.ts`. Move `createWebpackRequire`, registry,
  and synchronous-thenable helpers into `runtimeChunkLoading.testUtils.ts`.

- [ ] **Step 2: Add a failing controller behavior test.**

  Add a synchronous thenable test that asserts module installation and observer
  callback occur before the current stack returns when no consumes are pending.
  Add a stale timed-out load test that cannot delete a later retry's tuple.

- [ ] **Step 3: Run only the new lazy suite red.**

  Run: `pnpm --filter @module-federation/lynx exec rstest run src/runtimeLazyBundleLoading.test.ts`

  Expected: FAIL because `createLazyChunkLoadController` does not exist.

- [ ] **Step 4: Implement explicit settlement.**

  Give the controller one discriminated state and generation identity. It must
  call the Lynx `PromiseLike.then` directly, install synchronous chunks before
  returning, wait for consumes before completion, race only the owned tuple
  against its primary load, and delete the tuple only when it still owns it.

- [ ] **Step 5: Reduce `runtimeChunkLoading.ts` to dispatch.**

  Keep URL joining, section loading, registry lookup, and handler replacement
  there. Delegate the lazy branch to the controller. Delete `active`,
  `insideLoader`, `ImmediateLazyLoad`, and their scattered settlement paths.

- [ ] **Step 6: Run all chunk suites green.**

  Run: `pnpm --filter @module-federation/lynx exec rstest run src/runtimeSectionLoading.test.ts src/runtimeLazyBundleLoading.test.ts src/runtimeChunkUrl.test.ts`

  Expected: PASS; no test file exceeds 500 lines.

- [ ] **Step 7: Commit the lazy-load controller.**

  ```bash
  git add packages/lynx/src/lazyChunkLoadController.ts packages/lynx/src/runtimeChunkLoading.ts packages/lynx/src/runtime*Loading.test.ts
  git commit -m "refactor(lynx): isolate lazy chunk load settlement"
  ```

## Task 5: Make demo loading transactional and directly testable

**Files:**

- Create: `apps/lynx-module-federation-demo/src/app/catalogLoadController.ts`
- Create: `apps/lynx-module-federation-demo/src/app/catalogLoadController.test.ts`
- Modify: `apps/lynx-module-federation-demo/src/app/useFederatedCatalog.ts`
- Modify: `apps/lynx-module-federation-demo/src/app/App.tsx`

**Interfaces:**

- Produces:

  ```ts
  export type CatalogLoadResult = {
    activityFeed: ComponentType<ActivityFeedProps>;
    card: ComponentType<RemoteCardProps>;
    details: ComponentType<RemoteDetailsProps>;
    sharedState: SharedStateView;
    singletonShared: boolean;
  };
  export const createCatalogLoadController = (dependencies) => ({ load(): Promise<CatalogLoadResult> });
  ```

- [ ] **Step 1: Add failing controller tests.**

  Call `load()` twice before resolving dependencies and assert each call returns
  the same promise and each remote import runs once. Reject one load after
  partial imports, then resolve a retry and assert no stale result is returned.

- [ ] **Step 2: Run them red.**

  Run: `pnpm --filter lynx-module-federation-demo exec rstest run src/app/catalogLoadController.test.ts`

  Expected: FAIL because the controller module is absent.

- [ ] **Step 3: Implement the framework-independent transaction.**

  Inject `loadCompiledImportRemotes`, `loadRuntimeActivityFeed`, and shared
  state functions. Cache one in-flight promise; clear it after settlement;
  validate singleton identity once per successful controller lifetime.

- [ ] **Step 4: Project controller results through a discriminated hook state.**

  Replace independent component/error/ready state with `idle`, `loading`,
  `ready`, and `error` records. The hook retains an `inFlightRef`, clears
  components on error, and maps a successful result to UI activity atomically.
  Make `LoadButton` ignore taps while `loading` or `ready`.

- [ ] **Step 5: Run tests green and build the app.**

  Run: `pnpm --filter lynx-module-federation-demo exec rstest run src/app/catalogLoadController.test.ts`

  Run: `pnpm --filter lynx-module-federation-demo run build`

  Expected: PASS and host compiles.

- [ ] **Step 6: Commit transactional demo loading.**

  ```bash
  git add apps/lynx-module-federation-demo/src/app
  git commit -m "refactor(lynx-demo): serialize remote loading"
  ```

## Task 6: Isolate artifact serving and native dev output

**Files:**

- Create: `apps/lynx-module-federation-demo/test/support/artifact-server.mjs`
- Create: `apps/lynx-module-federation-demo/test/support/artifact-server.test.mjs`
- Modify: `apps/lynx-module-federation-demo/test/native-dev-server.mjs`
- Modify: `apps/lynx-module-federation-demo/test/real-web/run.mjs`
- Modify: `apps/lynx-module-federation-demo/test/ios/run.mjs`
- Modify: `apps/lynx-module-federation-demo/lynx*.config.mjs`
- Modify: `apps/lynx-module-federation-demo/test/native-artifacts.mjs`

**Interfaces:**

- Produces:

  ```js
  export const createArtifactServer = async ({ root, routes = {} }) => ({
    origin,
    requests,
    waitFor(url, timeout),
    close(),
  });
  ```

- [ ] **Step 1: Add failing artifact-server tests.**

  Serve a temporary root, request an artifact, assert path traversal is denied,
  request trace records the path/status, and `close()` releases the server.

- [ ] **Step 2: Run them red.**

  Run: `node --test apps/lynx-module-federation-demo/test/support/artifact-server.test.mjs`

  Expected: FAIL because the server module is absent.

- [ ] **Step 3: Implement the focused server.**

  Resolve requested paths beneath `root`, reject escapes, record every request,
  serve explicit dynamic routes before files, and make shutdown idempotent.

- [ ] **Step 4: Add environment-controlled output roots.**

  Each Lynx demo config derives `output.path` from `LYNX_OUTPUT_ROOT` when set,
  otherwise preserves the existing `dist/*` path. In
  `native-dev-server.mjs`, create one `mkdtemp` output root and pass it to all
  build/dev children. Delete only that directory in `finally`; remove all
  `rename(distRoot, ...)` calls.

- [ ] **Step 5: Replace generated-source proxy assertions.**

  Keep `native-artifacts.mjs` assertions at public boundaries: manifest schema,
  expected remote/container/lazy files, bundle count, and loadability through
  the server. Move compiler-source behavior assertions into `packages/lynx`
  unit tests.

- [ ] **Step 6: Migrate Web and iOS runners.**

  Use `createArtifactServer` in real-Web and iOS runners while retaining each
  scenario's current assertions and diagnostics.

- [ ] **Step 7: Run focused E2E checks green.**

  Run: `node --test apps/lynx-module-federation-demo/test/support/artifact-server.test.mjs`

  Run: `pnpm --dir apps/lynx-module-federation-demo run test:native-dev-server`

  Run: `pnpm --dir apps/lynx-module-federation-demo run e2e:web`

  Expected: PASS; canonical `apps/lynx-module-federation-demo/dist` remains
  untouched before and after native dev-server testing.

- [ ] **Step 8: Commit isolated E2E infrastructure.**

  ```bash
  git add apps/lynx-module-federation-demo/test apps/lynx-module-federation-demo/*.config.mjs
  git commit -m "refactor(lynx-demo): isolate artifact test output"
  ```

## Task 7: Decompose the native iOS resource boundary and add XCTest coverage

**Files:**

- Create: `apps/lynx-module-federation-demo/ios/OrbitControl/OrbitResourceURLResolver.{h,m}`
- Create: `apps/lynx-module-federation-demo/ios/OrbitControl/OrbitResourceStore.{h,m}`
- Create: `apps/lynx-module-federation-demo/ios/OrbitControl/OrbitResourceDownloader.{h,m}`
- Create: `apps/lynx-module-federation-demo/ios/OrbitControlTests/OrbitResourceTests.m`
- Modify: `apps/lynx-module-federation-demo/ios/OrbitControl/OrbitResourceFetcher.{h,m}`
- Modify: `apps/lynx-module-federation-demo/ios/OrbitControl.xcodeproj/project.pbxproj`
- Modify: `apps/lynx-module-federation-demo/test/ios-project.mjs`
- Modify: `apps/lynx-module-federation-demo/test/ios/run.mjs`

**Interfaces:**

- Produces:

  ```objc
  @interface OrbitResourceURLResolver : NSObject
  - (instancetype)initWithRootBundleURL:(NSString *)rootBundleURL;
  - (NSURL *)resolvedURLForString:(NSString *)urlString;
  - (BOOL)isAllowedLocalURL:(NSURL *)url;
  @end
  ```

  ```objc
  @interface OrbitResourceStore : NSObject
  - (NSString *)pathForURLString:(NSString *)urlString;
  - (NSString *)storeData:(NSData *)data forURLString:(NSString *)urlString error:(NSError **)error;
  @end
  ```

- [ ] **Step 1: Create failing XCTest cases.**

  Test relative URL resolution, `../` and symlink escape rejection, approved
  loopback URLs, cache replacement under the 64 MiB limit, oversize download
  cancellation, and temporary-file cleanup.

- [ ] **Step 2: Add the test target and run it red.**

  Add `OrbitControlTests` to the Xcode project and include:

  ```bash
  -only-testing:OrbitControlTests
  ```

  in the existing Release `xcodebuild` invocation.

  Run: `pnpm --filter lynx-module-federation-demo run test:ios-project`

  Expected: FAIL until the source/target wiring and collaborators exist.

- [ ] **Step 3: Extract resolver and store.**

  Move URL conversion and local containment into
  `OrbitResourceURLResolver`; move cache paths, atomic persistence, and byte
  accounting into `OrbitResourceStore`. Preserve the current 64 MiB limits and
  errors exactly.

- [ ] **Step 4: Extract injectable downloader.**

  Move `NSURLSessionDownloadDelegate` coordination into
  `OrbitResourceDownloader`; accept an injected session configuration for
  XCTest's custom `NSURLProtocol`. Cancel and delete when expected or received
  bytes exceed the limit.

- [ ] **Step 5: Reduce fetcher to Lynx adaptation.**

  `OrbitResourceFetcher` selects local vs remote paths, invokes the resolver,
  store, and downloader, and completes Lynx requests. It owns no URL policy,
  cache accounting, or download delegate maps.

- [ ] **Step 6: Replace regex behavior proxies with structural checks.**

  `ios-project.mjs` checks the Xcode target, files, single Release command,
  all test target selectors, and ATS policy. Remove assertions that merely
  search Objective-C source for implementation strings.

- [ ] **Step 7: Run policy and real iOS tests green.**

  Run: `pnpm --filter lynx-module-federation-demo run test:ios-project`

  Run: `pnpm run ci:local --only=e2e-lynx`

  Expected: policy test passes locally; macOS CI runs `OrbitControlTests` plus
  the three existing UI tests in one Release build.

- [ ] **Step 8: Commit the native resource boundaries.**

  ```bash
  git add apps/lynx-module-federation-demo/ios apps/lynx-module-federation-demo/test/ios-project.mjs apps/lynx-module-federation-demo/test/ios/run.mjs
  git commit -m "refactor(lynx-ios): isolate resource loading boundaries"
  ```

## Task 8: Document compatibility and remove CI configuration drift

**Files:**

- Modify: `apps/lynx-module-federation-demo/README.md`
- Modify: `apps/lynx-module-federation-demo/package.json`
- Create: `apps/lynx-module-federation-demo/test/ci-policy.mjs`
- Modify: `.github/workflows/e2e-metro.yml`
- Modify: `.github/workflows/e2e-lynx.yml`
- Modify: `apps/lynx-module-federation-demo/test/ios-project.mjs`

**Interfaces:**

- Produces: one documented `rspack-canary-rspeedy.mjs` compatibility boundary;
  one `ANDROID_EMULATOR_PARTITION_SIZE_MB` environment value.

- [ ] **Step 1: Add a failing workflow policy assertion.**

  Create `test/ci-policy.mjs` and expose it as `test:ci-policy`. Require
  `ANDROID_EMULATOR_PARTITION_SIZE_MB` and reject a second literal partition
  value in emulator options.

- [ ] **Step 2: Run it red.**

  Run: `pnpm --dir apps/lynx-module-federation-demo run test:ci-policy`

  Expected: the dedicated policy assertion fails until the workflow uses one
  environment value.

- [ ] **Step 3: Derive both emulator settings from one value.**

  Set `ANDROID_EMULATOR_PARTITION_SIZE_MB: 1024`; use
  `${{ env.ANDROID_EMULATOR_PARTITION_SIZE_MB }}M` for `disk-size` and
  `-partition-size ${{ env.ANDROID_EMULATOR_PARTITION_SIZE_MB }}` for emulator
  options.

- [ ] **Step 4: Document the wrapper.**

  Explain the canary wrapper's upstream resolution constraint, commands that
  own it, and the exact removal condition: Rspeedy must support the repository
  Rspack package directly. Do not expose wrapper imports to application code.

- [ ] **Step 5: Verify formatting and policy.**

  Run: `pnpm exec prettier --check .github/workflows/e2e-metro.yml apps/lynx-module-federation-demo/README.md`

  Run: `pnpm --dir apps/lynx-module-federation-demo run test:ci-policy`

  Run: `git diff --check`

  Expected: PASS.

- [ ] **Step 6: Commit compatibility documentation and CI consistency.**

  ```bash
  git add .github/workflows/e2e-metro.yml apps/lynx-module-federation-demo/README.md apps/lynx-module-federation-demo/package.json apps/lynx-module-federation-demo/test/ci-policy.mjs
  git commit -m "docs(lynx): document rspeedy compatibility boundary"
  ```

## Task 9: Full verification, simplification, and final review

**Files:**

- Modify only files required by failures from prior tasks.
- Test: all touched package, demo, local CI, and GitHub CI jobs.

- [ ] **Step 1: Run package validation.**

  ```bash
  pnpm exec turbo run build --filter=@module-federation/runtime-core --filter=@module-federation/sdk --filter=@module-federation/lynx
  pnpm exec turbo run test --filter=@module-federation/runtime-core --filter=@module-federation/sdk --filter=@module-federation/lynx --force
  pnpm exec turbo run lint --filter=@module-federation/runtime-core --filter=@module-federation/sdk --filter=@module-federation/lynx
  ```

- [ ] **Step 2: Run demo CI parity.**

  ```bash
  TURBO_ENV_MODE=loose CHOKIDAR_USEPOLLING=true pnpm run ci:local --only=e2e-lynx
  pnpm run ci:local --only=build-and-test
  ```

- [ ] **Step 3: Run final simplification audit.**

  Check that no private `.options` access, shared compilation collections,
  generated-output assertions, test skips, eager shares, or files above 1,000
  lines remain in the refactored scope. Run `git diff --check` and scoped
  Prettier.

- [ ] **Step 4: Push and monitor final GitHub CI.**

  Push the branch, confirm all latest-head checks, including `e2e-lynx-ios`,
  `e2e-metro-android`, and `e2e-metro-ios`, are green, and inspect failed logs
  before declaring completion.

- [ ] **Step 5: Commit any final scoped fixes.**

  ```bash
  git add <only-verified-fix-files>
  git commit -m "fix(lynx): complete architecture refactor"
  ```

## Plan Self-Review

- Spec coverage: Tasks 1–8 map directly to every approved architecture
  section; Task 9 proves all completion criteria.
- Placeholders: no deferred or ambiguous implementation steps remain.
- Type consistency: manifest records, compilation state, lazy controller,
  catalog result, artifact server, and iOS collaborators are named consistently
  across producer and consumer tasks.
