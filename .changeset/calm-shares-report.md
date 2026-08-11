---
'@module-federation/runtime-core': patch
'@module-federation/runtime': minor
'@module-federation/webpack-bundler-runtime': patch
'@module-federation/observability-plugin': patch
---

Extend the semantic shared registration and resolution hooks with explicit load context, re-export the shared-version `satisfy` helper, and keep provider, candidate, and selection diagnostics in the observability plugin while ignoring legacy share-scope metadata.
