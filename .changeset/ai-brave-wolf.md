---
"@module-federation/nextjs-mf": minor
---

Simplified InvertedContainerPlugin by removing configuration dependencies and improving runtime module integration.

- Refactored `InvertedContainerPlugin` to remove redundant configurations.
- Deleted `EmbeddedContainerPlugin` and moved its logic into `InvertedContainerPlugin`.
- Modified `InvertedContainerRuntimeModule` to dynamically locate and integrate container entry modules.
- Commented out runtime chunk creation in `configureServerCompilerOptions`.
- Enhanced module dependency handling using `FederationModulesPlugin` hooks.
