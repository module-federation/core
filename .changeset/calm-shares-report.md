---
'@module-federation/runtime-core': patch
'@module-federation/runtime': patch
'@module-federation/webpack-bundler-runtime': patch
'@module-federation/observability-plugin': patch
---

Extend the semantic shared registration and resolution hooks with explicit load context, while keeping provider, candidate, and selection diagnostics in the observability plugin and ignoring legacy share-scope metadata.
