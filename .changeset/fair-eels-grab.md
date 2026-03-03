---
'@module-federation/metro': patch
---

fix Metro Windows compatibility by normalizing path handling and source URL generation across absolute and relative entry paths, and tighten expose key resolution to avoid incorrect extension fallback matches.
