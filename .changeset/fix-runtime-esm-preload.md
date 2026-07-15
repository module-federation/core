---
'@module-federation/runtime-core': patch
---

fix(runtime): preload ESM remote chunks with `modulepreload` links instead of
executable module scripts before container initialization. Loader plugins now
observe these implicit ESM preloads through `createLink`.
