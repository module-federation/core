# Node.js Platform Research: Loading ES Modules over HTTP(S) Without a Bundler

> Research document for the bundler-free `@module-federation/node` runtime design.
> Compiled July 2026. All stability statuses were verified against the live Node.js
> documentation (v26.4.0 docs, v24.x docs, v22.x docs) and nodejs/node PRs/issues —
> not against pre-2025 training data. Node release lifecycle as of this writing:
> **Node 20 is End-of-Life (2026-04-30), Node 22 is Maintenance LTS (EOL 2027-04-30),
> Node 24 is Active LTS (EOL 2028-04-30), Node 26 is Current (LTS October 2026).**

---

## 1. Module customization hooks

Node.js currently ships two hook registration APIs on `node:module`. Their fortunes
have **inverted** relative to what most 2023–2024 material describes: the async
off-thread API is now deprecated, and the sync in-thread API is the recommended path.

### 1.1 `module.register()` — asynchronous, off-thread — **DEPRECATED**

| Property | Detail |
| --- | --- |
| Added | v20.6.0, v18.19.0 |
| Stability (2026) | **0 – Deprecated (DEP0205)**. Doc-deprecated via nodejs/node#62395; **runtime-deprecated in v26.0.0** (nodejs/node#62401) — calling it emits a `DeprecationWarning`. Slated for removal in a future major (27.x was floated in the deprecation discussion). |
| Threading model | Hook module runs on a **dedicated loader worker thread** in a **separate realm**. It is spawned lazily on first registration and inherited by child worker threads by default. |
| State sharing | Globals are not shared with the main thread. Communication only via `MessagePort` passed through the `initialize` hook's `data` (transferables supported). The hooks thread may be terminated by the main thread at any time, so async side effects (even `console.log`) may never complete. |
| Under the hood | Node uses `Atomics.wait()` (for customized `require()` in CJS) and `Atomics.waitAsync()` internally to synchronize the main thread with the loader thread. |
| Permission model | Because it spawns a worker, running under `--permission` requires `--allow-worker` (enforced since v23.6.1 / v22.13.1 / v20.18.2). |

