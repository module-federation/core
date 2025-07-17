---
"@module-federation/enhanced": patch
---

enhance HoistContainerReferencesPlugin for better module hoisting

- Separate handling for container, federation, and remote dependencies
- Improved support for `runtimeChunk: 'single'` configuration
- Proper remote module hoisting using the new `addRemoteDependency` hook
- Simplified cleanup logic for better performance
- Changed runtime chunk detection to include all chunks with runtime (not just entry chunks)
- Added comprehensive unit tests for the plugin functionality
