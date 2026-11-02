---
'@module-federation/bridge-react': minor
'@module-federation/manifest': patch
---

Enable Bridge application SSR through createReactRemote and ReactRemote when a Host SSR adapter and stream-capable provider are present. Reserve preparation before resolving string or callback remotes, reuse streamed DOM and restored loader data during independent hydration, and retain the hydrated instance for props updates, navigation, and unmounting. Preserve ordinary component SSR, noSSR, and existing CSR-only providers.

Recognize createModernBridgeComponent as a Bridge provider factory when generating expose rendering metadata, including imported aliases and namespace access.
