---
'@module-federation/runtime': minor
'@module-federation/runtime-core': minor
'@module-federation/webpack-bundler-runtime': minor
---

feat(runtime): move remote unload APIs to optional `@module-federation/runtime/unload` entry

- Removes `unloadRemote` from baseline `ModuleFederation` and `@module-federation/runtime` root exports to reduce default payload.
- Adds optional `@module-federation/runtime/unload` entrypoint with:
  - `unloadRemote(nameOrAlias)` for the active runtime instance.
  - `unloadRemoteFromInstance(instance, nameOrAlias)` for explicit instance control.
- Keeps deterministic unload behavior when using the optional entrypoint, including:
  - runtime bookkeeping cleanup (`moduleCache`, manifest/snapshot markers, preloaded map entries, id-to-remote mappings),
  - webpack bundler module cache cleanup (`__webpack_require__.c`/`m`) and remote load marker reset.
