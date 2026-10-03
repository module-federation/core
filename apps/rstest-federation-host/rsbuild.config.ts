import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import federationOptions from './module-federation.config';

export default defineConfig({
  environments: {
    node: {
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        cleanDistPath: true,
        distPath: {
          root: 'dist',
        },
        target: 'node',
      },
    },
  },
  plugins: [
    pluginModuleFederation(federationOptions, {
      environment: 'node',
      target: 'node',
    }),
  ],
});
