---
'@module-federation/runtime-core': patch
'@module-federation/webpack-bundler-runtime': patch
---

Use a provider's selective cache cleanup capability when preserving active shared dependencies, allowing unrelated exposed exports to be released. Providers without this capability retain their execution cache for compatibility.
