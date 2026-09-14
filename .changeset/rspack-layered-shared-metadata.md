---
'@module-federation/sdk': patch
'@module-federation/managers': patch
'@module-federation/manifest': patch
'@module-federation/enhanced': patch
---

Preserve shared and exposed module layers when reading Rspack and webpack stats or regenerating manifests. Keep public expose aliases, resolved imports, requirements, and chunk assets associated, including multi-import exposes and disabled asset analysis.

Expose configuration now preserves `layer`, including an empty string.

Support explicit expose layers in enhanced Webpack, including empty layers through shared modules and imports. Preserve module-rule precedence and assets for merged expose chunks, and accept the same layer configuration with manifests enabled or disabled.
