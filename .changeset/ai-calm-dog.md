---
"@module-federation/enhanced": minor
---

Updated ModuleFederationPlugin to enhance configuration capabilities and target environment identification.

- Introduced `definePluginOptions` to manage DefinePlugin settings.
- Added `FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN` to handle disabling of snapshot optimizations via experiments.
- Implemented environment target detection (`web` or `node`) based on compiler options and experiments.
- Consolidated DefinePlugin application with the newly constructed `definePluginOptions`.
