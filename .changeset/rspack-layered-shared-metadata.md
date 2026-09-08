---
'@module-federation/sdk': patch
'@module-federation/managers': patch
'@module-federation/manifest': patch
---

Support Rspack's layered Module Federation metadata in the public v2 wrapper.

- `ContainerManager.containerPluginExposesOptions` preserves `exposes.*.layer` (including the empty string) instead of rebuilding exposes from `import`/`name` only, so layered exposes are no longer silently built unlayered.
- The manifest reader decodes Rspack's structural shared identifiers (`provide shared module [<key>]@<version> …`, `consume shared module [<key>]@<range> …`) by their length-prefixed components, alongside the legacy positional format, and validates container-entry payloads in both the legacy `[[exposeKey, expose]]` and layered `[[[exposeKey, expose]], [layer | null]]` shapes (including array share-scope prefixes) instead of casting them.
- `ExposesConfig` gains an optional `layer`.
