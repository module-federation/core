import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginPublint } from 'rsbuild-plugin-publint';

const sharedLibOptions = {
  bundle: false,
  externalHelpers: true,
  outBase: 'src',
} as const;

export default defineConfig({
  source: {
    entry: {
      index: ['./src/**/*.{ts,tsx,js,jsx}', '!./src/**/*.spec.*'],
    },
  },
  plugins: [
    pluginReact({
      swcReactOptions: {
        runtime: 'automatic',
      },
    }),
    pluginPublint(),
  ],
  lib: [
    {
      ...sharedLibOptions,
      format: 'cjs',
      syntax: 'es2019',
      define: {
        'process.env.IS_ESM_BUILD': JSON.stringify('false'),
      },
      dts: false,
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
    {
      ...sharedLibOptions,
      format: 'esm',
      syntax: 'es5',
      define: {
        'process.env.IS_ESM_BUILD': JSON.stringify('true'),
      },
      dts: false,
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      ...sharedLibOptions,
      format: 'esm',
      syntax: 'es2019',
      define: {
        'process.env.IS_ESM_BUILD': JSON.stringify('true'),
      },
      dts: {
        distPath: './dist/types',
      },
      output: {
        distPath: {
          root: './dist/esm-node',
        },
      },
    },
  ],
});
