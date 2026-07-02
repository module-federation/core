# Native HTTP ESM Loader for `@module-federation/node`

Status: implemented (opt-in, non-breaking)
Feature entry points: `@module-federation/node/register`, `@module-federation/node/loader-hooks`

## 1. Motivation

`@module-federation/node` exists so Module Federation hosts running in Node.js
(SSR servers, node-to-node federation) can consume remotes over the network.
Today that works, but only through a bespoke fetch-and-eval pipeline that is
coupled to the webpack/rspack runtime. This design adds a second, opt-in
loading path built on Node's native module customization hooks
(`module.register()` from `node:module`), so the Module Federation runtime can
run **bundler-free** in a plain `node` process and load ESM remote entries with
a real `import()`.

## 2. Current architecture and its limitations

### How remote code is loaded today

Remote entry loading (runtime side):

- `@module-federation/runtime-core` resolves entries in
  `packages/runtime-core/src/utils/load.ts`. In Node (`ENV_TARGET !== 'web'`)
  it calls `loadEntryNode()`, which delegates to `loadScriptNode()` in
  `packages/sdk/src/node.ts`.
- `loadScriptNode` / `createScriptNode` **fetch the remote entry source over
  HTTP** (global `fetch` or `node-fetch`), wrap it in a CommonJS-style function
  wrapper, and execute it with `new vm.Script(...).runInThisContext()`. The
  container is then picked up from the injected `globalName`.
- For `library.type: 'module'` remotes, the SDK uses `vm.SourceTextModule`,
  which requires the `--experimental-vm-modules` flag.

Chunk loading (webpack runtime side):

- `packages/node/src/runtimePlugin.ts` patches
  `__webpack_require__.f.readFileVm` / `__webpack_require__.f.require` in its
  `beforeInit` hook. Async chunks are loaded from the filesystem when present,
  otherwise fetched over HTTP and executed via `eval(...)` (`fetchAndRun`) or
  `vm.Script` (`loadFromFs`).
- Webpack plugins in this package (`StreamingTargetPlugin`,
  `CommonJsChunkLoadingPlugin`, `UniverseEntryChunkTrackerPlugin`, …) exist to
  emit and track chunk graphs compatible with that strategy.

### Limitations

- **No real ESM support.** Everything is funneled through CJS-style wrappers;
  true ESM remotes need `--experimental-vm-modules` and a hand-rolled module
  linker (`loadModule` in `sdk/src/node.ts`).
- **Bundler coupling.** Chunk loading depends on `__webpack_require__`
  internals, so a plain `node` process cannot consume remotes without a
  webpack/rspack runtime present.
- **Security and debuggability.** `eval` / `runInThisContext` of fetched text
  defeats CSP-style review, breaks stack traces and source maps (the code has
  no true URL), and the fetch layer imposes no restriction on which hosts may
  supply executable code.
- **No module identity.** Evaluated chunks are invisible to Node's module
  graph: no import cache semantics, no `import.meta.url`, no interop with
  loaders/instrumentation (APM, coverage, mocking) that hook module loading.

## 3. Proposed architecture

Node's module customization hooks (stable since Node 20.6 in its current
`module.register()` form, available from 18.19) let us implement the
documented "import from HTTPS" loader pattern as a first-class, allowlisted
HTTP(S) ESM loader:

```
main thread                              hooks thread (module.register)
────────────────────────────             ──────────────────────────────
@module-federation/node/register  ────►  loader-hooks/hooks.mjs
  creates MessageChannel                    initialize({allowedOrigins, port})
  module.register(hooksUrl,                 resolve(): http(s) URL handling +
    {data:{allowedOrigins, port2}})                    allowlist enforcement
  stores state on globalThis                load():    fetch + in-memory cache,
                                                       returns ESM source
runtimePlugin loadEntry hook
  state.allowOrigin(entryOrigin) ──port──►  allowlist updated, ack sent back
  import(remoteEntryUrl)         ──────►    resolve/load serve the entry and
                                            every chunk it imports
```

### Components (all under `packages/node/src`)

