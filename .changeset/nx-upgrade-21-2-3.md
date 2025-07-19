---
"@module-federation/runtime": patch
"@module-federation/enhanced": patch
"@module-federation/rspack": patch
"@module-federation/webpack-bundler-runtime": patch
"@module-federation/sdk": patch
"@module-federation/runtime-tools": patch
"@module-federation/managers": patch
"@module-federation/manifest": patch
"@module-federation/dts-plugin": patch
"@module-federation/third-party-dts-extractor": patch
"@module-federation/devtools": patch
"@module-federation/bridge-react": patch
"@module-federation/bridge-vue3": patch
"@module-federation/bridge-shared": patch
"@module-federation/bridge-react-webpack-plugin": patch
"@module-federation/modern-js": patch
"@module-federation/retry-plugin": patch
"@module-federation/data-prefetch": patch
"@module-federation/rsbuild-plugin": patch
"@module-federation/error-codes": patch
"@module-federation/inject-external-runtime-core-plugin": patch
"@module-federation/runtime-core": patch
"create-module-federation": patch
"@module-federation/cli": patch
"@module-federation/rspress-plugin": patch
---

chore: upgrade NX to 21.2.3, Storybook to 9.0.9, and TypeScript to 5.8.3

- Upgraded NX from 21.0.3 to 21.2.3 with workspace configuration updates
- Migrated Storybook from 8.3.5 to 9.0.9 with updated configurations and automigrations
- Upgraded TypeScript from 5.7.3 to 5.8.3 with compatibility fixes
- Fixed package exports and type declaration paths across all packages
- Resolved module resolution issues and TypeScript compatibility problems
- Updated build configurations and dependencies to support latest versions