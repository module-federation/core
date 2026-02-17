---
'@module-federation/webpack-bundler-runtime': patch
'@module-federation/sdk': patch
'@module-federation/runtime-core': patch
'@module-federation/utilities': patch
---

Add runtime-safe access helpers for webpack require and ignored dynamic imports, and migrate core runtime loaders to use these helpers so intermediate bundling steps are less likely to rewrite runtime globals.
