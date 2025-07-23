---
"@module-federation/runtime-core": patch
"@module-federation/runtime": patch
"@module-federation/managers": patch
"@module-federation/cli": patch
"@module-federation/error-codes": patch
"@module-federation/data-prefetch": patch
"@module-federation/esbuild": patch
"@module-federation/manifest": patch
"@module-federation/rspack": patch
"@module-federation/runtime-tools": patch
"@module-federation/utils": patch
"@module-federation/webpack-bundler-runtime": patch
---

Enable modern TypeScript plugin for rollup packages

Add `useLegacyTypescriptPlugin: false` to all rollup-based packages to use the official `@rollup/plugin-typescript` instead of the deprecated `rollup-plugin-typescript2`. This resolves TypeScript compilation errors during build and modernizes the build toolchain.