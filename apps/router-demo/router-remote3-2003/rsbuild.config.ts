import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import path from 'path';

export default defineConfig({
  source: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 2003,
    host: 'localhost',
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production environment, you need to configure output.assetPrefix
    assetPrefix: 'http://localhost:2003',
    writeToDisk: true,
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      delete config.optimization?.splitChunks;
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'remote3',
          exposes: {
            './export-app': './src/export-app.ts',
          },
          shared: ['vue', 'vue-router'],
        }),
      ]);
    },
  },

  plugins: [pluginVue()],
});
