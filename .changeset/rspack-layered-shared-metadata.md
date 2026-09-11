---
'@module-federation/sdk': patch
'@module-federation/managers': patch
'@module-federation/manifest': patch
---

Preserve shared and exposed module layers when reading Rspack and webpack stats or regenerating manifests. Keep public expose aliases, resolved imports, requirements, and chunk assets associated, including multi-import exposes and disabled asset analysis.

Add optional `providers` metadata for multiple concrete version/import pairs while retaining existing unlayered shared fields. Single-provider entries and older manifests remain supported without this field. Expose configuration now preserves `layer`, including an empty string.
