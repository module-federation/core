---
'@module-federation/modern-js-v3': patch
'@module-federation/sdk': patch
---

Improve Node-side async startup remote loading by stripping browser HMR bootstrap calls, normalizing async startup container exports, and resolving var/global container shapes reliably for RSC federation flows.
