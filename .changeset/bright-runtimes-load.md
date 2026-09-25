---
'@module-federation/runtime': patch
'@module-federation/runtime-core': patch
---

Keep each runtime's constructor and reuse only global instances with matching remote, shared, and snapshot capabilities. This prevents updated runtimes with the same identity from inheriting another build's disabled features. Older runtimes without capability metadata are not reused by updated callers; their own instance lookup remains unchanged.
