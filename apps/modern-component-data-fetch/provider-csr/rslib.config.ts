import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';
import mfConfig from './module-federation.config';

const shared = {
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  lib: [
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
    port: 5003,
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation(mfConfig, { target: 'dual' }),
    pluginPublint(),
  ],
});
