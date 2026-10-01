# Native HTTP ESM Loader for `@module-federation/node`

Status: implemented (opt-in, non-breaking)
Feature entry points: `@module-federation/node/register`, `@module-federation/node/loader-hooks`
Working example: `apps/node-esm-remote` + `apps/node-esm-host`

See also (research underpinning this design):

- [research-node-platform.md](./research-node-platform.md) — Node hooks API
  status (DEP0205), network-import history, integrity, version matrix.
- [research-runtime-core.md](./research-runtime-core.md) — runtime-core entry
  loading pipeline, plugin hook surface, bundler-coupling audit, upstream gaps.
- [esm-chunk-loading-options.md](./esm-chunk-loading-options.md) — bundler
  output options and the ESM chunk-loading fallback recommendation.
- [research-prior-art.md](./research-prior-art.md) — Native Federation, JSPM,
  Deno/Bun, existing HTTPS loaders; lockfile/integrity lessons.

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

### Hook API choice: `module.register()` today, `module.registerHooks()` next

This change ships on the **async, off-thread `module.register()`** API because
it is the only hooks API available on the repo's current Node 20 baseline
(`registerHooks()` does not exist on any Node 20 release). The code
feature-detects `module.register` and degrades gracefully: on very old Node
versions, registration warns once and the vm path remains in force.

That choice is deliberately **transitional**. Platform research
([research-node-platform.md](./research-node-platform.md) §1) found the two
APIs' fortunes have inverted:

- `module.register()` is **deprecated (DEP0205)** — doc-deprecated, then
  **runtime-deprecated in Node 26.0.0** (calling it emits a
  `DeprecationWarning`; removal in 27.x was floated). Its caveats (restricted
  CJS API, `createRequire` bypass, empty-namespace CJS interop, per-crossing
  IPC/serialization overhead — ~1.9× slower than sync hooks in oxc-node's
  migration) were judged unresolvable by the Node loaders team.
- `module.registerHooks()` (synchronous, in-thread; Node ≥ 22.15 / 23.5) is
  **Release Candidate** and expected to go stable in a 26.x minor; it covers
  `import`, `require()`, *and* `createRequire()` requires, and shares state
  with app code directly (no MessageChannel/ack protocol needed).

**Roadmap (phase 2, primary API):** switch feature detection to prefer
`registerHooks()` wherever available and treat `register()` purely as the
legacy fallback for Node 20 / early-22. Because sync hooks cannot await, the
network I/O moves **out of band**: remote sources are prefetched during MF's
*async* phases (`init` / `loadRemoteSnapshotInfo` / preload, where the
allowlist is updated today) into an in-memory + disk cache, and the sync
`load` hook only serves cache hits (missing entry ⇒ actionable error naming
the remote and URL). This is the same pattern Node itself uses internally,
removes the ack round-trip entirely, and makes the loader compatible with the
recommended long-term baseline **`node: "^22.15.0 || >=24"`** (Node 20 is EOL
2026-04-30). The public surface (`/register`, `registerNativeHttpLoader()`,
the `loadEntry` bridge) is unchanged by the swap.

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

Note that runtime-core currently biases *against* ESM entries in Node: when a
manifest snapshot carries `ssrRemoteEntry` (usually `commonjs-module`), Node
unconditionally prefers it over the ESM `remoteEntry` — see the upstream PR
candidates below.

### ESM chunk loading when hooks are NOT registered

For ESM builds (`chunkFormat: 'module'`, `chunkLoading: 'import'`) consumed by
a process where the loader hooks were *not* registered, webpack's stock
`import()`-based chunk handler fails for http URLs. The analysis in
[esm-chunk-loading-options.md](./esm-chunk-loading-options.md) §3–5 recommends
a **thin wrap — not a replacement — of `__webpack_require__.f.j`**:

- Delegate to the original `f.j` whenever hooks are registered or the chunk
  resolves to a local file (the stock relative-`import()` path works there).
- Otherwise fetch the chunk text ourselves (respecting the runtime's
  `loaderHook.lifecycle.fetch`), evaluate it as ESM, and install the resulting
  namespace via the module chunk format's own exported install function,
  **`__webpack_require__.C`** (`RuntimeGlobals.externalInstallChunk`) — the
  real installer that mutates webpack's actual closure state. Wrapping matters
  because the emitted export *names* differ across webpack/rspack versions, so
  re-implementing the handler wholesale (as the CJS `readFileVm` swap does) is
  brittle; installing through `.C` is not.
- Guarantee `.C` exists via a one-line build-time `runtimeRequirementInTree`
  tap adding `RuntimeGlobals.externalInstallChunk`.

This fallback is planned alongside the phase-2 work; the shipped code covers
the hooks-registered path, where chunk imports need no patching at all.

### Caching

- **Hooks thread:** in-memory `Map<url, Promise<{source, contentType}>>`;
  failed fetches are evicted so they can be retried. Node's ESM registry then
  caches the instantiated module per URL for the process lifetime (standard
  `import()` semantics — same-URL re-imports are free).
- **Main thread:** the MF runtime's own `globalLoading`/container caches are
  unchanged.
- **Disk cache** (offline/warm-start) is not a nice-to-have but a
  **prerequisite for the phase-2 `registerHooks()` migration**: sync hooks
  cannot await a fetch, so sources must be prefetched during MF's async init /
  preload phases into a content-addressed cache (keyed by URL + hash/`ETag`)
  that the sync `load` hook serves from. Prior art
  ([research-prior-art.md](./research-prior-art.md) §7) recommends different
  policies per environment: prod fetch-once immutable, dev revalidated per
  manifest TTL/`ETag`. Until then, offline behavior is a load error surfaced
  through the runtime's error hooks.

