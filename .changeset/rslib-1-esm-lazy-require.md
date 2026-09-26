---
'@module-federation/esbuild': patch
'@module-federation/modern-js': patch
'@module-federation/modern-js-v3': patch
---

The ESM build loads `esbuild` (in `@module-federation/esbuild`) and `jiti` (in the Modern.js plugins) through `createRequire` when the code that needs them runs, instead of importing them at the top of the module. The build no longer emits `rslib-runtime.mjs`.
