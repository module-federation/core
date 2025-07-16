---
"@module-federation/enhanced": minor
---

Add advanced sharing capabilities in Module Federation

- Expanded `IncludeExcludeOptions` to support `request`, `version`, and `fallbackVersion` filters for finer control of module sharing inclusion and exclusion, allowing developers to target specific module versions or paths when sharing.
  - Enhanced the configuration of `ConsumeSharedModule`, `ConsumeSharedPlugin`, `ProvideSharedPlugin`, and `SharePlugin` to leverage these filtering options.
- Implemented new experimental features under `experiments`: `nodeModulesReconstructedLookup`, enabling more robust and flexible path reconstructions when consuming or providing shared modules, thus improving compatibility with monorepos and complex project structures.
- Updated internal schema validation and error handling to provide more informative feedback and operational resilience against misconfigurations or missing information.
- Introduced comprehensive test coverage for new features and plugin behaviors, ensuring robust validation against various edge cases and scenarios within module sharing operations.