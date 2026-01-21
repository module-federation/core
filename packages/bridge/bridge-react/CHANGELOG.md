# @module-federation/bridge-react

## 0.22.1

### Patch Changes

- @module-federation/sdk@0.22.1
- @module-federation/bridge-shared@0.22.1

## 0.22.0

### Patch Changes

- @module-federation/sdk@0.22.0
- @module-federation/bridge-shared@0.22.0

## 0.21.6

### Patch Changes

- @module-federation/sdk@0.21.6
- @module-federation/bridge-shared@0.21.6

## 0.21.5

### Patch Changes

- Updated dependencies [94d8868]
  - @module-federation/sdk@0.21.5
  - @module-federation/bridge-shared@0.21.5

## 0.21.4

### Patch Changes

- 444db72: fix(bridge-react): hoist BridgeWrapper to prevent component recreation
- Updated dependencies [a50e068]
  - @module-federation/sdk@0.21.4
  - @module-federation/bridge-shared@0.21.4

## 0.21.3

### Patch Changes

- @module-federation/sdk@0.21.3
- @module-federation/bridge-shared@0.21.3

## 0.21.2

### Patch Changes

- e98133e: feat: Re-export the exports of the v18/v19/plugin from @module-federation/bridge-react in modernjs
- dc103ee: fix: support React Router v6 in peer dependencies

  Update react-router peer dependency from "^7" to "^6 || ^7" to fix npm install failures for projects using React Router v6.

  - @module-federation/sdk@0.21.2
  - @module-federation/bridge-shared@0.21.2

## 0.21.1

### Patch Changes

- @module-federation/sdk@0.21.1
- @module-federation/bridge-shared@0.21.1

## 0.21.0

### Minor Changes

- d225658: feat: Add React Router v7 Support to Module Federation Bridge

### Patch Changes

- Updated dependencies [d1e90a4]
  - @module-federation/sdk@0.21.0
  - @module-federation/bridge-shared@0.21.0

## 0.20.0

### Patch Changes

- 0008621: test(bridge-react): stabilize async assertions for bridge tests
- Updated dependencies [37346d4]
- Updated dependencies [639a83b]
  - @module-federation/sdk@0.20.0
  - @module-federation/bridge-shared@0.20.0

## 0.19.1

### Patch Changes

- Updated dependencies
  - @module-federation/sdk@0.19.1
  - @module-federation/bridge-shared@0.19.1

## 0.19.0

### Patch Changes

- @module-federation/sdk@0.19.0
- @module-federation/bridge-shared@0.19.0

## 0.18.4

### Patch Changes

- Updated dependencies [8061f8c]
  - @module-federation/sdk@0.18.4
  - @module-federation/bridge-shared@0.18.4

## 0.18.3

### Patch Changes

- @module-federation/sdk@0.18.3
- @module-federation/bridge-shared@0.18.3

## 0.18.2

### Patch Changes

- @module-federation/sdk@0.18.2
- @module-federation/bridge-shared@0.18.2

## 0.18.1

### Patch Changes

- 8004e95: fix(bridge-react): correct createRemoteComponent warning info
- 765b448: fix(bridge-react): call preloadAssets after getting assets
- Updated dependencies [0bf3a3a]
  - @module-federation/sdk@0.18.1
  - @module-federation/bridge-shared@0.18.1

## 0.18.0

### Patch Changes

- Updated dependencies [f6381e6]
  - @module-federation/sdk@0.18.0
  - @module-federation/bridge-shared@0.18.0

## 0.17.1

### Patch Changes

- 65aa038: chore(bridge-react): set sideEffects false
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

- Updated dependencies [a7cf276]
- Updated dependencies [d31a326]
  - @module-federation/sdk@0.17.1
  - @module-federation/bridge-shared@0.17.1

## 0.17.0

### Minor Changes

- e874c64: refactor(bridge-react): rename createRemoteComponent as createRemoteAppComponent

### Patch Changes

- e874c64: feat(bridge-react): export createLazyCompoent api
- 3f736b6: chore: rename FederationHost to ModuleFederation
  - @module-federation/sdk@0.17.0
  - @module-federation/bridge-shared@0.17.0

