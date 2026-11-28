---
'@module-federation/enhanced': patch
---

Reuse newly generated composed runtime bootstraps on the next filesystem cache build by marking their content-addressed file paths immutable. Changed composition plans still generate new entries and rebuild.
