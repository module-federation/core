import { pluginPublint } from 'rsbuild-plugin-publint';
import { defineConfig } from '@rslib/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, './package.json'), 'utf-8'),
);

export default defineConfig({
  plugins: [pluginPublint()],
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
    define: {
      __RSBUILD_PLUGIN_PACKAGE_NAME__: JSON.stringify(pkg.name),
    },
  },
  output: {
    target: 'node',
    minify: false,
    distPath: {
      root: './dist',
    },
    externals: [/@module-federation\//, 'pnpapi'],
    copy: [
      {
        from: './LICENSE',
        to: '.',
      },
    ],
  },
});
