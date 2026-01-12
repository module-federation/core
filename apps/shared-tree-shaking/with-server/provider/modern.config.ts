import { appTools, defineConfig } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin,
  TreeShakingSharedPlugin,
} from '@module-federation/enhanced';
import { serverPlugin } from '@modern-js/plugin-server';

import mfConfig from './module-federation.config';

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
    treeShaking: {
      mode: 'server-calc',
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
        chain.plugin('TreeShakingSharedPlugin').use(TreeShakingSharedPlugin, [
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
