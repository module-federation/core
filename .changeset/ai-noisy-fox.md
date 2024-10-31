---
"@module-federation/runtime": patch
---

- Added optional `bundlerId` parameter to FederationHost constructor.
- Modified default logic to choose `bundlerId` if provided, otherwise fallback to `getBuilderId()`.
- Updated `getGlobalFederationInstance` function to accept and utilize an optional `builderId`.
- Ensured internal checks compare with the provided `bundlerId` for consistency in federation instances lookup.
