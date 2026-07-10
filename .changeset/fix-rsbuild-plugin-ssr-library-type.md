---
'@module-federation/rsbuild-plugin': patch
---

fix(rsbuild-plugin): force `output.library.type` to `commonjs-module` in `patchNodeConfig` so the `mf-ssr` bundle stops emitting module-scope `export {}` and passes rspack 2.1.x minification.
