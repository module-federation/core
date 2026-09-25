---
'@module-federation/runtime-core': minor
'@module-federation/runtime': minor
'@module-federation/sdk': minor
---

Split the federation runtime into a kernel and capability subpaths. `@module-federation/runtime-core` adds `./kernel` (`FederationKernel`), `./shared`, `./remote`, `./snapshot`, and `./platform/web`, `./platform/node`, `./platform/universal`. `@module-federation/runtime` adds `./compose` with `init(options, capabilities)` and `createInstance(options, capabilities)`. `@module-federation/sdk` adds `./core` (the root without the Node loader) and `./node`. The root entries keep today's behavior.

Each `Platform` has a `target` (`web`, `node`, `universal`, or `none`). Every instance records its `runtimeCapabilities` in the same format as runtimes on main: remote loading, shared loading, snapshot plugins, and the target. Public `init` and `runtime/compose` `init` reuse another bundle's instance only when it has the caller's capabilities, and instances from older runtimes are not reused. Public `createInstance` constructs its own `ModuleFederation` class, not a debug constructor another bundle set on the global.
