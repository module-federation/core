# @module-federation/manifest

## 0.22.1

### Patch Changes

- @module-federation/sdk@0.22.1
- @module-federation/managers@0.22.1
- @module-federation/dts-plugin@0.22.1

## 0.22.0

### Patch Changes

- @module-federation/sdk@0.22.0
- @module-federation/managers@0.22.0
- @module-federation/dts-plugin@0.22.0

## 0.21.6

### Patch Changes

- @module-federation/sdk@0.21.6
- @module-federation/managers@0.21.6
- @module-federation/dts-plugin@0.21.6

## 0.21.5

### Patch Changes

- f8ff0d8: fix(dts-plugin): api type file should not related with manifest config
- Updated dependencies [f8ff0d8]
- Updated dependencies [9dfcbb3]
- Updated dependencies [2fc4050]
- Updated dependencies [94d8868]
  - @module-federation/dts-plugin@0.21.5
  - @module-federation/sdk@0.21.5
  - @module-federation/managers@0.21.5

## 0.21.4

### Patch Changes

- a50e068: refactor(manifest): collect assets from build hook
- Updated dependencies [d729167]
- Updated dependencies [a50e068]
  - @module-federation/dts-plugin@0.21.4
  - @module-federation/sdk@0.21.4
  - @module-federation/managers@0.21.4

## 0.21.3

### Patch Changes

- @module-federation/dts-plugin@0.21.3
- @module-federation/sdk@0.21.3
- @module-federation/managers@0.21.3

## 0.21.2

### Patch Changes

- Updated dependencies [4cada54]
  - @module-federation/dts-plugin@0.21.2
  - @module-federation/sdk@0.21.2
  - @module-federation/managers@0.21.2

## 0.21.1

### Patch Changes

- @module-federation/sdk@0.21.1
- @module-federation/managers@0.21.1
- @module-federation/dts-plugin@0.21.1

## 0.21.0

### Patch Changes

- Updated dependencies [d1e90a4]
  - @module-federation/sdk@0.21.0
  - @module-federation/dts-plugin@0.21.0
  - @module-federation/managers@0.21.0

## 0.20.0

### Patch Changes

- c171400: fix: the requires type in manifest.exposes shoule be array instead of object
- 639a83b: use TSC instead of SWC
- Updated dependencies [1e96509]
- Updated dependencies [37346d4]
- Updated dependencies [639a83b]
  - @module-federation/dts-plugin@0.20.0
  - @module-federation/sdk@0.20.0
  - @module-federation/managers@0.20.0

## 0.19.1

### Patch Changes

- Updated dependencies
  - @module-federation/sdk@0.19.1
  - @module-federation/dts-plugin@0.19.1
  - @module-federation/managers@0.19.1

## 0.19.0

### Patch Changes

- @module-federation/sdk@0.19.0
- @module-federation/managers@0.19.0
- @module-federation/dts-plugin@0.19.0

## 0.18.4

### Patch Changes

- 8061f8c: add sourcemaps to fix builds
- Updated dependencies [8061f8c]
  - @module-federation/managers@0.18.4
  - @module-federation/sdk@0.18.4
  - @module-federation/dts-plugin@0.18.4

## 0.18.3

### Patch Changes

- @module-federation/sdk@0.18.3
- @module-federation/managers@0.18.3
- @module-federation/dts-plugin@0.18.3

## 0.18.2

### Patch Changes

- Updated dependencies [297c9a7]
  - @module-federation/dts-plugin@0.18.2
  - @module-federation/sdk@0.18.2
  - @module-federation/managers@0.18.2

## 0.18.1

### Patch Changes

- 9f16eac: fix(manifest): collect cached modules since rspack support cache
- Updated dependencies [0bf3a3a]
  - @module-federation/sdk@0.18.1
  - @module-federation/dts-plugin@0.18.1
  - @module-federation/managers@0.18.1

## 0.18.0

### Patch Changes

- Updated dependencies [08f089a]
- Updated dependencies [f6381e6]
  - @module-federation/dts-plugin@0.18.0
  - @module-federation/sdk@0.18.0
  - @module-federation/managers@0.18.0

## 0.17.1

### Patch Changes

