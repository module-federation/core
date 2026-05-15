# Proposal: `unloadRemote` API (runtime / runtime-core)

> Scope: **design only** (phase-1). No implementation in this change.
> Context: https://github.com/module-federation/core/discussions/4566

## Problem

In SSR/Node environments, `registerRemotes(remotes, { force: true })` currently calls an internal `removeRemote`, but it does not fully clean up global/runtime caches and side-effects created by prior remote loads.

Typical symptoms:

- Global caches keep growing across re-registers (e.g. `globalThis.__FEDERATION__.__MANIFEST_LOADING__`, `globalThis.__FEDERATION__.moduleInfo` snapshot entries).
- Long-lived host processes (SSR servers, Node runtimes) can accumulate stale references and leak memory.

This proposal introduces a dedicated `unloadRemote` API with an explicit contract and coverage list.

## Goals

- Provide a **first-class, observable** remote unload capability.
- Cover **all** runtime-owned caches and global side-effects that can be safely removed.
- Define behavior for SSR/Node vs Browser.
- Provide a migration path from `registerRemotes({ force: true })` and the existing internal `removeRemote`.

Non-goals (phase-1):

- Implementing full unload logic.
- Solving every possible leak caused by user-land references (e.g. app-level singletons holding onto exposed modules).

## API Shape

### Primary API

Add a new method on `ModuleFederation`:

```ts
type UnloadRemoteTarget =
  | string // remote name or alias
  | { name: string; entry?: string; version?: string; scope?: string };

type UnloadRemoteOptions = {
  /**
   * If true, tries to unload even if runtime detects active consumption.
   * Default: false.
   */
  force?: boolean;

  /**
   * If true, removes global snapshot/manifest records.
   * Default: true.
   */
  purgeSnapshot?: boolean;

  /**
   * If true, removes global share entries that were contributed by the remote.
   * Default: "auto" (remove only if not used by other hosts/remotes).
   */
  purgeShareScope?: boolean | 'auto';

  /**
   * For SSR/Node only: attempt to drop Node-module / VM cached artifacts if possible.
   * Default: false (best-effort only, no hard guarantees).
   */
  purgeNodeModuleCache?: boolean;

  /**
   * Abort ongoing load/unload operations.
   */
  signal?: AbortSignal;
};

type UnloadRemoteResult = {
  target: { name: string; resolvedEntry?: string; resolvedKey?: string };
  removed: {
    // Runtime-owned caches
    moduleCache: boolean;
    globalLoading: boolean;
    manifestCache: boolean;
    manifestLoading: boolean;
    snapshot: boolean;
    instances: boolean;
    shareScope: boolean;
    preloadedMap: boolean;
    globalEntryExport: boolean;
  };
  warnings: string[];
};

unloadRemote(target: UnloadRemoteTarget, options?: UnloadRemoteOptions): Promise<UnloadRemoteResult>;
```

Rationale (async):

- In Node/SSR, unload may involve waiting on in-flight loads, plugin hooks, or async fetches.
- Async allows future hooks like `beforeUnloadRemote` / `afterUnloadRemote`.

### Optional convenience API

Provide a static-ish helper for multiple remotes:

```ts
unloadRemotes(targets: UnloadRemoteTarget[], options?: UnloadRemoteOptions): Promise<UnloadRemoteResult[]>;
```

## What needs to be unloaded

The list below defines the **minimum** coverage for correctness in long-lived processes.

### Runtime-core / runtime owned caches

- **Host instance remotes list**
  - Remove the remote entry from `host.options.remotes` (name match, plus alias handling).

- **Per-host module cache**
  - Remove `host.moduleCache.get(remoteName)`.

- **Global remote-entry loading registry**
  - Remove `globalThis.__GLOBAL_LOADING_REMOTE_ENTRY__[compose(name, entry)]`.
  - Also consider cleaning any alias-derived keys if the runtime creates them.

