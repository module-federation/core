# Runtime-core research: bundler-free Node entry loading

Research notes for a native-Node (bundler-free) Module Federation story. All paths are relative
to the repo root of this worktree; line numbers refer to the state of the
`feat/node-native-http-loader` branch at the time of writing (other agents are editing this
worktree concurrently, so treat line numbers as approximate anchors).

Packages analyzed: `packages/runtime`, `packages/runtime-core`, `packages/sdk`,
`packages/node` (runtime plugin), plus `packages/enhanced` / `packages/webpack-bundler-runtime`
for how the bundler wires remotes in.

---

## 1. Entry loading pipeline

### 1.1 Top of the funnel: `createInstance` → `loadRemote`

- `createInstance` (`packages/runtime/src/index.ts:26-36`) just constructs
  `ModuleFederation` (from runtime-core) and registers it in the global instance list. `init`
  (`:39-54`) is the "one shared instance per name" wrapper. The module-level `loadRemote`
  (`:56-64`) delegates to the instance.
- `ModuleFederation.loadRemote` (`packages/runtime-core/src/core.ts:378-383`) delegates to
  `RemoteHandler.loadRemote` (`packages/runtime-core/src/remote/index.ts:239-372`), which:
  1. emits `beforeRequest` (`remote/index.ts:522`),
  2. matches the id against registered remotes with `matchRemoteWithNameAndExpose`
     (`remote/index.ts:548`, impl in `packages/runtime-core/src/utils/manifest.ts:18-73`),
  3. emits `afterMatchRemote`, then `sharedHandler.hooks.lifecycle.afterResolve`
     (`remote/index.ts:584-591`) — **this is where the snapshot plugin runs and may rewrite
     `remoteInfo.entry` / `remoteInfo.type` from a manifest** (see §5),
  4. gets/creates a `Module` per remote name (`remote/index.ts:598-608`) and calls
     `module.get(id, expose, options, remoteSnapshot)` (`remote/index.ts:285-290`).

### 1.2 `Module`: getEntry → init → get

`packages/runtime-core/src/module/index.ts`:

- `Module.getEntry` (`module/index.ts:110-133`) calls `getRemoteEntry(...)` and caches the
  result as `this.remoteEntryExports`.
- `Module.init` (`module/index.ts:137-281`) builds init options via
  `createRemoteEntryInitOptions` (`module/index.ts:45-88`) — the host's `shareScopeMap` object is
  passed by reference (non-enumerable `shareScopeMap` property, `module/index.ts:73-77`) — then
  calls **the container contract**:

  ```ts
  await remoteEntryExports.init(
    initContainerOptions.shareScope,
    initContainerOptions.initScope,
    initContainerOptions.remoteEntryInitOptions,
  ); // module/index.ts:226-230
  ```

  If `remoteEntryExports.init` is undefined it errors with `RUNTIME_002`
  (`module/index.ts:210-223`).
- `Module.get` (`module/index.ts:284-401`) first lets a plugin supply the factory via the
  `getModuleFactory` loader hook (`module/index.ts:310-317`), otherwise calls
  `remoteEntryExports.get(expose)` (`module/index.ts:321`), then executes the factory.

**Container interface** (`packages/runtime-core/src/type/config.ts:159-166`):

```ts
export type RemoteEntryExports = {
  get: (id: string) => () => Promise<Module>;
  init: (shareScope, initScope?, remoteEntryInitOptions?) => void | Promise<void>;
};
```

`get` receives the expose id normalized as `'.'` or `'./sub/path'`
(`utils/manifest.ts:30-47`), and must return a **factory function** (sync or async) whose result
is the module.

### 1.3 `getRemoteEntry` and the `loadEntry` hook

`packages/runtime-core/src/utils/load.ts:283-391`:

1. If already cached in `globalLoading[uniqueKey]` (keyed by `name:entry`,
   `load.ts:278-281`), reuse the in-flight promise.
2. Emit `remoteHandler.hooks.lifecycle.loadEntry` (`load.ts:305-314`). **If any plugin returns a
   truthy value, that value is used as the container and all built-in loading is skipped**
   (`load.ts:315-317`).
