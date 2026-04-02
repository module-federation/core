---
'@module-federation/bridge-vue3': patch
---

feat(bridge-vue3): add afterRouterCreate callback to preserve navigation guards

The bridge internally recreates the Vue Router instance, which discards any
global navigation guards (beforeEach, afterEach, beforeResolve) registered on
the original router. The new optional `afterRouterCreate` callback in the
`appOptions` return value is invoked with the bridge's internal router right
after creation but before any navigation, allowing consumers to re-register
their guards on the actual router that will be used.
