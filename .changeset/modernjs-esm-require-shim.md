---
'@module-federation/modern-js-v3': patch
'@module-federation/modern-js': patch
---

Inject a `require` shim into the ESM builds so the CLI plugin no longer throws
`ReferenceError: require is not defined` when it is loaded as native ESM.