3. Otherwise pick an environment path (`load.ts:319-333`):

   ```ts
   const isWebEnvironment =
     typeof ENV_TARGET !== 'undefined' ? ENV_TARGET === 'web' : isBrowserEnvValue;
   return isWebEnvironment ? loadEntryDom(...) : loadEntryNode(...);
   ```

   `ENV_TARGET` is a DefinePlugin-style constant that is **not defined in the published
   runtime/runtime-core builds** (`packages/runtime/tsdown.config.ts:14-22` only defines
   `__VERSION__` and `FEDERATION_DEBUG`), so the published packages fall back to
   `isBrowserEnvValue` from the SDK (`packages/sdk/src/env.ts:11-14`,
   `typeof window !== 'undefined' && window.document`). In Node this is `false` → **Node always
   goes through `loadEntryNode`, regardless of remote `type`**.
4. On success emit `loaderHook.lifecycle.afterLoadEntry` (`load.ts:335-342`); on a script *load*
   failure (not execution failure) emit `loaderHook.lifecycle.loadEntryError`
   (`load.ts:343-387`), which can retry via the passed-in `getRemoteEntry` and return a
   recovered container.

### 1.4 Remote `type` dispatch (browser path, `loadEntryDom`)

`load.ts:189-220`:

| `remoteInfo.type` | Loader |
| --- | --- |
| `'esm'`, `'module'` | `loadEsmEntry` (`load.ts:27-55`): native `import(entry)` (with `webpackIgnore`/`@vite-ignore` comments), or `new Function('callbacks', 'import("...")...')` when the `FEDERATION_ALLOW_NEW_FUNCTION` define is set (`load.ts:37-46`; declared in `packages/runtime-core/global.d.ts:5`). The **module namespace itself** is used as the container. |
| `'system'` | `loadSystemJsEntry` (`load.ts:57-85`): `System.import(entry)`. |
| everything else (default `'global'`, plus `'var'`, `'umd'`, `'jsonp'`, `'commonjs*'`, …) | `loadEntryScript` (`load.ts:108-188`): SDK `loadScript` (a `<script>` tag), `createScript` loader-hook consulted for a custom `HTMLScriptElement` or `{script, timeout}` (`load.ts:138-162`), then the container is read from `globalThis[entryGlobalName]` via `getRemoteEntryExports` / `handleRemoteEntryLoaded` (`load.ts:87-106`, `RUNTIME_001` if the global never appeared). |