| File | Role |
| --- | --- |
| `loader-hooks/hooks.ts` | The `initialize` / `resolve` / `load` hooks executed on Node's hooks thread. Only http(s) URLs whose **origin is allowlisted** are resolved and fetched; sources are cached in-memory per URL. |
| `loader-hooks/register.ts` | `registerNativeHttpLoader()`: feature-detects `module.register`, creates the `MessageChannel`, registers the hooks, and publishes a `NativeHttpLoaderState` on `globalThis` (symbol key), so app bundles and the `--import`ed entry point need not share module instances. |
| `loader-hooks/entryLoader.ts` | `loadEntryViaNativeHttpLoader(remoteInfo)`: the bridge used by the runtime plugin. Returns a container namespace via dynamic `import(entryUrl)`, or `undefined` when the native path does not apply. |
| `loader-hooks/protocol.ts` | Shared message/env-var constants and types (dependency-free; safe to bundle into apps). |
| `loader-hooks/state.ts` | `globalThis` accessors for the loader state. |
| `register.mjs` / `register.cjs` | Side-effect entry points (`@module-federation/node/register`) shipped verbatim; they locate `loader-hooks/hooks.mjs` (via `import.meta.url` / `__dirname`) and call `registerNativeHttpLoader()`. |
| `runtimePlugin.ts` (extended) | The existing `node-federation-plugin` now also implements the MF runtime's **`loadEntry` hook**: it defers to `loadEntryViaNativeHttpLoader` and falls back to the default vm path when that returns `undefined`. Default behavior is unchanged unless the loader was registered. |

### Runtime integration: the `loadEntry` hook

`runtime-core` already exposes exactly the extension point needed:
`remoteHandler.hooks.lifecycle.loadEntry` is emitted **before** the built-in
`loadEntryDom` / `loadEntryNode` logic in `getRemoteEntry()`
(`packages/runtime-core/src/utils/load.ts`). A plugin listener that returns a
`RemoteEntryExports` short-circuits the default path; returning `undefined`
falls through. Because ESM remote entries export `get`/`init` as named
exports, the module namespace returned by `import(remoteEntryUrl)` *is* the
container, so the native path is:

1. `state.allowOrigin(new URL(entry).origin)` — posted to the hooks thread and
   awaited (ack round-trip) so the subsequent import cannot race the
   allowlist.
2. `import(entryUrl)` via a `new Function('u','return import(u)')` indirection
   so bundlers never rewrite it and Node's loader (with our hooks) handles it.
3. Validate the namespace exposes `get`/`init` and hand it to the runtime.

Chunk loading for ESM remotes comes free: chunks emitted by webpack/rspack for
`library.type: 'module'` builds are loaded by the remote entry itself through
relative `import()`, whose `parentURL` is the http(s) entry URL — our
`resolve` hook maps those onto the same origin and the `load` hook fetches
them. No `__webpack_require__` patching is involved, which is what makes the
path bundler-free: `createInstance()` + `loadRemote()` from
`@module-federation/runtime` works in a plain `node` process.

Bare specifiers imported by remote code (shared/externalized dependencies such
as `react`) are re-resolved with a `parentURL` inside the host's working
directory, so they resolve from the host's `node_modules` — matching MF's
shared-dependency expectations. Builtins (`node:*`) delegate to the default
resolver.

### Why `module.register()` (async, off-thread) is the primary API

- Available on the whole supported range (Node ≥ 18.19 / 20.6; repo baseline
  is Node 20), while `module.registerHooks()` (synchronous, in-thread) only
  exists on Node ≥ 22.15 / 23.5.
- The `load` hook must perform network I/O; the off-thread API allows a plain
  async `fetch`, whereas synchronous in-thread hooks would need
  `Atomics.wait`-style blocking fetch machinery.

`module.registerHooks()` support is therefore a **follow-up**, not part of
this change (see §7). The code feature-detects `module.register` and degrades
gracefully: on very old Node versions, registration warns once and the vm path
remains in force.

## 4. Compatibility matrix and fallback strategy

| Dimension | Native HTTP loader path | Fallback (existing vm path) |
| --- | --- | --- |
| Node.js version | ≥ 18.19 / 20.6 (`module.register`); validated on 18.19 and 22 locally, CI baseline 20 | any supported Node |
| Remote entry format | `library.type: 'module'` / `'esm'` (`remoteInfo.type` `module`/`esm`) | `global`, `commonjs`, `commonjs-module`, `var`, … always use the vm path |
| Entry URL scheme | `http:` / `https:` only | `file:`/local paths keep the existing filesystem strategy |
| Async chunks | ESM chunks imported by the remote entry, same allowlisted origins | webpack `readFileVm`/`require` chunk handlers (unchanged) |
| Registration | `node --import @module-federation/node/register`, `require('@module-federation/node/register')`, or programmatic `registerNativeHttpLoader()` | nothing registered → hook returns `undefined` → default path |
| Kill switch | `MF_NODE_NATIVE_LOADER=0` (or `false`) disables the native path even when registered | — |
| Extra allowed hosts | `MF_NODE_NATIVE_LOADER_HOSTS=https://cdn.a.com,https://b.com` or `registerNativeHttpLoader({ allowedOrigins })` | — |

Decision flow in `loadEntryViaNativeHttpLoader` (any "no" → return
`undefined`, i.e. default vm-based loading):

1. Loader state present on `globalThis` (register ran)?
2. Not disabled by `MF_NODE_NATIVE_LOADER=0`?
3. Entry is `http(s)`?
4. Remote type is `module` / `esm`?

