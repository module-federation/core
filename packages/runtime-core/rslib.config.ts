import { defineConfig } from '@rslib/core';
import pkg from './package.json';

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

export default defineConfig({
  source: {
    entry: {
      index: './src/index.ts',
      types: './src/types.ts',
    },
  },
  output: {
    target: 'node',
    format: ['esm', 'cjs'],
    distPath: {
      root: './dist',
    },
    filename: {
      js: {
        esm: '[name].esm.js',
        cjs: '[name].cjs.cjs',
      },
      dts: {
        esm: '[name].esm.d.ts',
        cjs: '[name].cjs.d.ts',
      },
    },
  },
  lib: [
    {
      format: 'esm',
      output: {
        filename: {
          js: '[name].esm.js',
          dts: '[name].esm.d.ts',
        },
      },
    },
    {
      format: 'cjs',
      output: {
        filename: {
          js: '[name].cjs.cjs',
          dts: '[name].cjs.d.ts',
        },
      },
    },
  ],
  shims: true,
  bundle: false,
  external: ['@module-federation/sdk', '@module-federation/error-codes'],
});