- 7000c1f: fix: BuildVersion now correctly reads from project's package.json

  - Fixed getBuildVersion() to accept optional root parameter for correct directory resolution
  - Updated StatsManager to use compiler.context when determining build version
  - Ensures buildVersion in mf-manifest.json matches the project's package.json version
  - Resolves issue #3835 where buildVersion was reading from wrong package.json location

- 2428be0: Enable modern TypeScript plugin for rollup packages

  Add `useLegacyTypescriptPlugin: false` to all rollup-based packages to use the official `@rollup/plugin-typescript` instead of the deprecated `rollup-plugin-typescript2`. This resolves TypeScript compilation errors during build and modernizes the build toolchain.

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
  - @module-federation/managers@0.17.1
  - @module-federation/sdk@0.17.1
  - @module-federation/dts-plugin@0.17.1

## 0.17.0

### Patch Changes

- Updated dependencies [1d691ef]
  - @module-federation/dts-plugin@0.17.0
  - @module-federation/sdk@0.17.0
  - @module-federation/managers@0.17.0

## 0.16.0

### Patch Changes

- Updated dependencies [1485fcf]
  - @module-federation/dts-plugin@0.16.0
  - @module-federation/sdk@0.16.0
  - @module-federation/managers@0.16.0

## 0.15.0

### Patch Changes

- f432619: fix(manifest): record all exposes even if the expose value is the same file
- Updated dependencies [c343589]
- Updated dependencies [b5e1640]
  - @module-federation/dts-plugin@0.15.0
  - @module-federation/sdk@0.15.0
  - @module-federation/managers@0.15.0

## 0.14.3

### Patch Changes

- @module-federation/sdk@0.14.3
- @module-federation/managers@0.14.3
- @module-federation/dts-plugin@0.14.3

## 0.14.2

### Patch Changes

- @module-federation/sdk@0.14.2
- @module-federation/managers@0.14.2
- @module-federation/dts-plugin@0.14.2

## 0.14.1

### Patch Changes

- @module-federation/sdk@0.14.1
- @module-federation/managers@0.14.1
- @module-federation/dts-plugin@0.14.1

## 0.14.0

### Patch Changes

- Updated dependencies [82b8cac]
- Updated dependencies [0eb6697]
  - @module-federation/sdk@0.14.0
  - @module-federation/dts-plugin@0.14.0
  - @module-federation/managers@0.14.0

## 0.13.1

### Patch Changes

- Updated dependencies [129dac6]
  - @module-federation/managers@0.13.1
  - @module-federation/dts-plugin@0.13.1
  - @module-federation/sdk@0.13.1

## 0.13.0

### Patch Changes

- 92882ec: feat: initialize manifest with required properties from stats
- 38f324f: Disable live bindings on cjs builds of the runtime packages
- Updated dependencies [38f324f]
  - @module-federation/dts-plugin@0.13.0
  - @module-federation/managers@0.13.0
  - @module-federation/sdk@0.13.0

## 0.12.0

### Patch Changes

- 451b4f5: fix(manifest): correct shared assets and filter expose assets
- Updated dependencies [ebef2d0]
- Updated dependencies [c399b9a]
- Updated dependencies [ef96c4d]
- Updated dependencies [f4fb242]
  - @module-federation/dts-plugin@0.12.0
  - @module-federation/sdk@0.12.0
  - @module-federation/managers@0.12.0

## 0.11.4

### Patch Changes

- Updated dependencies [64a2bc1]
- Updated dependencies [ed8bda3]
- Updated dependencies [c14842f]
  - @module-federation/sdk@0.11.4
  - @module-federation/dts-plugin@0.11.4
  - @module-federation/managers@0.11.4

## 0.11.3

### Patch Changes

- Updated dependencies [e2c0a89]
  - @module-federation/dts-plugin@0.11.3
  - @module-federation/sdk@0.11.3
  - @module-federation/managers@0.11.3

## 0.11.2

### Patch Changes

- Updated dependencies [047857b]
  - @module-federation/sdk@0.11.2
  - @module-federation/dts-plugin@0.11.2
  - @module-federation/managers@0.11.2

## 0.11.1

### Patch Changes

