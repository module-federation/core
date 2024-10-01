---
"@module-federation/enhanced": minor
---

Added experimental support for minimal federation runtime dependencies.

- Introduced `federationRuntime` experiment configuration.
  - Added support for `use-host` and `hoist` strategies.
- Modified ContainerPlugin to handle new cache group types for chunk splitting.
- Updated FederationRuntimePlugin to include logic for minimal runtime dependencies.
  - Added methods to handle minimal dependencies and embedded file paths.
- EmbeddedFederationRuntimePlugin now receives experiments options via constructor.
- Refactored several async operations to utilize async/await for better readability and error handling.