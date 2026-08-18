---
'@module-federation/modern-js': patch
'@module-federation/modern-js-v3': patch
---

Fix misleading splitChunks warning under stream SSR so it only fires when chunks was not already async.
