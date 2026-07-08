---
'@module-federation/rsbuild-plugin': patch
'@module-federation/esbuild': patch
'@module-federation/metro': patch
'@module-federation/storybook-addon': patch
---

chore(deps): upgrade `@rslib/core` to 0.23.2, `@rsbuild/core` to 2.1.4, and `@rsbuild/plugin-react`/`plugin-vue`/`plugin-sass` to their 2.x latest across dev dependencies. `create-module-federation` templates are updated so newly scaffolded projects pick up the same versions. `@module-federation/modern-js-v3` is realigned to `@modern-js/* 3.5.0` (which uses `@rsbuild/core 2.1.0`) to resolve a `Rspack` type mismatch between the upgraded `@module-federation/rsbuild-plugin` and modern-js's own rsbuild embedding. Peer dependency ranges are untouched.
