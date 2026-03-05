import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  // Cast to bridge transient rsbuild type version skew in CI lockfile combos.
  plugins: [pluginPublint() as unknown as never],
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      bundle: false,
      dts: {
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
      syntax: 'es2021',
      bundle: false,
      dts: false,
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
