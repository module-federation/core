import { appTools, defineConfig } from '@modern-js/app-tools';
import { serverPlugin } from '@modern-js/plugin-server';
import mfPlugin from '@module-federation/modern-js';

const webpackConfig = {
  cache: false,
};

const isSecondarySharedTreeShaking = Boolean(
  process.env.SECONDARY_SHARED_TREE_SHAKING,
);

if (isSecondarySharedTreeShaking) {
  // @ts-ignore
  webpackConfig.entry = {
    main: 'data:application/node;base64,',
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
      root: isSecondarySharedTreeShaking ? 'dist-test' : 'dist',
    },
  },
  server: {
    port: 3001,
  },
  plugins: [
    appTools({
      bundler: 'webpack', // Set to 'webpack' to enable webpack
    }),
    mfPlugin({
      secondarySharedTreeShaking: isSecondarySharedTreeShaking,
    }),
    serverPlugin(),
  ],
  tools: {
    webpack: webpackConfig,
  },
});
