import { appTools, defineConfig } from '@modern-js/app-tools';
import mfPlugin from '@module-federation/modern-js-v3';
import { serverPlugin } from '@modern-js/plugin-server';

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

const publicPath = 'http://localhost:3002/';

const typeCheckerTypeScriptPath = require.resolve('typescript-compiler');

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    assetPrefix: publicPath,
  },
  output: {
    assetPrefix: publicPath,
    disableTsChecker: true,
    distPath: {
      root: isSecondarySharedTreeShaking ? 'dist-test' : 'dist',
    },
  },
  server: {
    port: 3002,
  },
  plugins: [
    appTools({
      bundler: 'webpack',
    }),
    mfPlugin({
      secondarySharedTreeShaking: isSecondarySharedTreeShaking,
    }),
    serverPlugin(),
  ],
  tools: {
    tsChecker: {
      typescript: {
        typescriptPath: typeCheckerTypeScriptPath,
      },
    },
    webpack: webpackConfig,
  },
});
