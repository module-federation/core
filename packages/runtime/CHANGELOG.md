# @module-federation/runtime

## 0.9.1

### Patch Changes

- Updated dependencies [35d925b]
- Updated dependencies [35d925b]
- Updated dependencies [8acd217]
  - @module-federation/sdk@0.9.1
  - @module-federation/runtime-core@0.6.22
  - @module-federation/error-codes@0.9.1

## 0.9.0

### Patch Changes

- @module-federation/sdk@0.9.0
- @module-federation/error-codes@0.9.0
- @module-federation/runtime-core@0.6.21

## 0.8.12

### Patch Changes

- @module-federation/sdk@0.8.12
- @module-federation/error-codes@0.8.12
- @module-federation/runtime-core@0.6.20

## 0.8.11

### Patch Changes

- @module-federation/sdk@0.8.11
- @module-federation/error-codes@0.8.11
- @module-federation/runtime-core@0.6.19

## 0.8.10

### Patch Changes

- Updated dependencies [9566fbc]
  - @module-federation/runtime-core@0.6.18
  - @module-federation/sdk@0.8.10
  - @module-federation/error-codes@0.8.10

## 0.8.9

### Patch Changes

- @module-federation/sdk@0.8.9
- @module-federation/error-codes@0.8.9
- @module-federation/runtime-core@0.6.17

## 0.8.8

### Patch Changes

- @module-federation/sdk@0.8.8
- @module-federation/error-codes@0.8.8
- @module-federation/runtime-core@0.6.16

## 0.8.7

### Patch Changes

- f573ad0: feat: add externalRuntime and provideExternalRuntime fields to help optimize assets size
- 4fd33fb: fix: throw RUNTIME-008 Error when script resources load failed
- Updated dependencies [835b09c]
- Updated dependencies [f573ad0]
- Updated dependencies [336f3d8]
- Updated dependencies [4fd33fb]
  - @module-federation/sdk@0.8.7
  - @module-federation/runtime-core@0.6.15
  - @module-federation/error-codes@0.8.7

## 0.8.6

### Patch Changes

- @module-federation/sdk@0.8.6
- @module-federation/error-codes@0.8.6

## 0.8.5

### Patch Changes

- @module-federation/sdk@0.8.5
- @module-federation/error-codes@0.8.5

## 0.8.4

### Patch Changes

- @module-federation/sdk@0.8.4
- @module-federation/error-codes@0.8.4

## 0.8.3

### Patch Changes

- f817674: chore(runtime): remove duplicate registerRemotes warn
- Updated dependencies [8e172c8]
  - @module-federation/sdk@0.8.3
  - @module-federation/error-codes@0.8.3

## 0.8.2

### Patch Changes

- fa7a0bd: feat: add remote-entry script resource retry for retry-plugin
  - @module-federation/sdk@0.8.2
  - @module-federation/error-codes@0.8.2

## 0.8.1

### Patch Changes

- @module-federation/sdk@0.8.1
- @module-federation/error-codes@0.8.1

## 0.8.0

### Patch Changes

- @module-federation/sdk@0.8.0
- @module-federation/error-codes@0.8.0

## 0.7.7

### Patch Changes

- a960c88: fix(runtime): add define constant to help downgrade non-esm project
- e26d107: add @vite-ignore for dynamic import in loadEsmEntry
  - @module-federation/sdk@0.7.7
  - @module-federation/error-codes@0.7.7

## 0.7.6

### Patch Changes

- @module-federation/sdk@0.7.6
- @module-federation/error-codes@0.7.6

## 0.7.5

### Patch Changes

- @module-federation/sdk@0.7.5
- @module-federation/error-codes@0.7.5

## 0.7.4

### Patch Changes

- ff8ce29: feat: feat: support lifecycyle hooks in module-deferation bridge
  - @module-federation/sdk@0.7.4
  - @module-federation/error-codes@0.7.4

## 0.7.3

### Patch Changes

- 4ab9295: disable package json generation during build
- c2b1efa: fix: initializeSharing before load remote while shareStrategy is version first
- Updated dependencies [4ab9295]
  - @module-federation/error-codes@0.7.3
  - @module-federation/sdk@0.7.3

