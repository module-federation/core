---
'@module-federation/runtime-core': minor
'@module-federation/webpack-bundler-runtime': minor
'@module-federation/sdk': minor
---

Add package-owned selectors for runtime capabilities and runtime targets.
Namespaced package conditions can select disabled modules without adding the
enabled implementations to the module graph. Default modules keep the existing
`FEDERATION_*` define behavior. Disabled handlers keep the hooks and methods
the runtime calls, and the worker loader stores an imported ESM remote under
its global name. Published declarations use the default module types and
contain no `#mf/*` imports, so `node10` resolution keeps working.
