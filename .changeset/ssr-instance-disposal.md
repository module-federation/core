---
"@module-federation/node": patch
"@module-federation/runtime-core": patch
"@module-federation/runtime": patch
"@module-federation/webpack-bundler-runtime": patch
"@module-federation/modern-js-v3": patch
---

Dispose application-owned MF instances and runtime bindings during full Modern SSR rebuilds, preserve shared factories used by other consumers, and initialize new instances from remote declarations.

Install Node chunk loaders for each bundle even when its provider reuses an existing MF instance.

Release unused shared records after loading completes even when their settled loading promise remains, allowing old SSR application runtimes to be collected.

Release the old application generation’s shared consumer records before destroying instances during full Modern SSR rebuilds.

Drop Modern ownership records for removed remotes so previous remote entry exports and loading promises are not retained until full application disposal.
