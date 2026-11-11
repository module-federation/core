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

The initialized federation runtime exposes `clearCache({ name })` on
`__webpack_require__.federation`. Its cache adapter connects asynchronous runtime
remote removal to each attached bundler. Detach an application generation with
`disposeClearCache()` only after its work and cache cleanup have finished.

The compiler must provide reverse remote-consumer and parent-module metadata,
Node chunk cache controls, and reloadable entry exports. Compatible Rspack builds
provide the native graph. Framework entry ownership and resource publication
remain responsibilities of the framework integration.

Applications must stop admission and drain business requests and producer work
before invalidation. A bare `clearCache` call invalidates pending chunk generations
and can reject unfinished loads as stale. It does not guarantee completion of
undrained requests or replace application references already retained by callers.
Stale completions are prevented from restoring retired cache entries.
