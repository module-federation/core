---
'@module-federation/runtime-core': patch
'@module-federation/runtime': patch
'@module-federation/webpack-bundler-runtime': patch
---

Resolve compiled federation instances by their build identity and keep other same-name builds alive during removal or disposal. Expose the shared provider resolver through the existing runtime helpers. Pure runtime initialization continues to support name and version reuse when no build or explicit instance ID is supplied.

Give independent Node executions their own runtime IDs and record the actual provider during container initialization. Cleanup follows this ownership even when manifest versions differ from the compiled release ID, while exact-ID lookup remains available for older containers.

Share the provider ownership calculation between Core remote removal and bundler cache cleanup through the runtime helpers, preserving shared records still owned by another build.

Retain provider runtimes and containers while another host consumes them, sharing the live consumer check between Core and bundler cleanup.

Keep mutable host snapshot selections on their owning runtime instance. Explicit build IDs use exact snapshot keys, and injected snapshots are cloned as initial templates so another same-name host cannot inherit runtime-added remote selections.

Detach the previous cache adapter when multiple federation plugins reinitialize one bundler, preserving other live bindings and rejecting replacement during pending cleanup.
