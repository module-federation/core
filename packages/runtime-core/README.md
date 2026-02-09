# @module-federation/runtime

- Can be combined with the build plug-in to share basic dependencies according to policies to reduce the number of module downloads and improve the loading speed of modules.
- Only consume part of the export of the remote module and will not fully download the remote module
- The runtime calling process can be extended through the module-runtime plug-in mechanism

## Documentation

See [https://module-federation.io/guide/basic/runtime/runtime.html](https://module-federation.io/guide/basic/runtime/runtime.html) for details.

## Import Maps

When using Import Maps with `type: "module"` or `type: "system"` remotes, preserve bare specifiers by setting `entryFormat: "importmap"`:

```ts
import { ModuleFederation } from '@module-federation/runtime-core';

const mf = new ModuleFederation({
  name: 'host',
  remotes: [
    {
      name: 'webpack_remote',
      entry: 'webpack_remote',
      type: 'module',
      entryFormat: 'importmap',
    },
  ],
});
```

This keeps the entry untouched so the browser/SystemJS can resolve it via the import map.

To tree-shake import map support, define `FEDERATION_OPTIMIZE_NO_IMPORTMAP` as `true` (or use `experiments.optimization.disableImportMap` when using the ModuleFederationPlugin). Note that the build plugins default `disableImportMap` to `true`, so set it to `false` if you want import map support enabled.

## License

`@module-federation/runtime` is [MIT licensed](https://github.com/module-federation/core/blob/main/packages/runtime/LICENSE).
