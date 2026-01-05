import { appTools, defineConfig } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin,
  TreeshakeSharedPlugin,
} from '@module-federation/enhanced';
import { serverPlugin } from '@modern-js/plugin-server';

import mfConfig from './module-federation.config';
import path from 'path';

const webpackConfig = {
  cache: false,
};

const isReShake = process.env.RE_SHAKE;

if (isReShake) {
  // @ts-ignore
  webpackConfig.entry = {
    main: 'data:application/node;base64,',
  };
  // @ts-ignore
  mfConfig.shared.antd = {
    // @ts-ignore
    ...mfConfig.shared.antd,
    treeshake: {
      strategy: 'server',
      usedExports: ['Divider', 'Space', 'Switch', 'Button', 'Badge'],
    },
  };
}

const publicPath = 'http://localhost:3002/';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },
  dev: {
    assetPrefix: publicPath,
  },
  output: {
    assetPrefix: publicPath,
    disableTsChecker: true,
    distPath: {
      root: isReShake ? 'dist-test' : 'dist',
    },
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
    enableAsyncEntry: true,
  },
  tools: {
    webpack: webpackConfig,
    bundlerChain(chain) {
      chain.optimization.runtimeChunk(false);

      if (isReShake) {
        chain.plugin('TreeshakeSharedPlugin').use(TreeshakeSharedPlugin, [
          {
            mfConfig,
          },
        ]);
      } else {
        chain.plugin('MF').use(ModuleFederationPlugin, [mfConfig]);
      }
    },
  },
});