- @module-federation/sdk@0.11.1
- @module-federation/managers@0.11.1
- @module-federation/dts-plugin@0.11.1

## 0.11.0

### Patch Changes

- Updated dependencies [fce107e]
- Updated dependencies [eecee74]
  - @module-federation/sdk@0.11.0
  - @module-federation/dts-plugin@0.11.0
  - @module-federation/managers@0.11.0

## 0.10.0

### Patch Changes

- Updated dependencies [0f71cbc]
- Updated dependencies [22fcccd]
  - @module-federation/sdk@0.10.0
  - @module-federation/dts-plugin@0.10.0
  - @module-federation/managers@0.10.0

## 0.9.1

### Patch Changes

- 8acd217: chore: remove isomorphic-rslog
- Updated dependencies [35d925b]
- Updated dependencies [35d925b]
- Updated dependencies [7a37360]
- Updated dependencies [8acd217]
  - @module-federation/dts-plugin@0.9.1
  - @module-federation/sdk@0.9.1
  - @module-federation/managers@0.9.1

## 0.9.0

### Patch Changes

- Updated dependencies [5ebc53f]
- Updated dependencies [d872b35]
  - @module-federation/dts-plugin@0.9.0
  - @module-federation/sdk@0.9.0
  - @module-federation/managers@0.9.0

## 0.8.12

### Patch Changes

- Updated dependencies [d227303]
  - @module-federation/dts-plugin@0.8.12
  - @module-federation/sdk@0.8.12
  - @module-federation/managers@0.8.12

## 0.8.11

### Patch Changes

- @module-federation/sdk@0.8.11
- @module-federation/managers@0.8.11
- @module-federation/dts-plugin@0.8.11

## 0.8.10

### Patch Changes

- @module-federation/dts-plugin@0.8.10
- @module-federation/sdk@0.8.10
- @module-federation/managers@0.8.10

## 0.8.9

### Patch Changes

- Updated dependencies [6e3afc6]
- Updated dependencies [1be9d62]
- Updated dependencies [6e3afc6]
- Updated dependencies [6e3afc6]
- Updated dependencies [6e3afc6]
- Updated dependencies [6e3afc6]
- Updated dependencies [6e3afc6]
- Updated dependencies [6e3afc6]
  - @module-federation/dts-plugin@0.8.9
  - @module-federation/sdk@0.8.9
  - @module-federation/managers@0.8.9

## 0.8.8

### Patch Changes

- @module-federation/sdk@0.8.8
- @module-federation/managers@0.8.8
- @module-federation/dts-plugin@0.8.8

## 0.8.7

### Patch Changes

- Updated dependencies [835b09c]
- Updated dependencies [336f3d8]
- Updated dependencies [4fd33fb]
  - @module-federation/sdk@0.8.7
  - @module-federation/dts-plugin@0.8.7
  - @module-federation/managers@0.8.7

## 0.8.6

### Patch Changes

- 4a2cf82: fix(manifest): add default exposes fields if set disableAssetsAnalyze: true
- Updated dependencies [c90bba2]
  - @module-federation/dts-plugin@0.8.6
  - @module-federation/sdk@0.8.6
  - @module-federation/managers@0.8.6

## 0.8.5

### Patch Changes

- @module-federation/sdk@0.8.5
- @module-federation/managers@0.8.5
- @module-federation/dts-plugin@0.8.5

## 0.8.4

### Patch Changes

- Updated dependencies [5ea7aea]
  - @module-federation/dts-plugin@0.8.4
  - @module-federation/sdk@0.8.4
  - @module-federation/managers@0.8.4

## 0.8.3

### Patch Changes

- Updated dependencies [8e172c8]
  - @module-federation/dts-plugin@0.8.3
  - @module-federation/sdk@0.8.3
  - @module-federation/managers@0.8.3

## 0.8.2

### Patch Changes

- 85ef6c4: fix(manifest): stats should add prefetchInterface if enable dataPrefetch
  - @module-federation/dts-plugin@0.8.2
  - @module-federation/sdk@0.8.2
  - @module-federation/managers@0.8.2

## 0.8.1

### Patch Changes

- @module-federation/sdk@0.8.1
- @module-federation/managers@0.8.1
- @module-federation/dts-plugin@0.8.1

