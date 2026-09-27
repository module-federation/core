---
'@module-federation/modern-js-v3': patch
---

fix(modernjs-v3): keep the SSR server bundle in one chunk so Rsbuild 2.2 server chunk splitting cannot make the federation entry asynchronous
