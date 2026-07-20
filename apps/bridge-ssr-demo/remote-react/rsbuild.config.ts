import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';
import { createBridgeRouterAlias } from '../shared/routerAlias';
import { pluginServeSsrDist } from '../shared/pluginServeSsrDist';
import { bridgeSsrHostUrl } from '../shared/devHost';

const remoteOrigin = bridgeSsrHostUrl(2301);

const runtimePlugins = [
  require.resolve('@module-federation/bridge-react/plugin'),
];

const shared = {
  react: { singleton: true },
  'react-dom': { singleton: true },
};

const mfOptions = {
  name: 'bridge_ssr_react',
  runtimePlugins,
  exposes: {
    './export-app': './src/export-app.tsx',
  },
  shared,
  dts: false,
  getPublicPath: `return '${remoteOrigin}/'`,
};

const ssrMfOptions = {
  ...mfOptions,
  exposes: {
    './export-app': './src/export-app.server.tsx',
  },
  // The server remote owns a matching React + renderer pair. Sharing either
  // with the host would reintroduce cross-version renderer coupling.
  shared: {},
  getPublicPath: `return '${remoteOrigin}/ssr/'`,
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
    port: 2301,
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
          index: './src/index.tsx',
        },
      },
      output: {
        distPath: {
          root: 'dist',
        },
      },
      tools: {
        rspack: (config) => {
          config.resolve ??= {};
          config.resolve.alias = {
            ...(config.resolve.alias as Record<string, string>),
            ...createBridgeRouterAlias(
              path.resolve(__dirname, 'node_modules/react-router-dom'),
            ),
          };
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
          config.resolve ??= {};
          config.resolve.alias = {
            ...(config.resolve.alias as Record<string, string>),
            ...createBridgeRouterAlias(
              path.resolve(__dirname, 'node_modules/react-router-dom'),
            ),
          };
        },
      },
    },
  },
  plugins: [
    pluginReact(),
    pluginServeSsrDist(__dirname),
    pluginModuleFederation(mfOptions, { environment: 'web' }),
    pluginModuleFederation(ssrMfOptions, {
      target: 'node',
      environment: 'ssr',
    }),
  ],
});