## 0.16.0

### Patch Changes

- Updated dependencies [1485fcf]
  - @module-federation/sdk@0.16.0
  - @module-federation/bridge-shared@0.16.0

## 0.15.0

### Patch Changes

- @module-federation/sdk@0.15.0
- @module-federation/bridge-shared@0.15.0

## 0.14.3

### Patch Changes

- @module-federation/sdk@0.14.3
- @module-federation/bridge-shared@0.14.3

## 0.14.2

### Patch Changes

- @module-federation/sdk@0.14.2
- @module-federation/bridge-shared@0.14.2

## 0.14.1

### Patch Changes

- @module-federation/sdk@0.14.1
- @module-federation/bridge-shared@0.14.1

## 0.14.0

### Patch Changes

- Updated dependencies [82b8cac]
- Updated dependencies [677aac9]
  - @module-federation/sdk@0.14.0
  - @module-federation/bridge-shared@0.14.0

## 0.13.1

### Patch Changes

- @module-federation/sdk@0.13.1
- @module-federation/bridge-shared@0.13.1

## 0.13.0

### Minor Changes

- 88a018d: feat(react-bridge): Add native support for React 19 in bridge-react with enhanced createRoot options

### Patch Changes

- 88a018d: feat(bridge-react): support react v19 in react compat file.
- 4db1b0e: feat: add error detection for react v19 under the default export createBaseBridgeComponent
- 38f324f: Disable live bindings on cjs builds of the runtime packages
- 0eb6d1b: refactor(bridge-react): modify the default mode of the bridge to legacy mode to reduce redundant code
- Updated dependencies [38f324f]
  - @module-federation/bridge-shared@0.13.0
  - @module-federation/sdk@0.13.0

## 0.12.0

### Patch Changes

- Updated dependencies [c399b9a]
- Updated dependencies [ef96c4d]
- Updated dependencies [f4fb242]
  - @module-federation/sdk@0.12.0
  - @module-federation/bridge-shared@0.12.0

## 0.11.4

### Patch Changes

- Updated dependencies [64a2bc1]
- Updated dependencies [c14842f]
  - @module-federation/sdk@0.11.4
  - @module-federation/bridge-shared@0.11.4

## 0.11.3

### Patch Changes

- @module-federation/sdk@0.11.3
- @module-federation/bridge-shared@0.11.3

## 0.11.2

### Patch Changes

- f4f843d: remove @loadable/component from package.json
- Updated dependencies [047857b]
  - @module-federation/sdk@0.11.2
  - @module-federation/bridge-shared@0.11.2

## 0.11.1

### Patch Changes

- 790bdea: fix(bridge-react): export DestroyParams and RenderParams types
  - @module-federation/sdk@0.11.1
  - @module-federation/bridge-shared@0.11.1

## 0.11.0

### Patch Changes

- 4d67b8f: feat(bridge-react): enable custom createRoot in bridge-react
- 2d086fc: Fix react-bridge version check for React versions earlier than 16.13.0
- 4d67b8f: refactor(bridge-react): centralize type definitions into a single file for better maintainability and consistency
- Updated dependencies [fce107e]
  - @module-federation/sdk@0.11.0
  - @module-federation/bridge-shared@0.11.0

## 0.10.0

### Minor Changes

- 578aa43: fix(bridge-react): prevent destroy/render the remote component every time after the states changed

### Patch Changes

- Updated dependencies [0f71cbc]
- Updated dependencies [22fcccd]
  - @module-federation/sdk@0.10.0
  - @module-federation/bridge-shared@0.10.0

## 0.9.1

### Patch Changes

- Updated dependencies [35d925b]
- Updated dependencies [35d925b]
- Updated dependencies [8acd217]
  - @module-federation/sdk@0.9.1
  - @module-federation/bridge-shared@0.9.1

## 0.9.0

### Patch Changes

- @module-federation/sdk@0.9.0
- @module-federation/bridge-shared@0.9.0

