---
'@module-federation/modern-js-v3': patch
---

Add read-only remote release checks and explicit response-deferred SSR update submissions. Deferred submissions return a receipt synchronously and throw submission errors synchronously; accepted execution failures remain observable through update status. Ordinary updates still return a Promise that completes after publication.
