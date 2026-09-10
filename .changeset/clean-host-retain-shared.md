---
'@module-federation/runtime-core': patch
'@module-federation/webpack-bundler-runtime': patch
---

Invalidate host remote consumers while preserving provider execution caches needed by in-use or loading shared modules. Preserve shared object identity and lazy dependencies across remote removal, including when the provider is no longer in the instance registry.
