# @module-federation/runtime

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
