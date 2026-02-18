import { defineConfig } from 'tsdown';

const libraryEntry = {
  index: 'src/index.ts',
  core: 'src/core/index.ts',
  'fork-dev-worker': 'src/dev-worker/forkDevWorker.ts',
  'start-broker': 'src/server/broker/startBroker.ts',
  'fork-generate-dts': 'src/core/lib/forkGenerateDts.ts',
  'dynamic-remote-type-hints-plugin':
    'src/runtime-plugins/dynamic-remote-type-hints-plugin.ts',
};

const commonConfig = {
  cwd: import.meta.dirname,
  tsconfig: 'tsconfig.json',
  clean: true,
  inlineOnly: false,
};

export default defineConfig([
  {
    ...commonConfig,
    name: 'dts-plugin-cjs',
    entry: libraryEntry,
    outDir: 'dist',
    format: ['cjs'],
    dts: {
      resolver: 'tsc',
    },
    outExtensions: () => ({
      js: '.js',
      dts: '.d.ts',
    }),
  },
  {
    ...commonConfig,
    name: 'dts-plugin-esm',
    entry: libraryEntry,
    outDir: 'dist/esm',
    format: ['esm'],
    dts: false,
    outExtensions: () => ({
      js: '.js',
    }),
  },
  {
    ...commonConfig,
    name: 'dts-plugin-launch-web-client',
    entry: {
      'launch-web-client': 'src/server/launchWebClient.ts',
    },
    outDir: 'dist/iife',
    format: ['iife'],
    platform: 'browser',
    dts: false,
    noExternal: [/.*/],
    outputOptions: {
      codeSplitting: false,
    },
  },
]);