**Performance overhead.** Each resolve/load crossing pays inter-thread IPC +
serialization + locking. A real-world migration data point: oxc-node's loader went
from **112.5 ms (`register()` worker thread) to 59.8 ms (`registerHooks()`)** for the
same workload (~1.9× faster; oxc-project/oxc-node#633). The Node docs themselves say
the async hooks "incur extra overhead from inter-thread communication" and that
`resolve` may still block the main thread despite being async.

**Unfixable caveats (why it was deprecated).** From the official docs' "Caveats of
asynchronous customization hooks" and Joyee Cheung's loader talks:

- Async hooks do **not** affect all `require()` calls: `createRequire()`-created
  require functions bypass them, and if the `load` hook doesn't override `source`
  for a CJS module, that module's children bypass the hooks too.
- CJS modules customized by async hooks get a **restricted CommonJS API** (no
  `require.cache`, no `require.extensions`, no `require.resolve.paths`), and
  `require()`/`require.resolve()` inside them use the `"import"` export condition
  instead of `"require"` — a dual-package hazard.
- The async `load` hook is **incompatible with namespaced exports from CJS**
  (imports yield an empty object).
- Node may load a CJS module's source **multiple times** to keep monkey-patching
  compat, causing surprises if content changes between loads.
- Mixing user MessagePorts/locks with Node's internal ones is deadlock-prone; the
  Node team concluded these issues "have proven unresolvable" (deprecation commit).

### 1.2 `module.registerHooks()` — synchronous, in-thread — **the target API**

| Property | Detail |
| --- | --- |
| Added | **v23.5.0 and v22.15.0** (nodejs/node#55698). Present in all of 24.x and 26.x from day one. **Not available on any Node 20 release.** |
| Stability (2026) | **1.2 – Release Candidate** since **v25.4.0 / v24.13.1** (and current 26.x docs). On the v22 line the docs still label it 1.1 (Active Development), but the API surface is identical. Per the DEP0205 discussion, the loaders team intends to mark it **stable in a 26.x minor (~August 2026)**, at which point `module.register()` removal timelines start. |
| Threading model | Hooks are plain synchronous functions run **in the same thread and same realm** as the application. No IPC, no serialization, no worker startup. Hooks can share state with app code via ordinary closures/globals. |
| Coverage | Applies to **`import`, `require()`, and `createRequire()`-created require** — strictly broader CJS coverage than the async API. |
| Async support | **None.** `resolve` and `load` must return synchronously; returning a Promise is not supported. If async work is needed (e.g. a network fetch), the documented pattern is to spawn your own worker and block on it with `Atomics.wait()` — this is exactly what Node does internally for the deprecated async API anyway. |
| Extras | Returns `{ deregister() }` for removing hooks (only the sync API has this). Multiple `registerHooks()` calls chain (LIFO — last registered runs first, `next*` delegates down the chain). No `initialize` hook needed: run setup code before calling `registerHooks()`. |
| Worker inheritance | **Not** inherited into child workers by default — unlike async hooks. If registered via a file preloaded with `--import`/`--require`, children inherit through `process.execArgv`. A programmatic in-app registration must be repeated inside worker threads (relevant if federated code spawns workers). |

### 1.3 Which API should a library target in 2026?

For a Node 20/22/24 support matrix as requested:

- **Node 20 is EOL as of 2026-04-30** and never got `registerHooks()`. Supporting it
  requires the deprecated `module.register()` (available 20.6.0+). Recommendation:
  treat Node 20 as best-effort or drop it; if kept, it must use the async-hook
  fallback with all of §1.1's caveats.
- **Node 22**: use `registerHooks()` on **≥22.15.0**, fall back to `register()` on
  22.0–22.14 (or set `engines: ">=22.15.0"` — 22.15.0 shipped April 2025, so
  Maintenance-LTS users are overwhelmingly past it).
- **Node 24 / 26**: `registerHooks()` unconditionally; it is RC on 24 and about to
  be stable on 26, while `register()` **emits a runtime deprecation warning on 26**
  — a library that still calls `register()` on Node 26 will spam users' consoles.

**Verdict: target `module.registerHooks()` as the primary API with feature
detection (`typeof module.registerHooks === 'function'`), and an optional
`module.register()` fallback only if Node 20 / early-22 support is contractually
required.** Detection-based fallback is what tsx, oxc-node, and other loaders
shipped in 2025.

---

## 2. HTTPS / network imports

### 2.1 `--experimental-network-imports`: history and removal

- Introduced experimentally in v17.6.0 / v16.15.0 (nodejs/node#36328) to allow
  browser-like `import 'https://…'` with a hard-coded security model: network
  modules could only import other network modules and had no access to Node
  builtins, no credentialed requests, HTTP restricted to loopback, etc.
- **Removed in v22.6.0 (August 2024)** via nodejs/node#53822 ("lib,src: drop
  --experimental-network-imports"), which reverted #36328. Node ≥22.6 has no flag
  at all; Node 18/20 kept it until their EOL. It never existed in 23.x/24.x/26.x.
- **Why removed** (from the PR, quoting Joyee Cheung): the feature had **no
  champion**, the docs never defined clear security expectations so incoming
  vulnerability reports could not even be assessed, and the security model ("no
  access to other builtins to run untrusted code") is "just not going to work out
  in the current Node.js architecture without a huge amount of refactoring …
  The only way you could do it is to rewrite Node.js from scratch, then that's
  Deno. Even [redacted] leaks a stream that can be a file stream, it's going to
  be a whack-a-mole."
- Related hardening (`data:`-URL bypass of network-import restrictions,
  nodejs/node#53764) landed around the same time — the feature was actively
  producing security bugs at the end.

**Nothing native has landed since.** The current v26 ESM docs state plainly: *"A
specifier like `'https://example.com/app.js'` is not supported natively in Node.js
unless using a custom HTTPS loader."* The v26.4.0 package-maps feature (§3.1)
explicitly supports **only `file:` URLs**. There is no open PR adding native
network imports back.

### 2.2 The officially documented path: an HTTPS loader hook

The Node docs (module.html → "Examples" → **"Import from HTTPS"**) ship a canonical
example: a `load` hook that intercepts `https://` URLs, fetches with `node:https`,
and returns `{ format: 'module', shortCircuit: true, source }`. The docs attach an
explicit warning: *"performance is much slower than loading files from disk, there
is no caching, and there is no security."* — i.e. Node core's official position is
that **caching, integrity, and origin policy are the loader author's job**. That is
precisely the value a Module Federation loader adds over the toy example.

Note the docs' example is written for the **async** hook API (it returns a
Promise). A `registerHooks()`-based HTTPS loader must fetch **synchronously**
(worker + `Atomics.wait`, or ahead-of-time prefetch into a local cache so the
hook is a synchronous cache read — see recommendations).

### 2.3 Security posture recommended by Node core

Reading #53822, the threat-model doc, and the policy-removal discussion (§5.3),
Node core's consistent position is:

1. Code you load is **trusted once loaded** — Node does not sandbox modules and
   never will in the current architecture.
2. Therefore remote-code loading must be **opt-in, explicit, and verified before
   evaluation** (allowlists + content integrity), not sandboxed after the fact.
3. Userland loaders own this responsibility; core provides the hook points only.

---

## 3. Related machinery

### 3.1 Import maps / package maps

Node has **no browser-style import map support**. New and directly relevant:
**`--experimental-package-map=<path>`, added in v26.4.0** (nodejs/node#62239,
Stability 1 – Experimental). It maps bare specifiers via a static JSON file instead
of `node_modules` walking. Constraints that make it unusable for federation
remotes: package URLs must be **`file:` protocol only**, the map is a **single
static file loaded synchronously at startup**, and it only affects bare specifiers.
It is interesting as prior art for "shared" scope pinning (mapping `react` for a
subtree) but cannot express `https:` targets. Resolution overriding for federation
must happen in a `resolve` hook.

### 3.2 `--loader` / `--experimental-loader` vs `--import`

- `--experimental-loader=<mod>` (renamed from `--loader` in v12.11.1): still exists
  in v26 but the docs say *"This flag is discouraged and may be removed in a future
  version… Please use `--import` with `register()` instead."* It runs hooks on the
  loader thread (same machinery as `register()`), needs `--allow-worker` under the
  permission model, and inherits every §1.1 caveat. **Do not build on it.**
- `--import=<mod>` (added v19.0.0 / v18.18.0, Stability 1 – Experimental but the
  blessed vector): preloads an ESM entry at startup, **into the main thread and
  into all worker threads / forked / clustered children**. This is the recommended
  way to register hooks before any app code runs:

  ```bash
  node --import @module-federation/node/register app.mjs
  ```

  where the `/register` export subpath calls `registerHooks()` at module top level.
  `--require` also works for a CJS registration entry and runs even earlier.

### 3.3 `NODE_OPTIONS` injection

`--import`, `--require`, `--experimental-loader`, `--enable-source-maps`,
`--experimental-vm-modules`, `--permission`, and `--allow-net` are all on the
`NODE_OPTIONS` allowlist (verified against v26 CLI docs). So zero-code-change
enablement is possible:

```bash
NODE_OPTIONS="--import @module-federation/node/register" node app.mjs
```

Caveat: `NODE_OPTIONS` applies to **every** Node process spawned in that
environment (including npm scripts and child tools), so it is a deployment-level
switch, not a library default.

### 3.4 Programmatic registration from a running app — timing caveats

`registerHooks()` can be called at any point at runtime (this is how a Module
Federation `init()` call could self-install hooks without any flag). Documented
caveats:

- Hooks only affect modules **loaded after** registration. Anything already in the
  ESM or CJS cache stays as-is (fine for federation — remote URLs were never
  loadable before).
- **Static `import` statements in the registering module are evaluated before any
  of its code runs** — including the `registerHooks()` call — regardless of where
  the import appears textually. Modules that must be customized have to be loaded
  with `require()` or dynamic `import()` *after* registration. For Module
  Federation this maps naturally onto the existing async `init()` →
  `loadRemote()` flow: as long as hooks are registered inside `init()` before the
  first `loadRemote()`, no CLI flag is needed at all.
- Sync hooks are not auto-inherited by worker threads (§1.2) — a runtime that
  supports `loadRemote()` inside user-spawned workers needs the `--import`
  registration style or re-initialization per worker.

### 3.5 Module compile cache

`module.enableCompileCache()` (added **v22.8.0**; `NODE_COMPILE_CACHE=dir` env var
since v22.1.0; **no longer experimental as of v25.4.0**; `portable: true` option in
v25.0.0/v24.12.0). Persists V8 code cache on disk for compiled CJS/ESM/TS modules,
keyed by content — big win for repeat startups. Two implications for the design:

- Compile cache operates on modules Node itself compiles, keyed by their URL and
  content; hook-served `source` for `https:` URLs is compiled fresh each process.
  The reliable way to benefit is the disk-cache architecture anyway required for
  sync hooks: persist fetched remotes under a cache dir and let modules be
  file-backed (or at minimum call `enableCompileCache()` and accept wins on the
  local portion of the graph).
- It is free to enable (never throws, returns a status object) and safe to call
  from library code, but respects `NODE_DISABLE_COMPILE_CACHE=1`.

### 3.6 Source maps for hook-provided sources

- Enable via `--enable-source-maps` (stable, allowed in `NODE_OPTIONS`) or
  programmatically via **`module.setSourceMapsSupport(enabled[, options])`,
  added v22.14.0 / v23.7.0** — the programmatic form only affects modules loaded
  *after* the call, so the CLI flag is preferred.
- Source maps are discovered via the standard `//# sourceMappingURL=` **magic
  comment in the final source that the `load` hook returns** — this works for
  hook-provided sources: either an inline `data:application/json;base64,…` URL
  (most robust for network-served code) or an absolute URL. Stack traces in
  federated remotes then map back to original sources.
- If the loader transforms source, it must append/merge the map itself; Node does
  not compose maps across transforms.

### 3.7 `vm.SourceTextModule` status

Still **Stability 1 – Experimental behind `--experimental-vm-modules`** in v24.x
and v26.x docs (verified July 2026). The long-standing memory leak
(nodejs/node#59118) was fixed in January 2026, but the stabilization roadmap issue
(#37648) concluded with maintainers opening **a redesigned vm-module API proposal
(nodejs/node#62720)** rather than stabilizing the current classes; the 26H1
collaborator summit confirmed a redesigned `vm` API is under discussion. **The
current `vm.SourceTextModule` API will likely never be stabilized as-is.**
Conclusion: a vm-based custom ESM linker (the "webpack-style runtime in userland"
approach) would ride an experimental flag indefinitely and chase a moving API —
it should be at most a last-resort strategy, not the primary design.

---

## 4. CJS interop

### 4.1 Serving `format: 'commonjs'` from a load hook

A `load` hook **may** return `{ format: 'commonjs', source }` — supported since
v20.6.0 for the async API and from the start for sync hooks. Constraints:

- **Sync hooks (`registerHooks()`)**: the clean path. Docs: *"These caveats do not
  apply to the synchronous `load` hook, in which case the complete set of CommonJS
  APIs [is] available to the customized CommonJS modules, and
  `require`/`require.resolve` always go through the registered hooks."* Named
  exports from hook-served CJS work (cjs-module-lexer runs on the returned source).
- **Async hooks (`register()`)**: serving CJS `source` switches those modules to
  the ESM-loader CJS path with the restricted `require` (§1.1); omitting `source`
  (nullish) drops back to the classic CJS loader and **children bypass hooks** —
  a documented-as-temporary behavior. Plus the namespaced-exports incompatibility.
- **Non-`file:` URLs with CJS format**: possible but rough. Internally Node maps
  the URL to a CJS `filename` via `urlToFilename()`, which converts only `file:`
  URLs to paths and otherwise **uses the raw URL string as the filename/cache
  key** (verified in `lib/internal/modules/helpers.js` on main: "This is generally
  only possible when the URL is provided by a custom loader"). So an
  `https://…/remoteEntry.cjs` module executes, but `__filename`/`__dirname` are
  URL-shaped strings, `require('./chunk.js')` inside it resolves relative to a
  non-path — every relative require must be intercepted by the resolve hook.
  Also note the default `nextLoad` throws `ERR_INVALID_URL_SCHEME` for anything
  but `file:`/`data:`/`node:` — the hook must fully short-circuit `https:` loads.

### 4.2 `require(esm)` status

- **Unflagged in v22.12.0** (Dec 2024) and backported to **v20.19.0**; enabled by
  default in 23+/24+/26. **Marked Stable at the end of 2025** (Joyee Cheung's
  Dec 2025 write-up). Detection: `process.features.require_module`.
- Constraint: the required ESM graph must not contain **top-level await**, else
  `ERR_REQUIRE_ASYNC_MODULE` (debug with `--experimental-print-required-tla`).
- Interop: `require(esm)` returns the module namespace (default under `.default`),
  or whatever the module exports as the string-named `"module.exports"` export;
  the `"module-sync"` exports condition lets one ESM file serve both `require`
  and `import` consumers.

### 4.3 Implications for federated remotes (`commonjs-module` vs `module`)

- **Remotes built as `module` (ESM) are the happy path**: hook returns
  `format: 'module'`, relative imports inside the remote resolve naturally against
  its `https:` base URL per standard URL semantics, and — because `require(esm)`
  is now stable and unflagged everywhere ≥20.19/22.12 — **even CJS host code can
  synchronously `require()` a federated ESM entry** once the resolve hook maps the
  specifier (sync hooks intercept `require`). One build target serves both worlds.
- **Remotes built as `commonjs-module`** remain loadable (sync hooks + `format:
  'commonjs'` + source), which matters because today's `@module-federation/node`
  remotes are `commonjs-module` chunks fetched and evaluated by webpack/rspack
  runtime patches. But each remote chunk's internal `require(./chunk)` graph must
  be rewritten/intercepted, `__filename` is a URL string, and top-level-await
  cannot exist anyway in CJS. Workable as a **compatibility mode for existing
  remotes**; ESM output should be the recommended target for new builds.
- Avoid the async-hook + CJS combination entirely (empty-namespace bug,
  restricted require) — a second reason the fallback ladder should prefer
  `registerHooks()` even on Node 22.

---

## 5. Permissions and security

### 5.1 Permission model interaction

- The **Permission Model is Stable** since v23.5.0 / v22.13.0 (`--permission`).
- **Network permissions (`--allow-net`) only exist since v25.0.0** (Stability 1.1,
  Active Development; present in 26.x). Consequences by version:
  - **Node 22 / 24 with `--permission`**: outbound network is **not restricted**
    — a federation loader's `fetch`/`https.get` works with no extra flag. (FS
    reads for the local cache dir need `--allow-fs-read`/`--allow-fs-write`.)
  - **Node 25+/26 with `--permission`**: network is denied by default
    (`ERR_ACCESS_DENIED`); apps must pass `--allow-net`. As of the January 2026
    security release this also covers Unix domain sockets. `--allow-net` is
    currently all-or-nothing (no per-host granularity yet).
- **Loader threads**: `module.register()` / `--experimental-loader` spawn a worker,
  which under `--permission` additionally requires **`--allow-worker`** (enforced
  since v22.13.1 / v23.6.1 / v20.18.2). `registerHooks()` runs in-thread and needs
  no worker permission — another point for the sync API. (A sync-fetch bridge
  worker spawned by the library *would* re-introduce the `--allow-worker`
  requirement; an ahead-of-time async prefetch design avoids it.)
- Node 26 also supports declaring permissions in a config file
  (`--experimental-config-file`, `"permission": { "allow-net": true, … }`).

### 5.2 Recommended allowlisting pattern

Nothing in core enforces origins anymore (§2.1, §5.3), so the loader must:

- Deny-by-default: only URLs whose **origin appears in the registered remotes /
  manifest config** are fetchable through the hook; everything else falls through
  to `nextResolve`/`nextLoad` and fails naturally.
- HTTPS-only by default, `http:` opt-in for `localhost`/dev.
- Constrain the *graph*, not just the entry: relative imports inside a remote must
  stay within that remote's origin/path prefix unless explicitly shared/mapped.

### 5.3 Integrity checking

Node's built-in mechanism is **gone**: `--experimental-policy` (policy manifests
with SRI `integrity` fields for every resource, plus `--policy-integrity`) was
**removed in v22.5.0-era, May 2024** (nodejs/node#52575 → #52583) — unmaintained
and in conflict with the threat model ("modules can circumvent security features
once loaded"). The security WG floated a future separate integrity feature with
Microsoft, but **nothing has shipped as of mid-2026**. Browsers meanwhile gained
`integrity` in import maps — Node has no equivalent.

Therefore integrity is a library concern, and Module Federation is well-placed:
the **manifest (`mf-manifest.json`) can carry SRI hashes (`sha384-…`) per exposed
chunk**, computed at build time; the loader verifies fetched bytes against the
manifest entry before returning source from the `load` hook (`node:crypto`
`createHash` on the exact bytes, constant-time compare). This reproduces what
policy manifests did, scoped to federation. Version-pinned manifests + hash-locked
chunks ≙ lockfile semantics for remotes.

---

## 6. Version support matrix

| Capability | Node 20 (EOL) | Node 22 (Maint. LTS) | Node 24 (Active LTS) | Node 26 (Current) |
| --- | --- | --- | --- | --- |
| `module.register()` (async, off-thread) | ✅ 20.6.0+ (exp.) | ✅ (Active Dev) | ✅ (Active Dev) | ⚠️ **runtime-deprecated (DEP0205)** |
| `module.registerHooks()` (sync, in-thread) | ❌ | ✅ **22.15.0+** (Active Dev label) | ✅ (RC since 24.13.1) | ✅ RC → stable expected in a 26.x minor |
| `--experimental-network-imports` | ✅ until EOL | ❌ **removed in 22.6.0** | ❌ never existed | ❌ never existed |
| Native `https:` import support | ❌ | ❌ | ❌ | ❌ (hooks only) |
| `require(esm)` unflagged | ✅ 20.19.0+ | ✅ 22.12.0+ | ✅ | ✅ (Stable since late 2025) |
| Sync `load` → `format:'commonjs'` + source, full CJS API | ❌ (no sync hooks) | ✅ 22.15.0+ | ✅ | ✅ |
| `--import` preload flag | ✅ (18.18+) | ✅ | ✅ | ✅ |
| `module.enableCompileCache()` | ❌ | ✅ 22.8.0+ | ✅ | ✅ (non-exp. since 25.4) |
| `module.setSourceMapsSupport()` | ❌ | ✅ 22.14.0+ | ✅ | ✅ |
| `--enable-source-maps` | ✅ | ✅ | ✅ | ✅ |
| Permission model (`--permission`) | exp. | ✅ stable 22.13.0+ | ✅ stable | ✅ stable |
| `--allow-net` (network gating) | ❌ | ❌ (net unrestricted) | ❌ (net unrestricted) | ✅ 25.0.0+ (Active Dev) |
| Policy manifests / SRI integrity | ✅ until EOL | ❌ removed 2024 | ❌ | ❌ |
| Package maps (`--experimental-package-map`) | ❌ | ❌ | ❌ | ✅ 26.4.0+ (`file:` only) |
| `vm.SourceTextModule` | flag, exp. | flag, exp. | flag, exp. | flag, exp.; API redesign proposed |

**Minimum viable baseline for a library shipping in 2026:
`node: "^22.15.0 || >=24"`.** That gives `registerHooks()`, `require(esm)`, compile
cache, programmatic source-map support, and the stable permission model everywhere,
with zero deprecated API usage and zero mandatory CLI flags. Node 20 is EOL; if it
must be supported, only via the deprecated `module.register()` path, clearly marked
degraded (async-hook CJS caveats apply).

---

## 7. Recommendations for the bundler-free `@module-federation/node` design

### 7.1 Registration API

- **Primary: `module.registerHooks()`** with synchronous `resolve` + `load` hooks.
  Feature-detect at runtime; on Node ≥26 never touch `module.register()` (avoids
  DEP0205 warnings).
- Hook mechanics: `resolve` maps federation specifiers (remote name / manifest
  entries / shared scope) → `https:`/`file:` URLs with `shortCircuit: true`;
  `load` serves bytes for federation-owned URLs (origin-allowlisted, integrity
  verified) with `format: 'module'` (or `'commonjs'` for legacy remotes), and
  delegates everything else to `nextLoad`.
- Because sync hooks cannot await, **fetch out-of-band**: `init()`/`loadRemote()`
  are already async — download manifest + chunks (with integrity check) into an
  on-disk content-addressed cache *before* triggering `import()`; the `load` hook
  then performs a synchronous cache read. This avoids both the `Atomics.wait`
  bridge worker (and its `--allow-worker` cost under `--permission`) and keeps the
  hot path fast. A sync bridge worker remains an option for truly-lazy static
  imports inside remotes that were not prefetched.

### 7.2 Flags an app must pass

- **Default: none.** Programmatic registration inside `init()` works because
  federation loads remotes via async `loadRemote()` after registration (§3.4).
- Optional zero-code mode: `node --import @module-federation/node/register app.mjs`
  or `NODE_OPTIONS="--import @module-federation/node/register"` — required if
  remote loading must work in user-spawned worker threads or before app bootstrap.
- Recommended alongside: `--enable-source-maps` (stack traces into remote
  sources); document `NODE_COMPILE_CACHE=dir` / `enableCompileCache()`.
- If the app runs with `--permission`: `--allow-fs-read`/`--allow-fs-write` for
  the cache dir on 22/24, plus `--allow-net` on 25+/26 (and `--allow-worker` only
  in async-fallback or bridge-worker modes).

### 7.3 Fallback ladder

1. **Node ≥22.15 / 24 / 26 → `registerHooks()`** (sync, in-thread). Full `import`
   + `require` interception, ESM remotes first-class, CJS remotes supported.
2. **Node 20.6–20.x / 22.0–22.14 → `module.register()`** (async, off-thread),
   ESM-format remotes only (avoid CJS-over-async-hooks entirely); accept the
   worker-thread overhead and mark this path deprecated from day one.
3. **Anything older / hooks unavailable → existing bundler-runtime path** (current
   webpack/rspack runtime-patching delegate) as the compatibility escape hatch.
   Do **not** build a `vm.SourceTextModule` tier: still experimental behind
   `--experimental-vm-modules` in 2026 with a replacement API being designed (§3.7).

### 7.4 Remote build format guidance

Recommend `module` (ESM) output for remotes targeting the native loader: natural
relative-URL resolution, `import()` and — via `require(esm)`, stable and unflagged
on every supported line — synchronous `require()` consumption from CJS hosts (as
long as remotes avoid top-level await, which should become a documented constraint
for Node-targeted remotes). Keep `commonjs-module` remote support as a
compatibility mode through the sync `load` hook, with the resolve hook owning all
relative-specifier resolution inside such remotes (§4.1, §4.3).

---

## Appendix: primary sources

- Node.js v26.4.0 docs: `module.html` (Customization Hooks, registerHooks RC
  status, DEP0205, compile cache, source maps, "Import from HTTPS" example),
  `esm.html` (no native `https:` support; resolution algorithm), `cli.html`
  (`--import`, `--experimental-loader` discouraged, `NODE_OPTIONS` allowlist,
  `--permission`, `--allow-net` v25.0.0), `packages.html` (Package maps v26.4.0),
  `vm.html` (SourceTextModule experimental), `permissions.html` (stable).
- nodejs/node#55698 (registerHooks implementation), #62395 (doc-deprecate
  register), #62401/commit 98907f560f (runtime-deprecate, DEP0205), #53822
  (drop network imports, in v22.6.0), #52575/#52583 (remove --experimental-policy),
  #47999 (CJS via ESM loader / non-file filenames), #62239 (package maps),
  #37648 → #62720 (vm modules redesign), #59118 (SourceTextModule leak, fixed
  Jan 2026).
- Node v22.12.0 release notes + Joyee Cheung, "require(esm) from experiment to
  stability" (Dec 2025); Joyee Cheung, "Evolving the Node.js Module Loader"
  (Igalia slides); nodejs/loaders#201 (hooks threading direction).
- oxc-project/oxc-node#633 (registerHooks migration benchmark, 1.9× faster).
- nodejs/Release schedule (20 EOL 2026-04-30; 22 Maintenance; 24 Active LTS;
  26 Current, LTS 2026-10-28). NodeSource, "Node.js January 2026 Security
  Release" (permission model UDS/network hardening).
