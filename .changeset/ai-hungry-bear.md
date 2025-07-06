---
"@module-federation/enhanced": minor
---

Enhancements to layer handling in module federation tests and configuration.

- Improved handling of `shareKey` for layers within `ConsumeSharedPlugin` and `ProvideSharedPlugin`.
  - Conditionally prepend the `shareKey` with the `layer` if applicable.
- Introduced new layer configurations to support more nuanced federation scenarios that consider multiple layers of dependency.

