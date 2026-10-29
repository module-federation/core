---
'@module-federation/runtime-core': patch
'@module-federation/bridge-react': patch
---

Support synchronous and asynchronous React remote callbacks returning loaded namespaces or preloaded component and provider exports. Preserve each runtime instance's completed source metadata without changing raw load results or repeating protocol resolution. Keep ordinary component SSR, data fetching and assets, client-only callbacks, and Bridge server placeholders on the shared renderers.
