---
"@module-federation/nextjs-mf": patch
---

Await async expose module factories in the server-side `onLoad` hook before Proxy-wrapping them, fixing `TypeError: Method Promise.prototype.then called on incompatible receiver` during the webpack `loadFactory: false` / `from: 'build'` path.
