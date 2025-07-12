---
"@module-federation/enhanced": patch
"@module-federation/nextjs-mf": patch
---

refactor: rename container hooks for clarity and consistency

- Renamed `addContainerEntryModule` to `addContainerEntryDependency`
- Renamed `addFederationRuntimeModule` to `addFederationRuntimeDependency`
- Added new `addRemoteDependency` hook for remote module tracking
- Updated all hook usages across the codebase to use new names
- This is an internal refactoring with no breaking changes to external APIs