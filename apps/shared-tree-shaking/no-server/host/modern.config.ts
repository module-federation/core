import { appTools, defineConfig } from '@modern-js/app-tools';
import { serverPlugin } from '@modern-js/plugin-server';
import {
  ModuleFederationPlugin,
  TreeShakingSharedPlugin,
} from '@module-federation/enhanced';
import mfConfig from './module-federation.config';

const publicPath = 'http://localhost:3001/';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    assetPrefix: publicPath,
  },
  output: {
    assetPrefix: publicPath,
  },
  server: {
    port: 3001,
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
