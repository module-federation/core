---
"@module-federation/metro": patch
---

Add Metro 0.83 compatibility layer. Metro 0.83 introduced a restrictive `exports` field that only allows `metro/private/*` paths instead of direct `metro/src/*` imports. This adds a `metro-compat` utility that dynamically resolves the correct import path, ensuring compatibility with both Metro 0.82 and 0.83+.
