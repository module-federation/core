---
"@module-federation/manifest": patch
---

Collect Webpack federation manifest data from the compilation graph when the compiler provides the federation metadata. The manifest now records the shared modules each expose requires, lists assets for an expose that has no `name`, and keeps shares whose key or scope contains a space. Fix a crash when `manifest.disableAssetsAnalyze` is used with a string expose.
