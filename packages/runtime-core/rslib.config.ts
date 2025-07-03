import { defineConfig } from '@rslib/core';
import pkg from './package.json';

const FEDERATION_DEBUG = process.env.FEDERATION_DEBUG || '';

export default defineConfig({
  source: {
    entry: {
      index: './src/index.ts',
      types: './src/types.ts',
      helpers: './src/helpers.ts',
      core: './src/core.ts',
      global: './src/global.ts',
    },
    define: {
      __VERSION__: JSON.stringify(pkg.version),
      FEDERATION_DEBUG: JSON.stringify(FEDERATION_DEBUG),
      FEDERATION_ALLOW_NEW_FUNCTION: JSON.stringify(
        process.env.FEDERATION_ALLOW_NEW_FUNCTION || false,
      ),
    },
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    target: 'node',
    format: ['esm', 'cjs'],
    distPath: {
      root: './dist',
    },
  },
  lib: [
    {
      format: 'esm',
      dts: {
        bundle: false,
        distPath: './dist',
      },
    },
    {
      format: 'cjs',
    },
  ],
  bundle: false,
  external: ['@module-federation/sdk', '@module-federation/error-codes'],
});
