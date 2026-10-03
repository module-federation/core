---
'@module-federation/runtime': patch
'@module-federation/runtime-core': patch
'@module-federation/runtime-tools': patch
'@module-federation/webpack-bundler-runtime': patch
'@module-federation/sdk': patch
'@module-federation/error-codes': patch
---

Emit CommonJS declarations as `.d.cts` and point the `require` types
condition at them. The CJS and ESM builds previously wrote the same `.d.ts`
path at the same time, which could leave a torn declaration file.
