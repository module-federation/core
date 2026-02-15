import { defineConfig } from '@rslib/core';
import { readFileSync } from 'fs';
import { join } from 'path';
import { pluginPublint } from 'rsbuild-plugin-publint';

const pkg = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
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
