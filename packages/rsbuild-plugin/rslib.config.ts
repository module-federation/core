import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      bundle: true,
      dts: {
        distPath: './dist',
      },
      output: {
        filename: {
          js: '[name].mjs',
        },
      },
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      bundle: true,
      dts: false,
    },
  ],
  source: {
    entry: {
      index: './src/cli/index.ts',
      utils: './src/utils/index.ts',
      constant: './src/constant.ts',
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    externals: [/@module-federation\//, 'pnpapi'],
    copy: [
      {
        from: './LICENSE',
        to: '.',
      },
    ],
  },
});
