---
'@module-federation/runtime-core': patch
'@module-federation/webpack-bundler-runtime': patch
---

Fall back to the full shared getter when a `runtime-infer` tree-shaken variant does not cover the consumer's used exports.
