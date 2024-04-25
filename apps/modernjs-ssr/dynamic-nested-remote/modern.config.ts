import { appTools, defineConfig } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin,
  AsyncBoundaryPlugin,
} from '@module-federation/enhanced';
import { StreamingTargetPlugin } from '@module-federation/node';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    port: 3009,
    hmr: false,
    liveReload: false,
  },
  runtime: {
    router: true,
  },
  output: {
    disableTsChecker: true,
    cssModuleLocalIdentName: 'dynamic-nested-remote-[local]-[hash:base64:6]',
  },
  server: {
    ssr: {
      mode: 'stream',
    },
    port: 3009,
  },
  // source: {
  //   enableAsyncEntry: true,
  // },
  plugins: [appTools()],
  tools: {
    webpack: (config, { isServer, appendPlugins }) => {
      if (config?.output) {
        config.output.publicPath = 'http://localhost:3009/';
      }
      if (!isServer) {
        // otherwise the federation entry will be loaded as async chunk
        config.optimization!.splitChunks.chunks = 'async';
      }

      const mfConfig = {
        name: 'dynamic_nested_remote',
        filename: 'remoteEntry.js',
        exposes: {
          './Content': './src/components/Content.tsx',
        },
        // remotes: {
        //   dynamic_remote:
        //     'dynamic_remote@http://localhost:3008/mf-manifest.json',
        // },
        shared: {
          react: { singleton: true },
          'react-dom': { singleton: true },
        },
      };

      if (isServer) {
        mfConfig.filename = 'bundles/remoteEntry.js';
        appendPlugins([new StreamingTargetPlugin(mfConfig)]);
      }
      appendPlugins([
        new AsyncBoundaryPlugin({
          excludeChunk: (chunk) => chunk.name === 'dynamic_nested_remote',
          eager: (module) =>
            module && /\.federation/.test(module?.request || ''),
        }),
        new ModuleFederationPlugin(mfConfig),
      ]);
    },
  },
});
