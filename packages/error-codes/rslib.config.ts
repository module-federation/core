import { defineConfig } from '@rslib/core';

// Rslib build for size-comparison against the existing Nx Rollup build.
// This is wired via an Nx target, so it won't affect consumers unless explicitly used.
export default defineConfig({
  source: {
    entry: {
      index: './src/index.ts',
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
  },
  lib: [
    {
      format: 'cjs',
      syntax: 'es2021',
      bundle: true,
      dts: false,
    },
    {
      redirect: {
        js: {
          extension: true,
        },
      },
      format: 'esm',
      syntax: 'es2021',
      bundle: true,
      dts: {
        distPath: './dist',
      },
    },
  ],
});
