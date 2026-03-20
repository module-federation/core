# @module-federation/metro

## 2.2.3

### Patch Changes

- @module-federation/runtime@2.2.3
- @module-federation/sdk@2.2.3
- @module-federation/dts-plugin@2.2.3

## 2.2.2

### Patch Changes

- Updated dependencies [95282ac]
  - @module-federation/dts-plugin@2.2.2
  - @module-federation/runtime@2.2.2
  - @module-federation/sdk@2.2.2

## 2.2.1

### Patch Changes

- @module-federation/runtime@2.2.1
- @module-federation/sdk@2.2.1
- @module-federation/dts-plugin@2.2.1

## 2.2.0

### Patch Changes

- Updated dependencies [c856ec1]
- Updated dependencies [12240bb]
- Updated dependencies [e5dd6ef]
- Updated dependencies [079aecd]
  - @module-federation/sdk@2.2.0
  - @module-federation/dts-plugin@2.2.0
  - @module-federation/runtime@2.2.0

## 2.1.0

### Patch Changes

- 11d4af3: ci: add Metro e2e coverage to local CI and reuse the same Metro e2e runner in both local CI and GitHub Actions.
- 5eef805: fix Metro Windows compatibility by normalizing path handling and source URL generation across absolute and relative entry paths, and tighten expose key resolution to avoid incorrect extension fallback matches.
- 374f5c2: refactor and harden Metro module federation config handling by deduplicating normalized runtime plugins, tightening option validation, and improving warnings for unsupported/deprecated options, including deprecating `plugins` in favor of `runtimePlugins`.
- e1970eb: Add optional dts-plugin support for Metro remotes. When `dts` is enabled in `withModuleFederation` config, both `bundle-mf-remote` and remote `start` mode can generate `@mf-types.zip` / `@mf-types.d.ts`, populate `mf-manifest.json` `metaData.types`, and serve the generated type assets from the Metro temp directory in development.
- Updated dependencies [6235711]
- Updated dependencies [918294f]
- Updated dependencies [5954fe7]
- Updated dependencies [918294f]
  - @module-federation/dts-plugin@2.1.0
  - @module-federation/runtime@2.1.0
  - @module-federation/sdk@2.1.0

## 2.0.1

### Patch Changes

- 28a2db4: Add Metro 0.83 compatibility layer. Metro 0.83 introduced a restrictive `exports` field that only allows `metro/private/*` paths instead of direct `metro/src/*` imports. This adds a `metro-compat` utility that dynamically resolves the correct import path, ensuring compatibility with both Metro 0.82 and 0.83+.
  - @module-federation/runtime@2.0.1
  - @module-federation/sdk@2.0.1

## 2.0.0

### Patch Changes

- @module-federation/runtime@2.0.0
- @module-federation/sdk@2.0.0

## 0.24.1

### Patch Changes

- @module-federation/runtime@0.24.1
- @module-federation/sdk@0.24.1

## 0.24.0

### Patch Changes

- @module-federation/runtime@0.24.0
- @module-federation/sdk@0.24.0

## 0.23.0

### Patch Changes

- @module-federation/runtime@0.23.0
- @module-federation/sdk@0.23.0

## 0.22.1

### Patch Changes

- @module-federation/runtime@0.22.1
- @module-federation/sdk@0.22.1

## 0.22.0

### Patch Changes

- @module-federation/runtime@0.22.0
- @module-federation/sdk@0.22.0

## 0.21.6

### Patch Changes

- @module-federation/runtime@0.21.6
- @module-federation/sdk@0.21.6

## 0.21.5

### Patch Changes

- Updated dependencies [94d8868]
  - @module-federation/sdk@0.21.5
  - @module-federation/runtime@0.21.5

## 0.21.4

### Patch Changes

- Updated dependencies [a50e068]
  - @module-federation/sdk@0.21.4
  - @module-federation/runtime@0.21.4

## 0.21.3

### Patch Changes

- @module-federation/runtime@0.21.3
- @module-federation/sdk@0.21.3

## 0.21.2

### Patch Changes

- @module-federation/runtime@0.21.2
- @module-federation/sdk@0.21.2

## 0.21.1

### Patch Changes

- @module-federation/runtime@0.21.1
- @module-federation/sdk@0.21.1

## 0.21.0

### Patch Changes

- Updated dependencies [d1e90a4]
  - @module-federation/sdk@0.21.0
  - @module-federation/runtime@0.21.0

## 0.20.0

### Patch Changes

- Updated dependencies [e89e972]
- Updated dependencies [37346d4]
- Updated dependencies [639a83b]
  - @module-federation/runtime@0.20.0
  - @module-federation/sdk@0.20.0

## 0.19.1

### Patch Changes

- Updated dependencies
  - @module-federation/sdk@0.19.1
  - @module-federation/runtime@0.19.1

## 0.19.0

### Patch Changes

- @module-federation/runtime@0.19.0
- @module-federation/sdk@0.19.0

## 0.18.4

### Patch Changes

- 14e0c78: Initial Release of Metro package
- Updated dependencies [8061f8c]
  - @module-federation/runtime@0.18.4
  - @module-federation/sdk@0.18.4
