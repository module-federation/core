---
'@module-federation/runtime-core': patch
'@module-federation/runtime': patch
'@module-federation/webpack-bundler-runtime': patch
'@module-federation/node': patch
---

Resolve compiled federation instances by their build identity and keep other same-name builds alive during removal or disposal. Expose the shared provider resolver through the existing runtime helpers. Pure runtime initialization continues to support name and version reuse when no build or explicit instance ID is supplied.

Reuse the runtime identified by the provider name and build version, and remove duplicate registry entries for that identity.

Keep SSR provider ownership in the Node runtime plugin, preserving shared records, runtimes and containers still used by another host.

Detach the previous cache adapter when multiple federation plugins reinitialize one bundler, preserving other live bindings and rejecting replacement during pending cleanup.

Bind each Node entry's cache adapter after bundler bootstrap, including entries that reuse an existing federation instance.
