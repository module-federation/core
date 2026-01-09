# @module-federation/error-codes

## 0.22.1

## 0.22.0

## 0.21.6

## 0.21.5

## 0.21.4

## 0.21.3

## 0.21.2

## 0.21.1

## 0.21.0

## 0.20.0

### Patch Changes

- 639a83b: use TSC instead of SWC

## 0.19.1

## 0.19.0

## 0.18.4

### Patch Changes

- 8061f8c: add sourcemaps to fix builds

## 0.18.3

## 0.18.2

## 0.18.1

## 0.18.0

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

## 0.17.0

## 0.16.0

## 0.15.0

## 0.14.3

## 0.14.2

## 0.14.1

## 0.14.0

## 0.13.1

## 0.13.0

### Patch Changes

- 38f324f: Disable live bindings on cjs builds of the runtime packages

## 0.12.0

## 0.11.4

## 0.11.3

## 0.11.2

## 0.11.1

## 0.11.0

## 0.10.0

## 0.9.1

## 0.9.0

## 0.8.12

## 0.8.11

## 0.8.10

## 0.8.9

## 0.8.8

## 0.8.7

### Patch Changes

- 336f3d8: fix(enhanced): abort process if not find expose modules
- 4fd33fb: fix: throw RUNTIME-008 Error when script resources load failed

## 0.8.6

## 0.8.5

## 0.8.4

## 0.8.3

## 0.8.2

## 0.8.1

## 0.8.0

## 0.7.7

## 0.7.6

## 0.7.5

## 0.7.4

## 0.7.3

### Patch Changes

- 4ab9295: disable package json generation during build

## 0.7.2

## 0.7.1

## 0.7.0

### Minor Changes

- 849ef9c: fix(error-codes): esm should use .mjs ext
