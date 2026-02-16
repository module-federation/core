import { defineConfig } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      format: 'cjs',
      syntax: 'es2021',
      bundle: false,
      outBase: '.',
      dts: {
        bundle: false,
        distPath: './dist',
      },
    },
  ],
  source: {
    entry: {
      index: [
        './src/**/*.{ts,tsx,js,jsx}',
        './utils/**/*.{ts,tsx,js,jsx}',
        './client/**/*.{ts,tsx,js,jsx}',
        './*.ts',
        '!./rslib.config.ts',
        '!./src/**/*.spec.*',
        '!./src/**/*.test.*',
        '!./src/**/__tests__/**',
      ],
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    minify: false,
    distPath: {
      root: './dist',
    },
    externals: [/@module-federation\//],
  },
});
