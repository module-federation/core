import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    port: 3008,
    hmr: false,
    host: 'localhost',
    liveReload: false,
  },
  runtime: {
    router: true,
  },
  server: {
    ssr: {
      mode: 'stream',
    },
  },
  output: {
    disableTsChecker: true,
    // disableCssExtract: true,
  },
  // source: {
  //   enableAsyncEntry: true,
  // },
  plugins: [appTools(), moduleFederationPlugin()],
  tools: {
    webpack: (config, { isServer, appendPlugins }) => {
      // if (config?.output) {
      //   config.output.publicPath = 'http://localhost:3008/';
      // }
      // const mfConfig = {
      //   name: 'dynamic_remote',
      //   filename: 'remoteEntry.js',
      //   exposes: {
      //     './Image': './src/components/Image.tsx',
      //   },
      //   shared: {
      //     react: { singleton: true },
      //     'react-dom': { singleton: true },
      //   },
      // };
      // if (isServer) {
      //   mfConfig.filename = 'bundles/remoteEntry.js';
      //   mfConfig.library = {
      //     type: 'commonjs-module',
      //   };
      //   mfConfig.manifest = false;
      //   appendPlugins([new StreamingTargetPlugin(mfConfig)]);
      // }
      // appendPlugins([new ModuleFederationPlugin(mfConfig)]);
    },
  },
});
