---
'@module-federation/enhanced': minor
'@module-federation/sdk': minor
---

Add `experiments.composedRuntime` to `ModuleFederationPlugin`. When the installed runtime exports its capability subpaths, the plugin generates a federation bootstrap that imports only the runtime parts the build uses, and checks the module graph for federation modules whose adapter is missing. Builds without the flag are unchanged.
