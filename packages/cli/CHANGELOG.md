# @module-federation/cli

## 0.22.1

### Patch Changes

- @module-federation/sdk@0.22.1
- @module-federation/dts-plugin@0.22.1

## 0.22.0

### Patch Changes

- @module-federation/sdk@0.22.0
- @module-federation/dts-plugin@0.22.0

## 0.21.6

### Patch Changes

- @module-federation/sdk@0.21.6
- @module-federation/dts-plugin@0.21.6

## 0.21.5

### Patch Changes

- 35c3695: perf(cli): use jiti to replace modernjs utils to load config
- Updated dependencies [f8ff0d8]
- Updated dependencies [9dfcbb3]
- Updated dependencies [2fc4050]
- Updated dependencies [94d8868]
  - @module-federation/dts-plugin@0.21.5
  - @module-federation/sdk@0.21.5

## 0.21.4

### Patch Changes

- Updated dependencies [d729167]
- Updated dependencies [a50e068]
  - @module-federation/dts-plugin@0.21.4
  - @module-federation/sdk@0.21.4

## 0.21.3

### Patch Changes

- @module-federation/dts-plugin@0.21.3
- @module-federation/sdk@0.21.3

## 0.21.2

### Patch Changes

- Updated dependencies [4cada54]
  - @module-federation/dts-plugin@0.21.2
  - @module-federation/sdk@0.21.2

## 0.21.1

### Patch Changes

- @module-federation/sdk@0.21.1
- @module-federation/dts-plugin@0.21.1

## 0.21.0

### Patch Changes

- Updated dependencies [d1e90a4]
  - @module-federation/sdk@0.21.0
  - @module-federation/dts-plugin@0.21.0

## 0.20.0

### Patch Changes

- 639a83b: use TSC instead of SWC
- Updated dependencies [1e96509]
- Updated dependencies [37346d4]
- Updated dependencies [639a83b]
  - @module-federation/dts-plugin@0.20.0
  - @module-federation/sdk@0.20.0

## 0.19.1

### Patch Changes

- Updated dependencies
  - @module-federation/sdk@0.19.1
  - @module-federation/dts-plugin@0.19.1

## 0.19.0

### Patch Changes

- @module-federation/sdk@0.19.0
- @module-federation/dts-plugin@0.19.0

## 0.18.4

### Patch Changes

- 8061f8c: add sourcemaps to fix builds
- Updated dependencies [8061f8c]
  - @module-federation/sdk@0.18.4
  - @module-federation/dts-plugin@0.18.4

## 0.18.3

### Patch Changes

- @module-federation/sdk@0.18.3
- @module-federation/dts-plugin@0.18.3

## 0.18.2

### Patch Changes

- Updated dependencies [297c9a7]
  - @module-federation/dts-plugin@0.18.2
  - @module-federation/sdk@0.18.2

## 0.18.1

### Patch Changes

- Updated dependencies [0bf3a3a]
  - @module-federation/sdk@0.18.1
  - @module-federation/dts-plugin@0.18.1

## 0.18.0

### Patch Changes

- Updated dependencies [08f089a]
- Updated dependencies [f6381e6]
  - @module-federation/dts-plugin@0.18.0
  - @module-federation/sdk@0.18.0

## 0.17.1

### Patch Changes

- 2428be0: Enable modern TypeScript plugin for rollup packages

  Add `useLegacyTypescriptPlugin: false` to all rollup-based packages to use the official `@rollup/plugin-typescript` instead of the deprecated `rollup-plugin-typescript2`. This resolves TypeScript compilation errors during build and modernizes the build toolchain.

- a7cf276: chore: upgrade NX to 21.2.3, Storybook to 9.0.9, and TypeScript to 5.8.3

  - Upgraded NX from 21.0.3 to 21.2.3 with workspace configuration updates
  - Migrated Storybook from 8.3.5 to 9.0.9 with updated configurations and automigrations
  - Upgraded TypeScript from 5.7.3 to 5.8.3 with compatibility fixes
  - Fixed package exports and type declaration paths across all packages
  - Resolved module resolution issues and TypeScript compatibility problems
  - Updated build configurations and dependencies to support latest versions

- Updated dependencies [a7cf276]
  - @module-federation/sdk@0.17.1
  - @module-federation/dts-plugin@0.17.1

## 0.17.0

### Patch Changes

- e0ceca6: bump modern.js to fix esbuild vulnerability
- Updated dependencies [1d691ef]
  - @module-federation/dts-plugin@0.17.0
  - @module-federation/sdk@0.17.0

## 0.16.0

### Patch Changes

- Updated dependencies [1485fcf]
  - @module-federation/dts-plugin@0.16.0
  - @module-federation/sdk@0.16.0

## 0.15.0

### Patch Changes

- Updated dependencies [c343589]
- Updated dependencies [b5e1640]
  - @module-federation/dts-plugin@0.15.0
  - @module-federation/sdk@0.15.0

## 0.14.3

### Patch Changes

- @module-federation/sdk@0.14.3
- @module-federation/dts-plugin@0.14.3

## 0.14.2

### Patch Changes

- @module-federation/sdk@0.14.2
- @module-federation/dts-plugin@0.14.2

## 0.14.1

### Patch Changes

- 0c68c2f: feat(modern-js-plugin): add server plugin to handle remote's SSR assets
  - @module-federation/sdk@0.14.1
  - @module-federation/dts-plugin@0.14.1

## 0.14.0

### Patch Changes

- Updated dependencies [82b8cac]
- Updated dependencies [0eb6697]
  - @module-federation/sdk@0.14.0
  - @module-federation/dts-plugin@0.14.0

## 0.13.1

### Patch Changes

- @module-federation/dts-plugin@0.13.1
- @module-federation/sdk@0.13.1

## 0.13.0

### Patch Changes

- e9a0681: Improve dynamic module import for `readConfig` function to use file URL format.

  - Added `pathToFileURL` import from 'url' module.
  - Updated the dynamic import statement for `mfConfig` to use `pathToFileURL(preBundlePath).href`.
  - Ensures compatibility and correctness in environments where file paths require URL format.

  ```

  ```

- 38f324f: Disable live bindings on cjs builds of the runtime packages
- Updated dependencies [38f324f]
  - @module-federation/dts-plugin@0.13.0
  - @module-federation/sdk@0.13.0

## 0.12.0

### Patch Changes

- Updated dependencies [ebef2d0]
- Updated dependencies [c399b9a]
- Updated dependencies [ef96c4d]
- Updated dependencies [f4fb242]
  - @module-federation/dts-plugin@0.12.0
  - @module-federation/sdk@0.12.0

## 0.11.4

### Patch Changes

- Updated dependencies [64a2bc1]
- Updated dependencies [ed8bda3]
- Updated dependencies [c14842f]
  - @module-federation/sdk@0.11.4
  - @module-federation/dts-plugin@0.11.4

## 0.11.3

### Patch Changes

- Updated dependencies [e2c0a89]
  - @module-federation/dts-plugin@0.11.3
  - @module-federation/sdk@0.11.3

## 0.11.2

### Patch Changes

- Updated dependencies [047857b]
  - @module-federation/sdk@0.11.2
  - @module-federation/dts-plugin@0.11.2
