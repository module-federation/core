## rspack on the ESM runtime entries (labels main-rspack-esm, proto-rspack-esm, proto-rspack2-esm)

Question: rspack removed nothing in any earlier cell because @rspack/core's native MF plugin bundles the .cjs runtime. If rspack consumes the ESM entries instead, does it (a) fold the inlined `typeof FEDERATION_*` checks at parse time and (b) prune the side-effect-free implementation modules, and does its federation runtime hoist inactive-connection modules back in?

### The knob

`@rspack/core` (1.3.9 and 2.1.8 alike, `ModuleFederationPlugin.apply`, the inner `paths` function) computes
`bundlerRuntimePath = require.resolve('@module-federation/webpack-bundler-runtime', { paths: [runtimeToolsPath] })` and
`runtimePath = require.resolve('@module-federation/runtime', { paths: [runtimeToolsPath] })`. Node's `require.resolve` applies the `require` export condition, so both land on `dist/index.cjs` whatever `implementation` points at. The generated entry (`@module-federation/runtime/rspack.js!=!data:text/javascript,import __module_federation_bundler_runtime__ from "<abs .cjs path>" ...`) imports that absolute path, and the plugin sets `resolve.alias['@module-federation/runtime'] = <abs .cjs path>` with the user's alias spread after it. `conditionNames` never gets a say: absolute paths bypass exports. `implementation` only moves the `paths:` base, not the condition. packages/rspack's own `'@module-federation/runtime$'` alias loses to the plugin's non-`$` key, which sits first in the object.

Two `resolve.alias` entries flip the whole chain to ESM (`rspackEsmAlias` in run.mjs; found with knob.mjs):

- `[<abs path of webpack-bundler-runtime/dist/index.cjs>]: <abs path of webpack-bundler-runtime/dist/index.js>` (rspack's resolver aliases absolute requests)
- `'@module-federation/runtime': <abs path of runtime/dist/index.js>` (overrides the plugin's value; runtime-core and sdk then resolve through the `import` condition on their own, no alias needed)

Knob sweep on origin/main, ALL-OFF M2: none = 78 cjs modules; wbr alias only = wbr ESM but runtime/runtime-core/sdk still cjs (main.js grows to 396 KB, two copies); wbr + runtime alias = 60 ESM modules, 0 cjs; adding runtime-core$/sdk$ aliases changes nothing.

### Results (ALL-OFF main.js bytes, six implementations G/E)

| build | M1 | M2 | M3+se |
|---|---|---|---|
| main, rspack 1.3.9, cjs (earlier) | 107387, all GE | 245801, all GE | 245919, all GE |
| main + ESM knob | 49582, five G-, container -- | 208830, five GE, container -- | 263613, five GE, container -- |
| proto (fold) + ESM knob, rspack 1.3.9 | 33480, all -- | 104579, all -- | 153464, all -- |
| proto (fold) + ESM knob, rspack 2.1.8 | 31353, all -- | 106147, all -- | 144482, all -- |
| proto, webpack (earlier) | 27873, all -- | 89236, all -- | 160982, all -- |

DEFAULT stays all GE on every rspack row, as it must; its orphans are exactly `shared/disabled.js`, `remote/disabled.js`, `snapshot/disabled.js` plus sdk types (the mirror image of ALL-OFF).

ESM alone (main + knob) already lets the SWC minifier strip the marker strings in M1 (`G-`, same as webpack main M1) and prunes `initContainerEntry`, whose check on main is already a single inline `typeof` expression. The other five stay in the graph because main's `const USE_* = typeof ... ? ... : true` at module top does not fold across statements. The fold-at-parse prototype closes that gap: rspack emits `this.sharedHandler = ( false) ? 0 : new DisabledSharedHandler();` and the import of `SharedHandler` is dead, so with `sideEffects` on the module leaves every chunk.

### Smoke

rspack's `moduleFederationDefaultRuntime` only calls `runtime.init` when `__webpack_require__.initializeSharingData || __webpack_require__.initializeExposesData` exists, so a host with no shared and no exposes never creates an instance on rspack (both 1.3.9 and 2.1.8; this is why every earlier rspack ALL-OFF smoke read "no federation instance"). The `ALL-OFF+expose` profile adds one expose; its instance lives in remoteEntry.js, not main.js. `smoke-rspack-esm.txt`:

- proto-rspack-esm ALL-OFF+expose M2 and M3+se remoteEntry.js: `sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler`; M1 the same under minified names.
- proto-rspack2-esm ALL-OFF+expose M2: same.
- proto-rspack-esm DEFAULT M1: throws the expected `loadShareSync` RUNTIME-006 under the DOM stub, as webpack does (the real handlers are live).
- main-rspack-esm ALL-OFF+expose M2: Disabled* handlers too (runtime selection was always right; only the bundle size was wrong).

### Hoisting

@rspack/core 1.3.9 has no hoisting pass: the binding contains no `HoistContainerReferencesPlugin`; the federation entry is a global `EntryPlugin` plus a `FederationRuntimeModule`. 2.1.8's binding does contain `HoistContainerReferencesPlugin` and `EmbedFederationRuntime`. Neither re-includes modules that only inactive connections reach: the chunk module sets for proto ALL-OFF M2 are identical between 1.3.9 and 2.1.8 (38 federation modules), and 2.1.8 does not even keep the pruned modules in `compilation.modules` (6 orphans vs 37). The enhanced guard in the prototype (`connection.getActiveState(undefined) === false` skip in `getAllReferencedModules`) has no rspack counterpart to fix.

### Verdict

(a) Yes. With the ESM entries rspack's parser folds the inlined `typeof FEDERATION_* === 'boolean' ? !FEDERATION_* : true` checks at parse time, in M1, M2 and M3+se.
(b) Yes. With `sideEffects` on, the six disabled implementations leave the module graph, matching webpack's proto rows; ALL-OFF M1 main.js drops from 107 KB to 33 KB (31 KB on 2.1.8) versus webpack's 28 KB.
Hoisting: no force-include on either rspack version.

Upstream @rspack/core change: in `ModuleFederationPlugin.apply`'s `paths` function, resolve `@module-federation/webpack-bundler-runtime` and `@module-federation/runtime` with an `import`-condition resolver (or try the `/bundler` subpath export, `@module-federation/webpack-bundler-runtime/bundler` and `@module-federation/runtime/bundler`, before falling back to `require.resolve`), and put the runtime alias under a `$` exact key so a wrapper can override it. Until then, packages/rspack can do it alone today in its existing `afterPlugins` tap: alias the absolute `.cjs` path it can recompute with `require.resolve('@module-federation/webpack-bundler-runtime', { paths: [implementationPath] })` to `dist/index.js`, and set the non-`$` `'@module-federation/runtime'` key instead of `'@module-federation/runtime$'`.
