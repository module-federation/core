---
'@module-federation/sdk': patch
'@module-federation/managers': patch
'@module-federation/manifest': patch
'@module-federation/enhanced': patch
---

Preserve shared and exposed module layers when reading Rspack and webpack stats or regenerating manifests. Keep public expose aliases, resolved imports, requirements, and chunk assets associated, including multi-import exposes and disabled asset analysis.

Support named expose layers in enhanced Webpack. Preserve module-rule precedence and assets for merged expose chunks, and accept the same layer configuration with manifests enabled or disabled.

Resolve relative shared requests and fallbacks with an explicit issuer layer from the importing module's directory.
