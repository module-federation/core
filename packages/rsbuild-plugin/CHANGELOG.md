# @module-federation/rsbuild-plugin

## 0.22.1

### Patch Changes

- @module-federation/enhanced@0.22.1
- @module-federation/sdk@0.22.1
- @module-federation/node@2.7.27

## 0.22.0

### Patch Changes

- @module-federation/enhanced@0.22.0
- @module-federation/sdk@0.22.0
- @module-federation/node@2.7.26

## 0.21.6

### Patch Changes

- b307ae0: fix(rsbuild-plugin): create different temp filepath to prevent invalid manifest.exposes
  - @module-federation/enhanced@0.21.6
  - @module-federation/sdk@0.21.6
  - @module-federation/node@2.7.25

## 0.21.5

### Patch Changes

- Updated dependencies [94d8868]
  - @module-federation/sdk@0.21.5
  - @module-federation/enhanced@0.21.5
  - @module-federation/node@2.7.24

## 0.21.4

### Patch Changes

- a50e068: refactor(manifest): collect assets from build hook
- Updated dependencies [a50e068]
  - @module-federation/enhanced@0.21.4
  - @module-federation/sdk@0.21.4
  - @module-federation/node@2.7.23

## 0.21.3

### Patch Changes

- @module-federation/node@2.7.22
- @module-federation/enhanced@0.21.3
- @module-federation/sdk@0.21.3

## 0.21.2

### Patch Changes

- @module-federation/enhanced@0.21.2
- @module-federation/node@2.7.21
- @module-federation/sdk@0.21.2

## 0.21.1

### Patch Changes

- @module-federation/enhanced@0.21.1
- @module-federation/sdk@0.21.1
- @module-federation/node@2.7.20

## 0.21.0

### Patch Changes

- Updated dependencies [d1e90a4]
  - @module-federation/sdk@0.21.0
  - @module-federation/enhanced@0.21.0
  - @module-federation/node@2.7.19

## 0.20.0

### Patch Changes

- b7872a1: refactor: migrate rsbuild-plugin build to rslib
- 639a83b: use TSC instead of SWC
- Updated dependencies [dcc290e]
- Updated dependencies [2eea0d0]
- Updated dependencies [25df940]
- Updated dependencies [22b9ff9]
- Updated dependencies [8a80605]
- Updated dependencies [c66c21e]
- Updated dependencies [37346d4]
- Updated dependencies [8038f61]
- Updated dependencies [639a83b]
  - @module-federation/enhanced@0.20.0
  - @module-federation/node@2.7.18
  - @module-federation/sdk@0.20.0

## 0.19.1

### Patch Changes

- Updated dependencies
  - @module-federation/sdk@0.19.1
  - @module-federation/enhanced@0.19.1
  - @module-federation/node@2.7.17

## 0.19.0

### Patch Changes

- @module-federation/enhanced@0.19.0
- @module-federation/sdk@0.19.0
- @module-federation/node@2.7.16

## 0.18.4

### Patch Changes

- 8061f8c: add sourcemaps to fix builds
- Updated dependencies [8061f8c]
  - @module-federation/sdk@0.18.4
  - @module-federation/enhanced@0.18.4
  - @module-federation/node@2.7.15

## 0.18.3

### Patch Changes

- @module-federation/enhanced@0.18.3
- @module-federation/sdk@0.18.3
- @module-federation/node@2.7.14

## 0.18.2

### Patch Changes

- 991f57c: fix(rsbuild-plugin): set output.emitAssets as true
- e110593: fix(rsbuild-plugin): invalid type field
- Updated dependencies [756750e]
- Updated dependencies [756750e]
- Updated dependencies [756750e]
  - @module-federation/enhanced@0.18.2
  - @module-federation/node@2.7.13
  - @module-federation/sdk@0.18.2

## 0.18.1

### Patch Changes

