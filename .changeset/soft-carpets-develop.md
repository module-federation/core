---
'@module-federation/runtime': minor
'@module-federation/runtime-core': minor
'@module-federation/webpack-bundler-runtime': minor
---

feat(runtime): add public `unloadRemote(nameOrAlias)` API for deterministic remote teardown

- Exposes `unloadRemote` on `ModuleFederation` and top-level `@module-federation/runtime` exports.
- Performs idempotent unload (`false` when remote is not registered).
- Clears runtime remote references and unload bookkeeping (`moduleCache`, global loading markers, snapshot/manifest entries, preloaded map entries, and id-to-remote mappings).
- Clears webpack bundler runtime module cache for unloaded remotes (`__webpack_require__.c`/`m`) and resets remote load markers for matched module ids.