The full accepted `type` union is `RemoteEntryType` in `packages/sdk/src/types/stats.ts:3-22` —
`'var' | 'module' | 'assign' | ... | 'system' | string` (open-ended, which is why `'esm'` works
even though it's not an explicit member). Default when unspecified: `'global'`
(`packages/runtime-core/src/constant.ts:2`, applied in `load.ts:393-401` / `remote/index.ts:654-656`).

There is **no `'json'` remote type**: a `.json` entry is detected as a *manifest* by
`isPureRemoteEntry` (`packages/runtime-core/src/utils/tool.ts:36-38`) and routed through the
snapshot/manifest pipeline instead (§5).

### 1.5 Node path: `loadEntryNode` → SDK `createScriptNode`

`loadEntryNode` (`load.ts:222-276`) ignores the DOM type-switch entirely. It:

1. checks `globalThis[entryGlobalName]` for an already-registered container (`load.ts:232-239`),
2. calls the SDK's `loadScriptNode(entry, { attrs: { name, globalName, type }, loaderHook })`
   (`load.ts:241-266`), forwarding the `createScript` loader hook — in the Node flavor a plugin
   may return `{ url }` to rewrite the fetched URL (`load.ts:257-263`; consumed at
   `packages/sdk/src/node.ts:69-78`),
3. after resolution, reads the container from `globalThis[globalName]`
   (`handleRemoteEntryLoaded`, `load.ts:267-269`).

`loadScriptNode` / `createScriptNode` (`packages/sdk/src/node.ts:212-255` / `:58-210`) do the
actual work today:

- **fetch**: uses global `fetch` or lazily imports `node-fetch`; if the runtime `fetch` loader
  hook is registered it is consulted first via `lazyLoaderHookFetch` (`node.ts:39-56`,
  `loaderHook.lifecycle.fetch.emit(url, init)`).
- **CJS/UMD/global remotes** (everything that is not `'esm'`/`'module'`): the fetched source is
  wrapped in `(function(exports, module, require, __dirname, __filename) {...})` and run with
  `new vm.Script(...).runInThisContext()` (`node.ts:98-171`). `require` is a real
  `createRequire`-based function (ESM build) or `eval('require')` (CJS build)
  (`node.ts:125-138`; the `IS_ESM_BUILD` define comes from `packages/sdk/tsdown.config.ts:29-32`).
  The container is taken from `module.exports[globalName] || module.exports`
  (`node.ts:147-158`).
- **`type === 'esm' | 'module'`**: goes to `loadModule` (`node.ts:175-191`, impl `:259-293`),
  which fetches the source and evaluates it with **`vm.SourceTextModule`** — *not* native
  `import()`. Import specifiers are resolved with `new URL(specifier, url)`
  (`node.ts:277-290`), i.e. only relative/absolute URL specifiers work.
- `loadScriptNode` finally assigns the result to
  `globalThis[globalName || '__FEDERATION_<name>:custom__']` (`node.ts:230-235`).

Consequences for a plain Node host (see §3): the ESM path requires the
`--experimental-vm-modules` flag (otherwise `vm.SourceTextModule` is undefined) and cannot
resolve bare specifiers (`import 'react'` → `new URL('react', entryUrl)` → sibling-URL fetch,
which is wrong).

### 1.6 How `@module-federation/node`'s runtimePlugin hooks in today

`packages/node/src/runtimePlugin.ts:491-513` — the plugin implements **only `beforeInit`**. It
does *not* touch `loadEntry`, `fetch`, `createScript` or `loadEntryError`. What it actually does
is patch webpack internals:

- `setupScriptLoader` (`runtimePlugin.ts:377-400`) replaces `__webpack_require__.l` so
  webpack's external-script loading goes through
  `__webpack_require__.federation.runtime.loadScriptNode` (i.e. the SDK function above), then
  wraps the result with `instance.initRawContainer(key, url, res)`
  (`packages/runtime-core/src/core.ts:362-374`) and stores it on `globalThis[key]`.
- `setupChunkHandler` + `setupWebpackRequirePatching` (`runtimePlugin.ts:403-489`) replace
  `__webpack_require__.f.require` / `.readFileVm` so *non-entry chunks* of a remote are loaded
  from the filesystem (`loadFromFs`, `:181-225`, `vm.Script`) or over HTTP (`fetchAndRun`,
  `:228-278`, `eval` of a CJS wrapper; the runtime `fetch` loader hook is consulted first at
  `:241-248`).

So entry loading in Node today is: runtime-core `loadEntryNode` → SDK `createScriptNode`
(fetch + `vm`), and the node package's plugin only handles webpack *chunk* loading around that.
The plugin is injected by the build plugin (`packages/node/src/plugins/NodeFederationPlugin.ts:38-39,87-95`)
and published as the `./runtimePlugin` export (`packages/node/package.json:21-30`).

---

## 2. Plugin hook surface relevant to entry/asset loading

Plugins are flat objects (`ModuleFederationRuntimePlugin`,
`packages/runtime-core/src/type/plugin.ts:39-48`): every key that matches a lifecycle name of
*any* of the six hook systems is registered on it
(`packages/runtime-core/src/utils/plugin.ts:5-35` iterates `instance.hooks`,
`remoteHandler.hooks`, `sharedHandler.hooks`, `snapshotHandler.hooks`, `loaderHook`,
`bridgeHook`).

Hook semantics that matter here (`packages/runtime-core/src/utils/hooks/asyncHook.ts:9-38`,
`syncHook.ts:30-42`): for plain `AsyncHook`/`SyncHook`, listeners run in registration order and
**the first non-`undefined` return value becomes the emit result** (later listeners still run and
can replace it; `false` aborts). Waterfall hooks pass the args object through each listener.

### Hooks that can fully replace entry loading

| Hook | Defined at | Signature (args → return) | Power |
| --- | --- | --- | --- |
| `loadEntry` (remoteHandler) | `remote/index.ts:194-205` | `{ origin, loaderHook, remoteInfo, remoteEntryExports? }` → `RemoteEntryExports \| void` (async ok) | **Total replacement.** A truthy return short-circuits `loadEntryDom`/`loadEntryNode` entirely (`utils/load.ts:305-334`). This is the hook the Metro plugin uses (`packages/metro-core/src/modules/metroCorePlugin.ts:45-76`) — precedent for a platform-native loader. |
| `loadEntryError` (loaderHook) | `core.ts:150-165` | `{ getRemoteEntry, origin, remoteInfo, remoteEntryExports?, globalLoading, uniqueKey }` → `RemoteEntryExports \| undefined` | Full replacement, but **only on script-load failure** (`load.ts:343-380`; excluded for `ScriptExecutionError`). Used by `packages/retry-plugin/src/index.ts:58`. |
| `getModuleFactory` (loaderHook) | `core.ts:255-264` | `{ remoteEntryExports, expose, moduleInfo }` → factory \| undefined | Replaces `container.get(expose)` per-expose (`module/index.ts:310-321`) but the container's `init` has already run. |

### Hooks that only tweak built-in loading

| Hook | Defined at | What it can change |
| --- | --- | --- |
| `createScript` (loaderHook) | `core.ts:114-129` | Browser: supply a custom `HTMLScriptElement` or `{script, timeout}` (`load.ts:138-162`). Node: return `{ url }` to redirect the fetch (`load.ts:244-264`, `sdk/src/node.ts:69-78`). Cannot change evaluation strategy. |
| `fetch` (loaderHook) | `core.ts:146-149` | `(url, init, remoteInfo?, resourceContext?)` → `Promise<Response> \| false \| void`. Consulted for **manifest fetches** (`SnapshotHandler.ts:307-321`), Node entry fetches (`sdk/src/node.ts:39-56`), and node-plugin chunk fetches (`runtimePlugin.ts:241-248`). Content interception only. |
| `createLink` | `core.ts:130-145` | Browser preload `<link>` elements only. |
| `afterLoadEntry` | `core.ts:166-177` | Observation (success/error/recovered) after entry load (`load.ts:335-342, 371-385`). |
| `beforeInitContainer` / `initContainer` (core hooks) | `core.ts:77-94` | Waterfall around `container.init` — can rewrite `shareScope` / `initScope` / `remoteEntryInitOptions` (`module/index.ts:200-208, 247-252`). |
| `beforeRegisterRemote` / `registerRemote` / `beforeRequest` / `afterResolve` | `remote/index.ts:68-80`, `shared/index.ts:57` | Can normalize/rewrite the `Remote` (e.g. entry URL, `type`) before loading. `afterResolve` is where the snapshot plugin substitutes manifest data (`plugins/snapshot/index.ts:43-92`). |

### Can a plugin resolve an entry via native `import(url)` and return the namespace?

**Yes, without runtime-core changes.** `loadEntry` receives `remoteInfo`
(`{ name, entry, type, entryGlobalName, shareScope, ... }`, `type/config.ts:34-43`) and its
return value is used directly as `RemoteEntryExports`. Requirements on the returned object:

- `init(shareScope, initScope?, remoteEntryInitOptions?)` must exist — called at
  `module/index.ts:226-230`; missing `init` is a hard `RUNTIME_002` error
  (`module/index.ts:210-223`).
- `get(expose)` must return a factory (`module/index.ts:321`); expose ids look like `'.'` /
  `'./Button'`.

A webpack/Rspack remote built with `library: { type: 'module' }` exports exactly `get`/`init`
as named ESM exports, so `await import(entryUrl)` returns a namespace that satisfies the
interface as-is — this is literally what the browser `loadEsmEntry` already relies on
(`load.ts:27-55`). Caveat: the namespace object is frozen/non-extensible, which is fine here —
the runtime never mutates `remoteEntryExports`; it only stores it (`module/index.ts:131`,
`initRawContainer` at `core.ts:362-374`). (The `mf_module_id` decoration at
`module/index.ts:403-433` guards with `Object.isExtensible`.)

One nuance: `loadEntry` short-circuits *before* the `globalThis[globalName]` registration that
`loadScriptNode` would do (`sdk/src/node.ts:230-235`). Nothing in the loadRemote path requires
that global to exist (the `RUNTIME_001` check lives inside the script loaders, which are
skipped), but writing it anyway keeps parity with debugging tools/devtools that introspect
globals.

---

## 3. Bundler coupling audit

### What assumes a bundler

- **runtime-core / runtime themselves: almost nothing.** `rg __webpack` over
  `packages/runtime-core/src` and `packages/runtime/src` finds no hits. The only build-time
  couplings are optional defines: `ENV_TARGET` (`load.ts:24`, `sdk/src/env.ts:9`),
  `FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN` (`core.ts:49-53`, defaults to snapshot **on**),
  `FEDERATION_ALLOW_NEW_FUNCTION` (`load.ts:37`), and `__VERSION__` (defined by tsdown,
  `packages/runtime/tsdown.config.ts:14-17`). All have runtime fallbacks.
- **`@module-federation/webpack-bundler-runtime`** is the bundler bridge: remote modules are
  materialized by `remotes.ts` which reads `idToExternalAndNameMapping` / `chunkMapping` and
  calls `webpackRequire.federation.instance.loadRemote(...)`
  (`packages/webpack-bundler-runtime/src/remotes.ts:112-130`). Share scopes are bridged to
  `__webpack_require__.S` via `attachShareScopeMap.ts` / `initializeSharing.ts`.
- **enhanced's FederationRuntimePlugin** injects the `__webpack_require__.federation` global:
  `FederationRuntimeModule.generate()` emits `getFederationGlobal(...)`
  (`packages/enhanced/src/lib/container/runtime/FederationRuntimeModule.ts:74-83`), which
  serializes `initOptions` (only `externalType === 'script'` remotes), `chunkMatcher`,
  `rootOutputDir`, and `bundlerRuntimeOptions.remotes` keyed to `__webpack_require__`
  (`getFederationGlobal.ts:43-58`). This is how build-declared remotes get registered — the
  embedded runtime later calls `initOptions`-driven `init`. None of this exists in a plain Node
  process, and none of it is *needed* by the pure runtime API.
- **`@module-federation/node`'s runtimePlugin** is entirely webpack-coupled: it declares
  `__webpack_require__` / `__non_webpack_require__` (`runtimePlugin.ts:39-40`) and patches
  `__webpack_require__.l` / `.f.*` (`:377-489`). Loading it in a non-webpack process would throw
  `ReferenceError: __webpack_require__ is not defined` as soon as `beforeInit` runs. A
  bundler-free plugin must be a **separate export** in `packages/node`.

### What already works bundler-free

- `@module-federation/runtime` and `@module-federation/runtime-core` are published as plain
  dual-format packages: `"type": "module"`, ESM `dist/index.js` + CJS `dist/index.cjs`, proper
  `exports` map (`packages/runtime/package.json:4-68`,
  `packages/runtime-core/package.json:4-43`). tsdown builds both formats
  (`createDualFormatConfig`, `packages/runtime/tsdown.config.ts:24-46`). No bundler required to
  import them.
- The whole hook/registration machinery, snapshot/manifest pipeline, and share-scope handling
  are plain JS over `globalThis` (`packages/runtime-core/src/global.ts:27-36`).
- Preload is Node-safe: `generatePreloadAssets` returns empty asset lists when
  `!isBrowserEnvValue` (`packages/runtime-core/src/plugins/generate-preload-assets.ts:326-332`).

### What a plain Node app must do today, and where it breaks

```js
import { createInstance } from '@module-federation/runtime';
const mf = createInstance({
  name: 'host',
  remotes: [{ name: 'app1', entry: 'https://cdn/remoteEntry.js', type: 'esm' }],
});
await mf.loadRemote('app1/Button');
```

Path taken: `loadRemote` → `getRemoteEntry` → `isBrowserEnvValue === false` → **`loadEntryNode`**
(`load.ts:319-333`) → SDK `createScriptNode` → because `type === 'esm'` → `loadModule` with
`vm.SourceTextModule` (`sdk/src/node.ts:175-191, 259-293`). Breakage points, in order:

1. **`vm.SourceTextModule` requires `node --experimental-vm-modules`.** Without the flag the
   constructor doesn't exist and the load fails (surfaced as the generic
   `Failed to load Node.js entry ...` error from `load.ts:270-275`).
