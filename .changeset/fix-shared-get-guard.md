---
'@module-federation/runtime-core': patch
'@module-federation/metro': patch
---

fix: handle shared entries without a `get` factory in `loadShare`

When the host's share scope contains a dependency that a remote does not
declare, the share scope entry has no `get()` factory. `loadShare` called
`targetShared.get!()` without checking, crashing with
`targetShared.get is not a function`. `SharedHandler.loadShare` now checks
for `get` before creating the loading promise, emits `errorLoadShare` with
`recovered: true`, and returns `false`, so a miss is never cached as a loaded
entry.

In `@module-federation/metro`, a remote container now preloads only the shared
dependencies it declares, rather than every package in the host's share
scope. A shared dependency with no provider now throws a descriptive error and
clears its registry entry so a later load can retry, instead of caching an
empty module.

Fixes #2497
