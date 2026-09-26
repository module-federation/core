import { defineConfig } from '@rslib/core';
import { readFileSync } from 'fs';
import { join } from 'path';
import { pluginPublint } from 'rsbuild-plugin-publint';

const pkg = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
);

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
      define: {
        'process.env.IS_ESM_BUILD': JSON.stringify('true'),
      },
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
      define: {
        'process.env.IS_ESM_BUILD': JSON.stringify('false'),
      },
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
    define: {
      __VERSION__: JSON.stringify(pkg.version),
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    minify: false,
    distPath: {
      root: './dist',
    },
    externals: [/@module-federation\//, '@rspack/core'],
    copy: [
      {
        from: './LICENSE',
        to: '.',
      },
    ],
  },
});
