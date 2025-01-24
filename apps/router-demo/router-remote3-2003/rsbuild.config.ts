import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import path from 'path';

export default defineConfig({
  source: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 2003,
  },
  dev: {
    writeToDisk: true,
  },
  plugins: [
    pluginVue(),
    pluginModuleFederation({
      name: 'remote3',
      exposes: {
        './export-app': './src/export-app.ts',
      },
      shared: ['vue', 'vue-router'],
      getPublicPath: `return 'http://localhost:2003/'`,
    }),
  ],
});
