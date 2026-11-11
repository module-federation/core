---
'@module-federation/runtime-core': minor
'@module-federation/runtime': minor
'@module-federation/sdk': patch
'@module-federation/webpack-bundler-runtime': minor
'@module-federation/bridge-react': patch
---

Add explicit asynchronous remote replacement, instance disposal and bundler cache
invalidation for SSR applications that coordinate request draining. Preserve the
existing synchronous force-registration behavior and shared provider factories
that remain in use. Carry server-local Bridge producer work through cancellation
without serializing ownership into Service App requests.
