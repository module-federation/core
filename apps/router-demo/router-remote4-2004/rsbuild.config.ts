import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';

export default defineConfig({
  output: {
    injectStyles: true,
  },
  source: {
    // Prevent pnpm workspace from causing dev dependencies on npm to take effect
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  dev: {
    writeToDisk: true,
  },
  server: {
    port: 2004,
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'remote4',
      exposes: {
        './export-app': './src/export-App.tsx',
      },
      shared: ['react', 'react-dom'],
      // getPublicPath: `return 'http://localhost:2004/'`,
      getPublicPath: `function(originalPublicPath){console.log(originalPublicPath);__webpack_require__.p = 'http://localhost:2004/'}`,
    }),
  ],
});