## 0.7.2

### Patch Changes

- @module-federation/sdk@0.7.2
- @module-federation/error-codes@0.7.2

## 0.7.1

### Patch Changes

- 66ba7b1: fix: clear globalLoading cache in node env
- 8712967: fix(runtime): use wrapper global instead of using globalThis directly
- Updated dependencies [6db4c5f]
  - @module-federation/sdk@0.7.1
  - @module-federation/error-codes@0.7.1

## 0.7.0

### Minor Changes

- 879ad87: pass all loaderHooks to loadEntry and fetch functions instead of just createScript

### Patch Changes

- 752537b: fix(runtime): use loaded or loading shared if sharedStrategy is loaded-first
- 54bfd1c: fix(runtime): use document.defaultView to get real window object to solve csp issue
- 206b56d: disable hoistTransitiveImports for better tree shake
- Updated dependencies [879ad87]
- Updated dependencies [4eb09e7]
- Updated dependencies [206b56d]
- Updated dependencies [849ef9c]
  - @module-federation/sdk@0.7.0
  - @module-federation/error-codes@0.7.0

## 0.6.16

### Patch Changes

- 024df60: disable hoistTransitiveImports for better tree shake
- Updated dependencies [f779188]
- Updated dependencies [024df60]
  - @module-federation/sdk@0.6.16

## 0.6.15

### Patch Changes

- ec31539: fix(retry-plugin): fix script retry logic to make error-boundary should render until script retry finished.
  - @module-federation/sdk@0.6.15

## 0.6.14

### Patch Changes

- ad605d2: chore: unified logger
- Updated dependencies [ad605d2]
  - @module-federation/sdk@0.6.14

## 0.6.13

### Patch Changes

- @module-federation/sdk@0.6.13

## 0.6.12

### Patch Changes

- @module-federation/sdk@0.6.12

## 0.6.11

### Patch Changes

- ea6d417: Replaced dynamic module import using `new Function` with a safer direct `import` call.

  - Removed usage of `new Function` to execute dynamic import
  - Implemented a direct async import with `/* webpackIgnore: true */` for proper bundler handling

- Updated dependencies [d5a3072]
  - @module-federation/sdk@0.6.11

## 0.6.10

### Patch Changes

- b704f30: fix(runtime): remove crossorigin attr from link tag which not preload success
- Updated dependencies [22a3b83]
  - @module-federation/sdk@0.6.10

## 0.6.9

### Patch Changes

- @module-federation/sdk@0.6.9

## 0.6.8

### Patch Changes

- 32db0ac: Manifest protocol to support more than global remote type
- 6c5f444: load entry to support delegate module responses
- fac6ecf: fix(runtime): catch init remote error in errorLoadRemote hook
- Updated dependencies [32db0ac]
  - @module-federation/sdk@0.6.8

## 0.6.7

### Patch Changes

- 9e32644: Added comprehensive integration tests for the API synchronization and enhanced the embedded module proxy implementation.

  - Added detailed integration tests for API consistency between embedded and index modules.
    - Tests include export comparison and method consistency for `FederationHost` and `Module` classes.
  - Introduced and updated the `embedded.ts` file to dynamically access the runtime modules at runtime.
    - Included detailed implementations for accessing and wrapping existing runtime functions.
  - Exposed the previously private `formatOptions` method in the `FederationHost` class publicly.
  - Enhanced error handling for uninstantiated or unregistered runtime access.

- 9e32644: - Refactor `embedded.ts` to use a proxy pattern for better runtime compatibility:
  - Implement FederationHost and Module classes that delegate to the actual runtime implementation
  - Expose all public methods and properties from the original classes
  - Use a lazy initialization approach to ensure proper runtime loading
  - Add comprehensive test suite for API synchronization between embedded.ts and index.ts
    - Introduce new test file `sync.spec.ts` with extensive tests for API compatibility
    - Ensure FederationHost and Module classes have the same methods in both files
    - Test various scenarios including remote loading, manifest handling, and circular dependencies
    - Modify `core.ts` to make `formatOptions` method public
