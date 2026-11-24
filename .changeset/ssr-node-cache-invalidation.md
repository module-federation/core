---
'@module-federation/node': minor
'@module-federation/webpack-bundler-runtime': minor
'@module-federation/runtime-core': patch
'@module-federation/runtime': patch
'@module-federation/sdk': patch
---

Support explicit Node SSR remote replacement, instance disposal, and opt-in bundler cache invalidation without expanding CSR runtime bundles:

- Keep `@module-federation/runtime-core` and `@module-federation/runtime` limited to `removeRemote` and `dispose` lifecycle hooks plus build-identified provider resolution.
- Provide serialized `updateRemotes`, `removeRemote`, load draining, shared-scope ownership retention, and `destroyNodeInstance` through `@module-federation/node`.
- Add the opt-in `@module-federation/webpack-bundler-runtime/clear-cache` bridge (loaded only by `@module-federation/node`) to plan and evict compiled remote, consumer, and container caches.
- Isolate Node remote entry executions and fetched ESM module graphs by entry URL and `buildVersion`.
