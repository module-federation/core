# Slots + attach on the kernel (probe)

Throwaway prototype. Branch `rfc-probe/kernel-split` in /fast/worktrees/rfc-probe-main, local commit 5f580d4f5 on top of 03aa956e2. Not pushed.

## Question

Does the grafted design from sketch-v3/11 (slots own hooks and state, `attach` is monotonic, idempotent and hook-preserving, the public entry points attach, the disabled remote handler fails fast) hold on the real code?

## Answer

Yes. The changes are one kernel method, three hook-declaration modules, and small edits to the handler constructors. Every test below goes red before the change and green after it. Four injected defects each turn the predicted test red. The composed ALL-OFF and remotes-only graphs gain exactly the three hook-declaration modules and no capability module.

## What changed

- `ModuleFederation.slots` is created in field initializers, before the constructor body runs: `shared: { hooks, shareScopeMap }`, `remote: { hooks, idToRemoteMap }`, `snapshot: { hooks }`. The hook sets come from `shared/hooks.ts`, `remote/hooks.ts` and `plugins/snapshot/hooks.ts`, which import only `utils/hooks`.
- Every handler, enabled or disabled, reads `host.slots.<x>` in its constructor. `this.shareScopeMap` is the slot's map, so it never changes identity.
- `fillSlots(caps)` fills each slot that is still disabled and returns the snapshot plugins when `remote` and `snapshot` have both just become enabled. The constructor registers `[...fillSlots(caps), ...userPlugins]`, which keeps today's plugin order. `attach(caps)` calls `fillSlots` and registers the returned plugins.
- The disabled remote handler throws from `formatAndRegisterRemote` when `userOptions.remotes` is non-empty, and from `registerRemotes`, `loadRemote`, `preloadRemote`, `initRawContainer` and `getRemoteModuleAndOptions`. The message is: "Remote loading is not composed into this runtime. Configure `remotes`, or compose the remote capability from @module-federation/runtime-core/remote."
- Public `init()` passes `legacyCapabilities()` to `initInstance`, which calls `instance.attach?.(capabilities)` before `initOptions` when the instance already exists. Public `registerRemotes` and `registerShared` call `attach?.(legacyCapabilities())` first. `legacyCapabilities()` returns the full set when no define is emitted, which is the case in composed mode. The legacy root keeps its define-driven dead-code elimination. The optional call is there because the global registry can hold an instance from an older runtime copy.

Diff size: 15 files, +674/-341. 215 of the added lines are tests. The three hook modules add 349 lines and the handler classes lose 305, so that part is a move. The rest is about 110 added and 35 removed: `core.ts` +59/-17, the three disabled handlers +33/-18, the handler constructors +11, and the runtime +7/-1.

## Tests

runtime-core `__tests__/attach.spec.ts`:

| test | before | after |
|---|---|---|
| (b) attaching the same capability twice keeps the first handler and registers the snapshot plugins once | red: `mf.attach is not a function` | green |
| (c) attach never downgrades or replaces an enabled slot | red: same | green |
| (c) shareScopeMap and idToRemoteMap keep their identity across attach | red: same | green |
| (d) registerRemotes and loadRemote on an instance without remote throw the named error | red: `expected ... to throw error including '@module-federation/runtime-core/remote' but got 'Remote loading is disabled by experim…'` | green |
| (e) a plugin that injects remotes in beforeInit fails construction and init without the remote capability | red: `expected [Function] to throw an error` (silent drop) | green |
| (f) remote arriving through attach registers the snapshot plugins, and their listeners run | red: `mf.attach is not a function` | green |

runtime:

| test | kernel and runtime both old | new kernel, old public API | both new |
|---|---|---|---|
| attach.spec (a) a remotes-only instance gains shared through public init, and listeners registered before attach fire | red: `Cannot read properties of undefined (reading 'on')` (the disabled hooks have no `beforeLoadShare`) | red: `expected 'DisabledSharedHandler' to be 'SharedHandler'` | green |
| attach-register.spec (d) the instance method throws the named error, and the public function attaches remote first | red: old message | red: public registerRemotes throws the named error | green |

