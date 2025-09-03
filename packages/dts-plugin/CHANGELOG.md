# @module-federation/dts-plugin

## 0.18.3

### Patch Changes

- @module-federation/sdk@0.18.3
- @module-federation/managers@0.18.3
- @module-federation/third-party-dts-extractor@0.18.3
- @module-federation/error-codes@0.18.3

## 0.18.2

### Patch Changes

- 297c9a7: chore: bump axios to resolve vulnerabilities in form-data dependency
  - @module-federation/sdk@0.18.2
  - @module-federation/managers@0.18.2
  - @module-federation/third-party-dts-extractor@0.18.2
  - @module-federation/error-codes@0.18.2

## 0.18.1

### Patch Changes

- Updated dependencies [0bf3a3a]
  - @module-federation/sdk@0.18.1
  - @module-federation/managers@0.18.1
  - @module-federation/third-party-dts-extractor@0.18.1
  - @module-federation/error-codes@0.18.1

## 0.18.0

### Minor Changes

- f6381e6: Added `family` option to DTS plugin

### Patch Changes

- 08f089a: fix(dts-plugin): update koa to 2.16.2 to fix CVE-2025-8129

  Security fix for open redirect vulnerability (GHSA-jgmv-j7ww-jx2x) in koa dependency.
  Updates koa from 2.16.1 to 2.16.2 to prevent attackers from manipulating the Referrer
  header in koa's back redirect functionality. Version 2.16.2 restricts redirects to
  same-origin only, preventing malicious external redirects.

- Updated dependencies [f6381e6]
  - @module-federation/sdk@0.18.0
  - @module-federation/managers@0.18.0
  - @module-federation/third-party-dts-extractor@0.18.0
  - @module-federation/error-codes@0.18.0

## 0.17.1

### Patch Changes

- a7cf276: chore: upgrade NX to 21.2.3, Storybook to 9.0.9, and TypeScript to 5.8.3

  - Upgraded NX from 21.0.3 to 21.2.3 with workspace configuration updates
  - Migrated Storybook from 8.3.5 to 9.0.9 with updated configurations and automigrations
  - Upgraded TypeScript from 5.7.3 to 5.8.3 with compatibility fixes
  - Fixed package exports and type declaration paths across all packages
  - Resolved module resolution issues and TypeScript compatibility problems
  - Updated build configurations and dependencies to support latest versions

- Updated dependencies [7000c1f]
- Updated dependencies [2428be0]
- Updated dependencies [a7cf276]
- Updated dependencies [d31a326]
  - @module-federation/managers@0.17.1
  - @module-federation/error-codes@0.17.1
  - @module-federation/sdk@0.17.1
  - @module-federation/third-party-dts-extractor@0.17.1

## 0.17.0

### Patch Changes

- 1d691ef: fix(dts-plugin): add expose file imported files to tsconfig files
  - @module-federation/sdk@0.17.0
  - @module-federation/managers@0.17.0
  - @module-federation/third-party-dts-extractor@0.17.0
  - @module-federation/error-codes@0.17.0

## 0.16.0

### Minor Changes

- 1485fcf: added flag to fetch types from remote when building in production.

### Patch Changes

- Updated dependencies [1485fcf]
  - @module-federation/sdk@0.16.0
  - @module-federation/managers@0.16.0
  - @module-federation/third-party-dts-extractor@0.16.0
  - @module-federation/error-codes@0.16.0

## 0.15.0

### Patch Changes

- c343589: fix(dts-plugin): only inject ipv4 str in dev mode
- b5e1640: chore(dts-plugin): check types archive url and optimize the error msg
  - @module-federation/sdk@0.15.0
  - @module-federation/managers@0.15.0
  - @module-federation/third-party-dts-extractor@0.15.0
  - @module-federation/error-codes@0.15.0

## 0.14.3

### Patch Changes

- @module-federation/sdk@0.14.3
- @module-federation/managers@0.14.3
- @module-federation/third-party-dts-extractor@0.14.3
- @module-federation/error-codes@0.14.3

## 0.14.2

### Patch Changes

- @module-federation/sdk@0.14.2
- @module-federation/managers@0.14.2
- @module-federation/third-party-dts-extractor@0.14.2
- @module-federation/error-codes@0.14.2

