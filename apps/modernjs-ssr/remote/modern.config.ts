import { appTools, defineConfig } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin,
  AsyncBoundaryPlugin,
} from '@module-federation/enhanced';
import { StreamingTargetPlugin } from '@module-federation/node';
// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    port: 3006,
    host: 'localhost',
    hmr: false,
    liveReload: false,
  },
  runtime: {
    router: true,
  },
  output: {
    disableTsChecker: true,
  },
  // source: {
  //   enableAsyncEntry: true,
  // },
  plugins: [appTools()],
  server: {
    ssr: true,
  },
  tools: {
    webpack: (config, { isServer, appendPlugins }) => {
      config.optimization!.runtimeChunk = false;
      if (config?.output) {
        config.output.publicPath = 'http://localhost:3006/';
      }

      const mfConfig = {
        name: 'remote',
        filename: 'remoteEntry.js',
        exposes: {
          './Image': './src/components/Image.tsx',
        },
        shared: {
          react: { singleton: true },
          'react-dom': { singleton: true },
        },
        dts: false,
        dev: false,
      };
      if (isServer) {
        mfConfig.filename = 'bundles/remoteEntry.js';
        mfConfig.library = {
          type: 'commonjs-module',
        };
        mfConfig.manifest = false;
      }
      if (isServer) {
        appendPlugins([new StreamingTargetPlugin(mfConfig)]);
      }
      appendPlugins([new ModuleFederationPlugin(mfConfig)]);
    },
  },
});
