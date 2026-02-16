import { defineConfig } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      format: 'cjs',
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      dts: {
        bundle: false,
        distPath: './dist/src',
      },
    },
  ],
  source: {
    entry: {
      index: [
        './src/**/*.{ts,tsx,js,jsx}',
        '!./src/**/*.d.ts',
        '!./src/**/*.spec.*',
        '!./src/**/*.test.*',
      ],
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    minify: false,
    distPath: {
      root: './dist/src',
    },
  },
});
