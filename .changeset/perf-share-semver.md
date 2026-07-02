---
'@module-federation/runtime-core': patch
---

perf(runtime-core): optimize share version comparison by bypassing range parsing for versionLt and caching parsed requiredVersion ranges