Errors *inside* the native path (fetch failure, non-container namespace) are
thrown, not swallowed — they surface through the runtime's existing
`loadEntryError` hook and error handling, keeping failures loud and
attributable.

### CJS remote entries

`commonjs-module` remotes intentionally stay on the vm path. Node's hooks can
return `format: 'commonjs'` sources (≥ 20.8), but `require()` calls inside an
http-hosted CJS module cannot be resolved over the network by the CJS loader,
so a fetch-and-execute layer would be needed anyway — that layer already
exists and works. Hosts can mix: ESM remotes go native, CJS remotes go vm,
within the same process.

### Caching

- **Hooks thread:** in-memory `Map<url, Promise<{source, contentType}>>`;
  failed fetches are evicted so they can be retried. Node's ESM registry then
  caches the instantiated module per URL for the process lifetime (standard
  `import()` semantics — same-URL re-imports are free).
- **Main thread:** the MF runtime's own `globalLoading`/container caches are
  unchanged.
- **Disk cache** (offline/warm-start) is a follow-up: the `load` hook is the
  single choke point where a content-addressed disk cache (keyed by URL +
  `ETag`) can be added without design changes. Until then, offline behavior is
  a load error surfaced through the runtime's error hooks.

## 5. Security considerations

- **Allowlist, not open network imports.** Unlike
  `--experimental-network-imports`, this loader refuses any http(s) URL whose
  *origin* is not explicitly allowed. Origins enter the allowlist only from:
  registered MF remotes (the runtime plugin allowlists the remote-entry origin
  right before importing it), `registerNativeHttpLoader({ allowedOrigins })`,
  or the `MF_NODE_NATIVE_LOADER_HOSTS` env var.
- **Race-free updates.** Allowlist additions are acknowledged by the hooks
  thread before the import proceeds, so there is no window where an import
  outruns its allowlist entry, and no window where a rejected origin is
  accidentally allowed.
- Remote code still executes with full process privileges — identical to the
  status quo (`vm.runInThisContext` is not a sandbox either). Operators should
  treat the allowlist as the trust boundary and prefer `https:` origins;
  chunks resolve on the same origin as their remote entry.
- The hooks thread never evaluates fetched code itself; it only supplies
  source text to Node's loader, so imported remotes get real URLs, real stack
  traces, and source-map support (`--enable-source-maps`).

## 6. Migration plan

Phase 1 (this change) — opt-in, zero default change:

1. Ship `register` / `loader-hooks` entry points and the guarded `loadEntry`
   hook in the default `runtimePlugin`. Nothing activates unless the app
   registers the loader (`node --import @module-federation/node/register`,
   `require('@module-federation/node/register')`, or
   `registerNativeHttpLoader()`).
2. Existing users see no behavioral difference: the `loadEntry` hook resolves
   `undefined` when no registration happened and the runtime proceeds down
   the unchanged vm path. `MF_NODE_NATIVE_LOADER=0` offers an emergency
   disable even for registered processes.

Phase 2 (follow-ups, separate changes):

3. `module.registerHooks()` (sync, in-thread) support on Node ≥ 22.15 where it
   simplifies allowlist sharing (no message channel needed).
4. Optional disk cache + offline mode; `import()`-based loading for
   `commonjs-module` remotes where Node's CJS-source hooks allow it.
5. Documentation + examples in the website; consider flipping the default for
   ESM remotes in a future major once the path has soaked.

## 7. Out of scope / known follow-ups

- **Webpack CJS chunk graphs over native hooks.** Async chunks of
  *non-ESM* builds keep using the patched `readFileVm` path; teaching the CJS
  loader to fetch chunk files over http is not attempted here (see §4).
- **`registerHooks()` sync API** (Node 22.15+) — feature-detected follow-up.
- **Disk cache / offline strategy** — see §4 "Caching".
- **Import maps / integrity metadata** — the manifest already carries asset
  hashes; wiring them into an `integrity` check inside the `load` hook is a
  natural hardening follow-up.

## 8. Usage

```bash
# enable the loader, then run a bundler-free MF host
node --import @module-federation/node/register host.mjs
```

```js
// host.mjs — no webpack/rspack runtime required
import { createInstance } from '@module-federation/runtime';
import nodeRuntimePlugin from '@module-federation/node/runtimePlugin';

const mf = createInstance({
  name: 'host',
  remotes: [
    { name: 'app2', entry: 'https://cdn.example.com/mf/remoteEntry.js', type: 'module' },
  ],
  plugins: [nodeRuntimePlugin()],
});

const mod = await mf.loadRemote('app2/hello');
```

Programmatic registration (CJS hosts, custom allowlists):

```js
const { registerNativeHttpLoader } = require('@module-federation/node/loader-hooks');
registerNativeHttpLoader({ allowedOrigins: ['https://cdn.example.com'] });
```
