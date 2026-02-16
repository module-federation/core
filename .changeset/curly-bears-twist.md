---
'@module-federation/error-codes': patch
'@module-federation/dts-plugin': patch
'@module-federation/retry-plugin': patch
'@module-federation/native-federation-tests': patch
'@module-federation/native-federation-typescript': patch
'@module-federation/third-party-dts-extractor': patch
---

Migrate rollup/tsup package builds in `packages/` to `rslib`, keep `dts-plugin` browser iife output in place, and align package exports to the new build artifacts.