2. **Bare import specifiers break.** `loadModule` links specifiers via
   `new URL(specifier, url)` (`node.ts:277-290`): `import { jsx } from 'react/jsx-runtime'`
   resolves to `https://cdn/react/jsx-runtime` — a 404 or wrong content. Only fully
   self-contained ESM bundles with relative imports work.
3. **The vm module context is isolated from the host's module graph** — no `import.meta.url`
   semantics of the host, no loader hooks, duplicated dependency instances even when the same
   URL is importable natively.
4. For CJS remotes (`type` omitted → `'global'`), the `vm.Script` path (`node.ts:98-171`)
   *does* work flag-free today — this is the SSR path webpack/Next SSR relies on — but its
   `require` resolves against the **host's** filesystem (`createRequire(process.cwd()+…)`,
   `node.ts:126-138`), so remote CJS entries with external `require('react')` only work if the
   host happens to have compatible copies installed.
5. Additionally, `loadEsmEntry`'s clean native `import(entry)` (`load.ts:43-45`) is **never
   reachable in Node** because of the environment fork at `load.ts:319-333` — the exact gap a
   native-import plugin fills.

Nothing else in the chain breaks: registration, module cache, share scope, and `container.get`
are bundler-agnostic.

---

## 4. Shared scope without a bundler

