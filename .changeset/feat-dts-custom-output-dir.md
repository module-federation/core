---
'@module-federation/dts-plugin': minor
'@module-federation/sdk': minor
---

feat(dts-plugin): support custom outputDir for DTS type emission

Expose the `outputDir` option in `DtsRemoteOptions` so users can configure where `@mf-types.zip` and `@mf-types.d.ts` are emitted. Fix `GenerateTypesPlugin` to use `path.relative()` for correct asset placement in subdirectories.
