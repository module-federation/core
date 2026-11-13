# `@module-federation/manifest` Documentation

## Description

This package contains the manifest plugin for webpack/rspack internal.

## Installation

```sh
npm install @module-federation/manifest
```

## Usage

1. replace expose options with container.options.exposes = containerManager.containerPluginExposesOptions;

```js
import { ContainerManager } from '@module-federation/managers';
const containerManager = new ContainerManager();
containerManager.init(options);
// it will set expose name automatically
options.exposes = containerManager.containerPluginExposesOptions;
```

2. use StatsPlugin in webpack.config.js

```js
import { StatsPlugin } from '@module-federation/manifest';

new StatsPlugin(mfOptions, {
  pluginVersion: pkg.version,
  bundler: 'webpack',
}).apply(compiler);
```

## Build identity

`metaData.buildInfo.buildVersion` identifies the compilation. In development,
it is a timestamp-based counter that advances on every compilation, including
empty rebuilds. The container runtime and manifest use the same value.
Production builds use `MF_BUILD_VERSION`, then the package version in the
compiler context, then the local fallback.

Merged manifests keep the browser build version in `buildInfo.buildVersion`
and the Node version in `ssrRemoteEntry.buildVersion`. The SDK exposes the latter
as `ssrBuildVersion`. Node consumers select the Node version, so rebuilding one
target does not relabel the other target's container. There is no separate
development revision field.

## Bridge rendering metadata

Statically identifiable default exports created with `createBridgeComponent` publish
`render: 'bridge'` on the corresponding expose. Application options retain the
statically declared `isService` flag, which is available as build analysis in Stats.
Published manifests and runtime Snapshots identify a Service App by the presence
of `servicePath`, without an additional `isService` flag. Ordinary exposes keep
their existing shape.

The plugin collects metadata after modules are built and before module concatenation,
then writes it during manifest generation. It follows the expose's default export
through local bindings and static re-exports using the compilation's resolved module
graph, including aliases, module-specific resolution and module replacements. It
never executes producer code. It recognizes calls named
`createBridgeComponent`, including named-import aliases and namespace members,
regardless of the factory's package or a framework's bundled implementation.
No framework import registration is required. A local factory with this name is
also treated as a Bridge factory. Merely importing or calling the factory elsewhere
in the file, or exporting only a named provider, does not mark the default export.
Framework wrappers are recognized when the expose calls or imports them under the
`createBridgeComponent` name. Arbitrary wrapper function bodies are not inspected,
so a differently named wrapper is not inferred as Bridge.
Remote, external and ignored modules are opaque and keep their existing metadata.
The analyzer does not resolve their requests against the local filesystem.

Provider options must be static objects without spreads or computed keys.
Service App declarations accept a statically known `isService: true`. Dynamic flags
and ambiguous wrappers are diagnosed at build time. Framework integrations receive
analyzed Bridge metadata in `manifest.additionalData`, and assign a relative
`servicePath` to each Service expose and one absolute `metaData.serviceBaseUrl` for
the producer deployment. This base is independent of the static asset `publicPath`.
The framework must use the same route definition to register its HTTP middleware.
Changing metadata alone does not register a server route.

Compilation fails when a Service declaration has no valid service path or base.
Paths cannot be empty, absolute, or traverse outside the service base. The SDK
copies the base to `Snapshot.serviceBaseUrl` and paths to its modules. Consumers
resolve endpoints from the selected Snapshot, including directly supplied Snapshots,
without fetching another manifest or deriving the service origin from the asset URL.
Service authentication credentials belong in private server configuration and must
not be included in these public fields.

Webpack reuses its parser AST and caches compact export descriptions with each
module. Rspack analyzes the already transformed source of reachable built modules
once per compilation. Loader output and resource queries therefore use the actual
built exports, rather than the original file contents. An unmarked legacy provider
requires an explicit
`render: 'bridge'` hint in the unified consumer.
