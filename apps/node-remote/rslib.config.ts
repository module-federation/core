import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rslib/core';
import mfConfig from './module-federation.config.ts';

export default defineConfig({
  source: {
    entry: {
      main: './src/main.tsx',
    },
  },
  output: {
    cleanDistPath: true,
  },
  lib: [
    {
      dts: {
        bundle: false,
      },
      format: 'mf',
      output: {
        distPath: {
          root: './dist/mf',
        },
      },
    },
  ],
  server: {
    port: 3022,
  },
  tools: {
    rspack: {
      optimization: {
        minimize: false,
      },
    },
  },
  plugins: [pluginModuleFederation(mfConfig, { target: 'node' })],
});
