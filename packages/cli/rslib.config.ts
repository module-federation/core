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
      format: 'cjs',
      autoExtension: true,
      syntax: 'es2021',
      bundle: false,
      outBase: 'src',
      dts: {
        bundle: false,
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
    externals: [/@module-federation\//, 'commander', 'chalk', 'jiti'],
    copy: [
      {
        from: './LICENSE',
        to: '.',
      },
    ],
  },
});
