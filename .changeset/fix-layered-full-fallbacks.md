---
"@module-federation/runtime-core": patch
"@module-federation/webpack-bundler-runtime": patch
"@module-federation/enhanced": patch
---

Preserve resolveShare version-map replacement and provider layers during registration. Match full shared fallbacks by scope, layer and version, and keep Webpack fallback bundles and manifest entries distinct across these identities, including filesystem cache restores.
