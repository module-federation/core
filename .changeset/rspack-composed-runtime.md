---
'@module-federation/rspack': minor
---

Add `experiments.composedRuntime` to the rspack `ModuleFederationPlugin`. When `@rspack/core` has `experiments.VirtualModulesPlugin`, the wrapper builds a composed federation bootstrap as a virtual module and points rspack's native bundler runtime import at it, so the build includes only the runtime parts its options need. Other builds keep the full runtime and get a warning that names the reason. A composed build reports an error when a runtime package is external or a federation module has no adapter in the bootstrap. The wrapper no longer writes the `@module-federation/runtime$` alias, which rspack's own `@module-federation/runtime` alias already shadowed.
