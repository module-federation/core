---
'@module-federation/runtime-core': minor
'@module-federation/runtime': minor
'@module-federation/sdk': patch
'@module-federation/webpack-bundler-runtime': minor
'@module-federation/bridge-react': patch
'@module-federation/node': minor
---

Add explicit asynchronous remote replacement, instance disposal and bundler cache
invalidation for SSR applications that coordinate request draining. Preserve the
existing synchronous force-registration behavior and shared provider factories
that remain in use. Carry server-local Bridge producer work through cancellation
without serializing ownership into Service App requests.

Keep the generic runtime limited to lifecycle hooks and disposal notifications.
Expose instance teardown through `@module-federation/node/lifecycle`, installed
by the Node runtime plugin, without adding disposal state or call guards to CSR
instances. Install SSR ownership, pending-work tracking and disposal through
that plugin. Load the
bundler cache adapter from a separate opt-in entry and delegate native module,
chunk and generation invalidation to Rspack. Supply Node chunk source without
replacing Rspack's native chunk handlers.
