---
'@module-federation/bridge-react': minor
'@module-federation/runtime-core': patch
---

Add createReactRemote and ReactRemote to select ordinary React components or client-side Bridge providers from expose metadata. Preserve component SSR and data loading, isolate provider instances, and support legacy protocol hints and failed-load retry. Client-only consumers prepare the component and data from the first hydrated effect without an intermediate mount gate or repeated loading effect.

Select rendering protocols from the completed runtime afterResolve result, including platform-provided snapshots and rewritten requests. Reuse that resolution when continuing the normal load lifecycle so version selection and plugin hooks run once. Record both original and rewritten request IDs for subsequent component data and asset lookup.
