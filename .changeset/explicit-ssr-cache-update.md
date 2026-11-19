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
bundler cache adapter from a separate opt-in entry. Rspack supplies the Node
producer module cache and the shared dependency IDs. The adapter clears that
cache in JavaScript and delegates consumer chunk and generation invalidation to
Rspack. Supply Node chunk source while preserving Rspack's native chunk handlers.
