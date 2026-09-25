---
'@module-federation/enhanced': patch
---

Fix the tree-shaking shared entry build finishing its `make` phase before the shared entry module tree was built. Large shared packages with a filesystem cache could crash in `createModuleAssets` or emit a fallback bundle with missing modules, and an entry error was thrown instead of reported.
