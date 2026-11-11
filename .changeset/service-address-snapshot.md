---
'@module-federation/sdk': patch
'@module-federation/manifest': patch
---

Identify Service App exposes in manifests and runtime Snapshots with `servicePath` and a shared `serviceBaseUrl`, replacing the repeated `isService` flag. Keep application declarations unchanged and expose analyzed Service declarations to framework manifest callbacks. Validate deployment addresses before publishing a Service manifest and provide a shared URL resolver independent of static asset URLs.