## 0.14.1

### Patch Changes

- @module-federation/sdk@0.14.1
- @module-federation/managers@0.14.1
- @module-federation/third-party-dts-extractor@0.14.1
- @module-federation/error-codes@0.14.1

## 0.14.0

### Patch Changes

- 0eb6697: fix(dts-plugin): add dynamic-remote-type-hints-plugin to runtimePlugins if not disable
- Updated dependencies [82b8cac]
  - @module-federation/sdk@0.14.0
  - @module-federation/managers@0.14.0
  - @module-federation/third-party-dts-extractor@0.14.0
  - @module-federation/error-codes@0.14.0

## 0.13.1

### Patch Changes

- Updated dependencies [723d0f8]
- Updated dependencies [129dac6]
  - @module-federation/third-party-dts-extractor@0.13.1
  - @module-federation/managers@0.13.1
  - @module-federation/sdk@0.13.1
  - @module-federation/error-codes@0.13.1

## 0.13.0

### Patch Changes

- 38f324f: Disable live bindings on cjs builds of the runtime packages
- Updated dependencies [38f324f]
  - @module-federation/third-party-dts-extractor@0.13.0
  - @module-federation/error-codes@0.13.0
  - @module-federation/managers@0.13.0
  - @module-federation/sdk@0.13.0

## 0.12.0

### Patch Changes

- ebef2d0: chore(dts-plugin): optimize type-001 message
- ef96c4d: feat(dts-plugin): support exclude extract specify third party dts
- Updated dependencies [c399b9a]
- Updated dependencies [ef96c4d]
- Updated dependencies [f4fb242]
  - @module-federation/sdk@0.12.0
  - @module-federation/third-party-dts-extractor@0.12.0
  - @module-federation/managers@0.12.0
  - @module-federation/error-codes@0.12.0

## 0.11.4

### Patch Changes

- ed8bda3: remove query strings from exposed modules to fix tsc resolves
- Updated dependencies [64a2bc1]
- Updated dependencies [c14842f]
  - @module-federation/sdk@0.11.4
  - @module-federation/managers@0.11.4
  - @module-federation/third-party-dts-extractor@0.11.4
  - @module-federation/error-codes@0.11.4

## 0.11.3

### Patch Changes

- e2c0a89: fix(dts-plugin): add recursive:true while generate types hit cache
  - @module-federation/sdk@0.11.3
  - @module-federation/managers@0.11.3
  - @module-federation/third-party-dts-extractor@0.11.3
  - @module-federation/error-codes@0.11.3

## 0.11.2

### Patch Changes

- Updated dependencies [047857b]
  - @module-federation/sdk@0.11.2
  - @module-federation/managers@0.11.2
  - @module-federation/third-party-dts-extractor@0.11.2
  - @module-federation/error-codes@0.11.2

## 0.11.1

### Patch Changes

- @module-federation/sdk@0.11.1
- @module-federation/managers@0.11.1
- @module-federation/third-party-dts-extractor@0.11.1
- @module-federation/error-codes@0.11.1

## 0.11.0

### Patch Changes

- eecee74: use `cwd` to create Module Federation tsconfig
- Updated dependencies [fce107e]
  - @module-federation/sdk@0.11.0
  - @module-federation/managers@0.11.0
  - @module-federation/third-party-dts-extractor@0.11.0
  - @module-federation/error-codes@0.11.0

## 0.10.0

### Patch Changes

- 22fcccd: perf(dts-plugin): add fetch timeout and add log
- Updated dependencies [0f71cbc]
- Updated dependencies [22fcccd]
  - @module-federation/sdk@0.10.0
  - @module-federation/managers@0.10.0
  - @module-federation/third-party-dts-extractor@0.10.0
  - @module-federation/error-codes@0.10.0

## 0.9.1

### Patch Changes

- 35d925b: feat(dts-plugin): support remoteTypeUrls option which allow user to specify the remote types url
- 35d925b: fix(dts-plugin): support parse @scope@manifest-url.json entry
- 7a37360: fix(dts-plugin): consume api types if adding new one
- Updated dependencies [35d925b]
- Updated dependencies [35d925b]
- Updated dependencies [8acd217]
  - @module-federation/sdk@0.9.1
  - @module-federation/managers@0.9.1
  - @module-federation/third-party-dts-extractor@0.9.1
  - @module-federation/error-codes@0.9.1

