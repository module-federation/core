import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { createCacheGroups } from '@rsbuild/shared';
import path from 'path';

export default defineConfig({
  source: {
    // Prevent pnpm workspace from causing dev dependencies on npm to take effect
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // set `react-router-dom/` to reference react-router-dom v5 which shoule be find in node_modules/react-router-dom, otherwise it will cause app.tsx fail to work which in react-router-dom v5 mode.
      'react-router-dom/$': path.resolve(
        __dirname,
        'node_modules/react-router-dom',
      ),
    },
  },
  server: {
    port: 2001,
    host: 'localhost',
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production environment, you need to configure output.assetPrefix
    assetPrefix: 'http://localhost:2001',
    writeToDisk: true,
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      delete config.optimization?.splitChunks;
      config.output!.uniqueName = 'router-remote1-2001';
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'remote1',
          exposes: {
            './button': './src/button.tsx',
            './export-app': './src/export-App.tsx',
          },
          shared: {
            // react: {
            //   singleton: true,
            // },
            // 'react-dom': {
            //   singleton: true,
            // },
            // 'react-router-dom': {
            //   singleton: true,
            // },
            // antd: {
            //   singleton: true,
            // },
          },
        }),
      ]);
    },
  },
  plugins: [pluginReact()],
});
