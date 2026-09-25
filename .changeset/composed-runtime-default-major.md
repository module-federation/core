---
'@module-federation/runtime-core': major
'@module-federation/runtime': major
'@module-federation/webpack-bundler-runtime': major
'@module-federation/enhanced': major
'@module-federation/rspack': major
'@module-federation/sdk': major
'@module-federation/node': major
'@module-federation/managers': major
---

The composed federation runtime is the default and only bootstrap. `ModuleFederationPlugin` now always generates a bootstrap that imports only the runtime parts the build uses, and `experiments.composedRuntime` is removed.

Removed:

- The `FEDERATION_OPTIMIZE_NO_SHARED`, `FEDERATION_OPTIMIZE_NO_REMOTE`, `FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN`, `FEDERATION_HAS_EXPOSES`, and `FEDERATION_BUILD_IDENTIFIER` defines. The plugins no longer emit them and the runtime no longer reads them. Use `experiments.optimization.disable*` with the plugin, or import the capabilities you need from `@module-federation/runtime/compose` when you bundle the runtime yourself.
- `__webpack_require__.federation.runtime`, and the named `runtime` export and default `runtime` key of `@module-federation/webpack-bundler-runtime` (so also of `@module-federation/runtime-tools/webpack-bundler-runtime`). Use `__webpack_require__.federation.instance`, `instance.platform.loadScriptNode` for the Node loader, or import `@module-federation/runtime` directly.
- The fallback in `@module-federation/node` to `federation.runtime.loadScriptNode`.
- `resolveRspackRuntimeAlias` from `@module-federation/rspack/plugin`. The wrapper no longer aliases `@module-federation/runtime$`, so the helper has no use.

A build whose installed runtime packages lack the composition subpath exports now fails with an error that names the release that added them. `ENV_TARGET`, `FEDERATION_ALLOW_NEW_FUNCTION`, and `FEDERATION_DEBUG` are unchanged.
