# ESM Chunk Loading Options for Node Federation

Research/analysis document. Evaluates replacing the current `async-node` + `readFileVm`
runtime patch with ESM output (`output.module: true`, `chunkLoading: 'import'`,
`remoteType: 'import'`), enumerates every relevant bundler option, and analyzes whether
the module-format chunk loader is patchable the way `readFileVm` is today.

All file/line citations refer to this repository (branch `feat/node-native-http-loader`)
and to `webpack@5.104.1` / `@rspack/core` as resolved in the main repo's `node_modules`.

Related: `packages/node/docs/native-http-loader-design.md` (the `module.register()`-based
http(s) ESM loader this document refers to as "the native loader hooks").

---

## 1. How the current patch works (status quo)

### 1.1 Build-time: what the bundler is forced to emit

Two build-time paths exist in `@module-federation/node`:

**Path A — `StreamingTargetPlugin` (own chunk-loading runtime module).**
`src/plugins/StreamingTargetPlugin.ts` hard-locks the output format:

- `output.chunkFormat = 'commonjs'` (line 44)
- `output.chunkLoading = 'async-node'` (line 51)
- `output.enabledChunkLoadingTypes = []` (line 57) — deliberately emptied so webpack's own
  `ReadFileChunkLoadingRuntimeModule` is *not* also registered ("ensures theres no other
  readFileVm added to webpack runtime", comment at lines 53–56)
- `output.environment.dynamicImport = true` (lines 58–61)

It then applies `CommonJsChunkLoadingPlugin` (`src/plugins/CommonJsChunkLoadingPlugin.ts`),
which taps `compilation.hooks.runtimeRequirementInTree` for
`RuntimeGlobals.ensureChunkHandlers`, HMR handlers, `baseURI`, `externalInstallChunk` and
`onChunksLoaded` (lines 68–96) and adds
`DynamicFilesystemChunkLoadingRuntimeModule` — a runtime module registered at
`RuntimeModule.STAGE_ATTACH + 1` (`DynamicFilesystemChunkLoadingRuntimeModule.ts` line 74),
i.e. *after* webpack's own chunk-loading runtime modules, so it wins.

The generated runtime code (`src/plugins/webpackChunkUtilities.ts`) installs a handler under
the **same key** webpack's async-node loader uses:

```135:135:packages/node/src/plugins/webpackChunkUtilities.ts
    `${fn}.readFileVm = function(chunkId, promises) {`,
```

(`fn` is `RuntimeGlobals.ensureChunkHandlers` = `__webpack_require__.f`;
`webpack/lib/RuntimeGlobals.js` line 117. Webpack's stock async-node module uses the
identical key: `webpack/lib/node/ReadFileChunkLoadingRuntimeModule.js` line 156.)

The generated handler decides per chunk: if `fs.existsSync(__dirname + rootOutputDir +
chunkFilename)` → strategy `filesystem`, else `http-vm` (node) / `http-eval` (browser-ish)
(lines 160–190). The three strategies are stringified straight into the bundle from
`src/filesystem/stratagies.ts` (`DynamicFilesystemChunkLoadingRuntimeModule.ts` lines 158–176):

- `fileSystemRunInContextStrategy` (lines 2–39): `fs.readFile` then
  `vm.runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\n})')(chunk, require, ...)` —
  the chunk is a CommonJS-format file whose body assigns onto `exports` (i.e.
  `chunkFormat: 'commonjs'` emits `exports.id = ...; exports.modules = {...}; exports.runtime = ...`).
- `httpEvalStrategy` (lines 42–80): `fetch(url).then(res => res.text())` then `eval` of the same wrapper.
- `httpVmStrategy` (lines 99–165): `http/https.get`, buffer the body, then
  `vm.runInThisContext(...)` (lines 151–154).

Chunk URL resolution in the strategies: `new URL(chunkName, __webpack_require__.p)`
(lines 50, 113). If `__webpack_require__.p` is not a valid absolute base, it falls back to
scanning `globalThis.__FEDERATION__.__INSTANCES__[*].moduleCache` for the remote's
`remoteInfo.entry` URL and rewriting its basename (lines 59–65, 123–139) — i.e. **chunks are
assumed to be siblings of the remote entry file**.

**Path B — `runtimePlugin.ts` (federation runtime plugin, used by the enhanced/rspack flow).**
`NodeFederationPlugin` prepends `@module-federation/node/runtimePlugin` to
`options.runtimePlugins` (`src/plugins/NodeFederationPlugin.ts` lines 86–98; ESM/CJS variant
chosen at lines 35–41). Nothing about the compiler's chunk format is changed here — the
default enhanced `ModuleFederationPlugin` build for `target: 'async-node'` emits webpack's
stock `readFileVm` handler, and the runtime plugin **replaces it in place**:

```473:489:packages/node/src/runtimePlugin.ts
export const setupWebpackRequirePatching = (
  handle: (chunkId: string, promises: any[]) => void,
): void => {
  if (__webpack_require__.f) {
    if (__webpack_require__.f.require) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        'CAUTION: build target is not set to "async-node", attempting to patch additional chunk handlers. This may not work',
      );
      __webpack_require__.f.require = handle;
    }

    if (__webpack_require__.f.readFileVm) {
      __webpack_require__.f.readFileVm = handle;
    }
  }
};
```

This runs in the plugin's `beforeInit` hook (lines 491–513), i.e. during
`ModuleFederation` instance construction, which the enhanced build triggers from the
prepended federation-runtime entry module (`packages/enhanced/src/lib/container/runtime/FederationRuntimePlugin.ts`,
`prependEntry` lines 315–354 via `compilation.addInclude`, `injectRuntime` lines 356–409) —
**before any user code can trigger `__webpack_require__.e()`**, but *after* webpack's runtime
modules have executed and defined `__webpack_require__.f.readFileVm`. That ordering is what
makes in-place replacement possible.

Why replacement works mechanically: webpack's `__webpack_require__.e` re-enumerates the
handler object **on every call**:

```39:52:node_modules/webpack/lib/runtime/EnsureChunkRuntimeModule.js
		`${RuntimeGlobals.ensureChunk} = ${runtimeTemplate.basicFunction(
			`chunkId${withFetchPriority ? ", fetchPriority" : ""}`,
			[
				`return Promise.all(Object.keys(${handlers}).reduce(${runtimeTemplate.basicFunction(
					"promises, key",
					[
						`${handlers}[key](chunkId, promises${
							withFetchPriority ? ", fetchPriority" : ""
						});`,
						"return promises;"
					]
				)}, []));`
			]
		)};`
```

(path is `webpack/lib/runtime/EnsureChunkRuntimeModule.js` in node_modules)

So `__webpack_require__.f` is a plain object and late reassignment of any key is honored.
This property holds identically for the module (`'import'`) chunk-loading runtime — see §3.

### 1.2 Runtime: the replacement handler

`setupChunkHandler` (`src/runtimePlugin.ts` lines 403–470) maintains its **own**
`installedChunks` map (created fresh in `beforeInit`, line 498 — it does *not* share webpack's
closure-scoped map) and per chunk:

1. Optional gate via `__webpack_require__.federation.chunkMatcher` (lines 413–415).
2. Filesystem first: `resolveFile(rootOutputDir, chunkId)` =
   `path.join(__dirname, rootOutputDir + __webpack_require__.u(chunkId))` (lines 147–150);
   if it exists → `loadFromFs` (lines 181–225): `fs.readFile` + `new vm.Script('(function(exports, require, __dirname, __filename) {...})', { filename, importModuleDynamically: vm.constants?.USE_MAIN_CONTEXT_DEFAULT_LOADER ?? importNodeModule })`
   then `script.runInThisContext()(chunk, __non_webpack_require__, ...)` (lines 194–208).
3. Otherwise http: `resolveUrl(remoteName, chunkName)` (lines 281–331) builds
   `new URL(chunkName, __webpack_require__.p)`; on failure falls back to the remote-entry URL
   taken from `__FEDERATION__.__INSTANCES__[*].moduleCache.get(remoteName).remoteInfo.entry`
   (via `returnFromCache`/`returnFromGlobalInstances`, lines 153–178) plus
   `__webpack_require__.federation.rootOutputDir` (lines 301–330). `__webpack_require__.p`
   itself is redefined lazily by `RemotePublicPathRuntimeModule`
   (`src/plugins/RemotePublicPathRuntimeModule.ts` lines 90–158) as a **getter** that derives
   the base from `import.meta.url` / `__filename` / the federation instance's own remote-entry
   URL (`getPathFromFederation`, lines 56–89) — so for a fetched remote, `p` typically resolves
   to the http directory of its remoteEntry.
4. `fetchAndRun` (lines 228–278): global `fetch` (or `node-fetch` fallback), first offering the
   request to the federation `loaderHook.lifecycle.fetch` hook (lines 241–248) — this is the
   offline-cache/auth extension point — then
   `eval('(function(exports, require, __dirname, __filename) {' + data + '\n})')(chunk, __non_webpack_require__, ...)` (line 256).
5. `installChunk` (lines 353–365): copy `chunk.modules` into `__webpack_require__.m`, run
   `chunk.runtime(__webpack_require__)`, resolve pending promises, mark ids `0`.

Remote **entries** (not chunks) are handled separately: `setupScriptLoader` (lines 377–400)
overwrites `__webpack_require__.l` to call
`__webpack_require__.federation.runtime.loadScriptNode(url, { attrs: { globalName } })` and
then `initRawContainer`. `loadScriptNode`/`createScriptNode`
(`packages/sdk/src/node.ts` lines 58–255) fetches the entry and evaluates it with
`new vm.Script('(function(exports, module, require, __dirname, __filename) {...})')`
(lines 114–146) — i.e. remote entries are also assumed to be **CommonJS scripts**
(`library.type: 'commonjs-module'`, cf. `StreamingTargetPlugin.ts` lines 45–49). Notably the
SDK *already* contains an ESM branch: when the remote's type is `esm`/`module` it uses
`vm.SourceTextModule` via `loadModule` (lines 175–191, 259–293) — which requires
`--experimental-vm-modules` and only resolves *URL-shaped* import specifiers
(`new URL(specifier, url)`, lines 277–289); bare specifiers and `node:` builtins are not handled.

Entry-chunk bookkeeping for hot-reload: `EntryChunkTrackerPlugin`
(`src/plugins/EntryChunkTrackerPlugin.ts` lines 51–89) taps
`JavascriptModulesPlugin.getCompilationHooks(compilation).renderStartup` and prepends code
recording `module.filename` (and `module.children`) into `globalThis.entryChunkCache`.
`UniverseEntryChunkTrackerPlugin` (`src/plugins/UniverseEntryChunkTrackerPlugin.ts` lines 5–23)
achieves the same by injecting a `data:text/javascript;base64,...` extra entry via
`EntryPlugin`. Both assume a CJS `module` object exists (`typeof module !== 'undefined'`) —
**neither works as-is in ESM output**, where there is no `module` and entry files are `.mjs`.

### 1.3 Assumptions that tie the patch to CJS/async-node

1. Chunk files are CommonJS scripts: every evaluation path wraps the file body in
   `(function(exports, require, __dirname, __filename) { ... })` and reads
   `exports.{ids,modules,runtime}`. A `chunkFormat: 'module'` chunk (`export const ...`) is a
   syntax error inside that wrapper.
2. `eval` / `vm.runInThisContext` / `vm.Script` accept **Script** goal syntax only —
   `import`/`export` cannot be evaluated this way at all.
3. The handler key is `readFileVm` (or `require`); module format registers `f.j` instead.
4. `__non_webpack_require__`/`require`, `__dirname`, `module.filename` are used throughout
   (chunk wrapper args; entry tracker plugins) — all absent or different in ESM output.
5. Remote entries are `commonjs-module` libraries evaluated by `createScriptNode`'s
   `vm.Script` path, keyed by a global name.

### 1.4 How remote entries are wired at build time (enhanced)

`ModuleFederationPlugin` defaults `remoteType` to the library type if it is a valid externals
type, else `'script'` (`packages/enhanced/src/lib/container/ModuleFederationPlugin.ts`
lines 190–197). `ContainerReferencePlugin` maps every remote to an external
`webpack/container/reference/<name>` with that externals type
(`packages/enhanced/src/lib/container/ContainerReferencePlugin.ts` lines 63–78) and adds
`RemoteRuntimeModule`, which registers `__webpack_require__.f.remotes`
(`packages/enhanced/src/lib/container/RemoteRuntimeModule.ts` lines 151–176) delegating to
`__FEDERATION__` bundler runtime `remotes()`.

The critical fork is in `packages/webpack-bundler-runtime/src/remotes.ts` lines 136–145:

- `externalType` ∈ `FEDERATION_SUPPORTED_TYPES` (= `['script']`,
  `packages/webpack-bundler-runtime/src/constant.ts` line 1) → the **federation runtime**
  loads the entry (`instance.loadRemote` → `getRemoteEntry` → `loadEntryNode` →
  `loadScriptNode`, `packages/runtime-core/src/utils/load.ts` lines 222–276, 283–334).
- Any other `externalType` (including `'import'`) → `webpackRequire(externalModuleId)` —
  i.e. **webpack's own `ExternalModule` codegen loads the container**, and the federation
  runtime only does share-scope `init`/`get` on the result.

So with `remoteType: 'import'`, the container entry is fetched by whatever `import()` means
in the host — which is exactly where the native http loader hooks plug in.

---

## 2. Bundler options matrix

### 2.1 `output.chunkFormat`

| Value | Emitted chunk shape | Node relevance |
|---|---|---|
| `'commonjs'` | `exports.id/ids/modules/runtime = ...` (script goal) | Status quo; evaluable via `vm.Script`/`eval` wrapper |
| `'module'` | `export const __webpack_esm_id/__webpack_esm_ids/__webpack_esm_modules__/__webpack_esm_runtime__` (webpack 5.104: `webpack/lib/esm/ModuleChunkFormatPlugin.js` lines 181–195; names from `webpack/lib/RuntimeGlobals.js` lines 138–148) | Only evaluable as an ES module (native `import()`, `vm.SourceTextModule`, or `data:` import) |
| `'array-push'` | `chunkLoadingGlobal.push([...])` | Browser/jsonp; irrelevant for Node (`chunkLoadingGlobal` matters only here) |

Defaults (`webpack/lib/config/defaults.js` lines 1435–1467): `output.module: true` +
dynamic-import support → `'module'`; node builtins without `output.module` → `'commonjs'`.

Entry chunks in module format additionally get
`import { __webpack_require__ } from './runtime.mjs'`-style **static relative imports** of the
runtime chunk plus `__webpack_require__.C(namespace)` install calls
(`ModuleChunkFormatPlugin.js` lines 78–82, 119–145, 199–262).

### 2.2 `output.chunkLoading`

Defaults per format (`webpack/lib/config/defaults.js` lines 1474–1501): `commonjs` →
`'require'` (if sync `require` available) else `'async-node'`; `module` → `'import'`.

| Value | Runtime module | Handler key | Load mechanism |
|---|---|---|---|
| `'require'` | `RequireChunkLoadingRuntimeModule` | `__webpack_require__.f.require` | synchronous `require('./chunk.js')` |
| `'async-node'` | `ReadFileChunkLoadingRuntimeModule` | `__webpack_require__.f.readFileVm` (`webpack/lib/node/ReadFileChunkLoadingRuntimeModule.js` line 156) | `fs.readFile` + `vm.runInThisContext` |
| `'import'` | `ModuleChunkLoadingRuntimeModule` (`webpack/lib/esm/`) | `__webpack_require__.f.j` (line 203) | `import()` — see below |
| MF node override | `DynamicFilesystemChunkLoadingRuntimeModule` | `__webpack_require__.f.readFileVm` (same key, replaces stock) | fs / http+vm / http+eval (§1.1) |

**What `'import'` chunk loading generates** (confirmed from
`webpack/lib/esm/ModuleChunkLoadingRuntimeModule.js`):

```224:230:node_modules/webpack/lib/esm/ModuleChunkLoadingRuntimeModule.js
													`var promise = ${importFunctionName}(${
														compilation.outputOptions.publicPath === "auto"
															? JSON.stringify(rootOutputDir)
															: RuntimeGlobals.publicPath
													} + ${
														RuntimeGlobals.getChunkScriptFilename
													}(chunkId)).then(installChunk, ${runtimeTemplate.basicFunction(
```

Two consequential details:

- **`publicPath: 'auto'` → a *relative* specifier** (e.g. `import("./" + "chunk.mjs")`),
  resolved against the *importing module's own URL*. If the runtime module itself was loaded
  from `http://host/remoteEntry.mjs` (via loader hooks), relative chunk imports resolve to
  `http://host/chunk.mjs` automatically. No publicPath configuration needed.
- **Explicit `publicPath` → `__webpack_require__.p + filename`**. `p` can be any string,
  including `http(s)://...` — webpack adds the `publicPath` runtime requirement only when it
  is not `'auto'` (`webpack/lib/esm/ModuleChunkLoadingPlugin.js` lines 103–105). So yes:
  with an http publicPath and an http-capable ESM loader registered, chunks load over http
  **natively, with zero MF runtime involvement**.

`installChunk` consumes the imported namespace's named exports
(`__webpack_esm_ids__`/`__webpack_esm_modules__`/`__webpack_esm_runtime__`, lines 166–199) and —
important for patchability — is exported as `__webpack_require__.C`
(`RuntimeGlobals.externalInstallChunk`, `RuntimeGlobals.js` line 159) whenever
`externalInstallChunk` is required (lines 343–347); `ModuleChunkLoadingPlugin` requires it
whenever the chunk has entry-dependent chunks (`ModuleChunkLoadingPlugin.js` lines 130–137)
and `ModuleChunkFormatPlugin` requires it for all non-runtime entry chunks
(`ModuleChunkFormatPlugin.js` lines 102–111).

There is **no `__webpack_require__.l`** in module chunk loading (script loading is `import()`
itself; `RuntimeGlobals.loadScript` is only pulled in for HMR, `ModuleChunkLoadingPlugin.js`
lines 110–120, and even then implemented as `import(/* webpackIgnore: true */ url)`,
`ModuleChunkLoadingRuntimeModule.js` lines 390–396).

### 2.3 `library.type` / `externalsType` / MF `remoteType`

From `webpack/lib/ExternalModule.js`:

| Type | Generated consumer code | ESM-output behavior | Node notes |
|---|---|---|---|
| `'commonjs'`/`'commonjs2'`/`'commonjs-module'`/`'commonjs-static'` | `require(request)` (lines 893–897) | still `require` — broken in pure ESM unless shimmed | status-quo remote-entry library type (`StreamingTargetPlugin.ts` lines 45–49) |
| `'node-commonjs'` | in ESM output: `createRequire(import.meta.url)`-based require (lines 156–178, 898–901) | works for on-disk deps; **fails when `import.meta.url` is `data:` or `http:`** (createRequire needs `file:`) | |
| `'import'` | `import(request)` — a plain dynamic import of the request string, marked async, namespace exports (lines 186–232 `getSourceForImportExternal`, 772–783) | identical | **remote entry = literal `import("http://.../remoteEntry.mjs")`** when the external request is a URL |
| `'module'` | ESM output: hoisted **static** `import * as X from request` via `ModuleExternalInitFragment` (lines 250+, 924–954); non-ESM output: falls back to `import()` (lines 935–939) | static imports appear at top of the chunk file containing the external | static form defeats lazy loading of remotes; `'import'` is the right choice for MF |
| `'module-import'` | resolves to `'module'` or `'import'` per dependency kind (lines 834–859) | | |
| `'script'` | `__webpack_require__.l(url, ..., globalName)` script loading | n/a in module chunk output for Node (no DOM); MF node overrides `.l` (§1.2) | current default `remoteType` (`ModuleFederationPlugin.ts` lines 190–195) |

MF specifics: `remoteType` flows verbatim into `ExternalsPlugin(remoteType, remoteExternals)`
(`ContainerReferencePlugin.ts` line 78). Only `'script'` goes through the federation
runtime's own entry loader; **everything else, including `'import'`, is loaded by webpack's
external-module codegen** (`remotes.ts` lines 136–145, `FEDERATION_SUPPORTED_TYPES = ['script']`).
This means with `remoteType: 'import'` the federation runtime keeps doing share-scope
`init`/`get` (`onExternal`/`onInitialized`/`onFactory`, `remotes.ts` lines 74–102) but never
touches the network — full shared-scope compatibility is retained as long as the imported
namespace exposes container `init`/`get` (which a `library.type: 'module'` container does).

Also relevant: enhanced already supports ESM startup — `MfStartupChunkDependenciesPlugin`
picks `generateESMEntryStartup` when `runtimeTemplate.outputOptions.module` is set
(`packages/enhanced/src/lib/startup/MfStartupChunkDependenciesPlugin.ts` lines 121–123), so
`experiments.asyncStartup` is not CJS-only.

### 2.4 Rspack support

From `@rspack/core` (JS dist) and the native bindings in the main repo's pnpm store:

- `chunkLoading` schema and `EnableChunkLoadingPlugin` accept
  `'jsonp' | 'import-scripts' | 'require' | 'async-node' | 'import'`
  (`@rspack/core/dist/index.js`, zod enum ~line 11859 and the plugin switch ~line 4580).
- Defaults mirror webpack: `chunkFormat 'module'` → `chunkLoading 'import'`
  (dist ~line 6679–6690); `output.module` via `experiments.outputModule` (~line 6469).
- Rspack ships `readFileVm` parity (`ReadFileChunkLoadingRuntimeModule` template strings are
  visible in the 1.x native binding, including `ON_CHUNKS_LOADED.readFileVm = ...`).
- **Module chunk format export names differ by major version** (from `strings` on the
  bindings): rspack 1.x emits `export const __webpack_ids__ / __webpack_modules__ /
  __webpack_runtime__`; rspack 2.x emits `__rspack_esm_id / __rspack_esm_ids /
  __rspack_esm_runtime` (+ modules). Both differ from webpack 5.104's
  `__webpack_esm_*` names. Any patch that reimplements install by reading namespace exports
  is therefore **bundler- and version-specific**; delegating to the runtime's own
  `installChunk` (via `__webpack_require__.C`) avoids this entirely.
- Rspack 1.x binding contains "HMR is not implemented for module chunk format yet" — expect
  gaps around HMR/module-format compared to webpack.
- Rspack's module chunk loading template imports
  `importFunctionName("<output_dir>" + getChunkScriptFilename(chunkId))` (visible in binding
  strings) — i.e. relative-specifier style like webpack's `publicPath: 'auto'` branch; verify
  the explicit-publicPath branch against the rspack version actually used before relying on
  http publicPath there.

### 2.5 Node.js platform facts (constrain everything below)

- `import()` of `http(s):` URLs does **not** work in stock Node. The old
  `--experimental-network-imports` flag never stabilized and was removed in Node 22. The only
  supported path is module customization hooks: `module.register()` (async, off-thread;
  Node ≥ 18.19 / ≥ 20.6) or `module.registerHooks()` (sync, in-thread; Node ≥ 22.15 / ≥ 23.5).
  **Approach (b) is therefore not "zero-setup"; it is "hooks-registered" by definition.**
- `import('data:text/javascript,...')` works unflagged, but a `data:` module can only import
  absolute-URL specifiers (`node:`, `data:`, `file:`); relative and bare specifiers throw, and
  `createRequire(import.meta.url)` fails (no `file:` base).
- `vm.SourceTextModule` requires `--experimental-vm-modules` (still true through Node 24).
- `vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER` (used at `runtimePlugin.ts` lines 198–201)
  needs Node ≥ 20.12 / ≥ 21.7.

---

## 3. Patchability analysis: `'import'` chunk loading

**Is `__webpack_require__.f` runtime-extensible in module chunk format?** Yes. The `f` object
and the reduce-over-`Object.keys(f)` dispatch in `__webpack_require__.e` are format-independent
(`EnsureChunkRuntimeModule.js` lines 39–52, cited in §1.1). `f.j` is a plain property assigned
by the runtime module (`ModuleChunkLoadingRuntimeModule.js` line 203) and can be reassigned.

**Does the federation runtime plugin run early enough?** Yes, same as today: the federation
runtime entry is `addInclude`d ahead of user entries (`FederationRuntimePlugin.prependEntry`,
lines 315–354) and runtime modules (which define `f.j`) execute during runtime-chunk
bootstrap, strictly before entry-module execution. `beforeInit` therefore sees `f.j` already
defined and no chunk load in flight — identical ordering to the `readFileVm` swap. One check
worth keeping: in module format the runtime chunk may be a *separate file* statically imported
by the entry (`ModuleChunkFormatPlugin.js` lines 78–82); that still executes before the
entry body, so ordering holds.

**Can we override `__webpack_require__.l` / entry loading for module remotes?** `.l` does not
exist in module chunk loading (§2.2) and is not needed: with `remoteType: 'import'` the entry
is an `ExternalModule` `import(url)` (§2.3), and with `remoteType: 'script'` the existing
`setupScriptLoader` path still applies. For manifest-driven remotes of type `esm`/`module`,
the runtime's Node path currently uses `vm.SourceTextModule`
(`sdk/src/node.ts` lines 175–191, 259–293); with native hooks registered, a runtime plugin
`loadEntry` hook (`runtime-core/src/utils/load.ts` lines 305–314) can short-circuit to plain
`import(entry)` instead — no core change strictly required, but recommended.

**Is patching even necessary when loader hooks are registered?** No — that is the headline
result. With hooks registered:

- remote entry: `import("http://.../remoteEntry.mjs")` (external codegen) → hooks fetch it;
- remote chunks: the *remote's own* runtime executes with
  `import.meta.url = http://.../remoteEntry.mjs`; its `f.j` does
  `import(relativeOrHttpSpecifier)` which resolves against that URL (`publicPath: 'auto'`
  branch) or uses an http `__webpack_require__.p` — hooks fetch those too.

Patching `f.j` is needed only for the fallback situations:

1. **No hooks registered** (host didn't opt in, or Node < 18.19): need fetch + evaluate.
2. **Non-http sources / custom filesystems** the hooks don't cover.
3. **Offline cache / headers / auth / retries**: today expressed through
   `loaderHook.lifecycle.fetch` (`runtimePlugin.ts` lines 241–248); a native-hook path must
   route through the same lifecycle to keep parity (Agent A's design doc covers this on the
   hook side).
4. **Interop period**: an ESM host consuming legacy CJS (`readFileVm`) remotes, or vice versa.

**Mechanics of an `f.j` patch (the readFileVm-equivalent).** Two viable designs:

- *Wrap* (recommended): keep the original `f.j` and only intervene on failure or on matcher
  hit. Because the original handler owns the closure `installedChunks`, wrapping avoids state
  duplication. The wrapper needs a way to install a manually-fetched chunk into the *original*
  closure state — that is exactly `__webpack_require__.C` (`externalInstallChunk = installChunk`,
  `ModuleChunkLoadingRuntimeModule.js` lines 343–347). If a given build doesn't require
  `externalInstallChunk`, MF's build plugins can force the runtime requirement (one-line
  `runtimeRequirementInTree` tap, same pattern as `ContainerReferencePlugin.ts` lines 133–142).
- *Replace* (what readFileVm does today): own `installedChunks` map + own install. Works, but
  in module format the install must know the namespace export names, which differ across
  webpack 5.104 (`__webpack_esm_*`), older webpack (`ids`/`modules`/`runtime`), rspack 1.x
  (`__webpack_ids__`/...), rspack 2.x (`__rspack_esm_*`) — see §2.4. Avoid.

**How would the patch evaluate fetched ESM text without loader hooks?** Honestly assessed:

- `vm.SourceTextModule`: correct semantics, per-module `identifier` (good stacks), an
  `importModuleDynamically`/`link` story for nested imports — but hard-requires
  `--experimental-vm-modules`, and the existing SDK `loadModule` (lines 259–293) resolves
  only URL-shaped specifiers. Webpack module chunks are *usually* import-free (non-entry
  chunks export only, `ModuleChunkFormatPlugin.js` lines 176–195), but chunks referencing
  `'module'`-type externals contain hoisted static imports (§2.3) and `node-commonjs`
  externals contain `createRequire(import.meta.url)` — the linker must special-case `node:`
  builtins and bare specifiers, and `createRequire` breaks under a synthetic identifier that
  is not `file:`. Feasible, flag-gated, moderately sharp edges.
- `data:` URL import: `import('data:text/javascript;base64,' + b64(chunkText))` — unflagged,
  but: relative/bare imports inside the chunk throw (breaks any chunk with `'module'`
  externals or entry-dependent runtime imports), `createRequire(import.meta.url)` throws,
  `import.meta.url` lies (breaks `RemotePublicPathRuntimeModule`-style auto publicPath inside
  that module), source maps/filenames are lost unless a `sourceURL`/inline map is appended,
  and every chunk body is duplicated in memory as a base64 string. Acceptable as a
  *last-ditch* fallback for plain async chunks; not a foundation.
- `eval`/`vm.runInThisContext`/`vm.Script`: **impossible** — Script-goal parsers reject
  `import`/`export` syntax outright. There is no CJS-style cheap path for module chunks.

---

## 4. Options comparison

| | (a) Status quo: async-node + readFileVm patch | (b) ESM + `remoteType: 'import'` + native http loader hooks | (c) ESM + patched `f.j` (fetch + SourceTextModule / data:) | (d) Hybrid: (b) with (c) as fallback |
|---|---|---|---|---|
| Node version | any ≥ 16-ish (vm/fetch paths; `node-fetch` fallback at `runtimePlugin.ts` 234–239) | ≥ 18.19 / ≥ 20.6 (`module.register`); ≥ 22.15 for sync `registerHooks` | any for `data:` subset; SourceTextModule path needs the flag | as (b); fallback degrades per (c) |
| CLI flags | none | none (hooks registered programmatically) or `--import` preload | `--experimental-vm-modules` for the SourceTextModule path | none on happy path |
| webpack support | full (this package's plugins) | full: `output.module` + `chunkFormat/chunkLoading` defaults, `'import'` externals all stock (§2.2–2.3) | `f.j` swap proven pattern; install via `__webpack_require__.C` | same |
| rspack support | full (readFileVm parity, §2.4) | `'import'` chunkLoading + `outputModule` supported; MF-on-rspack ESM output is the least-proven square (verify per version) | export-name divergence makes replace-style patch fragile; wrap+`.C` OK | same |
| Source maps / debugging | poor–medium: `eval` path has no filename; `vm` paths get filename but no map wiring | **best**: modules keep their http URLs as identity; stacks, `--inspect`, and maps behave like real modules | medium (SourceTextModule identifier) to poor (`data:`) | best normally; degraded under fallback |
| Shared scope / `@module-federation/runtime` | full | full — `remotes.ts` still runs `init`/`get`; only transport changes (§2.3) | full (same reason) | full |
| Patch surface owned by MF | large: chunk loader + `.l` + publicPath + entry trackers | **small**: loader hooks package + a `loadEntry` runtime-plugin override; no `f.*` patch on happy path | large: everything in (a) re-solved for ESM, minus loader-hook registration | medium |
| Key risks | vm/eval CSP-ish concerns, no real module identity, CJS-only future | requires host opt-in to hooks; hooks are process-global; multi-team hosts may object | flagged Node for the honest path; externals/`createRequire` break under synthetic identity (§3) | complexity of two paths; but each is independently simple |
| Migration cost for users | zero (today) | rebuild remotes as ESM (`output.module`, `library.type: 'module'`, `remoteType: 'import'`); host registers hooks; entry trackers/hot-reload need ESM rework (§1.2) | same rebuild, plus flag management | same as (b) |

---

## 5. Recommendation

**Adopt (d): approach (b) as the primary architecture, with a thin `f.j`/`loadEntry` fallback
patch (approach (c), wrap-style, `data:`-first) shipped in the same runtime plugin.**

Rationale:

1. (b) deletes the most fragile parts of this package — no more eval of fetched text, no more
   `readFileVm` swap, no publicPath getter tricks on the happy path — and gives real module
   identity (debugging, maps, `import.meta.url` correctness) for free. Everything MF-specific
   (share scopes, `init`/`get`, manifests) is untouched because with `remoteType: 'import'`
   the federation runtime already treats transport as webpack's job (§2.3).
2. (b) alone is not sufficient as a *product*: hooks are opt-in and process-global, Node
   < 20.6 exists, and the current plugin's value has always been "it just works". A fallback
   is required, and the wrap-style patch is small because `__webpack_require__.C` hands us the
   real installer (§3) — unlike the readFileVm era, we do not need to re-own chunk state.
3. Pure (c) is rejected as primary: `--experimental-vm-modules` cannot be a default
   requirement, and the `data:` path's restrictions (no relative/bare imports, broken
   `createRequire`, wrong `import.meta.url`) are exactly the cases MF builds hit
   (externals, auto publicPath).
4. Keep (a) fully supported for CJS targets indefinitely; it is orthogonal (different
   `chunkFormat`) and Next.js/legacy hosts depend on it.

Concrete configuration this implies for node ESM federation builds:
`output.module: true` (+ `experiments.outputModule`), `output.chunkFormat: 'module'`,
`output.chunkLoading: 'import'`, container `library: { type: 'module' }`,
`remoteType: 'import'`, and either `publicPath: 'auto'` (relative chunk imports resolve
against the remote entry's http URL — verified against the codegen, §2.2) or an explicit http
`publicPath`.

### The readFileVm-equivalent ESM fallback patch (pseudocode)

Runs in the runtime plugin's `beforeInit`, mirroring `setupWebpackRequirePatching`
(`runtimePlugin.ts` lines 473–489):

```js
// beforeInit, ESM build of runtimePlugin
const hooksRegistered = globalThis[Symbol.for('mf.node.httpLoaderRegistered')] === true;

if (__webpack_require__.f && typeof __webpack_require__.f.j === 'function') {
  const originalJ = __webpack_require__.f.j;
  const nativeImport = new Function('s', 'return import(s)');   // dodge bundler rewrite
  const pending = new Map();                                    // chunkId -> Promise

  __webpack_require__.f.j = (chunkId, promises) => {
    const matcher = __webpack_require__.federation.chunkMatcher?.(chunkId) ?? true;
    if (!matcher) return originalJ(chunkId, promises);

    // 1. filesystem-local chunks: let the stock loader do relative import()
    //    (resolves against the entry file on disk — works with no hooks)
    // 2. remote chunks:
    const url = resolveUrl(remoteNameFor(chunkId), __webpack_require__.u(chunkId)); // as today, runtimePlugin.ts:281
    if (!url || isFileUrlCoveredByStockLoader(url)) return originalJ(chunkId, promises);

    if (hooksRegistered) {
      // happy path: native import through registered http loader; also
      // covers headers/auth/offline via the hook implementation itself
      return originalJ(chunkId, promises);
    }

    // fallback path: fetch text ourselves (respecting loaderHook.lifecycle.fetch,
    // cf. fetchAndRun runtimePlugin.ts:241-248), then evaluate as ESM:
    if (!pending.has(chunkId)) {
      pending.set(chunkId, fetchChunkText(url)
        .then(evaluateEsm)          // (i) data: import if chunk has no static imports
                                    // (ii) vm.SourceTextModule if --experimental-vm-modules
                                    // (iii) hard error with actionable message otherwise
        .then((ns) => __webpack_require__.C(ns)));   // install into the REAL closure state
    }
    promises.push(pending.get(chunkId));
  };
}
```

Notes: `__webpack_require__.C` must be guaranteed by a one-line build-time
`runtimeRequirementInTree` tap adding `RuntimeGlobals.externalInstallChunk`; `evaluateEsm`'s
`data:` branch must append `//# sourceURL=` + an inline source map when available; the
SourceTextModule branch should extend the SDK's `loadModule` linker (`sdk/src/node.ts`
lines 286–290) to route `node:`/bare specifiers through `import()` instead of `fetch`.
Remote *entries* need the mirror-image treatment in a `loadEntry` runtime-plugin hook: prefer
plain `import(entry)` when hooks are registered; otherwise reuse the same `evaluateEsm`.

### What must also change (migration cost inside this package)

- `EntryChunkTrackerPlugin` / `UniverseEntryChunkTrackerPlugin` assume CJS `module.filename`
  (§1.2) — need `import.meta.url`-based equivalents for ESM output, or exclusion.
- `flush-chunks`/hot-reload utilities keyed on `globalThis.entryChunkCache` inherit that work.
- `createScriptNode`'s ESM branch (`sdk/src/node.ts` lines 175–191) should learn the
  "hooks registered → plain import" shortcut so manifest-type `esm` remotes don't require
  `--experimental-vm-modules` when hooks exist.

---

## 6. Verification gaps (flagged, not hand-waved)

- Rspack module-format details (§2.4) were read from native-binding strings, not Rust source:
  confirm the explicit-publicPath branch of its `f.j` template and MF-plugin compatibility
  with `outputModule` on the rspack version the examples use.
- Webpack's `__webpack_esm_*` export names are current as of 5.104.1; older 5.x used
  `id/ids/modules/runtime`. The wrap+`.C` design is intentionally insensitive to this, but any
  test fixture asserting chunk text is not.
- Node hook-registration idempotency across multiple federation instances in one process
  (hooks are process-global) is Agent A's design territory; the fallback patch above assumes a
  single truthy registration marker.
