---
'@module-federation/runtime-core': patch
---

removeRemote (run by registerRemotes({ force: true })) now resolves the remote's runtime instance in __FEDERATION__.__INSTANCES__ explicitly: registered name + buildVersion, then entryGlobalName + buildVersion, and only when no buildVersion is known the registered name or a unique entryGlobalName. A versioned lookup never falls back to a name-only match and an ambiguous match removes nothing. Share-scope entries are released by the instance's own name (options.name), never by the registration alias. A warning is logged only for ambiguous matches or when same-named instances exist with a different build version; plain containers without a runtime instance stay silent.
