---
"@module-federation/enhanced": minor
---

Enhanced module federation plugin to remove the `federationRuntime` experiment and replace it with `asyncStartup`.

- Dropped support for `federationRuntime` experiment and introduced `asyncStartup` to enable asynchronous container startup.
- Refactored EmbedFederationRuntimePlugin for improved runtime embedding and startup management.
  - Added options to enable runtime embedding for all chunks.
  - Integrated measures to ensure proper initialization and avoid duplicate hooks.
- Simplified constructor and class dependencies by removing the `experiments` parameter.
- Revised schema and validation definitions to accommodate new asynchronous startup configurations.
- Updated test cases to reflect the change from `federationRuntime` to `asyncStartup`.
