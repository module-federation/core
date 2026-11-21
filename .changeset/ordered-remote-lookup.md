---
'@module-federation/runtime-core': patch
'@module-federation/enhanced': patch
---

Reduce remote request matching allocations in the runtime. Index large compiler remote configurations while preserving configuration order, fallback requests, and share scopes.

Reuse the fixed semver regular expressions during shared version selection without caching mutable share resolution results.
