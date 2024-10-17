---
"@module-federation/runtime": patch
---

Added support for defining and setting a shareable runtime globally to enhance modularity and reusability within the Federation system.

- Defined a `ShareableRuntime` type encapsulating the core functionalities of the module federation.
- Introduced `__SHAREABLE_RUNTIME__` to the `Federation` interface to store the `ShareableRuntime`.
- Implemented `setGlobalShareableRuntime` function to set the shareable runtime if not already set.
- Modified `FederationManager` methods (`preloadRemote`, `registerRemotes`, `registerPlugins`) to use the spread operator for cleaner code.
- Initialized the global shareable runtime at the module's root with key components like `FederationManager`, `FederationHost`, etc.