## 0.8.0

### Patch Changes

- @module-federation/sdk@0.8.0
- @module-federation/managers@0.8.0
- @module-federation/dts-plugin@0.8.0

## 0.7.7

### Patch Changes

- Updated dependencies [8db7611]
  - @module-federation/dts-plugin@0.7.7
  - @module-federation/sdk@0.7.7
  - @module-federation/managers@0.7.7

## 0.7.6

### Patch Changes

- @module-federation/sdk@0.7.6
- @module-federation/managers@0.7.6
- @module-federation/dts-plugin@0.7.6

## 0.7.5

### Patch Changes

- @module-federation/sdk@0.7.5
- @module-federation/managers@0.7.5
- @module-federation/dts-plugin@0.7.5

## 0.7.4

### Patch Changes

- @module-federation/dts-plugin@0.7.4
- @module-federation/sdk@0.7.4
- @module-federation/managers@0.7.4

## 0.7.3

### Patch Changes

- 4ab9295: disable package json generation during build
- Updated dependencies [4ab9295]
- Updated dependencies [7facc10]
  - @module-federation/managers@0.7.3
  - @module-federation/sdk@0.7.3
  - @module-federation/dts-plugin@0.7.3

## 0.7.2

### Patch Changes

- Updated dependencies [85990e2]
  - @module-federation/dts-plugin@0.7.2
  - @module-federation/sdk@0.7.2
  - @module-federation/managers@0.7.2

## 0.7.1

### Patch Changes

- Updated dependencies [6db4c5f]
  - @module-federation/sdk@0.7.1
  - @module-federation/dts-plugin@0.7.1
  - @module-federation/managers@0.7.1

## 0.7.0

### Minor Changes

- 206b56d: disable hoistTransitiveImports for better tree shake
- Updated dependencies [879ad87]
- Updated dependencies [4eb09e7]
- Updated dependencies [206b56d]
  - @module-federation/sdk@0.7.0
  - @module-federation/managers@0.7.0
  - @module-federation/dts-plugin@0.7.0

## 0.6.16

### Patch Changes

- 024df60: disable hoistTransitiveImports for better tree shake
- Updated dependencies [f779188]
- Updated dependencies [024df60]
  - @module-federation/sdk@0.6.16
  - @module-federation/managers@0.6.16
  - @module-federation/dts-plugin@0.6.16

## 0.6.15

### Patch Changes

- @module-federation/dts-plugin@0.6.15
- @module-federation/sdk@0.6.15
- @module-federation/managers@0.6.15

## 0.6.14

### Patch Changes

- ad605d2: chore: unified logger
- Updated dependencies [ad605d2]
  - @module-federation/dts-plugin@0.6.14
  - @module-federation/managers@0.6.14
  - @module-federation/sdk@0.6.14

## 0.6.13

### Patch Changes

- @module-federation/sdk@0.6.13
- @module-federation/managers@0.6.13
- @module-federation/dts-plugin@0.6.13

## 0.6.12

### Patch Changes

- @module-federation/sdk@0.6.12
- @module-federation/managers@0.6.12
- @module-federation/dts-plugin@0.6.12

## 0.6.11

### Patch Changes

- 83c8620: fix(manifest): record all remotes which are declared in build config
- Updated dependencies [d5a3072]
  - @module-federation/sdk@0.6.11
  - @module-federation/dts-plugin@0.6.11
  - @module-federation/managers@0.6.11

## 0.6.10

### Patch Changes

- Updated dependencies [22a3b83]
  - @module-federation/sdk@0.6.10
  - @module-federation/dts-plugin@0.6.10
  - @module-federation/managers@0.6.10

## 0.6.9

### Patch Changes

- @module-federation/sdk@0.6.9
- @module-federation/managers@0.6.9
- @module-federation/dts-plugin@0.6.9

## 0.6.8

### Patch Changes

- Updated dependencies [32db0ac]
  - @module-federation/sdk@0.6.8
  - @module-federation/dts-plugin@0.6.8
  - @module-federation/managers@0.6.8

## 0.6.7

### Patch Changes

