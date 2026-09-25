---
'@module-federation/runtime-core': patch
---

Import `ResourceLoadContext` in the remote handler so the published
`remote/index.d.ts` declares it. Consumers that type-check dependencies with
`skipLibCheck: false` no longer get TS2304.