- Shared modules are declared per-instance via `shared` options; `ShareArgs`
  (`packages/runtime-core/src/type/config.ts:69-107`) accepts either
  `get: () => Promise<() => Module>` (lazy factory) or `lib: () => Module` (already-loaded,
  marks `loaded: true` at `shared/index.ts:195-203`). `registerShared` runs at construct time
  (`core.ts:416-419`, `shared/index.ts:177-212`) and can also be called later via
  `instance.registerShared(...)` (`core.ts:462-467`).
- The registry is a plain nested object `shareScopeMap[scope][pkgName][version] = Shared`
  (`type/config.ts:109-115`), mirrored globally at
  `globalThis.__FEDERATION__.__SHARE__[instanceId]`
  (`shared/index.ts:727-733`, `utils/share.ts` `getGlobalShareScope`).
- Bundler-free host usage:

  ```js
  import * as React from 'react';
  createInstance({
    name: 'host',
    shared: {
      react: { version: '19.1.0', lib: () => React, shareConfig: { singleton: true, requiredVersion: '^19.0.0' } },
    },
  });
  ```

  `loadShare`/`loadShareSync` then resolve by version strategy (`shared/index.ts:214-390,
  507-645`; version selection via the `resolveShare` waterfall hook, `shared/index.ts:95-103`).
