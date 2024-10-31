---
"@module-federation/enhanced": minor
---

Introduce minimal runtime and experiment options for FederationRuntimePlugin.

- Added support for minimal federation runtime dependency in `FederationRuntimeDependency` class.
- Introduced `experiments` property to `EmbedFederationRuntimePlugin` class.
- Enhanced `FederationRuntimePlugin` to support both standard and minimal runtime dependencies.
  - Added logic to handle `useMinimalRuntime` option.
  - Conditionally modified entry file path based on the runtime mode.
- Adjusted constructor to initialize new experimental paths and dependencies.
- Modified `getTemplate` and `getFilePath` methods to accommodate minimal runtime.
- Updated `setRuntimeAlias` and `apply` methods to utilize new experiment options and embedded paths.