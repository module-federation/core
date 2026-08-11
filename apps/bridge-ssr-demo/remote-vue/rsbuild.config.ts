import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { pluginServeSsrDist } from '../shared/pluginServeSsrDist';
import { bridgeSsrHostUrl } from '../shared/devHost';

const remoteOrigin = bridgeSsrHostUrl(2302);

const mfOptions = {
  name: 'bridge_ssr_vue',
  exposes: {
    './export-app': './src/export-app.ts',
  },
  shared: {
    vue: { singleton: true },
    'vue-router': { singleton: true },
  },
  dts: false,
  getPublicPath: `return '${remoteOrigin}/'`,
};

const ssrMfOptions = {
  ...mfOptions,
  exposes: {
    './export-app': './src/export-app.server.ts',
  },
  // Keep the Vue app and its renderer request-local to the remote server graph.
  shared: {},
  getPublicPath: `return '${remoteOrigin}/ssr/'`,
};

export default defineConfig({
  performance: { buildCache: false },
  server: {
    port: 2302,
    cors: true,
  },
  dev: {
    assetPrefix: remoteOrigin,
    writeToDisk: true,
  },
  tools: {
    rspack: (config) => {
      delete config.optimization?.splitChunks;
    },
  },
  environments: {
    web: {
      source: {
        entry: {
          index: './src/standalone.ts',
        },
      },
      html: {
        template: './src/index.html',
      },
      output: {
        distPath: {
          root: 'dist',
        },
      },
    },
    ssr: {
      source: {
        entry: {
          index: './src/ssr-env.ts',
        },
      },
      output: {
        target: 'node',
        distPath: {
          root: 'dist/ssr',
        },
        emitAssets: true,
      },
      tools: {
        rspack: (config) => {
          config.output ??= {};
          config.output.publicPath = `${remoteOrigin}/ssr/`;
        },
      },
    },
  },
  plugins: [
    pluginVue(),
    pluginServeSsrDist(__dirname),
    pluginModuleFederation(mfOptions, { environment: 'web' }),
    pluginModuleFederation(ssrMfOptions, {
      target: 'node',
      environment: 'ssr',
    }),
  ],
});
