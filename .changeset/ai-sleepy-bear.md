---
"@module-federation/runtime": minor
---

Refactor initialization and management of Federation instances with the new FederationManager class.

- Introduced FederationManager class to encapsulate federation management logic.
  - FederationManager class now handles the initialization and operation methods.
  - Methods `init`, `loadRemote`, `loadShare`, `loadShareSync`, `preloadRemote`, `registerRemotes`, and `registerPlugins` are now routed through an instance of FederationManager.
- Updated test to exclude `FederationManager` from index.ts exports.
- Minor code cleanup and added import for `getBuilderId` in `index.ts`.
- Removed direct manipulation of a singleton FederationHost instance and replaced it with the FederationManager pattern.