# @module-federation/cli

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
