import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import mfConfig from './module-federation.config';

const shared = {
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  output: {
    cleanDistPath: true,
  },
  source: {
    entry: {
      index: './src/Index.tsx',
    },
  },
  lib: [
    {
      ...shared,
      format: 'esm',
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      ...shared,
      format: 'cjs',
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
    {
      ...shared,
      format: 'mf',
      output: {
        distPath: {
          root: './dist/mf',
        },
      },
    },
  ],
  server: {
    port: 3053,
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation(mfConfig, { target: 'dual' }),
  ],
});
