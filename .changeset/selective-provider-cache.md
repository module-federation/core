---
'@module-federation/runtime-core': patch
'@module-federation/webpack-bundler-runtime': patch
---

Require a provider's selective cache cleanup capability when preserving active shared dependencies, allowing unrelated exposed exports to be released. The provider must be built with the matching Rspack cache implementation.
