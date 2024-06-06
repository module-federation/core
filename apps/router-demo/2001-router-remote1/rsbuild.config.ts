import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';

export default defineConfig({
  source: {
    // 避免 pnpm workspace 导致 npm 依赖的 devDependencies 生效
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // 'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
      'react-router-dom$': path.resolve(
        __dirname,
        'node_modules/@module-federation/bridge-react/dist/router.es.js',
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
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'remote1',
          exposes: {
            './button': './src/button.tsx',
            './export-app': './src/export-App.tsx',
          },
          shared: ['react', 'react-dom'],
        }),
      ]);
    },
  },
  plugins: [pluginReact()],
});