- 0bf3a3a: fix(rsbuild-plugin): add build dependencies configuration to project.json

  - Add dependsOn configuration to ensure dependencies are built before the plugin
  - Improves build reliability and fixes potential issues when dependencies haven't been built

- 0bf3a3a: fix(rsbuild-plugin): use detail source.include instead of range regexp
- Updated dependencies [0bf3a3a]
- Updated dependencies [0bf3a3a]
  - @module-federation/enhanced@0.18.1
  - @module-federation/node@2.7.12
  - @module-federation/sdk@0.18.1

## 0.18.0

### Patch Changes

- 38b8d24: fix(rsbuild-plugin): use detail source.include instead of range regexp
- Updated dependencies [0ab51b8]
- Updated dependencies [98a29c3]
- Updated dependencies [f6381e6]
  - @module-federation/enhanced@0.18.0
  - @module-federation/sdk@0.18.0
  - @module-federation/node@2.7.11

## 0.17.1

### Patch Changes

- bb953a6: fix: add missing vitest imports to rsbuild-plugin test file

  Fixes CI test failure by adding missing `describe`, `expect`, and `it` imports from vitest to the test file. This resolves the "ReferenceError: describe is not defined" error that was causing the rsbuild-plugin tests to fail.

- a7cf276: chore: upgrade NX to 21.2.3, Storybook to 9.0.9, and TypeScript to 5.8.3

  - Upgraded NX from 21.0.3 to 21.2.3 with workspace configuration updates
  - Migrated Storybook from 8.3.5 to 9.0.9 with updated configurations and automigrations
  - Upgraded TypeScript from 5.7.3 to 5.8.3 with compatibility fixes
  - Fixed package exports and type declaration paths across all packages
  - Resolved module resolution issues and TypeScript compatibility problems
  - Updated build configurations and dependencies to support latest versions

- d31a326: refactor: sink React packages from root to individual packages

  - Removed React dependencies from root package.json and moved them to packages that actually need them
  - Fixed rsbuild-plugin configuration to match workspace patterns
  - Updated tests to handle platform-specific files
  - This change improves dependency management by ensuring packages only have the dependencies they actually use

- Updated dependencies [bc3bc10]
- Updated dependencies [7000c1f]
- Updated dependencies [4ffefbe]
- Updated dependencies [a7cf276]
- Updated dependencies [1825b9d]
- Updated dependencies [8727aa3]
  - @module-federation/enhanced@0.17.1
  - @module-federation/sdk@0.17.1
  - @module-federation/node@2.7.10

## 0.17.0

### Patch Changes

- Updated dependencies [3f736b6]
  - @module-federation/node@2.7.9
  - @module-federation/enhanced@0.17.0
  - @module-federation/sdk@0.17.0

## 0.16.0

### Patch Changes

- 98136ca: fix(modern-js-plugin): use contenthash instead of chunkhash
- Updated dependencies [1485fcf]
- Updated dependencies [98136ca]
  - @module-federation/sdk@0.16.0
  - @module-federation/node@2.7.8
  - @module-federation/enhanced@0.16.0

## 0.15.0

### Patch Changes

- f777710: feat(rsbuild-plugin): support generate MF SSR in Rslib
- Updated dependencies [ad446af]
  - @module-federation/enhanced@0.15.0
  - @module-federation/node@2.7.7
  - @module-federation/sdk@0.15.0

## 0.14.3

### Patch Changes

- @module-federation/enhanced@0.14.3
- @module-federation/sdk@0.14.3

## 0.14.2

### Patch Changes

- @module-federation/enhanced@0.14.2
- @module-federation/sdk@0.14.2

## 0.14.1

### Patch Changes

- @module-federation/enhanced@0.14.1
- @module-federation/sdk@0.14.1

## 0.14.0

### Patch Changes

