---
"@module-federation/sdk": minor
---

Added experimental option for federation runtime in ContainerPluginOptions.

- Extended `ContainerPluginOptions` to include an `experiments` property.
  - Within `experiments`, added a `federationRuntime` option.
    - `federationRuntime` can be either `false` or `'hoisted'`.