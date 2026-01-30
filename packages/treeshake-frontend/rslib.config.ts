import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      bundle: true,
      dts: {
        distPath: './dist/adapter',
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
      index: './adapter/index.ts',
    },
    tsconfigPath: './tsconfig.adapter.json',
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist/adapter',
    },
  },
});
