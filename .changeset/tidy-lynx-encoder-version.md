---
'@module-federation/lynx': patch
---

Accept TASM 0.0.49 so native builds can use the same encoder as the Lynx template plugin. Loading different native TASM versions in one process can crash on macOS.
