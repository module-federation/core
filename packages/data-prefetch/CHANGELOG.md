# @module-federation/data-prefetch

## 0.6.16

### Patch Changes

- 024df60: disable hoistTransitiveImports for better tree shake
- Updated dependencies [f779188]
- Updated dependencies [024df60]
  - @module-federation/sdk@0.6.16
  - @module-federation/runtime@0.6.16

## 0.6.15

### Patch Changes

- Updated dependencies [ec31539]
  - @module-federation/runtime@0.6.15
  - @module-federation/sdk@0.6.15

## 0.6.14

### Patch Changes

- ad605d2: chore: unified logger
- Updated dependencies [ad605d2]
  - @module-federation/runtime@0.6.14
  - @module-federation/sdk@0.6.14

## 0.6.13

### Patch Changes

- @module-federation/runtime@0.6.13
- @module-federation/sdk@0.6.13

## 0.6.12

### Patch Changes

- @module-federation/runtime@0.6.12
- @module-federation/sdk@0.6.12

## 0.6.11

### Patch Changes

- Updated dependencies [ea6d417]
- Updated dependencies [d5a3072]
  - @module-federation/runtime@0.6.11
  - @module-federation/sdk@0.6.11

## 0.6.10

### Patch Changes

- 22a3b83: fix(data-prefetch): apply DataPrefetchPlugin on demand
- 22a3b83: fix(data-prefetch): set sharedStrategy in build options instead of using runtime plugin
- Updated dependencies [b704f30]
- Updated dependencies [22a3b83]
  - @module-federation/runtime@0.6.10
  - @module-federation/sdk@0.6.10

## 0.6.9

### Patch Changes

- @module-federation/runtime@0.6.9
- @module-federation/sdk@0.6.9

## 0.6.8

### Patch Changes

- Updated dependencies [32db0ac]
- Updated dependencies [32db0ac]
- Updated dependencies [6c5f444]
- Updated dependencies [fac6ecf]
  - @module-federation/sdk@0.6.8
  - @module-federation/runtime@0.6.8

## 0.6.7

### Patch Changes

- 9e32644: Refactored the way prefetch entries are imported for improved dynamic loading handling.

  - Changed the import of prefetch entries to use a function wrapper for more dynamic control.
  - Updated data types to ensure consistency with the new function-based import approach.
  - Modified the `injectPrefetch` function structure to incorporate the new import method.
  - Modified the `MFDataPrefetch` class to handle the new import function when resolving exports.

- Updated dependencies [9e32644]
- Updated dependencies [9e32644]
- Updated dependencies [9e32644]
  - @module-federation/runtime@0.6.7
  - @module-federation/sdk@0.6.7

## 0.6.6

### Patch Changes

- @module-federation/runtime@0.6.6
- @module-federation/sdk@0.6.6
