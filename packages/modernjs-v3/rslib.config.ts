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
      autoExtension: true,
      syntax: 'es2019',
      dts: {
        autoExtension: true,
        distPath: './dist/types',
      },
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    },
    {
      ...sharedLibOptions,
      format: 'esm',
      autoExtension: true,
      syntax: 'es5',
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
      autoExtension: true,
      syntax: 'es2019',
      dts: {
        autoExtension: true,
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
