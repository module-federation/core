import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      format: 'esm',
      autoExtension: true,
      syntax: 'es2021',
      bundle: false,
      dts: {
        autoExtension: true,
        bundle: false,
        distPath: './dist/types',
      },
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      format: 'cjs',
      autoExtension: true,
      syntax: 'es2021',
      bundle: false,
      dts: {
        autoExtension: true,
        distPath: './dist/types',
      },
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
  ],
  source: {
    entry: {
      index: ['./src/**/*.ts', './src/**/*.tsx', '!./src/**/*.spec.*'],
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'web',
    minify: false,
    externals: [/@module-federation\//, 'react', 'react-dom'],
  },
});
