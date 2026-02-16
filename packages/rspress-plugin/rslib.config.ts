import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from '@rslib/core';

const shared = {
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  plugins: [pluginPublint()],
  source: {
    entry: {
      index: 'src/plugin.ts',
    },
  },
  lib: [
    {
      ...shared,
      format: 'esm',
      autoExtension: true,
      autoExternal: true,
      output: {
        distPath: {
          root: './dist',
        },
      },
    },
  ],
});
