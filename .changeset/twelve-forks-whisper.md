---
'@module-federation/webpack-bundler-runtime': patch
'@module-federation/runtime-core': patch
'@module-federation/utilities': patch
'@module-federation/node': patch
---

Add runtime-safe access helpers for webpack require and ignored dynamic imports, and migrate core/node runtime loaders to use these helpers so intermediate bundling steps are less likely to rewrite runtime globals.
