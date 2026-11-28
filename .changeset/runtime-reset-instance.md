---
'@module-federation/runtime': patch
---

Discard an unregistered bundle instance before initialization after a federation global reset. Public and composed initialization now create a clean instance or adopt a registered replacement without retaining the previous instance's remotes, plugins, shared dependencies, and module cache.