## 0.8.12

### Patch Changes

- 4ef21d2: chore: adjust bridge-react to structure directory
  - @module-federation/sdk@0.8.12
  - @module-federation/bridge-shared@0.8.12

## 0.8.11

### Patch Changes

- 646314d: fix: the bridge-react package was failing when used with React 16 due to missing react-dom/client module
  - @module-federation/sdk@0.8.11
  - @module-federation/bridge-shared@0.8.11

## 0.8.10

### Patch Changes

- e751ad0: change rollup config to prevent react-dom/client code being bundled into the bridge-react package
  - @module-federation/sdk@0.8.10
  - @module-federation/bridge-shared@0.8.10

## 0.8.9

### Patch Changes

- @module-federation/sdk@0.8.9
- @module-federation/bridge-shared@0.8.9

## 0.8.8

### Patch Changes

- @module-federation/sdk@0.8.8
- @module-federation/bridge-shared@0.8.8

## 0.8.7

### Patch Changes

- 4102786: feat: support basename passed by remote module props
- Updated dependencies [835b09c]
- Updated dependencies [336f3d8]
- Updated dependencies [4fd33fb]
  - @module-federation/sdk@0.8.7
  - @module-federation/bridge-shared@0.8.7

## 0.8.6

### Patch Changes

- 85e7482: fix(bridge-react): change all logs from info to debug in all bridge packages
  - @module-federation/sdk@0.8.6
  - @module-federation/bridge-shared@0.8.6

## 0.8.5

### Patch Changes

- @module-federation/sdk@0.8.5
- @module-federation/bridge-shared@0.8.5

## 0.8.4

### Patch Changes

- @module-federation/sdk@0.8.4
- @module-federation/bridge-shared@0.8.4

## 0.8.3

### Patch Changes

- Updated dependencies [8e172c8]
  - @module-federation/sdk@0.8.3
  - @module-federation/bridge-shared@0.8.3

## 0.8.2

### Patch Changes

- @module-federation/sdk@0.8.2
- @module-federation/bridge-shared@0.8.2

## 0.8.1

### Patch Changes

- @module-federation/sdk@0.8.1
- @module-federation/bridge-shared@0.8.1

## 0.8.0

### Patch Changes

- 542164e: chore(bridge-react): set react-router-dom peer version to >=4 <7
  - @module-federation/sdk@0.8.0
  - @module-federation/bridge-shared@0.8.0

## 0.7.7

### Patch Changes

- ae5ee1e: feat: mount bridge api to module instance
  - @module-federation/sdk@0.7.7
  - @module-federation/bridge-shared@0.7.7

## 0.7.6

### Patch Changes

- @module-federation/runtime@0.7.6
- @module-federation/sdk@0.7.6
- @module-federation/bridge-shared@0.7.6

## 0.7.5

### Patch Changes

- 0309fb5: fix: wrap try catch with react-router-dom path resolve
  - @module-federation/runtime@0.7.5
  - @module-federation/sdk@0.7.5
  - @module-federation/bridge-shared@0.7.5

## 0.7.4

### Patch Changes

- ff8ce29: feat: feat: support lifecycyle hooks in module-deferation bridge
- Updated dependencies [ff8ce29]
  - @module-federation/runtime@0.7.4
  - @module-federation/sdk@0.7.4
  - @module-federation/bridge-shared@0.7.4

## 0.7.3

### Patch Changes

- Updated dependencies [4ab9295]
  - @module-federation/sdk@0.7.3
  - @module-federation/bridge-shared@0.7.3

## 0.7.2

### Patch Changes

- @module-federation/sdk@0.7.2
- @module-federation/bridge-shared@0.7.2

## 0.7.1

### Patch Changes

- Updated dependencies [6db4c5f]
  - @module-federation/sdk@0.7.1
  - @module-federation/bridge-shared@0.7.1

## 0.7.0

### Minor Changes

- 3942740: add license information
- Updated dependencies [879ad87]
- Updated dependencies [4eb09e7]
- Updated dependencies [3942740]
- Updated dependencies [206b56d]
  - @module-federation/sdk@0.7.0
  - @module-federation/bridge-shared@0.7.0

