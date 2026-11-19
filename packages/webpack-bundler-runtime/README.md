# `@module-federation/webpack-bundler-runtime`

- Extract the build runtime and combine it with the internal runtime
- Used with webpack/rspack

## Usage

The package needs to be used with webpack/rspack bundler. It will export federation object which includes runtime, instance, bundlerRuntime, initOptions, attachShareScopeMap, bundlerRuntimeOptions.

After referencing, mount it to the corresponding bundler runtime, and then use the corresponding api/instance.

- example

```ts
import federation from '@module-federation/webpack-bundler-runtime';

__webpack_require__.federation = federation;

__webpack_require__.f.remotes = __webpack_require__.federation.remotes(options);
__webpack_require__.f.consumes = __webpack_require__.federation.remotes(options);
```

## SSR cache invalidation

`@module-federation/node/runtimePlugin` opts into the separate `clear-cache`
entry. The default bundler runtime does not import this adapter. On initialization,
the adapter exposes `clearCache({ name })` on `__webpack_require__.federation`
and connects asynchronous MF remote removal to every attached bundler.
Detach an application generation with `disposeClearCache()` after its work and
cache cleanup have finished.

Rspack emits the compiled remote dependency graph and module tables under
`federation.remotesLoadingData.cache`. The Node adapter uses one eviction plan
to clear remote factories, affected module exports and MF loading records.
Frameworks can reuse the same plan to select which entries to rebuild.
The MF Node plugin retains ownership of remote chunk loading and provider state.

For Node producers, Rspack supplies the module cache and shared dependency IDs
through `federation.containerCache`. The adapter installs
`federation.clearContainerCache` and locates it by the loaded container's getter.
Selective cleanup keeps the shared dependency closure. Full cleanup discards that
container's execution cache.

Compiled remote invalidation needs complete dependency metadata and writable
module tables. The Node adapter waits for in-flight loads before eviction,
and queued loads resume after the new registration is installed. A timeout
aborts before clearing those tables. Existing ordinary Host chunk factories
continue to serve the rebuilt entries.

Drain application requests and producer work before updating. Framework
integrations own request admission and publication of new application resources.
