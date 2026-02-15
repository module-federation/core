---
'@module-federation/metro': patch
---

Add optional dts-plugin support for Metro remotes. When `dts` is enabled in `withModuleFederation` config, `bundle-mf-remote` can generate `@mf-types.zip` / `@mf-types.d.ts` and will populate `mf-manifest.json` `metaData.types` when those files are produced.