## 0.6.16

### Patch Changes

- Updated dependencies [f779188]
- Updated dependencies [024df60]
  - @module-federation/sdk@0.6.16
  - @module-federation/bridge-shared@0.6.16

## 0.6.15

### Patch Changes

- @module-federation/sdk@0.6.15
- @module-federation/bridge-shared@0.6.15

## 0.6.14

### Patch Changes

- ad605d2: chore: unified logger
- Updated dependencies [ad605d2]
  - @module-federation/bridge-shared@0.6.14
  - @module-federation/sdk@0.6.14

## 0.6.13

### Patch Changes

- @module-federation/bridge-shared@0.6.13

## 0.6.12

### Patch Changes

- @module-federation/bridge-shared@0.6.12

## 0.6.11

### Patch Changes

- @module-federation/bridge-shared@0.6.11

## 0.6.10

### Patch Changes

- 8a77291: fix(bridge-react): add default basename for WraperRouterProvider
  - @module-federation/bridge-shared@0.6.10

## 0.6.9

### Patch Changes

- @module-federation/bridge-shared@0.6.9

## 0.6.8

### Patch Changes

- @module-federation/bridge-shared@0.6.8

## 0.6.7

### Patch Changes

- @module-federation/bridge-shared@0.6.7

## 0.6.6

### Patch Changes

- @module-federation/bridge-shared@0.6.6

## 0.6.5

### Patch Changes

- @module-federation/bridge-shared@0.6.5

## 0.6.4

### Patch Changes

- @module-federation/bridge-shared@0.6.4

## 0.6.3

### Patch Changes

- @module-federation/bridge-shared@0.6.3

## 0.6.2

### Patch Changes

- @module-federation/bridge-shared@0.6.2

## 0.6.1

### Patch Changes

- @module-federation/bridge-shared@0.6.1

## 0.6.0

### Patch Changes

- @module-federation/bridge-shared@0.6.0

## 0.5.2

### Patch Changes

- @module-federation/bridge-shared@0.5.2

## 0.5.1

### Patch Changes

- @module-federation/bridge-shared@0.5.1

## 0.5.0

### Patch Changes

- 49d6135: feat(@module-federation/bridge): enhance Bridge capabilities and fix some issues
- Updated dependencies [49d6135]
  - @module-federation/bridge-shared@0.5.0

## 0.4.0

### Patch Changes

- @module-federation/bridge-shared@0.4.0

## 0.3.5

### Patch Changes

- @module-federation/bridge-shared@0.3.5

## 0.3.4

### Patch Changes

- @module-federation/bridge-shared@0.3.4

## 0.3.3

### Patch Changes

- @module-federation/bridge-shared@0.3.3

## 0.3.2

### Patch Changes

- @module-federation/bridge-shared@0.3.2

## 0.3.1

### Patch Changes

- @module-federation/bridge-shared@0.3.1

## 0.3.0

### Patch Changes

- @module-federation/bridge-shared@0.3.0

## 0.2.8

### Patch Changes

- @module-federation/bridge-shared@0.2.8

## 0.2.7

### Patch Changes

- @module-federation/bridge-shared@0.2.7

## 0.2.6

### Patch Changes

- @module-federation/bridge-shared@0.2.6

## 0.2.5

### Patch Changes

- @module-federation/bridge-shared@0.2.5

## 0.2.4

### Patch Changes

- @module-federation/bridge-shared@0.2.4

## 0.2.3

### Patch Changes

- @module-federation/bridge-shared@0.2.3

## 0.2.2

### Patch Changes

- @module-federation/bridge-shared@0.2.2

## 0.2.1

### Patch Changes

- @module-federation/bridge-shared@0.2.1

## 0.2.0

### Minor Changes

- d2ab821: feat(bridge): Supports exporting and loading of application-level modules (with routing), currently supports react and vue3

### Patch Changes

- Updated dependencies [d2ab821]
  - @module-federation/bridge-shared@0.2.0
