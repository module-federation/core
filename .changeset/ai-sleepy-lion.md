---
"@module-federation/enhanced": patch
---

Refactor `HoistContainerReferencesPlugin` to optimize module disconnection and cleanup logic.

- Removed `moduleToDelete` set as it was redundant.
- Ensured all referenced modules are disconnected from unused chunks directly.
- Added call to `cleanUpChunks` within the main loop to clean up chunks using `allReferencedModules`.