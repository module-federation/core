# Kernel split probe (candidate 1, delivery PR 1)

Throwaway prototype. Branch `rfc-probe/kernel-split` in /fast/worktrees/rfc-probe-main, local commit 03aa956e2 on origin/main 6bd7ea0aa. Not pushed. Packages diff: 44 files, +946/-517 (most of it moves: load.ts leaves into platform/*, the tree-shake plugin out of init.ts, exports maps). The commit hook also added the 6 untracked probe fixture files under apps/rfc-probe/.

## Question

Can runtime-core split into a kernel that takes a Capabilities record plus capability subpaths so that a composed ALL-OFF or remotes-only bootstrap has no shared handler, snapshot plugin, container entry, or sdk Node loader in the chunk graph, on webpack 5 and rspack 2.1.8, in M1, M2, M3 and M3+se? Or does a barrel pull a capability back?

## Answer

Yes. After one cut (below), every ALL-OFF and remotes-only cell is clean on both bundlers in all four modes, M3 included. No runtime-core barrel pulled anything back: tsdown's unbundle output already resolves runtime-core's internal barrels (utils/index.ts, helpers.ts) to leaf imports, and the kernel imports none of index.ts, helpers.ts, or the sdk root. The one leak was the sdk root barrel, reached through webpack-bundler-runtime.

## How the probe composes

`run.mjs` label `composed` writes apps/rfc-probe/compose/<profile>.js, which imports `webpack-bundler-runtime/dist/compose.js`, the needed `dist/adapters/*.js`, and runtime-core capability files by absolute path, then `export default createFederation({ capabilities, adapters })`. It aliases the path each bootstrap imports to that file: webpack gets enhanced's `resolveRuntimePaths().bundlerRuntimePath` (`webpack-bundler-runtime/dist/bundler.js`); rspack 2.1.8 gets `webpack-bundler-runtime/dist/index.cjs` plus `'@module-federation/runtime'` to the ESM entry. The wbrRoot column confirms neither legacy entry is in any graph.

| profile | adapters | capabilities |
|---|---|---|
| ALL-OFF | none | {} |
| remotes-only (disableShared, disableSnapshot, target web) | remotes, share-scope | remote, platform/web |
| ALL-OFF+expose (container named remoteApp) | container, share-scope | {} |
| DEFAULT | remotes, consumes, share-scope, container | shared, remote, snapshot, platform/web |

Legend as results.md: G = in an emitted chunk (chunk graph), E = marker string in emitted JS. Extra graph-only columns: rcRoot = runtime-core/dist/index, sdkRoot = sdk/dist/index, rtRoot = runtime/dist/index|bundler, wbrRoot = webpack-bundler-runtime/dist/index|bundler.

### composed  (rfc-probe/kernel-split (kernel + capability subpaths, composed bootstrap), @rspack/core 2.1.8)

| bundler | profile | mode | shared | remote | module | snapshot | preload | container | sdknode | main bytes | total JS bytes | fed mods in chunks | fed orphans | rcRoot | sdkRoot | rtRoot | wbrRoot |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| webpack | ALL-OFF | M1 | -- | -- | -- | -- | -- | -- | -- | 16173 | 16324 | 43 | 0 | - | - | - | - |
| webpack | ALL-OFF | M2 | -- | -- | -- | -- | -- | -- | -- | 68016 | 68403 | 43 | 0 | - | - | - | - |
| webpack | ALL-OFF | M3 | -- | -- | -- | -- | -- | -- | -- | 141762 | 142193 | 43 | 0 | - | - | - | - |
| webpack | ALL-OFF | M3+se | -- | -- | -- | -- | -- | -- | -- | 121918 | 122349 | 43 | 0 | - | - | - | - |
| rspack | ALL-OFF | M1 | -- | -- | -- | -- | -- | -- | -- | 19542 | 19691 | 28 | 5 | - | - | - | - |
| rspack | ALL-OFF | M2 | -- | -- | -- | -- | -- | -- | -- | 66422 | 66717 | 28 | 5 | - | - | - | - |
| rspack | ALL-OFF | M3 | -- | -- | -- | -- | -- | -- | -- | 130108 | 130447 | 44 | 0 | - | - | - | - |
| rspack | ALL-OFF | M3+se | -- | -- | -- | -- | -- | -- | -- | 83085 | 83424 | 30 | 3 | - | - | - | - |
| webpack | remotes-only | M1 | -- | GE | GE | -- | -- | -- | -- | 55428 | 55579 | 65 | 0 | - | - | - | - |
| webpack | remotes-only | M2 | -- | GE | GE | -- | -- | -- | -- | 156285 | 156672 | 65 | 0 | - | - | - | - |
| webpack | remotes-only | M3 | -- | GE | GE | -- | -- | -- | -- | 251571 | 252003 | 65 | 0 | - | - | - | - |
| webpack | remotes-only | M3+se | -- | GE | GE | -- | -- | -- | -- | 232653 | 233085 | 65 | 0 | - | - | - | - |
| rspack | remotes-only | M1 | -- | GE | GE | -- | -- | -- | -- | 57775 | 57924 | 49 | 8 | - | - | - | - |
| rspack | remotes-only | M2 | -- | GE | GE | -- | -- | -- | -- | 156337 | 156632 | 49 | 8 | - | - | - | - |
| rspack | remotes-only | M3 | -- | GE | GE | -- | -- | -- | -- | 229649 | 229989 | 66 | 0 | - | - | - | - |
| rspack | remotes-only | M3+se | -- | GE | GE | -- | -- | -- | -- | 195729 | 196069 | 54 | 3 | - | - | - | - |
| webpack | ALL-OFF+expose | M1 | -- | -- | -- | -- | -- | GE | -- | 21485 | 43806 | 51 | 0 | - | - | - | - |
| webpack | ALL-OFF+expose | M2 | -- | -- | -- | -- | -- | GE | -- | 81391 | 164854 | 51 | 0 | - | - | - | - |
| webpack | ALL-OFF+expose | M3 | -- | -- | -- | -- | -- | GE | -- | 159031 | 298943 | 51 | 0 | - | - | - | - |
| webpack | ALL-OFF+expose | M3+se | -- | -- | -- | -- | -- | GE | -- | 139196 | 279591 | 51 | 0 | - | - | - | - |
| rspack | ALL-OFF+expose | M1 | -- | -- | -- | -- | -- | GE | -- | 24767 | 50335 | 36 | 5 | - | - | - | - |
| rspack | ALL-OFF+expose | M2 | -- | -- | -- | -- | -- | GE | -- | 80010 | 161568 | 36 | 5 | - | - | - | - |
| rspack | ALL-OFF+expose | M3 | -- | -- | -- | -- | -- | GE | -- | 146309 | 274431 | 52 | 0 | - | - | - | - |
| rspack | ALL-OFF+expose | M3+se | -- | -- | -- | -- | -- | GE | -- | 99144 | 199180 | 38 | 3 | - | - | - | - |
| webpack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | -- | 82709 | 176493 | 78 | 0 | - | - | - | - |
| webpack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | -- | 193931 | 407948 | 78 | 0 | - | - | - | - |
| webpack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | -- | 282930 | 585525 | 78 | 0 | - | - | - | - |
| webpack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | -- | 285014 | 589693 | 78 | 0 | - | - | - | - |
| rspack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | -- | 83975 | 179407 | 67 | 3 | - | - | - | - |
| rspack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | -- | 205634 | 430808 | 67 | 3 | - | - | - | - |
| rspack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | -- | 257563 | 534342 | 79 | 0 | - | - | - | - |
| rspack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | -- | 243289 | 505794 | 67 | 3 | - | - | - | - |

## Resolved federation modules per cell

The container column is GE in ALL-OFF+expose and DEFAULT because they expose a module. remote and module are GE in remotes-only because it loads remotes. That is the intended content.

## The barrel that pulled a capability back, and the cut

First run (log: run-composed-before-sdkcore.log): remotes-only and DEFAULT had sdknode = G on webpack in every mode and on rspack in M3. chains.json (shortest chain of active incoming connections, from moduleGraph.getIncomingConnections) for rspack remotes-only M3:

`rspack.js entry -> compose/remotes-only.js -> wbr dist/adapters/remotes.js -> wbr dist/remotes.js --'@module-federation/sdk'--> sdk/dist/index.js --./node.js--> sdk/dist/node.js`

Webpack M3 showed the same chain. In webpack M1 the sdk root and node.js had no active incoming connection but stayed in the chunk (the inactive-connection keep pattern the earlier probe saw; not re-verified here). Cut: `webpack-bundler-runtime/src/remotes.ts` imports `decodeName, ENCODE_NAME_PREFIX` from `@module-federation/sdk/core`. All runtime-core value imports of the sdk already went to `sdk/core` (the sdk root minus `./node`), and platform/node and platform/universal import `sdk/node`.

## Root (legacy) path on the same branch vs main

Label kernel-root, main bytes. webpack ALL-OFF M1 28740 vs main 28047 (+2.5%). DEFAULT webpack M1 89069 vs 88470 (+0.7%), M3 321527 vs 304605 (+5.6%). rspack (1.x cjs) ALL-OFF M1 114659 vs 107387, DEFAULT M1 123594 vs 118131 (+4.6%). The first version of `legacyCapabilities()` routed the define reads through a helper, and webpack ALL-OFF M1 grew to 71153. Inline `typeof X === 'boolean' && X ? undefined : cap` ternaries fixed that. The M3 growth is the extra modules: kernel.js, three capability files, three platform files, and the sdk/core barrel next to the sdk root.

## Smoke (smoke-composed.mjs, smoke-composed.txt)

The script serves the composed ALL-OFF+expose output on :3001 and DEFAULT on :3002. It runs each in Node with a DOM stub whose script tags fetch and eval.

- ALL-OFF+expose remoteEntry.js, webpack and rspack, M1 M2 M3: `instance=remoteApp platform=none plugins=[] DisabledSharedHandler DisabledRemoteHandler DisabledSnapshotHandler` (minified names in M1).
- DEFAULT main.js, webpack and rspack, M1 M2 M3: `platform=web plugins=[snapshot-plugin,generate-preload-assets-plugin,tree-shake-plugin] SharedHandler RemoteHandler SnapshotHandler`, then `loadRemote('remoteApp/Button') -> button`. The entry's synchronous `import 'tslib'` throws RUNTIME-006 first, as in every earlier DEFAULT smoke.
- Identity (Node ESM against runtime dist): `compose.init({name:'idcheck'}, {})` then root `getInstance() === inst` true, root `init({name:'idcheck'})` returns the same instance, root `createInstance` gets SharedHandler/RemoteHandler/universal and both default plugins.

## Tree-shaking shared secondary entries: host bundlerRuntime keys they call

The host passes its bundlerRuntime to the secondary entry's `init(mfInstance, bundlerRuntime)` in getSharedFallbackGetter.ts and in the tree-shake plugin's `treeShaking.get`. SharedEntryModule.ts:172-178 stores it as the entry's `federation.bundlerRuntime`. Then the secondary's own runtime modules call:

- `installInitialConsumes`: from `init`, through the secondary's ConsumeSharedRuntimeModule (ConsumeSharedRuntimeModule.ts:151-163).
- `consumes`: the chunk handler for async consumes (ConsumeSharedRuntimeModule.ts:176-185).
- `getSharedFallbackGetter`: through updateConsumeOptions (updateOptions.ts:18-33), which both of the above call. It runs only when the secondary's federation.sharedFallback is set.
- `I`: defined by the ShareRuntimeModule that ConsumeSharedModule's shareScopeMap requirement brings in (ShareRuntimeModule.ts:130-140). Nothing on the consume path calls `__webpack_require__.I`, so it is reachable but not called.

`getRemoteEntry` is a runtime import (now `runtime/compose`), not a bundlerRuntime key. With the task's adapter split, a tree-shaking host needs consumes plus share-scope, because share-scope owns installInitialConsumes.

## Caveats

- sdk/core still carries dom.js and the sdk type-plugin barrels, so ALL-OFF M3 keeps sdk/dist/dom.js. I did not add `./dom`, because dom.js is not a tracked capability. The RFC's sdk/core excludes both loaders.
- remotes-only keeps utils/share.js and semver through remote/index.ts's `getGlobalShareScope`. That is not SharedHandler.
- 47 runtime-core tests and 1 runtime test fail. The tests construct `../src/core` directly, which is now the kernel with no capabilities, and the runtime test sees the extra constructor argument. Not fixed.
- Adapter shape here: `{ bundlerRuntime: {...}, beforeInit? }`. The consumes adapter owns the tree-shake plugin. Types are `any`.
- rspack aliasing `@module-federation/runtime` to the ESM entry did not break `@module-federation/runtime/compose` resolution. No custom plugin was needed.
- enhanced was rebuilt from origin/main (no hoist guard).
