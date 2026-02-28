import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      define: {
        'process.env.IS_ESM_BUILD': JSON.stringify('true'),
      },
      dts: {
        bundle: false,
        distPath: './dist',
        autoExtension: true,
      },
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      define: {
        'process.env.IS_ESM_BUILD': JSON.stringify('false'),
      },
      dts: {
        bundle: false,
        distPath: './dist',
        autoExtension: true,
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
    externals: [/@module-federation\//, 'react', 'react-dom'],
    copy: [
      {
        from: './LICENSE',
        to: '.',
      },
    ],
  },
});
