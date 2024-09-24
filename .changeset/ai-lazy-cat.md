---
"@module-federation/enhanced": patch
---

Added support for hoisting federation runtime modules and enhancing dependency management.

- Introduced `FederationModulesPlugin` to handle federation-related hooks and dependencies.
- Added new `FederationRuntimeDependency` and logic to include it conditionally.
- Enhanced `ContainerPlugin` and related plugins to support experimental `federationRuntime` options.
- Modified `HoistContainerReferencesPlugin` to hoist additional modules in chunks.
- Implemented changes across multiple files to support the new plugin and dependency management features.
