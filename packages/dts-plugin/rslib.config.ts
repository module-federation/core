import { defineConfig } from '@rslib/core';
import { pluginPublint } from 'rsbuild-plugin-publint';

const runtimeEntries = {
  index: './src/index.ts',
  core: './src/core/index.ts',
  'fork-dev-worker': './src/dev-worker/forkDevWorker.ts',
  'start-broker': './src/server/broker/startBroker.ts',
  'fork-generate-dts': './src/core/lib/forkGenerateDts.ts',
  'dynamic-remote-type-hints-plugin':
    './src/runtime-plugins/dynamic-remote-type-hints-plugin.ts',
};

export default defineConfig({
  plugins: [pluginPublint()],
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      source: {
        entry: runtimeEntries,
      },
      dts: {
        bundle: false,
        distPath: './dist',
      },
      output: {
        distPath: {
          root: './dist',
        },
      },
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      source: {
        entry: runtimeEntries,
      },
      dts: false,
      output: {
        distPath: {
          root: './dist',
        },
      },
    },
    {
      format: 'iife',
      syntax: 'es2021',
      source: {
        entry: {
          'launch-web-client': './src/server/launchWebClient.ts',
        },
      },
      dts: false,
      output: {
        target: 'web',
        distPath: {
          root: './dist/iife',
        },
      },
    },
  ],
  source: {
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
