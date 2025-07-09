import { defineConfig } from '@rslib/core';

export default defineConfig({
  output: {
    copy: [
      {
        from: 'LICENSE',
        to: '',
      },
    ],
  },
  source: {
    entry: {
      index: './src/index.ts',
      'normalize-webpack-path': './src/normalize-webpack-path.ts',
    },
  },
  lib: [
    {
      id: 'esm_index',
      format: 'esm',
      syntax: 'es2021',
      dts: true,
    },
    {
      id: 'cjs_index',
      format: 'cjs',
      syntax: 'es2021',
    },
  ],
});
