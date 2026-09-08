---
'@module-federation/sdk': patch
'@module-federation/managers': patch
'@module-federation/manifest': patch
---

Support layered Module Federation metadata from Rspack in the public v2 wrapper.

- `ContainerManager.containerPluginExposesOptions` preserves `exposes.*.layer` (including the empty string) instead of rebuilding exposes from `import`/`name` only, so layered exposes are no longer silently built unlayered.
- The manifest reader understands the `(layer)` segment that both webpack and Rspack insert after the share scope in shared module identifiers, reads a `layer` carried inside container expose options, and validates container-entry payloads instead of casting them, falling back to plugin options for unsupported shapes.
- `ExposesConfig` gains an optional `layer`.