## 0.9.0

### Minor Changes

- 5ebc53f: feat: enable tsc incremental build

### Patch Changes

- d872b35: fix(dts-plugin): cache file should have name as its unique path
  - @module-federation/sdk@0.9.0
  - @module-federation/managers@0.9.0
  - @module-federation/third-party-dts-extractor@0.9.0
  - @module-federation/error-codes@0.9.0

## 0.8.12

### Patch Changes

- d227303: fix(dts-plugin): only block build process in prod env when generating types
  - @module-federation/sdk@0.8.12
  - @module-federation/managers@0.8.12
  - @module-federation/third-party-dts-extractor@0.8.12
  - @module-federation/error-codes@0.8.12

## 0.8.11

### Patch Changes

- @module-federation/sdk@0.8.11
- @module-federation/managers@0.8.11
- @module-federation/third-party-dts-extractor@0.8.11
- @module-federation/error-codes@0.8.11

## 0.8.10

### Patch Changes

- @module-federation/sdk@0.8.10
- @module-federation/managers@0.8.10
- @module-federation/third-party-dts-extractor@0.8.10
- @module-federation/error-codes@0.8.10

## 0.8.9

### Patch Changes

- 6e3afc6: feat(dts-plugin): support pass headers when request types url
- 1be9d62: feat(dts-plugin): add dts.displayErrorInTerminal to help control display error
- 6e3afc6: fix(dts-plugin): set outputDir default value
- 6e3afc6: fix(dts-plugin): use remoteTarPath first to fetch hot types
- 6e3afc6: fix(dts-plugin): only consume types in dev
- 6e3afc6: fix(dts-plugin): throw error while downloading types archive hit historyApiFallback
- 6e3afc6: fix(dts-plugin): generateTypes should after consumeTypes finished
- 6e3afc6: fix(dts-plugin): dev plugin should apply after fetchPromise resolved
  - @module-federation/sdk@0.8.9
  - @module-federation/managers@0.8.9
  - @module-federation/third-party-dts-extractor@0.8.9
  - @module-federation/error-codes@0.8.9

## 0.8.8

### Patch Changes

- @module-federation/sdk@0.8.8
- @module-federation/managers@0.8.8
- @module-federation/third-party-dts-extractor@0.8.8
- @module-federation/error-codes@0.8.8

## 0.8.7

### Patch Changes

- Updated dependencies [835b09c]
- Updated dependencies [336f3d8]
- Updated dependencies [4fd33fb]
  - @module-federation/sdk@0.8.7
  - @module-federation/error-codes@0.8.7
  - @module-federation/managers@0.8.7
  - @module-federation/third-party-dts-extractor@0.8.7

## 0.8.6

### Patch Changes

- c90bba2: fix(dts-plugin): auto inject compiler output path to avoid duplicate zip file
  - @module-federation/sdk@0.8.6
  - @module-federation/managers@0.8.6
  - @module-federation/third-party-dts-extractor@0.8.6
  - @module-federation/error-codes@0.8.6

## 0.8.5

### Patch Changes

- @module-federation/sdk@0.8.5
- @module-federation/managers@0.8.5
- @module-federation/third-party-dts-extractor@0.8.5
- @module-federation/error-codes@0.8.5

## 0.8.4

### Patch Changes

- 5ea7aea: Lazy emit DTS files on hmr rebuilds, do not block compiler pipeline
  - @module-federation/sdk@0.8.4
  - @module-federation/managers@0.8.4
  - @module-federation/third-party-dts-extractor@0.8.4
  - @module-federation/error-codes@0.8.4

## 0.8.3

### Patch Changes

- 8e172c8: add `cwd` property to generate types
- Updated dependencies [8e172c8]
  - @module-federation/sdk@0.8.3
  - @module-federation/managers@0.8.3
  - @module-federation/third-party-dts-extractor@0.8.3
  - @module-federation/error-codes@0.8.3

## 0.8.2

### Patch Changes

- @module-federation/sdk@0.8.2
- @module-federation/managers@0.8.2
- @module-federation/third-party-dts-extractor@0.8.2
- @module-federation/error-codes@0.8.2

## 0.8.1