- **Snapshot / Manifest caches**
  - Per-host manifest cache: `host.snapshotHandler.manifestCache`.
  - Global manifest loading registry: `globalThis.__FEDERATION__.__MANIFEST_LOADING__`.
  - Global snapshot registry: `globalThis.__FEDERATION__.moduleInfo` entries for:
    - `remoteName:remoteEntry` (manifest URL case)
    - `remoteName:version` (version-based case)
    - Host snapshot remotesInfo entry pointing to this remote

- **Global instances list**
  - Remove the remote instance from `globalThis.__FEDERATION__.__INSTANCES__` if it belongs to the unloaded remote.

- **Global share scope map**
  - Remove shared entries that were **contributed by this remote** and are not used by others.
  - For `force: true`, allow dropping even if `useIn` indicates usage (with warnings).

- **Preload records**
  - Clear `globalThis.__FEDERATION__.__PRELOADED_MAP__` entries that are scoped to the remote.
  - If there is no stable remote-scoped keying, do not over-delete; record warnings.

### Global side-effects created by remote entry

- **Remote entry exports on globalThis**
  - Remove or nullify `globalThis[remoteInfo.entryGlobalName]` (browser global container pattern).
  - If not configurable, set `undefined` as a fallback.

### Browser vs Node differences

- Browser
  - Script/link DOM nodes might have been created and remain attached.
  - If runtime can track created elements (recommended via loader hook), it can remove them.
  - Without tracking, **do not** try to scan/remove arbitrary `<script>` tags.

- Node/SSR
  - Remote entry may be evaluated in a `vm` context or via dynamic import.
  - Node module cache / ESM module registry is not reliably mutable across all loaders.
  - Provide only **best-effort** cleanup behind `purgeNodeModuleCache` (default false), and report warnings.

## Hooks (optional but recommended)

Introduce plugin hooks to let integrators clean their own caches:

```ts
beforeUnloadRemote: AsyncWaterfallHook<{ target; options; origin }>
afterUnloadRemote: AsyncHook<[ { result; origin } ]>
```

This avoids hardcoding framework-specific caches in core.

## Relationship with `registerRemotes({ force: true })` and `removeRemote`

### Current behavior

- `registerRemotes(..., { force: true })` calls a private `removeRemote(remote)`.
- `removeRemote` is currently incomplete for SSR/Node and is not an explicit public contract.

### Proposed migration

1. Introduce public `unloadRemote`.
2. Refactor internal `removeRemote` to call `unloadRemote` (or share the same internal implementation).
3. Update `registerRemotes(..., { force: true })` to:
   - `await unloadRemote(target, { purgeSnapshot: true, purgeShareScope: 'auto', ... })`
   - then register the new remote.
4. Keep `force: true` behavior for backward compatibility, but make it **correct** by delegating to `unloadRemote`.

## Risks & Compatibility

### Unloading consumed modules

- If an exposed module has been imported and retained by user code, unloading runtime caches does not revoke those references.
- For webpack-style module factories, the module may also be cached in the bundler's module cache.
- Recommendation:
  - Default `force: false` should be conservative and warn/refuse when it can detect active consumption.
  - `force: true` should proceed but return warnings.

### Concurrent load/unload

- There can be in-flight `loadRemote`/`getRemoteEntry`/manifest fetch.
- The unload implementation should guard via:
  - per-remote mutex/lock in runtime
  - `AbortSignal` propagation where supported
  - idempotency (double-unload is OK)

### Share scope state

- Share scope is global; deleting entries can break other remotes/hosts.
- The default should be `'auto'` cleanup:
  - Only delete shared entries that:
    - were contributed by this remote (`from === remoteName`)
    - and are not used elsewhere (`useIn` empty)
  - Never delete host-owned share entries.

### Webpack module cache / VM context

- Webpack runtime caches are not uniformly accessible from this library.
- Node `vm` evaluation can leave references in closures.
- Provide best-effort optional cleanup, but document that full GC is not guaranteed.

## Acceptance criteria (for future implementation)

- A Node/SSR regression test shows that after `registerRemotes(...,{force:true})` and re-load:
  - `globalThis.__FEDERATION__.__MANIFEST_LOADING__` does not grow.
  - `globalThis.__FEDERATION__.moduleInfo` does not retain prior remote snapshot entries.
  - `host.moduleCache` does not retain the removed remote.

