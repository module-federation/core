import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';

const reactPath = path.dirname(require.resolve('react/package.json'));
const reactDomPath = path.dirname(require.resolve('react-dom/package.json'));

export default defineConfig({
  output: {
    injectStyles: true,
  },
  source: {
    // Prevent pnpm workspace from causing dev dependencies on npm to take effect
    alias: {
      react: reactPath,
      'react-dom': reactDomPath,
    },
  },
  server: {
    port: 2006,
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production environment, you need to configure output.assetPrefix
    assetPrefix: 'http://localhost:2006',
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'remote6',
      exposes: {
        './button': './src/button.tsx',
        './export-app': './src/export-App.tsx',
      },
      shared: {
        react: {
          singleton: true,
          // eager: true,
        },
        'react-dom': {
          singleton: true,
          // eager: true,
        },
      },
      bridge: {
        enableBridgeRouter: true,
      },
    }),
  ],
});