- Updated dependencies [9e32644]
- Updated dependencies [0216364]
  - @module-federation/sdk@0.6.7
  - @module-federation/dts-plugin@0.6.7
  - @module-federation/managers@0.6.7

## 0.6.6

### Patch Changes

- 35aead4: fix(dts-plugin): zipName should add prefix if remoteEntry has it
- Updated dependencies [35aead4]
  - @module-federation/dts-plugin@0.6.6
  - @module-federation/sdk@0.6.6
  - @module-federation/managers@0.6.6

## 0.6.5

### Patch Changes

- @module-federation/sdk@0.6.5
- @module-federation/managers@0.6.5
- @module-federation/dts-plugin@0.6.5

## 0.6.4

### Patch Changes

- @module-federation/sdk@0.6.4
- @module-federation/managers@0.6.4
- @module-federation/dts-plugin@0.6.4

## 0.6.3

### Patch Changes

- @module-federation/sdk@0.6.3
- @module-federation/managers@0.6.3
- @module-federation/dts-plugin@0.6.3

## 0.6.2

### Patch Changes

- @module-federation/dts-plugin@0.6.2
- @module-federation/sdk@0.6.2
- @module-federation/managers@0.6.2

## 0.6.1

### Patch Changes

- Updated dependencies [2855583]
- Updated dependencies [813680f]
  - @module-federation/sdk@0.6.1
  - @module-federation/dts-plugin@0.6.1
  - @module-federation/managers@0.6.1

## 0.6.0

### Patch Changes

- Updated dependencies [1d9bb77]
  - @module-federation/sdk@0.6.0
  - @module-federation/dts-plugin@0.6.0
  - @module-federation/managers@0.6.0

## 0.5.2

### Patch Changes

- Updated dependencies [b90fa7d]
  - @module-federation/sdk@0.5.2
  - @module-federation/dts-plugin@0.5.2
  - @module-federation/managers@0.5.2

## 0.5.1

### Patch Changes

- @module-federation/sdk@0.5.1
- @module-federation/managers@0.5.1
- @module-federation/dts-plugin@0.5.1

## 0.5.0

### Patch Changes

- Updated dependencies [8378a77]
  - @module-federation/sdk@0.5.0
  - @module-federation/dts-plugin@0.5.0
  - @module-federation/managers@0.5.0

## 0.4.0

### Patch Changes

- Updated dependencies [a6e2bed]
- Updated dependencies [a6e2bed]
  - @module-federation/sdk@0.4.0
  - @module-federation/dts-plugin@0.4.0
  - @module-federation/managers@0.4.0

## 0.3.5

### Patch Changes

- @module-federation/sdk@0.3.5
- @module-federation/managers@0.3.5
- @module-federation/dts-plugin@0.3.5

## 0.3.4

### Patch Changes

- @module-federation/dts-plugin@0.3.4
- @module-federation/sdk@0.3.4
- @module-federation/managers@0.3.4

## 0.3.3

### Patch Changes

- @module-federation/sdk@0.3.3
- @module-federation/managers@0.3.3
- @module-federation/dts-plugin@0.3.3

## 0.3.2

### Patch Changes

- Updated dependencies [0de1c83]
- Updated dependencies [85ae159]
  - @module-federation/dts-plugin@0.3.2
  - @module-federation/sdk@0.3.2
  - @module-federation/managers@0.3.2

## 0.3.1

### Patch Changes

- Updated dependencies [0a9adaf]
  - @module-federation/dts-plugin@0.3.1
  - @module-federation/sdk@0.3.1
  - @module-federation/managers@0.3.1

## 0.3.0

### Minor Changes

