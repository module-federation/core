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

The adapter translates MF remote names and aliases, passes pending loader promises,
and resets its own loading records. Rspack's native `remoteCache` owns reverse
dependency traversal, module factories, module caches, chunk state, generations,
and rollback. MF instance, container, shared-provider and snapshot ownership
belong to the Node runtime plugin. Framework request draining and resource
publication belong to the framework integration.

Compiled remote invalidation requires native `remoteCache` support. Unsupported
bundlers reject the request. Pure-runtime Node hosts without compiled remotes
can use the Node lifecycle plugin without this native API.

Applications must stop admission and drain business requests and producer work
before invalidation. A bare `clearCache` call invalidates pending chunk generations
and can reject unfinished loads as stale. It does not guarantee completion of
undrained requests or replace application references already retained by callers.
Stale completions are prevented from restoring retired cache entries.
