import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import path from 'path';

export default defineConfig({
  source: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      vue: path.resolve(__dirname, 'node_modules/vue'),
      'vue-router': path.resolve(__dirname, 'node_modules/vue-router'),
    },
  },
  server: {
    port: 2100,
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production environment, you need to configure output.assetPrefix
    assetPrefix: 'http://localhost:2100',
    writeToDisk: true,
  },
  plugins: [
    pluginVue(),
    pluginModuleFederation({
      name: 'host2',
      remotes: {
        remote1: 'remote1@http://localhost:2001/mf-manifest.json',
      },
    }),
  ],
});