- **How the remote sees it:** `Module.init` passes the host's live `shareScopeMap[scope]`
  object into `container.init(shareScope, ...)` (`module/index.ts:193-230`). A webpack-built
  remote copies that object into its own `__webpack_require__.S` and its `ConsumeSharedModule`s
  pick compatible versions from it. This works identically whether the host is bundled or not —
  the contract is just the object shape.
- **Implication for an ESM remote whose shared deps were bundled** (i.e. built with no
  `shared` config, deps inlined): sharing simply doesn't happen — the remote never consults the
  scope, so the host gets duplicate copies (fatal for singleton-by-identity libs like React
  contexts). Conversely, an ESM remote that *was* built with `shared: { react: ... }` will
  consume the host's `lib`-registered copy through `container.init`, **but** its *fallback*
  loading (when the host provides nothing) goes through the remote's own chunk loading — for a
  webpack `module`-type remote in the vm/native-import world, fallback chunks are ESM `import()`
  from its own origin, which works natively; under `vm.SourceTextModule` they go through the
  relative-URL linker (`sdk/src/node.ts:277-290`).
- A native-import plugin therefore doesn't need any new shared machinery: manual
  `shared`/`registerShared` on the host plus the standard `container.init` handshake is
  sufficient. The one rough edge is versioning: the host must state accurate `version` strings
  since there is no bundler to read `package.json` automatically (helpers exist in userland
  only; `createRequire(import.meta.url)('react/package.json').version` is the usual trick).

---

## 5. Manifest (`mf-manifest.json`) support

- Detection: a remote whose `entry` contains `.json` is *not* a "pure remote entry"
  (`utils/tool.ts:36-38`), so the built-in `snapshot-plugin`'s `afterResolve` hook
  (`packages/runtime-core/src/plugins/snapshot/index.ts:43-92`, registered by default at
  `core.ts:286-289`) fetches the manifest through
  `SnapshotHandler.loadRemoteSnapshotInfo` (`plugins/snapshot/SnapshotHandler.ts:122-280`).
- `getManifestJson` (`SnapshotHandler.ts:290-391`) fetches with the `fetch` loader hook first
  (`:307-321`), validates `metaData`/`exposes`/`shared`, caches, and
  `generateSnapshotFromManifest` (`packages/sdk/src/generateSnapshotFromManifest.ts:61-188`)
  turns it into a snapshot containing:
  - `remoteEntry` (path+name joined, `:142`) and **`remoteEntryType`** (`:143`, from
    `manifest.metaData.remoteEntry.type`) — **yes, the manifest declares the module format**;
  - optional `ssrRemoteEntry` / `ssrRemoteEntryType` (default `'commonjs-module'`,
    `:177-185`) from `metaData.ssrRemoteEntry`;
  - `publicPath`/`getPublicPath`, `remoteTypes` (types artifact URL, `:144-146`), per-expose
    `modules`, and `shared` asset lists.