### Patch Changes

- @module-federation/sdk@0.8.1
- @module-federation/managers@0.8.1
- @module-federation/third-party-dts-extractor@0.8.1
- @module-federation/error-codes@0.8.1

## 0.8.0

### Patch Changes

- @module-federation/sdk@0.8.0
- @module-federation/managers@0.8.0
- @module-federation/third-party-dts-extractor@0.8.0
- @module-federation/error-codes@0.8.0

## 0.7.7

### Patch Changes

- 8db7611: ensure when dev is false that type generation only runs once
  - @module-federation/sdk@0.7.7
  - @module-federation/managers@0.7.7
  - @module-federation/third-party-dts-extractor@0.7.7
  - @module-federation/error-codes@0.7.7

## 0.7.6

### Patch Changes

- @module-federation/sdk@0.7.6
- @module-federation/managers@0.7.6
- @module-federation/third-party-dts-extractor@0.7.6
- @module-federation/error-codes@0.7.6

## 0.7.5

### Patch Changes

- @module-federation/sdk@0.7.5
- @module-federation/managers@0.7.5
- @module-federation/third-party-dts-extractor@0.7.5
- @module-federation/error-codes@0.7.5

## 0.7.4

### Patch Changes

- @module-federation/sdk@0.7.4
- @module-federation/managers@0.7.4
- @module-federation/third-party-dts-extractor@0.7.4
- @module-federation/error-codes@0.7.4

## 0.7.3

### Patch Changes

- Updated dependencies [4ab9295]
- Updated dependencies [7facc10]
  - @module-federation/error-codes@0.7.3
  - @module-federation/managers@0.7.3
  - @module-federation/sdk@0.7.3
  - @module-federation/third-party-dts-extractor@0.7.3

## 0.7.2

### Patch Changes

- 85990e2: fix(dts-plugin): hold the broker server if the remote not start locally
  - @module-federation/sdk@0.7.2
  - @module-federation/managers@0.7.2
  - @module-federation/third-party-dts-extractor@0.7.2
  - @module-federation/error-codes@0.7.2

## 0.7.1

### Patch Changes

- Updated dependencies [6db4c5f]
  - @module-federation/sdk@0.7.1
  - @module-federation/managers@0.7.1
  - @module-federation/third-party-dts-extractor@0.7.1
  - @module-federation/error-codes@0.7.1

## 0.7.0

### Minor Changes

- Updated dependencies [879ad87]
- Updated dependencies [4eb09e7]
- Updated dependencies [206b56d]
- Updated dependencies [849ef9c]
  - @module-federation/sdk@0.7.0
  - @module-federation/managers@0.7.0
  - @module-federation/error-codes@0.7.0
  - @module-federation/third-party-dts-extractor@0.7.0

## 0.6.16

### Patch Changes

- Updated dependencies [f779188]
- Updated dependencies [024df60]
  - @module-federation/sdk@0.6.16
  - @module-federation/managers@0.6.16
  - @module-federation/third-party-dts-extractor@0.6.16

## 0.6.15

### Patch Changes

- @module-federation/sdk@0.6.15
- @module-federation/managers@0.6.15
- @module-federation/third-party-dts-extractor@0.6.15

## 0.6.14

### Patch Changes

- ad605d2: chore: unified logger
- Updated dependencies [ad605d2]
  - @module-federation/managers@0.6.14
  - @module-federation/sdk@0.6.14
  - @module-federation/third-party-dts-extractor@0.6.14

## 0.6.13

### Patch Changes

- @module-federation/sdk@0.6.13
- @module-federation/managers@0.6.13
- @module-federation/third-party-dts-extractor@0.6.13

## 0.6.12

### Patch Changes

- @module-federation/sdk@0.6.12
- @module-federation/managers@0.6.12
- @module-federation/third-party-dts-extractor@0.6.12

## 0.6.11

### Patch Changes

- Updated dependencies [d5a3072]
  - @module-federation/sdk@0.6.11
  - @module-federation/managers@0.6.11
  - @module-federation/third-party-dts-extractor@0.6.11

## 0.6.10

### Patch Changes

- Updated dependencies [22a3b83]
  - @module-federation/sdk@0.6.10
  - @module-federation/managers@0.6.10
  - @module-federation/third-party-dts-extractor@0.6.10

