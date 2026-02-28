import { defineConfig } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      format: 'esm',
      autoExtension: true,
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      dts: {
        autoExtension: true,
        bundle: false,
        distPath: './dist',
      },
    },
    {
      format: 'cjs',
      autoExtension: true,
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      dts: {
        autoExtension: true,
        distPath: './dist',
      },
    },
  ],
  source: {
    entry: {
      index: [
        './src/**/*.{ts,tsx,js,jsx}',
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
      root: './dist',
    },
    externals: ['unplugin'],
    copy: [
      {
        from: './LICENSE',
        to: '.',
      },
    ],
  },
});