- `assignRemoteInfo` (`plugins/snapshot/index.ts:18-38`) then rewrites the live `remoteInfo`:
  `entry`, `type`, `entryGlobalName`, `version` — using
  `getRemoteEntryInfoFromSnapshot` (`utils/tool.ts:77-112`), which in a **non-browser env
  prefers `ssrRemoteEntry`/`ssrRemoteEntryType` when present** (`:91-109`). The same preference
  appears for manifest-provider globals at `SnapshotHandler.ts:195-209`.
- After that, loading proceeds through the exact same `getRemoteEntry` pipeline of §1 — so the
  **`loadEntry` hook sees the manifest-resolved `remoteInfo`** (final URL + declared type) with
  zero extra work.

**Assessment for a native-Node loader:** the manifest path is the *preferred* integration point,
not an alternative one — it composes with the `loadEntry` hook for free. Benefits: the entry URL
and format come from `remoteEntryType`/`ssrRemoteEntryType` instead of user config;
`remoteTypes` gives the `.d.ts` artifact for DX; version/publicPath handling is done. A
native-import plugin only needs a policy decision: when running in Node, `remoteInfo.type` will
have been set from `ssrRemoteEntryType` (usually `'commonjs-module'`) if an `ssrRemoteEntry`
exists. A native-ESM loader wants the opposite preference (use `remoteEntry` when
`remoteEntryType` is `'esm'|'module'`) — that can be done in the same plugin via the
`loadRemoteSnapshot`/`afterLoadSnapshot` waterfall hooks (`SnapshotHandler.ts:96-110`) or simply
in `loadEntry` by re-reading the snapshot, but there is **no runtime option today to say "I'm in
Node but prefer the ESM entry"** (see gaps).

---

## 6. Minimal integration design

### Recommended shape: a runtime plugin in `packages/node` (new export, e.g. `./native-runtime-plugin`), no bundler plugin required

Primary hook: **`loadEntry`** (total replacement, precedent in metro-core). Secondary hooks:
`fetch` (optional, proxy/auth), `errorLoadRemote`/`loadEntryError` (optional resilience). No
runtime-core changes needed for the MVP.

```ts
import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

const ESM_TYPES = new Set(['esm', 'module']);

export default function nativeNodeImportPlugin(): ModuleFederationRuntimePlugin {
  return {
    name: 'node-native-import-plugin',

    loadEntry: async ({ remoteInfo }) => {
      const { entry, type, entryGlobalName, name } = remoteInfo;

      // Only claim ESM remotes; return undefined to fall through to the
      // built-in loadEntryNode (vm.Script) for commonjs/global remotes.
      if (!ESM_TYPES.has(type)) return undefined;

      // Node >= 23.6 (or --experimental-network-imports back-versions) can
      // import(https://...) natively; otherwise fall back to
      // fetch -> data:/tmp-file import, or module.registerHooks-based http loader.
      const namespace = await import(/* webpackIgnore: true */ entry);

      // Container contract: { get, init } (runtime-core/src/type/config.ts:159-166).
      const container = namespace.default?.init ? namespace.default : namespace;
      if (typeof container.init !== 'function' || typeof container.get !== 'function') {
        throw new Error(
          `Remote "${name}" at ${entry} is not a federation container (missing get/init)`,
        );
      }

      // Optional parity with loadScriptNode (sdk/src/node.ts:230-235) for devtools:
      (globalThis as any)[entryGlobalName] ||= container;

      return container;
    },
  };
}
```

Host usage (no webpack anywhere):

```ts
import { createInstance } from '@module-federation/runtime';
import nativeNodeImportPlugin from '@module-federation/node/native-runtime-plugin';
import * as React from 'react';

const mf = createInstance({
  name: 'host',
  plugins: [nativeNodeImportPlugin()],
  remotes: [
    // direct: { name: 'app1', entry: 'https://cdn/remoteEntry.mjs', type: 'module' },
    { name: 'app1', entry: 'https://cdn/mf-manifest.json' }, // preferred: type inferred
  ],
  shared: { react: { version: '19.1.0', lib: () => React } },
});
const Button = await mf.loadRemote('app1/Button');
```

Why `loadEntry` and not the others:

- `createScript` can only rewrite the URL in Node (`load.ts:257-263`) — it cannot change the
  `vm` evaluation strategy.
