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
      index: './src/cli/index.ts',
      utils: './src/utils/index.ts',
      constant: './src/constant.ts',
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
