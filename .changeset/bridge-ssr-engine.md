---
'@module-federation/bridge-react': minor
---

Add framework-neutral Bridge SSR composition through the Node-only `ssr-node` and producer `server` entries, with request-scoped reservations, ordered remote streams, data restoration, independent hydration, cancellation, and server diagnostics. Keep Node stream and parser dependencies outside browser entries.

Extend provider factories with optional stream and hydration callbacks while preserving business-props inference, existing renderer callbacks, and per-mount routing and cleanup. Frameworks can reuse their application runtime through producer-local root metadata.

Preserve application script elements after replay so their server-rendered structure remains available for hydration. Remove only identified React transport instructions, including while Suspense content continues streaming.

Keep Node producer stream rendering separate from the browser mount and hydration lifecycle, sharing only the React tree construction. Remove unused revision and duplicate message-result metadata. Version only the producer-to-consumer contract, without a separate protocol identifier for the consumer's inline browser transport.
