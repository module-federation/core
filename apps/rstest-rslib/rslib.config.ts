import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      id: 'web',
      format: 'mf',
      source: {
        entry: {
          index: './src/index.tsx',
        },
      },
      output: {
        target: 'web',
        distPath: {
          root: './dist/web',
        },
      },
    },
    {
      id: 'node',
      format: 'mf',
      source: {
        entry: {
          index: './src/index.tsx',
        },
      },
      output: {
        target: 'node',
        distPath: {
          root: './dist/node',
        },
      },
    },
  ],
  server: {
    host: '127.0.0.1',
    port: 3035,
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'rstest_rslib_host',
      remotes: {
        rstest_remote: 'rstest_remote@http://127.0.0.1:3016/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
});
