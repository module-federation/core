---
'@module-federation/sdk': patch
'@module-federation/runtime-core': patch
'@module-federation/retry-plugin': patch
---

Call the runtime `fetch` hook for Node.js remote entries and their ESM imports; RetryPlugin does not handle requests with a `remoteEntry` resource context, so its behaviour for them is unchanged.
