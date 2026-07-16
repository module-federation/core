---
'@module-federation/lynx': minor
---

Add an Rspeedy build adapter plus background and Lynx for Web main-thread
transports. Dual-realm remotes publish a standard Module Federation manifest
whose remote entry resolves to one HTTP-loadable external `.lynx.bundle`.
Compiled federated `import()` calls skip Lynx's local loader for remote-only
chunk IDs while preserving normal local JavaScript chunk loading.
