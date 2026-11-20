---
'@module-federation/modern-js-v3': patch
'@module-federation/modern-js': patch
---

Skip the SSR dev live-reload script when Modern.js renders the root on the client, where React 19.3 reports it as a script tag that never runs.
