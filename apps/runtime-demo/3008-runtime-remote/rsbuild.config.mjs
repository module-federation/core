import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
const path = require('path');
const reactPath = path.dirname(require.resolve('react/package.json'));
const reactDomPath = path.dirname(require.resolve('react-dom/package.json'));

export default defineConfig({
  server: {
    port: 3008,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production environment, you need to configure output.assetPrefix
    assetPrefix: 'http://localhost:3008',
  },
  resolve: {
    alias: {
      react: reactPath,
      'react-dom': reactDomPath,
    },
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      config.output.uniqueName = 'runtime_remote3';
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'runtime_remote3',
          exposes: {
            './button': './src/Button.tsx',
          },
          shared: ['react', 'react-dom'],
        }),
      ]);
    },
  },
  plugins: [pluginReact()],
});
