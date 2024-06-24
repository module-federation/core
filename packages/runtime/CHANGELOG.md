# @module-federation/runtime

## 0.2.0

### Patch Changes

- @module-federation/sdk@0.2.0

## 0.1.21

### Patch Changes

- Updated dependencies [88900ad]
  - @module-federation/sdk@0.1.21

## 0.1.20

### Patch Changes

- 652c8a2: do not apply symbol if object not extensible
- 685c607: feat: support dynamic remote type hints
- 05c43f3: feat: support pass shareScopeMap
- Updated dependencies [685c607]
- Updated dependencies [e8e0969]
- Updated dependencies [349c381]
  - @module-federation/sdk@0.1.20

## 0.1.19

### Patch Changes

- 031454d: fix: do not delete link tag if no preload
- a2bfb9b: fix: In load remote, link preload is not used to preload resources, preventing resource reloading
- Updated dependencies [031454d]
- Updated dependencies [b0a31a7]
- Updated dependencies [a2bfb9b]
  - @module-federation/sdk@0.1.19

## 0.1.18

### Patch Changes

- 80af3f3: fix: add protocol in node automaticly
- Updated dependencies [80af3f3]
  - @module-federation/sdk@0.1.18

## 0.1.17

### Patch Changes

- 26bff6e: feat: add mf_module_id to remote to add module debugging information
  - @module-federation/sdk@0.1.17

## 0.1.16

### Patch Changes

- 103cd07: fix types for beforePreloadRemote args hook
- 425fc9d: fix: only delete can be configurable descriptor
- Updated dependencies [364f2bc]
  - @module-federation/sdk@0.1.16

## 0.1.15

### Patch Changes

- @module-federation/sdk@0.1.15

## 0.1.14

### Patch Changes

- 103b2b8: Script timeout options for createScript hook
- Updated dependencies [103b2b8]
  - @module-federation/sdk@0.1.14

## 0.1.13

### Patch Changes

- d259a37: chore: extract sharedHandler
- 08740a0: fix: should use userOptions.shared to apply hooks
- 0113b81: chore: delete references to used shared to prevent memory leaks
- d259a37: chore: extract remoteHandler
- Updated dependencies [2e52e51]
  - @module-federation/sdk@0.1.13

## 0.1.12

### Patch Changes

- 371d1f1: Before Request throws to errorLoadRemote
  - @module-federation/sdk@0.1.12

## 0.1.11

### Patch Changes

- 328cd99: package json main definition
  - @module-federation/sdk@0.1.11

## 0.1.10

### Patch Changes

- @module-federation/sdk@0.1.10

## 0.1.9

### Patch Changes

- 5ef0150: fix: preserve generic in loadRemote/loadShare/loadShareSync
  - @module-federation/sdk@0.1.9

## 0.1.8

### Patch Changes

- @module-federation/sdk@0.1.8

## 0.1.7

### Patch Changes

- 648353b: Filter falsey runtime plugins from registerPlugins
- 35ebb46: fix: support config string shareScope
  - @module-federation/sdk@0.1.7

## 0.1.6

### Patch Changes

- 72c7b80: chore: fix release tag
- Updated dependencies [72c7b80]
  - @module-federation/sdk@0.1.6

## 0.1.5

### Patch Changes

- 876a4ff: feat: support config shared import:false in runtime
- f26aa2d: chore: prevent plugins from losing information
- 1a9c6e7: feat: support config multiple versions shared
- Updated dependencies [ca271ab]
- Updated dependencies [1a9c6e7]
  - @module-federation/sdk@0.1.5

## 0.1.4

### Patch Changes

- 2f697b9: fix: fixed type declaration in pkg
- Updated dependencies [8f3a440]
- Updated dependencies [2f697b9]
  - @module-federation/sdk@0.1.4

## 0.1.3

### Patch Changes

- 6b3b210: Add Register plugins api
  - @module-federation/sdk@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [c8c0ad2]
  - @module-federation/sdk@0.1.2

## 0.1.1

### Patch Changes

- @module-federation/sdk@0.1.1

## 0.1.0

### Patch Changes

- df3ef24: chore: adjust add federation init process
- df3ef24: chore: redefine prefetch types
- Updated dependencies [df3ef24]
- Updated dependencies [df3ef24]
- Updated dependencies [df3ef24]
- Updated dependencies [df3ef24]
  - @module-federation/sdk@0.1.0

## 0.0.17

### Patch Changes

- ce0597e: feat: add registerRemotes api
  - @module-federation/sdk@0.0.17

## 0.0.16

### Patch Changes

- @module-federation/sdk@0.0.16

## 0.0.15

### Patch Changes

- 6e9b6d5: fix(runtime): preserve error.stack instead of throwing new error
- Updated dependencies [3a45d99]
- Updated dependencies [ba5bedd]
  - @module-federation/sdk@0.0.15

## 0.0.14

### Patch Changes

- a050645: Expose node script loaders to bundler runtime. Replace require.loadScript from federation/node to use federation.runtime.loadScriptNode
- 4fc20cc: adding reject to args in loadEsmEntry
- Updated dependencies [cd8c7bf]
- Updated dependencies [5576c6b]
  - @module-federation/sdk@0.0.14

## 0.0.13

### Patch Changes

- 804447c: fix(runtime): use link to preload js
- Updated dependencies [804447c]
  - @module-federation/sdk@0.0.13

## 0.0.12

### Patch Changes

- @module-federation/sdk@0.0.12

## 0.0.11

### Patch Changes

- b2ead7a: fix(runtime): nativeGlobal is undefined
- 589a3bd: fix(runtime): runtime should not pre-register shared while strategy is 'loaded-first'
  - @module-federation/sdk@0.0.11

## 0.0.10

### Patch Changes

- 2d774d1: onLoad hook will allow you to return a custom module factory or proxy
- 2097daa: feat(runtime): automatically complete the snapshot so that devtool can visualize it
  - @module-federation/sdk@0.0.10

## 0.0.9

### Patch Changes

- 2ad29a6: fix: remove duplicate init shareScopeMap
  fix: normalize schemas path
  fix: shared is loaded if it has lib attr
- b129098: fix: window.location.origin will be "null" in iframe srcDoc
  - @module-federation/sdk@0.0.9

## 0.0.8

### Patch Changes

- 98eb40d: Support offline remotes recovery in errorLoadRemote. Allows hook to return a Module / factory / fallback mock when a request fails or container cannot be accessed
- 98eb40d: feat: enhanced
- Updated dependencies [98eb40d]
- Updated dependencies [98eb40d]
  - @module-federation/sdk@0.0.8

## 0.0.7

### Patch Changes

- 7df24df: only both version and name matched instance can be re-use
- 7df24df: feat: add initContainer and beforeInitContainer hook
  - @module-federation/sdk@0.0.7

## 0.0.6

### Patch Changes

- b505deb: fix: rename usePlugins to prevent swc react-refresh from throwing errors when replacing variables
  - @module-federation/sdk@0.0.6

## 0.0.5

### Patch Changes

- 0dce151: chore(runtime): support entry with query
- Updated dependencies [5a79cb3]
  - @module-federation/sdk@0.0.5

## 0.0.4

### Patch Changes

- 3af2723: fix: add runtime api
  - @module-federation/sdk@0.0.4
