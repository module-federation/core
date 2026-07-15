---
'@module-federation/enhanced': patch
'@module-federation/rspack': patch
'@module-federation/runtime-core': patch
'@module-federation/sdk': patch
'@module-federation/webpack-bundler-runtime': patch
---

Allow builds to exclude unused remote consumption and shared capabilities, and automatically omit Webpack container initialization when no exposes are configured.
