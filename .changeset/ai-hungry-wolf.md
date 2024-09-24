---
"@module-federation/runtime": patch
---

Added comprehensive integration tests for the API synchronization and enhanced the embedded module proxy implementation.

- Added detailed integration tests for API consistency between embedded and index modules.
  - Tests include export comparison and method consistency for `FederationHost` and `Module` classes.
- Introduced and updated the `embedded.ts` file to dynamically access the runtime modules at runtime.
  - Included detailed implementations for accessing and wrapping existing runtime functions.
- Exposed the previously private `formatOptions` method in the `FederationHost` class publicly.
- Enhanced error handling for uninstantiated or unregistered runtime access.
```