---
'@module-federation/nextjs-mf': patch
---

Use `matchRemoteWithNameAndExpose` for `beforeRequest` cache-busting to correctly handle remote aliases that differ from the remote name, including scoped package names.
