---
'@module-federation/webpack-bundler-runtime': patch
'@module-federation/runtime-core': patch
'@module-federation/utilities': patch
'@module-federation/node': patch
'@module-federation/sdk': patch
---

Add runtime-safe access helpers for webpack require, webpack share-scope globals, and ignored dynamic imports, and migrate core/node runtime loaders to use these helpers. The helpers are exposed via a standalone `@module-federation/sdk/bundler` entrypoint so they can be built and consumed independently from the SDK main index bundle.