## 0.6.9

### Patch Changes

- @module-federation/sdk@0.6.9
- @module-federation/managers@0.6.9
- @module-federation/third-party-dts-extractor@0.6.9

## 0.6.8

### Patch Changes

- Updated dependencies [32db0ac]
  - @module-federation/sdk@0.6.8
  - @module-federation/managers@0.6.8
  - @module-federation/third-party-dts-extractor@0.6.8

## 0.6.7

### Patch Changes

- 0216364: fix(dts-plugin): ignore .vue ext
- Updated dependencies [9e32644]
  - @module-federation/sdk@0.6.7
  - @module-federation/managers@0.6.7
  - @module-federation/third-party-dts-extractor@0.6.7

## 0.6.6

### Patch Changes

- 35aead4: fix(dts-plugin): zipName should add prefix if remoteEntry has it
  - @module-federation/sdk@0.6.6
  - @module-federation/managers@0.6.6
  - @module-federation/third-party-dts-extractor@0.6.6

## 0.6.5

### Patch Changes

- @module-federation/sdk@0.6.5
- @module-federation/managers@0.6.5
- @module-federation/third-party-dts-extractor@0.6.5

## 0.6.4

### Patch Changes

- @module-federation/sdk@0.6.4
- @module-federation/managers@0.6.4
- @module-federation/third-party-dts-extractor@0.6.4

## 0.6.3

### Patch Changes

- @module-federation/sdk@0.6.3
- @module-federation/managers@0.6.3
- @module-federation/third-party-dts-extractor@0.6.3

## 0.6.2

### Patch Changes

- @module-federation/sdk@0.6.2
- @module-federation/managers@0.6.2
- @module-federation/third-party-dts-extractor@0.6.2

## 0.6.1

### Patch Changes

- Updated dependencies [2855583]
- Updated dependencies [813680f]
  - @module-federation/sdk@0.6.1
  - @module-federation/managers@0.6.1
  - @module-federation/third-party-dts-extractor@0.6.1

## 0.6.0

### Patch Changes

- Updated dependencies [1d9bb77]
  - @module-federation/sdk@0.6.0
  - @module-federation/managers@0.6.0
  - @module-federation/third-party-dts-extractor@0.6.0

## 0.5.2

### Patch Changes

- Updated dependencies [b90fa7d]
  - @module-federation/sdk@0.5.2
  - @module-federation/managers@0.5.2
  - @module-federation/third-party-dts-extractor@0.5.2

## 0.5.1

### Patch Changes

- @module-federation/sdk@0.5.1
- @module-federation/managers@0.5.1
- @module-federation/third-party-dts-extractor@0.5.1

## 0.5.0

### Patch Changes

- Updated dependencies [8378a77]
  - @module-federation/sdk@0.5.0
  - @module-federation/managers@0.5.0
  - @module-federation/third-party-dts-extractor@0.5.0

## 0.4.0

### Patch Changes

- Updated dependencies [a6e2bed]
- Updated dependencies [a6e2bed]
  - @module-federation/sdk@0.4.0
  - @module-federation/managers@0.4.0
  - @module-federation/third-party-dts-extractor@0.4.0

## 0.3.5

### Patch Changes

- @module-federation/sdk@0.3.5
- @module-federation/managers@0.3.5
- @module-federation/third-party-dts-extractor@0.3.5

## 0.3.4

### Patch Changes

- @module-federation/sdk@0.3.4
- @module-federation/managers@0.3.4
- @module-federation/third-party-dts-extractor@0.3.4

## 0.3.3

### Patch Changes

- @module-federation/sdk@0.3.3
- @module-federation/managers@0.3.3
- @module-federation/third-party-dts-extractor@0.3.3

## 0.3.2

### Patch Changes

- 0de1c83: fix: do not collect node internal utils
- 85ae159: feat: support rspack ssr
- Updated dependencies [0de1c83]
  - @module-federation/third-party-dts-extractor@0.3.2
  - @module-federation/sdk@0.3.2
  - @module-federation/managers@0.3.2

## 0.3.1

### Patch Changes

- 0a9adaf: chore: remove useless log
  - @module-federation/sdk@0.3.1
  - @module-federation/managers@0.3.1
  - @module-federation/third-party-dts-extractor@0.3.1

