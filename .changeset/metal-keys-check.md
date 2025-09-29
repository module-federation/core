---
'@module-federation/enhanced': patch
---

fix(enhanced): Mark all exports as provided, to avoid webpack's export analysis from marking them as unused since we copy buildMeta
