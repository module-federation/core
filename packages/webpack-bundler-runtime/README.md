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

## Runtime plugins

Webpack-specific behaviors (like clearing webpack's module cache on unload)
are exposed as runtime plugins. The bundler runtime automatically registers
the unload plugin during init, but you can also register it manually:

```ts
import { unloadRemotePlugin } from '@module-federation/webpack-bundler-runtime';

const instance = federation.runtime.init({
  name: 'host',
  remotes: [],
});

instance.registerPlugins([unloadRemotePlugin()]);
instance.unloadRemote('remote/subpath');
```
