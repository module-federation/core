# `@module-federation/webpack-bundler-runtime`

- Extract the build runtime and combine it with the internal runtime
- Used with webpack/rspack

## Usage

The package needs to be used with webpack/rspack bundler. It exports a federation object with instance, bundlerRuntime, initOptions, attachShareScopeMap, and bundlerRuntimeOptions. The root includes every adapter and the full runtime. `@module-federation/webpack-bundler-runtime/compose` exports `createFederation`, which the plugins use to build a federation object from only the adapters and capabilities a build needs.

After referencing, mount it to the corresponding bundler runtime, and then use the corresponding api/instance.

- example

```ts
import federation from '@module-federation/webpack-bundler-runtime';

__webpack_require__.federation = federation;

__webpack_require__.f.remotes = __webpack_require__.federation.remotes(options);
__webpack_require__.f.consumes = __webpack_require__.federation.remotes(options);
```
