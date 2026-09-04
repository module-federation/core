---
'@module-federation/nextjs-mf': patch
---

Fix server-side onLoad crash when async remote module factories are used during the webpack build/SSR path. Await async factory results before proxy-wrapping, return a wrapper factory for exposeModuleFactory, and preserve class constructor semantics via Proxy apply/construct traps.
