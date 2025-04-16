---
"@module-federation/sdk": patch
---

Introduced environment-specific handling for `createScriptNode` and `loadScriptNode` functions and added build optimization options.

- Declared `ENV_TARGET` constant to differentiate between 'web' and 'node' environments.
- Modified `createScriptNode` and `loadScriptNode` to execute only in Node.js environment.
  - Throws an error if attempted in a non-Node.js environment.
- Added logging for debugging purposes.
- Introduced `optimization` options in `ModuleFederationPluginOptions`.
  - Added config for `disableSnapshot` and `target` environment optimizations.
```