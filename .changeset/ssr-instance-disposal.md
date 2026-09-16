---
"@module-federation/node": patch
"@module-federation/runtime-core": patch
"@module-federation/runtime": patch
"@module-federation/webpack-bundler-runtime": patch
"@module-federation/modern-js-v3": patch
---

Dispose application-owned MF instances and runtime bindings during full Modern SSR rebuilds, preserve shared factories used by other consumers, and initialize new instances from remote declarations.

Install Node chunk loaders for each bundle even when its provider reuses an existing MF instance.
