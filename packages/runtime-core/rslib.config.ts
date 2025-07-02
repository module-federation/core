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
    distPath: {
      root: './dist',
    },
  },
  lib: [
    {
      format: 'esm',
      dts: true,
    },
    {
      format: 'cjs',
      dts: true,
    },
  ],
  tools: {
    bundlerChain: (config, { CHAIN_ID }) => {
      config.output.path('./dist');
    },
  },
  shims: true,
  bundle: false,
  external: ['@module-federation/sdk', '@module-federation/error-codes'],
});
