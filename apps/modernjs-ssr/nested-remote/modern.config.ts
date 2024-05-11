import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    port: 3007,
    hmr: false,
    liveReload: false,
  },
  runtime: {
    router: true,
  },
  security: {
    checkSyntax: true,
  },
  output: {
    disableTsChecker: true,
    cssModuleLocalIdentName: 'nested-remote-[local]-[hash:base64:6]',
  },
  server: {
    ssr: {
      mode: 'stream',
    },
    port: 3007,
  },
  // source: {
  //   enableAsyncEntry: true,
  // },
  plugins: [appTools(), moduleFederationPlugin()],
  tools: {
    webpack: (config, { isServer, appendPlugins }) => {
      config.optimization!.runtimeChunk = false;

      if (config?.output) {
        config.output.publicPath = 'http://localhost:3007/';
      }
      // if (!isServer) {
      //   // otherwise the federation entry will be loaded as async chunk
      //   config.optimization!.splitChunks.chunks = 'async';
      // }
      // const mfConfig = {
      //   name: 'nested_remote',
      //   filename: 'remoteEntry.js',
      //   exposes: {
      //     './Content': './src/components/Content.tsx',
      //   },
      //   remotes: {
      //     remote: 'remote@http://localhost:3006/mf-manifest.json',
      //   },
      //   shared: {
      //     react: { singleton: true },
      //     'react-dom': { singleton: true },
      //   },
      //   dts: false,
      //   dev: false,
      // };
      // if (isServer) {
      //   mfConfig.filename = 'bundles/remoteEntry.js';
      //   mfConfig.remotes = {
      //     remote: 'remote@http://localhost:3006/bundles/remoteEntry.js',
      //   };
      //   appendPlugins([new StreamingTargetPlugin(mfConfig)]);
      // }

      // appendPlugins([
      //   new AsyncBoundaryPlugin({
      //     excludeChunk: (chunk) => chunk.name === 'nested_remote',
      //     eager: (module) => /\.federation/.test(module?.request || ''),
      //   }),
      //   new ModuleFederationPlugin(mfConfig),
      // ]);
    },
  },
});
