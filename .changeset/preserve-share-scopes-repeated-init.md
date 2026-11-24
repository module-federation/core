---
'@module-federation/webpack-bundler-runtime': patch
'@module-federation/runtime-core': patch
---

Preserve non-default share scopes on repeated container init. `resolveShareScope` falls back to the federation instance's existing `shareScopeMap` when the incoming host scope is missing or empty. `initShareScopeMap` merges incoming scopes with existing ones instead of replacing them to provide defense-in-depth against incomplete re-initialization data.
