import { appTools, defineConfig } from '@modern-js/app-tools';
import { serverPlugin } from '@modern-js/plugin-server';
import {
  ModuleFederationPlugin,
  TreeShakingSharedPlugin,
} from '@module-federation/enhanced';
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
    treeShaking: {
      strategy: 'server',
      usedExports: ['Divider', 'Space', 'Switch', 'Button', 'Badge'],
    },
  };
}

const publicPath = 'http://localhost:3001/';

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
    distPath: {
      root: isReShake ? 'dist-test' : 'dist',
    },
  },
  server: {
    port: 3001,
  },
  plugins: [
    appTools({
      bundler: 'webpack', // Set to 'webpack' to enable webpack
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
      // chain.optimization.minimize(false);

      if (isReShake) {
        chain.plugin('TreeShakingSharedPlugin').use(TreeShakingSharedPlugin, [
          {
            mfConfig,
            reShake: true,
          },
        ]);
      } else {
        chain.plugin('MF').use(ModuleFederationPlugin, [mfConfig]);
      }
    },
  },
});