- fa37cc4: feat: support modern.js ssr [#2348](https://github.com/module-federation/core/issues/2348)

### Patch Changes

- Updated dependencies [7c4d99b]
- Updated dependencies [fa37cc4]
  - @module-federation/dts-plugin@0.3.0
  - @module-federation/sdk@0.3.0
  - @module-federation/managers@0.3.0

## 0.2.8

### Patch Changes

- Updated dependencies [f3d13c2]
  - @module-federation/dts-plugin@0.2.8
  - @module-federation/sdk@0.2.8
  - @module-federation/managers@0.2.8

## 0.2.7

### Patch Changes

- Updated dependencies [b00ef13]
  - @module-federation/dts-plugin@0.2.7
  - @module-federation/sdk@0.2.7
  - @module-federation/managers@0.2.7

## 0.2.6

### Patch Changes

- Updated dependencies [91bf689]
  - @module-federation/sdk@0.2.6
  - @module-federation/dts-plugin@0.2.6
  - @module-federation/managers@0.2.6

## 0.2.5

### Patch Changes

- Updated dependencies [8cce571]
  - @module-federation/sdk@0.2.5
  - @module-federation/dts-plugin@0.2.5
  - @module-federation/managers@0.2.5

## 0.2.4

### Patch Changes

- Updated dependencies [09b792d]
- Updated dependencies [09b792d]
  - @module-federation/sdk@0.2.4
  - @module-federation/dts-plugin@0.2.4
  - @module-federation/managers@0.2.4

## 0.2.3

### Patch Changes

- Updated dependencies [32f26af]
- Updated dependencies [32f26af]
  - @module-federation/sdk@0.2.3
  - @module-federation/dts-plugin@0.2.3
  - @module-federation/managers@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies [7d09ed8]
  - @module-federation/dts-plugin@0.2.2
  - @module-federation/sdk@0.2.2
  - @module-federation/managers@0.2.2

## 0.2.1

### Patch Changes

- 88445e7: Support getPublicPath in compiler plugins
- e494f1a: fix: fix expose collect assets do not filter entry point cause load extra file
- Updated dependencies [88445e7]
  - @module-federation/dts-plugin@0.2.1
  - @module-federation/sdk@0.2.1
  - @module-federation/managers@0.2.1

## 0.2.0

### Patch Changes

- Updated dependencies [804cc3b]
- Updated dependencies [52bb94c]
- Updated dependencies [f7a6d3f]
  - @module-federation/dts-plugin@0.2.0
  - @module-federation/sdk@0.2.0
  - @module-federation/managers@0.2.0

## 0.1.21

### Patch Changes

- Updated dependencies [a50c459]
- Updated dependencies [88900ad]
- Updated dependencies [4cddb8a]
- Updated dependencies [6ee10aa]
- Updated dependencies [1e93c5e]
  - @module-federation/dts-plugin@0.1.21
  - @module-federation/sdk@0.1.21
  - @module-federation/managers@0.1.21

## 0.1.20

### Patch Changes

- Updated dependencies [685c607]
- Updated dependencies [34f9498]
- Updated dependencies [e8e0969]
- Updated dependencies [349c381]
  - @module-federation/dts-plugin@0.1.20
  - @module-federation/sdk@0.1.20
  - @module-federation/managers@0.1.20

## 0.1.19

### Patch Changes

- Updated dependencies [031454d]
- Updated dependencies [b0a31a7]
- Updated dependencies [a2bfb9b]
  - @module-federation/sdk@0.1.19
  - @module-federation/dts-plugin@0.1.19
  - @module-federation/managers@0.1.19

## 0.1.18

### Patch Changes

- 80af3f3: fix: get remoteEntry type from options
- Updated dependencies [80af3f3]
  - @module-federation/sdk@0.1.18
  - @module-federation/dts-plugin@0.1.18
  - @module-federation/managers@0.1.18

## 0.1.17

### Patch Changes

- 4f22c3e: fix: add requiredVersion to manifest.shared
  - @module-federation/sdk@0.1.17
  - @module-federation/managers@0.1.17
  - @module-federation/dts-plugin@0.1.17

## 0.1.16

### Patch Changes

- Updated dependencies [cce5404]
- Updated dependencies [ea34795]
- Updated dependencies [364f2bc]
  - @module-federation/managers@0.1.16
  - @module-federation/dts-plugin@0.1.16
  - @module-federation/sdk@0.1.16

## 0.1.15

### Patch Changes

- Updated dependencies [1227fd6]
  - @module-federation/dts-plugin@0.1.15
  - @module-federation/sdk@0.1.15
  - @module-federation/managers@0.1.15

## 0.1.14

### Patch Changes

- Updated dependencies [103b2b8]
  - @module-federation/sdk@0.1.14
  - @module-federation/dts-plugin@0.1.14
  - @module-federation/managers@0.1.14

## 0.1.13

### Patch Changes

- 9559769: fix: remoteEntry chunk may have css files which need to be exclude
- 2e52e51: publicPath: auto support for json manifest remote
- Updated dependencies [2e52e51]
- Updated dependencies [2e52e51]
- Updated dependencies [0113b81]
- Updated dependencies [677958c]
- Updated dependencies [2e52e51]
  - @module-federation/dts-plugin@0.1.13
  - @module-federation/managers@0.1.13
  - @module-federation/sdk@0.1.13

## 0.1.12

### Patch Changes

- Updated dependencies [2a18c65]
  - @module-federation/dts-plugin@0.1.12
  - @module-federation/sdk@0.1.12
  - @module-federation/managers@0.1.12

## 0.1.11

### Patch Changes

- @module-federation/sdk@0.1.11
- @module-federation/managers@0.1.11
- @module-federation/dts-plugin@0.1.11

## 0.1.10

### Patch Changes

- Updated dependencies [3d4fb69]
  - @module-federation/dts-plugin@0.1.10
  - @module-federation/sdk@0.1.10
  - @module-federation/managers@0.1.10

## 0.1.9

### Patch Changes

- @module-federation/sdk@0.1.9
- @module-federation/managers@0.1.9
- @module-federation/dts-plugin@0.1.9

## 0.1.8

### Patch Changes

- @module-federation/sdk@0.1.8
- @module-federation/managers@0.1.8
- @module-federation/dts-plugin@0.1.8

## 0.1.7

### Patch Changes

- @module-federation/sdk@0.1.7
- @module-federation/managers@0.1.7
- @module-federation/dts-plugin@0.1.7

## 0.1.6

### Patch Changes

- 72c7b80: chore: fix release tag
- Updated dependencies [72c7b80]
  - @module-federation/dts-plugin@0.1.6
  - @module-federation/managers@0.1.6
  - @module-federation/sdk@0.1.6

## 0.1.5

### Patch Changes

- ca271ab: feat: support config manifest
- Updated dependencies [f9b8af7]
- Updated dependencies [71559fb]
- Updated dependencies [ca271ab]
- Updated dependencies [1a9c6e7]
  - @module-federation/dts-plugin@0.1.5
  - @module-federation/sdk@0.1.5
  - @module-federation/managers@0.1.5

## 0.1.4

### Patch Changes

- Updated dependencies [8f3a440]
- Updated dependencies [2f697b9]
  - @module-federation/dts-plugin@0.1.4
  - @module-federation/sdk@0.1.4
  - @module-federation/managers@0.1.4

## 0.1.3

### Patch Changes

- f926b6c: chore: split types plugins implementation
- Updated dependencies [f926b6c]
  - @module-federation/dts-plugin@0.1.3
  - @module-federation/sdk@0.1.3
  - @module-federation/managers@0.1.3

## 0.1.2

### Patch Changes

- c8c0ad2: feat: enhance type capability
- Updated dependencies [c8c0ad2]
  - @module-federation/native-federation-typescript@0.1.2
  - @module-federation/sdk@0.1.2
  - @module-federation/managers@0.1.2

## 0.1.1

### Patch Changes

- @module-federation/sdk@0.1.1
- @module-federation/managers@0.1.1

## 0.1.0

### Patch Changes

- Updated dependencies [df3ef24]
- Updated dependencies [df3ef24]
- Updated dependencies [df3ef24]
- Updated dependencies [df3ef24]
  - @module-federation/sdk@0.1.0
  - @module-federation/managers@0.1.0

## 0.0.17

### Patch Changes

- @module-federation/sdk@0.0.17
- @module-federation/managers@0.0.17

## 0.0.16

### Patch Changes

- ccafac3: fix(manifest): apply stats options
  - @module-federation/sdk@0.0.16
  - @module-federation/managers@0.0.16

## 0.0.15

### Patch Changes

- ba5bedd: feat: support manifest
- Updated dependencies [3a45d99]
- Updated dependencies [ba5bedd]
  - @module-federation/sdk@0.0.15
  - @module-federation/managers@0.0.15
