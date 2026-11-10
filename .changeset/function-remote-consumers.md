---
'@module-federation/bridge-react': minor
'@module-federation/runtime-core': patch
'@module-federation/sdk': minor
'@module-federation/dts-plugin': patch
---

Require function inputs for `createReactRemote` and `ReactRemote`, including the base entry. Migrate `remote: 'shop/App'` to `remote: () => loadRemote('shop/App')`, or return a statically imported MF export from the callback.

Remove the string-only protocol preflight and runtime load continuation. Functions retain namespace and individual export inference, component data and assets, runtime recovery, and Bridge SSR. Loaders execute before protocol selection, so use `noSSR` to prevent server-side loader execution. Prevent a loader that completes after its SSR deadline from instantiating a Bridge provider.

Remove the SDK registry and generated global declarations used only to infer direct string consumer inputs. Preserve generated `loadRemote` overloads and their default and named export inference.
