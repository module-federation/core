import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  plugins: [pluginPublint()],
  performance: {
    // CopyRspackPlugin walks the whole package directory to copy LICENSE, and
    // one lib's persistent cache deletes its .temp directories under
    // node_modules/.cache while the other lib's walk can be inside them.
    buildCache: false,
  },
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      dts: {
        bundle: false,
        distPath: './dist',
      },
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      dts: false,
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
    externals: [/@module-federation\//],
    copy: [
      {
        from: './LICENSE',
        to: '.',
      },
    ],
  },
});
