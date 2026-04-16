---
'@module-federation/bridge-vue3': patch
---

fix(bridge-vue3): fix route processing for relative paths and default child routes with basename

Two issues in `routeUtils` are fixed:

1. **Relative child paths no longer get double-prefixed.** `prefixPath` now skips paths that don't start with `/`, letting Vue Router resolve them against the already-prefixed parent. This prevents breakage with nested route children like `path: 'history'` or `path: ':id?'`.

2. **Default child routes (`path: ''`) no longer cause infinite recursion.** `flatRoutesMap` now stores arrays of candidates per path, and child matching skips the current parent route and uses the child's `name` when available. This correctly handles the case where a parent and its default child resolve to the same absolute path.
