# Example

### Rsbuild App
```
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  server: {
    port: 2000,
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'federation_consumer',
      remotes: {
        remote1: 'remote1@http://localhost:2001/mf-manifest.json',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
});
```

### Rslib Module
```
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    // ...
    {
      format: 'mf',
      output: {
        distPath: {
          root: './dist/mf',
        },
        assetPrefix: 'http://localhost:3001/mf',
      },
      plugins: [
        // ...
        pluginModuleFederation({
          name: 'rslib_provider',
          exposes: {
            '.': './src/index.tsx',
          },
          shared: {
            react: {
              singleton: true,
            },
            'react-dom': {
              singleton: true,
            },
          },
        }),
      ],
    },
  ],
});

```
