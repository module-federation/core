---
"@module-federation/nextjs-mf": patch
---

Support Next 15 externals configuration

- Refactored external handling to dynamically find and replace the first function in the 'externals' array.
- This change improves robustness by ensuring the system correctly overrides external functions regardless of their position in the list.
- Maintained the existing logic to preserve intended behavior with conditions checking specific package prefixes and names.
```
