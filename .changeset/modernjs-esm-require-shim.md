---
'@module-federation/modern-js-v3': patch
'@module-federation/modern-js': patch
---

Resolve runtime plugins through `createRequire(import.meta.url)` in the CLI
config plugin, so it no longer throws `ReferenceError: require is not defined`
when it is loaded as native ESM. No `node:module` import reaches the browser
runtime entries.
