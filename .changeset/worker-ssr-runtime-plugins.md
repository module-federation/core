---
'@module-federation/modern-js-v3': patch
'@module-federation/modern-js': patch
---

Resolve the SSR data-fetch and dev runtime plugins to inert plugins under the `worker` export condition. Module Federation skips web-worker builds, so these plugins no longer pull Node-only code into worker bundles.