### Upstream runtime-core / sdk PR candidates

The bundler-free path works today from `packages/node` alone, but the
runtime-core audit ([research-runtime-core.md](./research-runtime-core.md) §7)
identified quality-of-life gaps that belong upstream:

1. **Node unconditionally prefers `ssrRemoteEntry`** — snapshot resolution
   (`getRemoteEntryInfoFromSnapshot` in `runtime-core/src/utils/tool.ts` and
   the manifest-provider branch of `SnapshotHandler`) picks `ssrRemoteEntry`
   (typically `commonjs-module`) whenever present in a non-browser env. A
   first-class "prefer the ESM `remoteEntry` in Node" option (e.g.
   `preferredEntryTarget: 'esm' | 'ssr'`) is needed for manifest-driven
   remotes to use the native path without fragile snapshot rewriting.
2. **`loadEntryNode` failures bypass the error-recovery hook** — its catch
   logs a bare `error(...)` without the `RUNTIME_008` code, while the
   `loadEntryError` recovery hook is gated on `RUNTIME_008`; Node entry
   failures are therefore unrecoverable via the hook. Routing them through the
   same error-code machinery as `loadEntryScript` is a small runtime-core PR.
3. **`vm.SourceTextModule` ESM fallback is a dead end without
   `--experimental-vm-modules`** — the sdk's `loadModule` silently assumes the
   flag and cannot link bare specifiers; it should feature-check and emit an
   actionable error (or delegate to native `import()` when hooks are
   registered).

## 5. Security considerations

- **Allowlist, not open network imports.** Node itself has retreated from
  open network imports: `--experimental-network-imports` was **removed in
  22.6.0** (never shipped in 24+), and the policy-manifest integrity system
  (`--experimental-policy` + SRI) was **removed in 2024** — so both loading
  and integrity are explicitly library concerns now. This loader refuses any
  http(s) URL whose *origin* is not explicitly allowed. Origins enter the
  allowlist only from: registered MF remotes (the runtime plugin allowlists
  the remote-entry origin right before importing it),
  `registerNativeHttpLoader({ allowedOrigins })`, or the
  `MF_NODE_NATIVE_LOADER_HOSTS` env var.
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
- **Integrity roadmap (manifest-carried SRI + lockfile semantics).** With
  Node's policy manifests gone, the research
  ([research-node-platform.md](./research-node-platform.md) §5.3,
  [research-prior-art.md](./research-prior-art.md) §Lessons 6/8) recommends
  MF carry its own integrity chain: build-time SRI hashes (`sha384-…`) per
  remote-entry/chunk in `mf-manifest.json`, verified by the `load` hook
  against the exact fetched bytes before source ever reaches the module
  system; plus, longer term, a Deno-style **lockfile / `--frozen` mode** that
  fails CI on any hash or version drift, and a vendoring command that
  materializes remotes to disk for airgapped deploys. The honest model is
  *integrity + allowlist, not sandboxing* — a Node-target remote is
  server-executed trusted code; verify **what** runs, don't pretend to
  constrain what it can do.

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

Phase 2 (the primary-API migration, separate changes):

3. **Make `module.registerHooks()` (sync, in-thread) the primary API** on
   Node ≥ 22.15, with `module.register()` demoted to a legacy fallback for
   Node 20 / early-22 (see §3 "Hook API choice"): `register()` is
   runtime-deprecated in Node 26 (DEP0205) and will start warning in users'
   consoles. This requires the **out-of-band prefetch + disk cache** (sources
   fetched during MF's async init/preload; sync hooks serve cache hits) and
   removes the MessageChannel/ack allowlist protocol on that path.
4. The no-hooks ESM chunk fallback: thin `__webpack_require__.f.j` wrap
   installing fetched chunks via `__webpack_require__.C`
   (`externalInstallChunk`) — see §4.
5. Manifest-carried SRI verification in the `load` hook; lockfile/`--frozen`
   mode (§5). Target engine range moves to `^22.15.0 || >=24` once Node 20
   support is dropped (EOL 2026-04-30).
6. Upstream runtime-core PRs from §4 (prefer-ESM-entry option, `RUNTIME_008`
   normalization for `loadEntryNode`, `vm.SourceTextModule` capability check).
7. Documentation + examples in the website; consider flipping the default for
   ESM remotes in a future major once the path has soaked.

## 7. Out of scope / known follow-ups

- **Webpack CJS chunk graphs over native hooks.** Async chunks of
  *non-ESM* builds keep using the patched `readFileVm` path; teaching the CJS
  loader to fetch chunk files over http is not attempted here (see §4).
- **`registerHooks()` sync API** (Node 22.15+) — the phase-2 primary API
  (see §3 and §6), paired with out-of-band prefetch + disk cache.
- **No-hooks ESM chunk fallback** — the `f.j` wrap via
  `__webpack_require__.C`, see §4.
- **Integrity metadata** — manifest-carried SRI verified in the `load` hook,
  plus lockfile/frozen mode, see §5.
- **Entry-tracker/flush-chunks parity for ESM output** — the
  `EntryChunkTrackerPlugin` / `UniverseEntryChunkTrackerPlugin` and
  `flush-chunks` utilities assume CJS `module.filename`; ESM builds need
  `import.meta.url`-based equivalents or explicit exclusion
  ([esm-chunk-loading-options.md](./esm-chunk-loading-options.md) §5).
- **Upstream runtime-core gaps** — see §4 "Upstream runtime-core / sdk PR
  candidates".

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

A complete, runnable webpack-built pair (ESM remote with a nested async
chunk + bundler-free-loading host) lives at
[`apps/node-esm-remote`](../../../apps/node-esm-remote/README.md) and
[`apps/node-esm-host`](../../../apps/node-esm-host/README.md).
