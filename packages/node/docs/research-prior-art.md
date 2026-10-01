# Prior Art: Loading Remote / Federated ES Modules Natively in Server-Side JS Runtimes

> Research survey (July 2026) to inform the bundler-free Node design for
> `@module-federation/node`. Each section covers: how remote modules are loaded,
> runtime requirements/flags, chunk/multi-file handling, shared-dependency
> strategy, security model, and what Module Federation (MF) can borrow.

---

## 1. Native Federation (`@softarc/native-federation` / `@angular-architects/native-federation`)

The closest philosophical sibling to a bundler-free MF. Its whole premise is
"the Module Federation mental model re-expressed on plain ESM + import maps."

**How it loads remote modules.** Every project (host or remote) builds with its
own bundler (esbuild via the Angular `ApplicationBuilder`, or any adapter
implementing `NFBuildAdapter`) and emits two artifacts: `remoteEntry.json`
(what this project exposes and which shared externals it expects) and
`importmap.json` (this project's view of where its externals live). At startup
the runtime fetches each remote's `remoteEntry.json`, merges the shared
declarations, resolves version conflicts, and injects **one combined import
map**. From then on the *platform* resolves every `import` — no custom module
loader in the hot path. `loadRemoteModule('mfe1', './Component')` is just sugar
over a dynamic `import()` resolved through the injected map.

**Node/SSR story.** This is the most instructive part for MF:

- Server-side Native Federation is driven by a **Node loader hook**, originally
  a fork of Joel Denning's `@node-loader/import-maps` package. The v4
  "Orchestrator" ships a `/node` entry (`@softarc/native-federation-orchestrator/node`,
  `initNodeFederation`) that installs a `module.register()` loader hook.
- Launch shape: `node --import @angular-architects/native-federation/node-preload dist/<app>/server/server.mjs`.
  The `--import` preload is fully evaluated (top-level await included) before
  Node loads the entry point, so the hook intercepts even the *static*
  `@angular/*` imports of `server.mjs`. The build emits the CLI's `server.mjs`
  unmodified — the preload is the only SSR-specific piece, applied purely at
  launch, and **one preload serves the host and every remote**.
- Earlier versions used a generated `fstart.mjs` ("federation start") wrapper
  that initialized federation then delegated to the normal `server.mjs`; the
  preload approach replaced it because it keeps `server.mjs` as the main module
  (its `isMainModule(import.meta.url)` guard keeps working).
- Shared singletons are bridged across host and remotes via a global
  (`hostInstances` / `globalThis.__NF_REGISTRY__`), so a remote's
  `@angular/core` resolves to the host's single instance during SSR.
- `loadRemoteModule` supports a `fallback` so a missing remote degrades
  gracefully server-side instead of crashing the render.

**Runtime requirements.** Node with `module.register()` support (>= 18.19 /
20.6); no experimental flags — customization hooks are the supported path. The
SSR build must **not** pre-bundle externals: Angular's
`options.externalDependencies = externals` leaves shared imports as real
`import` statements the hook can intercept.

**Chunks / multiple files.** Shared packages are pre-bundled per-external by
esbuild at build time. When a v4 remote opts into *chunked* shared externals,
each chunk sibling is registered inside the owning remote's **import-map
scope** under an internal specifier (e.g. `@nf-internal/chunk-IXOA6WTM`), so
bundler-emitted dynamic imports inside a shared package resolve to the right
sibling without polluting the global `imports` field. Relative chunk imports
between a remote's own files just work, because they're plain URLs resolved
against the remote's base.

**Shared dependencies.** Declared per-project in `remoteEntry.json` with
version metadata + `singleton`/`strictVersion` flags; the runtime/orchestrator
resolves a winner per share-scope (semver-range resolution in v4) and writes
the result into the import map (`imports` for winners, `scopes` for
version-isolated losers). This is "share resolution as import-map generation."

**Security.** The orchestrator supports **SRI verification** of remote
artifacts declared in `remoteEntry.json`; otherwise trust is placed in the
serving origin (same as script-tag federation).

**What MF can borrow:**
- The two-artifact contract (expose manifest + externals map) — MF's
  `mf-manifest.json` already plays the first role; a per-remote import map is
  the missing second half.
- The `node --import <preload>` launch pattern with a single process-wide hook
  serving host *and* all remotes.
- Scoped import maps (`scopes`) as the mechanism for version-skew isolation
  and for internal chunk naming.
- SRI hashes in the manifest, verified by the loader.
- Server-side fallback modules for failed remotes.

---

## 2. JSPM / import-map tooling in Node

**`@jspm/node-importmap-loader`** (a.k.a. `node-importmap-http-loader`):
experimental JSPM loader that reads a `node.importmap` / `importmap.json` from
the working directory and both applies the map *and* fetches `https:` targets,
using Node's native `fetch`. Requires Node 18+. Ships a `load-node-importmap
<file>` CLI wrapper rather than asking users to compose `--import` flags.
Status is still "Experimental" on jspm.org — a signal that a generic
HTTP-import-map loader for Node has real edge cases (caching, CJS interop,
builtin passthrough) that nobody has fully productized.

**`@node-loader/import-maps`** (v2.0.0, Sep 2025): the cleanest reference
implementation of import maps as a Node **resolve hook**. Registration pattern:

```js
import { register } from "node:module";
import { MessageChannel } from "node:worker_threads";

const { port1, port2 } = new MessageChannel();
global.importMapPort = port1;

register("@node-loader/import-maps", import.meta.url, {
  data: { port: port2, importMapUrl: "./node.importmap" },
  transferList: [port2],
});
```

Two details matter for MF: (a) it only customizes *resolution* and lets Node's
default loader do the loading — which means it cannot fetch `https:` targets
by itself; and (b) because `module.register()` hooks run on a **separate
loader thread**, dynamic updates to the import map (i.e. registering a remote
after startup) must be shipped over a `MessagePort`. That cross-thread
choreography is exactly the complexity Node has since deprecated (see §5).

**`@jspm/import-map`**: a runtime-agnostic library for constructing, merging,
and resolving import maps programmatically (including scopes and integrity
attributes). Useful as an off-the-shelf data structure if MF generates
per-remote maps instead of writing a bespoke resolver.

**es-module-shims relevance server-side.** It's browser-only, but its API is a
useful design checklist: `resolve` hook, `source` hook (virtual module
sources), `fetch` hook, dynamic/lazy import-map extension, and an
`importShim()` entry point. Native Federation explicitly depends on its
shim-mode ability to *extend the map after modules have already loaded* —
something native browser import maps historically forbade. Any MF Node design
needs the same property: remotes register at arbitrary times, so resolution
state must be mutable, which argues for keeping resolution inside an MF-owned
hook/runtime rather than a frozen startup-time map.

**What MF can borrow:** the resolve-hook-only architecture (map bare
specifiers, let something else fetch); `MessagePort`-based dynamic map updates
if async hooks are ever used; `@jspm/import-map` for map algebra; the lesson
that mutable, late-extensible resolution is a hard requirement federation adds
on top of the static import-map spec.

---

## 3. Deno

**How it loads remote modules.** `https:` imports are first-class: `import x
from "https://cdn.example.com/mod.ts"`. Modules are fetched once, cached
globally on disk, and compiled. `deno.json` supports full import maps
(`imports` + `scopes`), and `npm:` / `jsr:` / `node:` specifiers coexist with
URL imports.

**Cache / lock / integrity model — the DX gold standard here:**
- `deno.lock` (v5 format) pins every dependency to an exact version **with an
  integrity hash**, maintained automatically, verified on every run.
- `deno ci` = "install strictly from the lockfile, error on drift" (the
  npm-ci analogue); `--frozen` / `"frozen": true` makes any command that would
  mutate the lock fail loudly with a diff of what it wanted to change.
- Vendoring localizes remote modules for offline/airgapped builds.
- A `trust-policy` (`no-downgrade`) refuses to resolve a package whose
  publishing-trust level is weaker than what the lockfile already recorded.
- Notably, Deno's own docs now *discourage* raw HTTPS imports for applications
  ("can drift to different versions across files, aren't managed by `deno
  add`, and trust the serving host") in favor of registries — i.e. even the
  runtime that pioneered URL imports concluded that **URL imports need a
  manifest/lockfile layer on top** to be production-safe.

**Security model.** Permission flags (`--allow-net=host`, `--allow-read`, …)
sandbox what fetched code can do; integrity hashes in the lockfile prevent
tampering between runs. This is the security model Node explicitly said it
*cannot* retrofit (see §5's network-imports removal), so MF should not pretend
loader hooks provide sandboxing — only integrity + allowlisting are realistic.

**Could the MF runtime run on Deno?** Plausibly yes for the pure-runtime path:
Deno 2.x runs npm packages via `npm:` specifiers, implements nearly all
`node:` builtins, supports `package.json`, and (since 2.9) resolves bare
builtin names. `@module-federation/runtime-core` is plain TS with no bundler
requirement. The blockers are the *loading* layer: `vm.SourceTextModule`
(used by the current Node ESM remote path) is not implemented in Deno, so a
Deno target would want either native `import(url)` (trivially available —
arguably federation is *easier* on Deno) or a fetch-and-cache-to-disk loader.
A design that isolates "get module namespace for URL" behind a small adapter
keeps Deno/Bun targets cheap.

**What MF can borrow:** lockfile with integrity hashes per remote artifact +
a `--frozen`-style CI mode; global content-addressed disk cache (fetch once,
compile many); vendoring for airgapped deploys; `scopes`-based redirection;
honesty that URL loading without a lock/manifest layer is a production
anti-pattern.

---

## 4. Bun (status as of 2026)

**URL imports: still not supported, and officially not planned.** Issue
oven-sh/bun#38 ("Add support for importing URLs") was closed *not_planned* in
Aug 2024 by Jarred Sumner and remains closed (last activity Feb 2026). Bun's
docs state plainly: "Unlike Deno, Bun does not currently support URL imports."
The team's position: implement it yourself via `Bun.plugin`, and first-party
support only if a community plugin demonstrates demand. (Community pushback
notes the catch-22: the main use case — dependency-free standalone scripts —
can't be served by a plugin you must install.)

**The plugin API is capable, though.** `Bun.plugin` exposes `onResolve` /
`onLoad` (esbuild-style, shared between runtime and bundler), and plugins can
return `contents` + `loader` for any specifier, including virtual namespaces.
Runtime plugins are activated via `preload` in `bunfig.toml`, which is Bun's
analogue of `node --import`. A community HTTP-loader plugin is a ~20-line
`onResolve` (URL passthrough) + `onLoad` (fetch → contents) pair.

**Chunks / shared deps / security.** All inherited from whatever the plugin
does — no caching, integrity, or permission layer is provided for network
code. Bun's auto-install covers `npm:`-style bare specifiers, not URLs.

**What MF can borrow / implication:** an MF "native loader" package should be
structured so the Node `registerHooks` adapter and a `Bun.plugin` adapter are
thin shells over one shared core (fetch, cache, integrity, share resolution).
The esbuild-shaped `onResolve`/`onLoad` pair and Node's `resolve`/`load` hooks
are near-isomorphic, so a runtime-agnostic hook core is cheap and makes Bun a
supported target despite Bun never shipping URL imports natively.

---

## 5. Existing Node HTTPS loaders and hook architectures

**Official status of network imports in Node core.** The
`--experimental-network-imports` flag was **removed** in Node 22.6.0
(nodejs/node#53822, 2024). The stated reasons are essential reading for MF's
security posture: the feature lacked a champion, and per Joyee Cheung the
browser-like security model ("no access to other builtins for untrusted
code") "is just not going to work out in the current Node.js architecture…
The only way you could do it is to rewrite Node.js from scratch, then that's
Deno." Conclusion: **Node core will not ship https imports; userland hooks
are the sanctioned mechanism**, and MF must treat remote code as *trusted*
code whose integrity (not capability) is what we can verify.

**The official https-hooks example.** Node's `node:module` docs ship a
canonical `load`-hook HTTPS loader: if `url.startsWith('https://')`, fetch the
body and return `{ format: 'module', shortCircuit: true, source }`; otherwise
`nextLoad(url)`. The docs themselves flag the gaps MF would need to fill:
"performance is much slower than loading from disk, there is **no caching**,
and there is **no security**." Registration is via
`node --import 'data:text/javascript,…register(…)'` or a small preload file.
Note the default ESM loader accepts only `file:`, `node:`, and `data:`
schemes — but a *custom resolve hook can return any URL*, and only the load
phase validates schemes, so an MF `load` hook that short-circuits `https:`
URLs composes cleanly with default resolution for everything else.

**`register()` vs `registerHooks()` — a live migration.** As of Node 26,
`module.register()` (async, off-thread hooks) is **documentation-deprecated
(DEP0205)** in favor of `module.registerHooks()` (sync, in-thread, added via
nodejs/node#55698). The async hooks' worker-thread orchestration produced
"issues that have proven unresolvable"; `registerHooks()` additionally covers
`require()` and `createRequire()` paths, which async hooks never did.
Practical consequences for MF:
- Target `module.registerHooks()` as the primary API (Node ≥ 22.15/23.5);
  removal of `register()` is on Node's roadmap (~27.x).
- Sync hooks mean the `load` hook body can't `await` — network fetch must be
  synchronous (e.g. `child_process`/`Atomics.wait` tricks), or, far better,
  **pre-fetched**: resolve/load hooks only serve from a warm on-disk cache
  that the MF runtime populated asynchronously *before* triggering
  `import()`. MF's runtime already has an async orchestration phase
  (manifest fetch, snapshot, preload) where downloads naturally belong.
- No loader thread means shared state (share scopes, remote registry) lives
  in the same thread as the app — no `MessagePort` choreography (§2).

**Hook architectures at scale (ts-node / tsx / jiti).**
- `tsx` ships a `--import tsx` preload that registers both CJS and ESM
  transforms; it migrated to `registerHooks()` for Node ≥ 26 to kill
  deprecation warnings — evidence the migration is practical today. It also
  exposes a programmatic `register()`/unregister API with scoped namespaces
  so multiple registrations don't collide.
- `ts-node` pioneered the "loader + require-hook pair" and keeping heavy
  state (compiler instances) out of the hook path.
- `jiti` avoids loader hooks entirely: it's a userland `require`/`import`
  implementation with its own on-disk transform cache — proof that "own the
  cache directory, key by content hash" works well and survives Node API
  churn.
- Common patterns worth copying: idempotent registration guards; a
  process-wide singleton keyed on a `globalThis` symbol (survives duplicate
  package instances — MF already does this for its runtime instance); hooks
  that *only* touch specifiers they own and `nextResolve`/`nextLoad`
  everything else, so multiple hook packages chain safely.

**Community HTTP loaders** (`node-fetch`-style one-offs, `@node-loader/http`,
etc.) all converge on the same shape and the same unsolved tail: no cache
invalidation story, no integrity, no CJS-in-remote handling, broken builtin
passthrough when authors forget to delegate. These are precisely the bugs now
filed against MF's own Node path (§6), which validates fixing them at the
design level rather than patch by patch.

---

## 6. Module Federation ecosystem itself — existing bundler-free / native efforts

**Pure-runtime consumption is already documented and supported.** The
module-federation.io blog post "Module Federation on Node.js, Made Easy" and
the Runtime docs describe the no-build-plugin path: `createInstance({ name,
remotes: [{ name, entry: 'http://…/mf-manifest.json' }] })` then
`loadRemote('remote/expose')`. This works in Node today for **CJS-style
remotes**: the entry is fetched as text and evaluated (`vm.runInThisContext`
with a CJS-ish wrapper providing `exports/module/require/__dirname`), with
chunks handled by the bundler's own patched chunk-loading runtime
(`@module-federation/node`'s `runtimePlugin` + `remoteType: 'script'`,
`target: 'async-node'` on webpack/rspack). So today's Node story is option
(c) — *patched bundler chunk loaders* — with the runtime downloading files
and delegating chunk graphs to bundler-generated code.

**Native/ESM history in the org:**
- module-federation/core **#1918 "Node ESM server support"** (2023, closed
  stale): proposed `vm.SourceTextModule` + `importModuleDynamically` +
  `SyntheticModule` bridging for host imports — requires
  `--experimental-vm-modules`. ScriptedAlchemy: "this looks feasible… when we
  improve the node runtime bindings to bundler." This is the direct ancestor
  of the current effort.
- module-federation/core **#2001 "Import Maps Support"** (closed): import-map
  interop has been requested but never landed in core.
- Current open bugs against the SDK's experimental Node ESM path show where
  the naive approach leaks: **#4810** — non-OK HTTP responses are evaluated
  as JavaScript (404 HTML → `Unexpected identifier`), i.e. no status/MIME
  gate before eval; **#4815** — the `vm.SourceTextModule` linker resolves
  *every* specifier with `new URL(specifier, url)` and fetches it, so
  `node:url` inside a remote gets passed to `fetch`. A real design needs a
  resolution ladder: builtin → shared/share-scope → import-map/bare → relative
  URL → error.
- **`@module-federation/vite` SSR**: remotes emit a dedicated
  `ssrRemoteEntry` (ESM) recorded in `mf-manifest.json` `metaData`; the host
  picks it when `target: 'node'`. Server loading currently evaluates remote
  ESM through `vm.SourceTextModule`, so hosts run with
  `--experimental-vm-modules`; the docs explicitly frame the VM loader as "a
  temporary Node bridge" to be replaced by "native Node import / materialized
  server chunks later without changing host code" — i.e. the ecosystem has
  already committed to the API staying stable while the loading mechanism
  underneath migrates. Dev-mode SSR additionally routes through Vite's
  ModuleRunner (`/__mf_ssr__/`), with a fetch-ESM-to-temp-file fallback —
  "materialize to disk, then `import(fileUrl)`" is already in production use
  in this org.
- Its security guidance is also the right template: treat a Node-target
  remote as **server-executed code**, never accept tenant/request-controlled
  manifest URLs, allowlist origins.
- **Native Federation bridging** (§1) exists browser-side for consuming NF
  remotes in MF hosts and vice versa (`remoteEntry.json` ⇄ manifest
  translation was requested in module-federation-examples#4258); an
  import-map-based Node design would make that interop nearly free
  server-side.

**What MF can borrow from itself:** keep `createInstance`/`loadRemote` as the
invariant public API and treat the Node ESM mechanism as a swappable backend
(vm bridge today → loader-hook or disk-materialized native `import()`
tomorrow), exactly as @module-federation/vite promises; adopt manifest-first
(`mf-manifest.json` with an `ssrRemoteEntry`-style ESM entry field) so
bundler-built and bundler-free remotes are interchangeable; fix #4810/#4815
classes of bugs (HTTP status + content-type gates, builtin passthrough) in
the shared loading core.

---

## 7. SystemJS in Node — the historical baseline

SystemJS remains the reference for what a *userland registry-based* loader
gives you that native ESM still doesn't. Its `system-node.cjs` build was
built precisely for "System modules executed on the server, like SSR."

**What it solved that native ESM doesn't:**
1. **Eval from string.** `System.register` modules are plain function calls,
   so a fetched string can be evaluated (`new Function` / `vm.Script` /
   script tag) and registered — no `vm.SourceTextModule`, no flags, works
   identically in browser and Node, CSP-manageable. Native ESM in Node has no
   stable "instantiate module from string with live bindings" API (that's
   exactly why `--experimental-vm-modules` keeps appearing in §6).
2. **Named registration.** The `named-register` extra supports
   `System.register('name', deps, declare)` + `System.import('name')` — i.e.
   a *writable module registry* where a bundle can carry several named
   modules in one file, and a host can alias/pre-populate modules
   (`System.set(id, moduleNamespace)`). Native ESM registries are per-loader,
   immutable, and unaddressable; webpack MF's container/share-scope design is
   essentially a rebuilt named registry, and any native-ESM MF design must
   choose where that mutable registry lives (answer: in the MF runtime, with
   the platform loader delegating into it).
3. **Interop.** Automatic AMD/global/CJS format handling behind one import
   API — federation across module formats. React's CJS-only distribution is
   the perennial motivating example (Native Federation still fights this,
   §1).
4. **Hookable pipeline.** `resolve`/`instantiate`/`getRegister` hooks plus
   import maps, integrity, and depcache — the conceptual ancestor of both
   es-module-shims hooks and Node's customization hooks.

**What it costs:** a nonstandard on-disk format (System.register), a
runtime that must wrap/own all module evaluation, and drift from platform
semantics (TLA, import attributes, source phase) that must be re-implemented.
SystemJS 2.0 deliberately dropped named-register-by-default and `depCache`
because Rollup-style build-time graph analysis had won; the ecosystem verdict
is that **string-eval registries are a compatibility layer, not the future**.
MF should use its existing global registry the same way — as the federation
brain — while letting the platform's native loader execute code whenever
possible.

---

## Lessons for MF Node

Concrete takeaways for `@module-federation/node`'s bundler-free design:

1. **Separate "resolution brain" from "loading mechanism."** Every successful
   system keeps a stable public API (`loadRemoteModule`, `createInstance` +
   `loadRemote`) and swaps the loader underneath (NF: node-loader fork →
   orchestrator hook; MF vite: vm bridge → "native import later, no host code
   change"). Design the Node package as: MF runtime resolves *what* URL/module
   wins; a thin pluggable backend answers *how* a URL becomes a namespace
   (loader-hook passthrough, disk-materialize + `import()`, or vm bridge).

2. **Target `module.registerHooks()` (sync, in-thread), not
   `module.register()`.** `register()` is DEP0205-deprecated and slated for
   removal; sync hooks also cover `require()` and eliminate the
   MessagePort/loader-thread state problem that made dynamic import-map
   updates awkward (§2). Design constraint: sync hooks can't await ⇒
   **pre-fetch remotes during MF's async init/preload phase into an on-disk
   cache; hooks only serve cache hits.** This also fixes the "no caching, much
   slower than disk" caveat in Node's own https-hooks example.

3. **Prefer hook-passthrough of real URLs over a global pre-resolved import
   map, but implement import-map *semantics* (especially `scopes`) inside the
   hook.** A static map frozen at startup can't express late remote
   registration (federation's core feature) — es-module-shims exists browser-
   side precisely to mutate maps late. Owning a resolve hook gives mutable,
   scoped resolution: bare specifier → share-scope winner; `./chunk-X.mjs`
   relative to remote base → remote URL; everything else → `nextResolve`.
   Per-remote scopes are how version skew is handled (NF's scoped losers +
   `@nf-internal/chunk-*` trick).

4. **Resolution ladder must special-case builtins and non-remote schemes
   first.** `node:*`/builtins → `nextResolve`, *never* fetched (MF core #4815
   is exactly this bug); `file:`/`data:` → default loader; only URLs under a
   registered remote's base (or explicitly mapped) get the MF path. Fail loud
   on anything else rather than `new URL(specifier, base)`-and-fetch.

5. **Gate every network response before evaluation.** HTTP status check,
   content-type sanity, and size limits before source ever reaches the module
   system (MF core #4810). Errors should carry URL + status + which remote —
   MF vite's `MFV-004`-style coded errors with debug snapshots
   (`lastLoadError` with entry/target/manifest context) are the model.

6. **Ship a lockfile + integrity story, Deno-style.** Per-remote-artifact
   integrity hashes (SRI in the manifest, like NF's orchestrator; sha512 in a
   lockfile like `deno.lock`), a `--frozen` CI mode that fails on any hash or
   version drift, and a vendoring command that materializes remotes to disk
   for airgapped deploys. Deno's own retreat from raw URL imports is the
   proof: URL loading without a lock layer is a production anti-pattern.

7. **Content-addressed disk cache, with different dev/prod policies.** Prod:
   fetch-once keyed by URL + hash, immutable, shared across processes (Deno's
   global cache; jiti's transform cache). Dev: revalidate per manifest TTL /
   ETag, or SSE-driven invalidation like NF's dev server. Materializing to
   `file:` URLs also buys native `import()` compatibility, real stack traces,
   `import.meta.url`-relative asset loading, and debugger support for free —
   the fetch-to-temp-file fallback in @module-federation/vite already
   validates this.

8. **Be honest about the security model: integrity + allowlist, not
   sandboxing.** Node removed `--experimental-network-imports` because a
   browser-grade capability model "is not realistic on top of the existing
   code… that's Deno." A Node-target remote is server-executed trusted code:
   verify *what* runs (hashes, origin allowlists, no request-controlled
   manifest URLs), don't pretend to constrain what it can do. Document this
   loudly, as @module-federation/vite does.

9. **The share registry stays in MF, in-process, keyed on `globalThis`.**
   SystemJS's named registry and NF's `hostInstances` bridge both show
   federation needs a mutable module/share registry that the platform loader
   consults. Host shared modules (e.g. the host's `react`) can be registered
   by namespace reference — no re-fetch, no duplicate instance — with the
   resolve hook mapping a remote's bare `react` import to the winning
   registration (data:/virtual specifier or pre-materialized file that
   re-exports the host namespace).

10. **Manifest-first, ESM-entry-aware, cross-runtime by construction.** Add an
    ESM server entry field to the manifest (as vite's `metaData.ssrRemoteEntry`
    does) so bundler-built and bundler-free remotes are interchangeable and NF
    interop is cheap. Keep the loader core runtime-agnostic (fetch/cache/
    integrity/share resolution shared), with thin adapters: Node
    `registerHooks`, Bun `Bun.plugin` (`onResolve`/`onLoad` — Bun will never
    ship URL imports natively), and Deno (where plain `import(url)` plus the
    resolve layer suffices).

---

## Sources

- Native Federation docs: architecture, mental model, orchestrator, Angular adapter SSR
  (native-federation.com); "SSR and Hydration with Native Federation" (angulararchitects.io);
  "Micro Frontends with Angular and Native Federation" (Angular blog, 2025).
- `@node-loader/import-maps` README (v2.0.0, 2025); `@jspm/node-importmap-loader` README;
  jspm.org/docs/integrations; es-module-shims README (v2.x).
- Deno docs: Node/npm compatibility, dependency management, `deno.lock` tutorial (2026).
- Bun docs: runtime plugins, auto-install; oven-sh/bun#38 (closed not_planned).
- Node.js docs v26.x: `node:module` customization hooks, https-hooks example, DEP0205;
  nodejs/node#55698 (registerHooks), #62395 (deprecate register), #53822 (drop
  --experimental-network-imports).
- module-federation.io: Runtime access/API docs, "Module Federation on Node.js, Made Easy";
  module-federation/core #1918, #2001, #4810, #4815; module-federation/vite #798 and the
  vite plugin's SSR/production-runtime docs.
- SystemJS README/api docs (system-node.cjs, named-register, registry API); "SystemJS 2.0.0
  Release" (guybedford.com); systemjs/systemjs#2053 (eval-from-string discussion).
