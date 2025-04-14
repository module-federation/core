import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      source: {
        entry: {
          index: './src',
        },
      },
      output: {
        distPath: {
          root: './dist/',
        },
      },
      bundle: false,
      dts: true,
      format: 'cjs',
      syntax: 'es2021',
    },
  ],
  // output: {
  //   copy: {
  //     patterns: [{ from: 'src/resources', to: 'resources' }],
  //   },
  // },
});
