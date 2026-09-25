---
'@module-federation/runtime-core': minor
'@module-federation/runtime': minor
'@module-federation/sdk': minor
---

Split the federation runtime into a kernel and capability subpaths. `@module-federation/runtime-core` adds `./kernel` (`FederationKernel`), `./shared`, `./remote`, `./snapshot`, and `./platform/web`, `./platform/node`, `./platform/universal`. `@module-federation/runtime` adds `./compose` with `init(options, capabilities)` and `createInstance(options, capabilities)`. `@module-federation/sdk` adds `./core` (the root without the Node loader) and `./node`. The root entries keep today's behavior.