- Updated dependencies [9e32644]
  - @module-federation/sdk@0.6.7

## 0.6.6

### Patch Changes

- @module-federation/sdk@0.6.6

## 0.6.5

### Patch Changes

- @module-federation/sdk@0.6.5

## 0.6.4

### Patch Changes

- @module-federation/sdk@0.6.4

## 0.6.3

### Patch Changes

- @module-federation/sdk@0.6.3

## 0.6.2

### Patch Changes

- 9f98292: fix(runtime): set loading if registeredShared not set
  - @module-federation/sdk@0.6.2

## 0.6.1

### Patch Changes

- 2855583: externalize swc helpers and add them as a dependency
- 813680f: Remove duplicated util functions and reference central ones in sdk
- Updated dependencies [2855583]
- Updated dependencies [813680f]
  - @module-federation/sdk@0.6.1

## 0.6.0

### Patch Changes

- Updated dependencies [1d9bb77]
  - @module-federation/sdk@0.6.0

## 0.5.2

### Patch Changes

- 24ba96e: fix: handle circular init shared
- b90fa7d: feat: add shareStrategy option
- Updated dependencies [b90fa7d]
  - @module-federation/sdk@0.5.2

## 0.5.1

### Patch Changes

- @module-federation/sdk@0.5.1

## 0.5.0

### Minor Changes

- 8378a77: feat(runtime): add loadEntry hook

### Patch Changes

- 5c7ac8a: provide error message when remote entry init fails
- Updated dependencies [8378a77]
  - @module-federation/sdk@0.5.0

## 0.4.0

### Minor Changes

- f2f02c9: provide users to mark shared module as loaded

### Patch Changes

- a6e2bed: fix: add attrs option to createLink hook
- Updated dependencies [a6e2bed]
- Updated dependencies [a6e2bed]
  - @module-federation/sdk@0.4.0

## 0.3.5

### Patch Changes

- @module-federation/sdk@0.3.5

## 0.3.4

### Patch Changes

- 67ea678: checking for remote entry type when loading assets
- d26d7e6: Ensured createScript runtime hook always receives `attrs`
  - @module-federation/sdk@0.3.4

## 0.3.3

### Patch Changes

- @module-federation/sdk@0.3.3

## 0.3.2

### Patch Changes

- @module-federation/sdk@0.3.2

## 0.3.1

### Patch Changes

- @module-federation/sdk@0.3.1

## 0.3.0

### Minor Changes

- fa37cc4: feat: support modern.js ssr [#2348](https://github.com/module-federation/core/issues/2348)

### Patch Changes

- Updated dependencies [fa37cc4]
  - @module-federation/sdk@0.3.0

## 0.2.8

### Patch Changes

- @module-federation/sdk@0.2.8

## 0.2.7

### Patch Changes

- Updated dependencies [b00ef13]
  - @module-federation/sdk@0.2.7

## 0.2.6

### Patch Changes

- Updated dependencies [91bf689]
  - @module-federation/sdk@0.2.6

## 0.2.5

### Patch Changes

- 8cce571: fix(runtime): Fixed an issue where script failed to load properly when static resources were set to cross-domain response headers due to the default setting of script crossorigin to anonymous (this issue appeared in next.js)
- Updated dependencies [8cce571]
  - @module-federation/sdk@0.2.5

## 0.2.4

### Patch Changes

- 60cd259: adding support for loading systemjs based remotes
- 09b792d: connect attrs to create script hook
- Updated dependencies [09b792d]
- Updated dependencies [09b792d]
  - @module-federation/sdk@0.2.4

## 0.2.3

### Patch Changes

- 32f26af: fix fetch hook types on runtime plugin interfaces
- Updated dependencies [32f26af]
- Updated dependencies [32f26af]
  - @module-federation/sdk@0.2.3

## 0.2.2

### Patch Changes

- @module-federation/sdk@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [88445e7]
  - @module-federation/sdk@0.2.1

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