## 0.3.0

### Minor Changes

- fa37cc4: feat: support modern.js ssr [#2348](https://github.com/module-federation/core/issues/2348)

### Patch Changes

- 7c4d99b: fix(dts-plugin): temp tsconfig path should extends original tsconfig
- Updated dependencies [fa37cc4]
  - @module-federation/sdk@0.3.0
  - @module-federation/managers@0.3.0
  - @module-federation/third-party-dts-extractor@0.3.0

## 0.2.8

### Patch Changes

- f3d13c2: fix(dts-plugin): ensure dts file path if it has deep path
  - @module-federation/sdk@0.2.8
  - @module-federation/managers@0.2.8
  - @module-federation/third-party-dts-extractor@0.2.8

## 0.2.7

### Patch Changes

- b00ef13: fix(dts-plugin): support compile vue@3 dts
- Updated dependencies [b00ef13]
  - @module-federation/third-party-dts-extractor@0.2.7
  - @module-federation/sdk@0.2.7
  - @module-federation/managers@0.2.7

## 0.2.6

### Patch Changes

- Updated dependencies [91bf689]
  - @module-federation/sdk@0.2.6
  - @module-federation/managers@0.2.6
  - @module-federation/third-party-dts-extractor@0.2.6

## 0.2.5

### Patch Changes

- Updated dependencies [8cce571]
  - @module-federation/sdk@0.2.5
  - @module-federation/managers@0.2.5
  - @module-federation/third-party-dts-extractor@0.2.5

## 0.2.4

### Patch Changes

- Updated dependencies [09b792d]
- Updated dependencies [09b792d]
  - @module-federation/sdk@0.2.4
  - @module-federation/managers@0.2.4
  - @module-federation/third-party-dts-extractor@0.2.4

## 0.2.3

### Patch Changes

- Updated dependencies [32f26af]
- Updated dependencies [32f26af]
  - @module-federation/sdk@0.2.3
  - @module-federation/managers@0.2.3
  - @module-federation/third-party-dts-extractor@0.2.3

## 0.2.2

### Patch Changes

- 7d09ed8: Emit DTS relative to remote entry location
  - @module-federation/sdk@0.2.2
  - @module-federation/managers@0.2.2
  - @module-federation/third-party-dts-extractor@0.2.2

## 0.2.1

### Patch Changes

- 88445e7: Support getPublicPath in compiler plugins
- Updated dependencies [88445e7]
  - @module-federation/sdk@0.2.1
  - @module-federation/managers@0.2.1
  - @module-federation/third-party-dts-extractor@0.2.1

## 0.2.0

### Patch Changes

- 804cc3b: fix: check pid is undefined before kill it
- 52bb94c: fix(dts-plugin): ensure kill fork child process when the task is finished
- f7a6d3f: fix: download api types when types refresh
  - @module-federation/sdk@0.2.0
  - @module-federation/managers@0.2.0
  - @module-federation/third-party-dts-extractor@0.2.0

## 0.1.21

### Patch Changes

- a50c459: fix: use ipv4 first while load local remote
- 88900ad: fix: support decode encode remote name
- 4cddb8a: fix: no delete exist types if fetch new types failed
- 6ee10aa: fix: replace sourceEntry with index if the value is '.'
- 1e93c5e: fix: use userOptions.typesFolder first
- Updated dependencies [88900ad]
  - @module-federation/sdk@0.1.21
  - @module-federation/managers@0.1.21
  - @module-federation/third-party-dts-extractor@0.1.21

## 0.1.20

### Patch Changes

- 685c607: feat: support dynamic remote type hints
- 34f9498: dts-plugin can now support remotes using relative path references: 'app@/mf-manifest.json'
- Updated dependencies [685c607]
- Updated dependencies [e8e0969]
- Updated dependencies [349c381]
  - @module-federation/third-party-dts-extractor@0.1.20
  - @module-federation/sdk@0.1.20
  - @module-federation/managers@0.1.20

## 0.1.19

### Patch Changes

- Updated dependencies [031454d]
- Updated dependencies [b0a31a7]
- Updated dependencies [a2bfb9b]
  - @module-federation/sdk@0.1.19
  - @module-federation/managers@0.1.19
  - @module-federation/third-party-dts-extractor@0.1.19

## 0.1.18

### Patch Changes

- Updated dependencies [80af3f3]
  - @module-federation/sdk@0.1.18
  - @module-federation/managers@0.1.18
  - @module-federation/third-party-dts-extractor@0.1.18

## 0.1.17

### Patch Changes

- @module-federation/sdk@0.1.17
- @module-federation/managers@0.1.17
- @module-federation/third-party-dts-extractor@0.1.17

## 0.1.16

### Patch Changes

- ea34795: optional vue-tsc
- Updated dependencies [cce5404]
- Updated dependencies [364f2bc]
  - @module-federation/managers@0.1.16
  - @module-federation/sdk@0.1.16
  - @module-federation/third-party-dts-extractor@0.1.16

## 0.1.15

### Patch Changes

- 1227fd6: fix: Avoid the generation type order being affected by the loading timing so that every type occurs
  - @module-federation/sdk@0.1.15
  - @module-federation/managers@0.1.15
  - @module-federation/third-party-dts-extractor@0.1.15

## 0.1.14

### Patch Changes

- Updated dependencies [103b2b8]
  - @module-federation/sdk@0.1.14
  - @module-federation/managers@0.1.14
  - @module-federation/third-party-dts-extractor@0.1.14

## 0.1.13

### Patch Changes

- 2e52e51: Build zip url for json ext as well
- 677958c: fix: tsup configuration
- Updated dependencies [2e52e51]
- Updated dependencies [0113b81]
- Updated dependencies [677958c]
- Updated dependencies [2e52e51]
  - @module-federation/managers@0.1.13
  - @module-federation/third-party-dts-extractor@0.1.13
  - @module-federation/sdk@0.1.13

## 0.1.12

### Patch Changes

- 2a18c65: fix(dts-plugin): avoid typescript generation exceptions in javascript projects
  - @module-federation/sdk@0.1.12
  - @module-federation/managers@0.1.12
  - @module-federation/third-party-dts-extractor@0.1.12

## 0.1.11

### Patch Changes

- @module-federation/sdk@0.1.11
- @module-federation/managers@0.1.11
- @module-federation/third-party-dts-extractor@0.1.11

## 0.1.10

### Patch Changes

- 3d4fb69: import path on Windows
  - @module-federation/sdk@0.1.10
  - @module-federation/managers@0.1.10
  - @module-federation/third-party-dts-extractor@0.1.10

## 0.1.9

### Patch Changes

- @module-federation/sdk@0.1.9
- @module-federation/managers@0.1.9
- @module-federation/third-party-dts-extractor@0.1.9

## 0.1.8

### Patch Changes

- @module-federation/sdk@0.1.8
- @module-federation/managers@0.1.8
- @module-federation/third-party-dts-extractor@0.1.8

## 0.1.7

### Patch Changes

- @module-federation/sdk@0.1.7
- @module-federation/managers@0.1.7
- @module-federation/third-party-dts-extractor@0.1.7

## 0.1.6

### Patch Changes

- 72c7b80: chore: fix release tag
- Updated dependencies [72c7b80]
  - @module-federation/managers@0.1.6
  - @module-federation/sdk@0.1.6
  - @module-federation/third-party-dts-extractor@0.1.6

## 0.1.5

### Patch Changes

- f9b8af7: feat: supports the use of @module-federation/enhanced/runtime and also has type hints
- 71559fb: fix: output error in file
- Updated dependencies [ca271ab]
- Updated dependencies [1a9c6e7]
  - @module-federation/sdk@0.1.5
  - @module-federation/managers@0.1.5

## 0.1.4

### Patch Changes

- 8f3a440: fix: detect whether the project is ts
- Updated dependencies [8f3a440]
- Updated dependencies [2f697b9]
  - @module-federation/sdk@0.1.4
  - @module-federation/managers@0.1.4

## 0.1.3

### Patch Changes

- f926b6c: chore: split types plugins implementation
  - @module-federation/sdk@0.1.3
  - @module-federation/managers@0.1.3

## 0.1.2

### Patch Changes

- c8c0ad2: feat: enhance type capability
- Updated dependencies [c8c0ad2]
  - @module-federation/native-federation-typescript@0.1.2
  - @module-federation/sdk@0.1.2
