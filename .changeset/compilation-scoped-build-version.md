---
'@module-federation/sdk': patch
'@module-federation/manifest': patch
'@module-federation/rspack': patch
'@module-federation/enhanced': patch
---

Add an experimental compilation-scoped build version source for framework-managed rebuilds. Runtime identifiers and manifests now share the same frozen version when configured, including cached watch rebuilds, without changing the process environment.
