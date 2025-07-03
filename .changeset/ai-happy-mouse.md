---
"@module-federation/sdk": minor
---

Added a new option to improve path resolution in ModuleFederationPlugin options.

- Introduced `nodeModulesReconstructedLookup` option in `ModuleFederationPluginOptions`
  - Enhances support for reconstructed lookup of node_modules paths
- The new option is a boolean and is optional.