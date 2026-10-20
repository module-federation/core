---
'@module-federation/runtime-core': patch
'@module-federation/node': patch
'@module-federation/modern-js-v3': patch
---

Add `helpers.global.resetFederationRuntime()`, which clears instance module caches and container globals together with the global federation info. `@module-federation/node` hot reload uses it, and the Modern.js v3 server plugin calls it on dev rebuilds so re-required SSR bundles no longer reuse the previous build's containers.
