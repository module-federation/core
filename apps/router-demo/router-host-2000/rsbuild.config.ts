import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';

export default defineConfig({
  source: {
    // Prevent pnpm workspace from causing dev dependencies on npm to take effect
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // 'react-router-dom$': require.resolve('@module-federation/bridge-react/dist/router-v6.es.js'),
      // 'react-router-dom$': require.resolve('@module-federation/bridge-react/dist/router.es.js'),
      // 'react-router-dom\/$': path.resolve(
      //   __dirname,
      //   'node_modules/react-router-dom',
      // ),
    },
  },
  server: {
    port: 2000,
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'federation_consumer',
          remotes: {
            remote1: 'remote1@http://localhost:2001/mf-manifest.json',
            remote2: 'remote2@http://localhost:2002/mf-manifest.json',
            remote3: 'remote3@http://localhost:2003/mf-manifest.json',
            remote_error: 'remote_error@http://localhost:2004/mf-manifest.json',
          },
          shared: ['react', 'react-dom', 'antd'],
          runtimePlugins: [
            path.join(__dirname, './src/runtime-plugin/shared-strategy.ts'),
          ],
        }),
      ]);
    },
  },
  plugins: [pluginReact()],
});
