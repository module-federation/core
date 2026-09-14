---
'@module-federation/sdk': patch
'@module-federation/manifest': patch
---

Add optional `providers` metadata for multiple concrete version/import pairs and their assets while retaining existing shared fields and layer identities. Single-provider and consumer-only entries omit this field; older manifest readers remain supported.
