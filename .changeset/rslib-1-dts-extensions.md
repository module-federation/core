---
'@module-federation/cli': patch
'@module-federation/esbuild': patch
'@module-federation/managers': patch
'@module-federation/manifest': patch
'@module-federation/metro': patch
'@module-federation/modern-js': patch
'@module-federation/modern-js-v3': patch
'@module-federation/rsbuild-plugin': patch
'@module-federation/rspack': patch
'@module-federation/treeshake-server': patch
'@module-federation/utilities': patch
---

Build with Rslib 1.0. Relative imports in the emitted declaration files now carry explicit extensions, such as `./types.js`, `./index.mjs` and `./utils/index.js`, so they also resolve under `moduleResolution: "node16"` and `"nodenext"`.
