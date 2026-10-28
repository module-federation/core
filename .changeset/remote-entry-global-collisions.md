---
'@module-federation/runtime-core': patch
---

Reject remote entry global names that collide with existing non-container globals before loading a script. Preserve real preloaded containers, including Webpack/Rspack export getters, and unassigned writable registration slots without invoking global property getters.
