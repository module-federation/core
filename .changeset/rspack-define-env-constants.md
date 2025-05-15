---
"@module-federation/rspack": minor
---

Update Rspack ModuleFederationPlugin to support enhanced configuration capabilities and environment targeting.

- Injects `FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN` and `ENV_TARGET` as global constants using DefinePlugin, based on the new `experiments.optimization` options.
- Ensures parity with the Webpack plugin for build-time optimizations and environment-specific code paths.
- Enables tree-shaking and feature toggling in the runtime and SDK for both Rspack and Webpack builds. 
