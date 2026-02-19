import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';

export default defineConfig({
  output: {
    injectStyles: true,
  },
  resolve: {
    // Prevent pnpm workspace from causing dev dependencies on npm to take effect
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  server: {
    host: '127.0.0.1',
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
