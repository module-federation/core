---
'@module-federation/runtime-core': minor
'@module-federation/webpack-bundler-runtime': minor
'@module-federation/sdk': minor
---

Add package-owned selectors for runtime capabilities and runtime targets.
Namespaced package conditions can select disabled modules without pulling the
enabled implementations into the module graph. Default selectors keep the
existing `FEDERATION_*` define behavior.