- 26f8a77: fix(rsbuild-plugin): detect server.cors option to check waring
- d237ab9: fix(rsbuild-plugin): judge options from orignal userConfig
- Updated dependencies [82b8cac]
- Updated dependencies [82b8cac]
- Updated dependencies [0eb6697]
  - @module-federation/enhanced@0.14.0
  - @module-federation/sdk@0.14.0

## 0.13.1

### Patch Changes

- @module-federation/enhanced@0.13.1
- @module-federation/sdk@0.13.1

## 0.13.0

### Patch Changes

- 38f324f: Disable live bindings on cjs builds of the runtime packages
- Updated dependencies [9efb9b9]
- Updated dependencies [38f324f]
  - @module-federation/enhanced@0.13.0
  - @module-federation/sdk@0.13.0

## 0.12.0

### Patch Changes

- Updated dependencies [f4fb242]
- Updated dependencies [f4fb242]
- Updated dependencies [f4fb242]
- Updated dependencies [c399b9a]
- Updated dependencies [ef96c4d]
- Updated dependencies [f4fb242]
- Updated dependencies [f4fb242]
  - @module-federation/enhanced@0.12.0
  - @module-federation/sdk@0.12.0

## 0.11.4

### Patch Changes

- Updated dependencies [64a2bc1]
- Updated dependencies [ebe7d89]
- Updated dependencies [c14842f]
  - @module-federation/sdk@0.11.4
  - @module-federation/enhanced@0.11.4

## 0.11.3

### Patch Changes

- @module-federation/enhanced@0.11.3
- @module-federation/sdk@0.11.3

## 0.11.2

### Patch Changes

- 60d1fc1: chore(rsbuild-plugin): revert sharedStrategy default value
- Updated dependencies [047857b]
  - @module-federation/sdk@0.11.2
  - @module-federation/enhanced@0.11.2

## 0.11.1

### Patch Changes

- Updated dependencies [09d6bc1]
  - @module-federation/enhanced@0.11.1
  - @module-federation/sdk@0.11.1

## 0.11.0

### Patch Changes

- f302eeb: chore(rsbuild-plugin): set 'loaded-first' as default shareStrategy
- Updated dependencies [fce107e]
- Updated dependencies [fce107e]
  - @module-federation/enhanced@0.11.0
  - @module-federation/sdk@0.11.0

## 0.10.0

### Patch Changes

- 5b391b5: chore(rsbuild-plugin): update mf format judgment conditions
- 1010f96: chore(modern-js-plugin): use bundlerChain instead of tools.webpack or tools.rspack
- 3c8bd83: fix(rsbuild-plugin): add more MF packages to `source.include`
- Updated dependencies [0f71cbc]
- Updated dependencies [22fcccd]
  - @module-federation/sdk@0.10.0
  - @module-federation/enhanced@0.10.0

## 0.9.1

### Patch Changes

- Updated dependencies [35d925b]
- Updated dependencies [35d925b]
- Updated dependencies [8acd217]
  - @module-federation/sdk@0.9.1
  - @module-federation/enhanced@0.9.1

## 0.9.0

### Patch Changes

- @module-federation/enhanced@0.9.0
- @module-federation/sdk@0.9.0

## 0.8.12

### Patch Changes

- Updated dependencies [9062cee]
  - @module-federation/enhanced@0.8.12
  - @module-federation/sdk@0.8.12

## 0.8.11

### Patch Changes

- @module-federation/enhanced@0.8.11
- @module-federation/sdk@0.8.11

## 0.8.10

### Patch Changes

- @module-federation/enhanced@0.8.10
- @module-federation/sdk@0.8.10

## 0.8.9

### Patch Changes

- Updated dependencies [6e3afc6]
  - @module-federation/enhanced@0.8.9
  - @module-federation/sdk@0.8.9

## 0.8.8

### Patch Changes

- Updated dependencies [eda5184]
  - @module-federation/enhanced@0.8.8
  - @module-federation/sdk@0.8.8

## 0.8.7

### Patch Changes

