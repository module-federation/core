import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      format: 'esm',
      autoExtension: true,
      syntax: 'es2021',
      bundle: true,
      dts: {
        distPath: './dist/adapter',
      },
    },
    {
      format: 'cjs',
      autoExtension: true,
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
