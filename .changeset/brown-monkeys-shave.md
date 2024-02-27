---
'@module-federation/runtime': patch
'@module-federation/node': patch
---

Expose node script loaders to bundler runtime. Replace require.loadScript from federation/node to use federation.runtime.loadScriptNode