Injected defects (`attach.spec.ts` unless noted):
- attach replaces enabled slots. (b) `expected SharedHandler{…} to be SharedHandler{…}` and (c) `enabled slot was replaced`.
- the disabled `formatAndRegisterRemote` returns `[]`. (e) `expected [Function] to throw an error`.
- attach skips the snapshot plugins. (b) `expected [] to deeply equal [ 'snapshot-plugin', …(1) ]` and (f) `expected [ 'user-plugin' ] to deeply equal [ 'user-plugin', …(2) ]`.
- SharedHandler creates its own hooks (runtime (a), after a dist rebuild). `expected [] to deeply equal [ 'react' ]`.

Full suites: runtime-core has 34 failures out of 132, down from 47 out of 126. No test that passed before fails now. 13 older tests now pass, all in load.spec, hooks.spec and plugin.spec, because `DisabledRemoteHandler` now carries the full remote hook set (for example `loadEntry` and `errorLoadRemote`). The runtime package has 1 failure out of 95, the same `global.spec` inject-mode failure as before (an extra constructor argument).

## Composed smoke (smoke-attach.txt, `node smoke-composed.mjs <mode> attach webpack`)

- webpack ALL-OFF+expose M1: `instance=remoteApp platform=none plugins=[] sharedHandler=D remoteHandler=M snapshotHandler=L` (minified). In M3: `DisabledSharedHandler DisabledRemoteHandler DisabledSnapshotHandler`.
- webpack DEFAULT M1 and M3: `platform=web plugins=[snapshot-plugin,generate-preload-assets-plugin,tree-shake-plugin]`, real handlers, then `loadRemote(remoteApp/Button) -> button`. The RUNTIME-006 `loadShareSync` throw is the same as before, and the pre-attach build prints the same console line.

## Chunk membership (modset-diff.mjs, modset-diff.txt)

Label `attach` in run.mjs, webpack, compared with out/composed (commit 03aa956e2). The capability columns are identical: ALL-OFF is all `--`, and remotes-only shows only remote and module as `GE`.

| profile | mode | modules before | after | added | removed |
|---|---|---|---|---|---|
| ALL-OFF | M1 | 43 | 46 | shared/hooks.js, remote/hooks.js, plugins/snapshot/hooks.js | none |
| ALL-OFF | M3 | 43 | 46 | same three | none |
| remotes-only | M1 | 65 | 68 | same three | none |
| remotes-only | M3 | 65 | 68 | same three | none |

ALL-OFF+expose and DEFAULT show the same +3 and nothing removed. Bytes, main.js: ALL-OFF M1 went from 16173 to 17917 (+1744, +10.8%), and M3 from 141762 to 148931. remotes-only M1 went from 55428 to 56449 (+1021).

## Where the design contradicted the code

1. Each handler class created its own hooks as a field initializer, and the disabled handlers declared `PluginSystem({})`, or only `afterResolve` in the shared case. `applyPlugin` iterates the declared lifecycle keys, so a plugin applied to a disabled handler recorded its name and attached nothing. Adopting that hooks object would lose the listeners. I resolved this by moving each full hook declaration into a hooks-only module that the kernel calls. The cost is the three modules and 1.7 KB in ALL-OFF M1.
2. The constructor registered the snapshot plugins through `defaultOptions.plugins`. Those plugins now come from `fillSlots`, so construction and attach share one path. There is one divergence. At construction the snapshot plugins come first. Through attach they are appended after the existing plugins, so the user's `afterResolve` waterfall runs before the snapshot plugin's. Test (f) pins this order.
3. `shareScopeMap` was assigned once from the handler. It now comes from the slot, so no getter is needed.
4. The disabled `formatAndRegisterRemote` returned `[]`, which is the silent drop on origin/main as well. It now throws.
5. The capabilities record was stored by reference. It is now the instance's own record, and `fillSlots` fills its keys.
6. `SharedHandler._setGlobalShareScopeMap(host.options)` runs when the handler is created. A handler created through attach registers its map under the final `options.id`. A handler created at construction registers it under the build id or the name. The only reader, remote/index.ts:633, iterates every key, so nothing breaks.
7. The disabled handlers still need an `as unknown as SharedHandler` cast at construction. The RFC's one interface per slot removes it. The prototype does not add it.
