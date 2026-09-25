---
'@module-federation/runtime-core': major
'@module-federation/runtime': major
'@module-federation/webpack-bundler-runtime': major
'@module-federation/enhanced': major
'@module-federation/rspack': major
'@module-federation/sdk': major
'@module-federation/node': major
---

The composed federation runtime is the default and only bootstrap. `ModuleFederationPlugin` now always generates a bootstrap that imports only the runtime parts the build uses, and `experiments.composedRuntime` is removed.

Removed:

- The `FEDERATION_OPTIMIZE_NO_SHARED`, `FEDERATION_OPTIMIZE_NO_REMOTE`, `FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN`, `FEDERATION_HAS_EXPOSES`, and `FEDERATION_BUILD_IDENTIFIER` defines. The plugins no longer emit them and the runtime no longer reads them. Use `experiments.optimization.disable*` with the plugin, or import the capabilities you need from `@module-federation/runtime/compose` when you bundle the runtime yourself.
- `__webpack_require__.federation.runtime`. Use `__webpack_require__.federation.instance`, and `instance.platform.loadScriptNode` for the Node loader.
- The fallback in `@module-federation/node` to `federation.runtime.loadScriptNode`.

A build whose installed runtime packages do not export the composition subpaths now fails with an error that names the minimum runtime version. `ENV_TARGET`, `FEDERATION_ALLOW_NEW_FUNCTION`, and `FEDERATION_DEBUG` are unchanged.
