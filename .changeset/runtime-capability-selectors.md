---
'@module-federation/runtime-core': minor
'@module-federation/webpack-bundler-runtime': minor
'@module-federation/sdk': minor
---

Add package-owned selectors for runtime capabilities and runtime targets.
Namespaced package conditions can select disabled leaves without adding enabled
implementations to the module graph. Default leaves retain the existing
`FEDERATION_*` define behavior.
Published declarations use the default leaf types and contain no `#mf/*`
imports, so `node10` resolution keeps working.
