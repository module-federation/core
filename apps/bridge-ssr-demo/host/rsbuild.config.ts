import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';
import {
  bridgeSsrHostUrl,
  bridgeSsrRemotePort,
  bridgeSsrServerManifestPath,
} from '../shared/devHost';

const vueRemoteOrigin = bridgeSsrHostUrl(bridgeSsrRemotePort('vue'));

const clientRuntimePlugins = [
  require.resolve('@module-federation/bridge-react/plugin'),
];

const ssrRuntimePlugins = [
  require.resolve('@module-federation/bridge-react/plugin'),
];

const shared = {
  react: { singleton: true, eager: true },
  'react-dom': { singleton: true, eager: true },
  vue: { singleton: true, eager: true },
  'vue-router': { singleton: true, eager: true },
};

const ssrShared = {
  react: { singleton: true, eager: true },
  'react-dom': { singleton: true, eager: true },
  vue: { singleton: true, eager: true },
  'vue-router': { singleton: true, eager: true },
};

const webRemotes = {
  bridge_ssr_vue: `bridge_ssr_vue@${vueRemoteOrigin}/mf-manifest.json`,
};

const ssrRemotes = {
  bridge_ssr_vue: `bridge_ssr_vue@${vueRemoteOrigin}/${bridgeSsrServerManifestPath}`,
};

export default defineConfig({
  performance: { buildCache: false },
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  server: {
    port: 2300,
    cors: true,
    middlewareMode: true,
  },
  environments: {
    client: {
      source: {
        entry: {
          index: './src/entry.client.tsx',
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
          index: './src/entry.server.tsx',
        },
      },
      output: {
        target: 'node',
        distPath: {
          root: 'dist/ssr',
        },
      },
    },
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation(
      {
        name: 'bridge_ssr_host',
        shareStrategy: 'loaded-first',
        remotes: webRemotes,
        shared,
        runtimePlugins: clientRuntimePlugins,
      },
      { environment: 'client' },
    ),
    pluginModuleFederation(
      {
        name: 'bridge_ssr_host',
        shareStrategy: 'loaded-first',
        remotes: ssrRemotes,
        shared: ssrShared,
        runtimePlugins: ssrRuntimePlugins,
      },
      { target: 'node', environment: 'ssr' },
    ),
  ],
});
