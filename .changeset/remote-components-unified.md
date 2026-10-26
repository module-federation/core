---
'@module-federation/bridge-react': minor
---

Add createReactRemote and ReactRemote to select ordinary React components or client-side Bridge providers from expose metadata. Preserve component SSR and data loading, isolate provider instances, and support legacy protocol hints and failed-load retry. Client-only consumers prepare the component and data from the first hydrated effect without an intermediate mount gate or repeated loading effect.
