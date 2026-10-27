---
'@module-federation/sdk': minor
'@module-federation/manifest': minor
'@module-federation/enhanced': minor
---

Publish expose rendering metadata for statically identifiable React Bridge providers and preserve it through Manifest and Snapshot conversion. Identify default exports produced by a createBridgeComponent call by name, including aliases and bundled framework factories, without requiring provider import registration.

Follow the actual compilation module graph for aliased and transformed re-exports, reusing Webpack parser metadata and analyzing built Rspack modules. Remote and external modules remain opaque without filesystem resolution.