- Updated dependencies [835b09c]
- Updated dependencies [f573ad0]
- Updated dependencies [336f3d8]
- Updated dependencies [4fd33fb]
  - @module-federation/sdk@0.8.7
  - @module-federation/enhanced@0.8.7

## 0.8.6

### Patch Changes

- a1d46b7: chore(rsbuild-plugin): split setUp function to help extend
  - @module-federation/enhanced@0.8.6
  - @module-federation/sdk@0.8.6

## 0.8.5

### Patch Changes

- @module-federation/enhanced@0.8.5
- @module-federation/sdk@0.8.5

## 0.8.4

### Patch Changes

- @module-federation/enhanced@0.8.4
- @module-federation/sdk@0.8.4

## 0.8.3

### Patch Changes

- Updated dependencies [8e172c8]
  - @module-federation/sdk@0.8.3
  - @module-federation/enhanced@0.8.3

## 0.8.2

### Patch Changes

- @module-federation/enhanced@0.8.2
- @module-federation/sdk@0.8.2

## 0.8.1

### Patch Changes

- @module-federation/enhanced@0.8.1
- @module-federation/sdk@0.8.1

## 0.8.0

### Patch Changes

- @module-federation/enhanced@0.8.0
- @module-federation/sdk@0.8.0

## 0.7.7

### Patch Changes

- @module-federation/enhanced@0.7.7
- @module-federation/sdk@0.7.7

## 0.7.6

### Patch Changes

- @module-federation/enhanced@0.7.6
- @module-federation/sdk@0.7.6

## 0.7.5

### Patch Changes

- Updated dependencies [5613265]
  - @module-federation/enhanced@0.7.5
  - @module-federation/sdk@0.7.5

## 0.7.4

### Patch Changes

- @module-federation/enhanced@0.7.4
- @module-federation/sdk@0.7.4

## 0.7.3

### Patch Changes

- 4ab9295: disable package json generation during build
- Updated dependencies [4ab9295]
  - @module-federation/sdk@0.7.3
  - @module-federation/enhanced@0.7.3

## 0.7.2

### Patch Changes

- @module-federation/enhanced@0.7.2
- @module-federation/sdk@0.7.2

## 0.7.1

### Patch Changes

- 5fc6045: fix(rsbuild-plugin): remove duplicate logs for shared modules.
- Updated dependencies [6db4c5f]
- Updated dependencies [47fdbc2]
  - @module-federation/sdk@0.7.1
  - @module-federation/enhanced@0.7.1

## 0.7.0

### Minor Changes

- Updated dependencies [879ad87]
- Updated dependencies [4eb09e7]
- Updated dependencies [206b56d]
  - @module-federation/sdk@0.7.0
  - @module-federation/enhanced@0.7.0

## 0.6.16

### Patch Changes

- Updated dependencies [f779188]
- Updated dependencies [024df60]
  - @module-federation/sdk@0.6.16
  - @module-federation/enhanced@0.6.16

## 0.6.15

### Patch Changes

- @module-federation/enhanced@0.6.15
- @module-federation/sdk@0.6.15

## 0.6.14

### Patch Changes

- ad605d2: chore: unified logger
- Updated dependencies [ad605d2]
  - @module-federation/enhanced@0.6.14
  - @module-federation/sdk@0.6.14

## 0.6.13

### Patch Changes

- @module-federation/enhanced@0.6.13
- @module-federation/sdk@0.6.13

## 0.6.12

### Patch Changes

- cf14509: fix: configure the default assetPrefix for MF apps correctly
  - @module-federation/enhanced@0.6.12
  - @module-federation/sdk@0.6.12

## 0.0.2

### Patch Changes

- b41faaa: feat: support mf rsbuild plugin #[3062](https://github.com/module-federation/core/pull/3062)
- Updated dependencies [d5a3072]
  - @module-federation/sdk@0.6.11
  - @module-federation/enhanced@0.6.11
