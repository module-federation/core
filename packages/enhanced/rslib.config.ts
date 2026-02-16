import { defineConfig } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      format: 'cjs',
      autoExtension: true,
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      dts: {
        autoExtension: true,
        bundle: false,
        distPath: './dist/src',
        tsconfigPath: './tsconfig.rslib.json',
      },
    },
  ],
  source: {
    entry: {
      index: ['./src/**/*.ts', '!./src/**/*.spec.ts', '!./src/**/*.test.ts'],
    },
    tsconfigPath: './tsconfig.rslib.json',
  },
  output: {
    target: 'node',
    minify: false,
    distPath: {
      root: './dist/src',
    },
    externals: [/@module-federation\//],
    copy: [
      {
        from: './src/declarations',
        to: './declarations',
      },
      {
        from: './package.json',
        to: '../package.json',
      },
    ],
  },
});
