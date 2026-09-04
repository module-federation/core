---
'@module-federation/runtime-core': patch
---

removeRemote now also matches the remote's runtime instance by entryGlobalName and warns when no instance can be found, instead of silently leaving stale instances in __FEDERATION__.__INSTANCES__ after registerRemotes({ force: true }).
