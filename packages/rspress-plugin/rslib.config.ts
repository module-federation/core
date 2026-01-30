import { defineConfig } from '@rslib/core';

const shared = {
  dts: {
    bundle: false,
  },
};

export default defineConfig({
  source: {
    entry: {
      index: 'src/plugin.ts',
    },
  },
  lib: [
    {
      ...shared,
      format: 'esm',
      autoExternal: true,
      output: {
        distPath: {
          root: './dist',
        },
      },
    },
  ],
});
