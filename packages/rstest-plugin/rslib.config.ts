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
      index: './src/index.ts',
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    distPath: {
      root: './dist',
    },
    // Keep workspace packages external; everything else is bundled for portability.
    externals: [/@module-federation\//, 'pnpapi'],
    copy: [
      {
        from: './LICENSE',
        to: '.',
      },
    ],
  },
});
