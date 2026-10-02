---
'@module-federation/runtime-core': patch
'@module-federation/metro-core': patch
---

fix: guard `targetShared.get` before calling in `loadShare`

When the host's share scope contains a dependency that a remote does not
declare, the share scope entry has no `get()` factory. `loadShare` called
`targetShared.get!()` without checking, crashing with
`targetShared.get is not a function`. Added a typeof guard before both
call sites in `SharedHandler.loadShare`, returning `false` (the documented
miss sentinel) so callers can fall back correctly.

Also guard the `factory()` call in `metro-core`'s `remote-module-registry`
to handle the `false` return from `loadShare` without crashing.

Fixes #2497
