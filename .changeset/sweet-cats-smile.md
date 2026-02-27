---
'@module-federation/metro': patch
---

Add optional dts-plugin support for Metro remotes. When `dts` is enabled in `withModuleFederation` config, both `bundle-mf-remote` and remote `start` mode can generate `@mf-types.zip` / `@mf-types.d.ts`, populate `mf-manifest.json` `metaData.types`, and serve the generated type assets from the Metro temp directory in development.
