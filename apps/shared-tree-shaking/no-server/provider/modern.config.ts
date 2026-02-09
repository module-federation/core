import { appTools, defineConfig } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin,
  TreeShakingSharedPlugin,
} from '@module-federation/enhanced';
import { serverPlugin } from '@modern-js/plugin-server';

import mfConfig from './module-federation.config';

const publicPath = 'http://localhost:3002/';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    assetPrefix: publicPath,
  },
  output: {
    assetPrefix: publicPath,
    disableTsChecker: true,
  },
  server: {
    port: 3002,
  },
  plugins: [
    appTools({
      bundler: 'webpack',
    }),
    serverPlugin(),
  ],
  source: {
    transformImport: false,
    enableAsyncEntry: true,
  },
  tools: {
    bundlerChain(chain) {
      chain.optimization.runtimeChunk(false);
      chain.plugin('MF').use(ModuleFederationPlugin, [mfConfig]);
    },
  },
});
