import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rslib/core';
import mfConfig from './module-federation.config';

export default defineConfig({
  source: {
    entry: {
      index: './src/sharedConsumer.ts',
    },
  },
  lib: [
    {
      dts: false,
      format: 'mf',
      output: {
        distPath: {
          root: './dist',
        },
      },
    },
  ],
  server: {
    port: 3057,
  },
  plugins: [pluginModuleFederation(mfConfig, { target: 'dual' })],
});
