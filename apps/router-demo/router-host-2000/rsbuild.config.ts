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
      'react-router-dom': path.resolve(
        __dirname,
        'node_modules/react-router-dom',
      ),
      '@module-federation/enhanced': path.resolve(
        __dirname,
        'node_modules/@module-federation/enhanced',
      ),
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
          },
          shared: ['react', 'react-dom'],
          runtimePlugins: [
            path.join(__dirname, './src/runtime-plugin/shared-strategy.ts'),
          ],
        }),
      ]);
    },
  },
  plugins: [pluginReact()],
});
