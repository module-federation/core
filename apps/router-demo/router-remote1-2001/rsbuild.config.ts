import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';

export default defineConfig({
  source: {
    // Prevent pnpm workspace from causing dev dependencies on npm to take effect
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // set `react-router-dom/` to reference react-router-dom v5 which shoule be find in node_modules/react-router-dom, otherwise it will cause app.tsx fail to work which in react-router-dom v5 mode.
      // 'react-router-dom': path.resolve(
      //   __dirname,
      //   'node_modules/react-router-dom',
      // ),
    },
  },
  server: {
    port: 2001,
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production environment, you need to configure output.assetPrefix
    assetPrefix: 'http://localhost:2001',
    writeToDisk: true,
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      delete config.optimization?.splitChunks;
    },
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'remote1',
      runtimePlugins: [
        require.resolve('@module-federation/bridge-react/plugin'),
      ],
      exposes: {
        './button': './src/button.tsx',
        './export-app': './src/export-App.tsx',
        './export-button': './src/export-Button.tsx',
        './app': './src/App.tsx',
      },
      shared: {
        react: {
          singleton: true,
        },
        'react-dom': {
          singleton: true,
        },
        antd: {
          singleton: true,
        },
      },
    }),
  ],
});