- `fetch` only intercepts bytes; evaluation still goes through `vm`.
- `loadEntryError` only fires after the built-in loader failed, and `vm.SourceTextModule`
  absence surfaces as a load *error path* inconsistently (`load.ts:270-275` converts it to a
  logged `error(...)` throw without the `RUNTIME_008` marker that `loadEntryError` gating checks
  at `load.ts:349-352`) — not a reliable trigger.

Because `loadEntry` is consulted *after* the snapshot plugin's `afterResolve`
(`remote/index.ts:584-591` runs inside `getRemoteModuleAndOptions`, before `module.get` →
`getEntry`), the plugin automatically sees manifest-resolved URLs and types.

### HTTP source acquisition options inside the plugin

1. Native `import(httpsUrl)` where supported (network imports).
2. `fetch` + write to a content-addressed temp file + `import(fileUrl)` — works on all
   supported Node versions, keeps the host's real module graph (bare specifiers in the remote
   resolve against the *host's* `node_modules`, which matches shared-fallback expectations for
   externals).
3. `module.registerHooks`/`module.register` customization hooks registering an `https:`
   resolver/loader once, then plain `import(url)` — the cleanest long-term option (Node ≥ 18.19
   for `register`, ≥ 22.15/23.5 for sync `registerHooks`).

The plugin should also emit the runtime `fetch` loader hook before its own fetch (mirroring
`SnapshotHandler.ts:307-321`) so retry/proxy plugins compose.

## 7. Gaps: plugin-only vs runtime-core PRs

### Achievable purely from a plugin in `packages/node` (no core changes)

- Native `import()`-based ESM entry loading via `loadEntry` (shown above).
- Manifest-driven remotes, including format detection from `remoteEntryType`.
- Shared-scope participation via standard `container.init`.
- URL rewriting/auth via the existing `createScript`(`{url}`)/`fetch` hooks.
- Falling back to the existing `vm.Script` CJS path for `commonjs*` remotes by returning
  `undefined` from `loadEntry`.

### Gaps that would need runtime-core / sdk PRs

1. **Node prefers `ssrRemoteEntry` unconditionally** —
   `getRemoteEntryInfoFromSnapshot` (`utils/tool.ts:91-109`) and the manifest-provider branch
   (`SnapshotHandler.ts:195-199`) pick `ssrRemoteEntry` (typically `commonjs-module`) whenever it
   exists in a non-browser env. A native-ESM loader wants "prefer the ESM `remoteEntry` in Node".
   Workaround from a plugin (`loadRemoteSnapshot` waterfall mutating the snapshot, or `loadEntry`
   re-deriving the URL) is possible but fragile; a first-class option
   (e.g. `preferredEntryTarget: 'esm' | 'ssr'` on the instance or per-remote) belongs in core.
2. **`loadEntryNode` error normalization** — failures in `loadEntryNode` are logged via a bare
   `error(...)` without the `RUNTIME_008` code (`load.ts:270-275`), so the `loadEntryError`
   recovery hook is effectively unreachable on the Node path (gate at `load.ts:349-352` checks
   `RUNTIME_008`). PR: route Node entry failures through the same error-code machinery as
   `loadEntryScript` (`load.ts:169-186`).
3. **`vm.SourceTextModule` ESM path is a dead end without a flag** — `sdk/src/node.ts:259-293`
   silently assumes `--experimental-vm-modules` and cannot link bare specifiers. Even if it's
   kept as fallback, a capability check + actionable error (and/or delegating to native
   `import()` when `vm.SourceTextModule` is unavailable) is a small sdk PR that fixes the
   default experience for everyone, not just plugin users.
4. **No `remoteEntryInitOptions`-level hint of host module format** — cosmetic today, but if
   remotes ever need to know they were loaded natively vs via vm (e.g. to pick chunk-loading
   strategy), that would extend `beforeInitContainer` data (`core.ts:77-83`). Not needed for MVP.
5. **`packages/node` packaging** — the existing `runtimePlugin` export hard-crashes without
   `__webpack_require__` (`runtimePlugin.ts:39-40, 494-511`), so the native plugin must ship as
   a new subpath export in `packages/node/package.json` (pattern already established at
   `packages/node/package.json:21-40`). This is a change in `packages/node` only, not core.

**No hard blockers in runtime-core**: the `loadEntry` hook is emitted before any environment
dispatch (`load.ts:304-334`), receives everything needed, and its return value flows through
`init`/`get` untouched. The gaps above are quality-of-life, not enablement.
