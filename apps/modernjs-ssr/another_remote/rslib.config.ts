import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rslib/core';
import mfConfig from './module-federation.config';

export default defineConfig({
  source: {
    // This fixture checks production shared-provider GC. React development
    // elements retain initialization CallSites in _debugStack, which can keep
    // the importing exposed module alive independently of federation caches.
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    entry: {
      index: './src/sharedConsumer.ts',
    },
  },
  lib: [
    {
      dts: false,
      format: 'mf',
      output: {
        distPath: {
          root: './dist',
        },
      },
    },
  ],
  server: {
    port: 3057,
  },
  tools: {
    rspack: {
      optimization: {
        // Use the explicit production define above even with `rslib mf-dev`.
        nodeEnv: false,
      },
    },
  },
  plugins: [pluginModuleFederation(mfConfig, { target: 'dual' })],
});
