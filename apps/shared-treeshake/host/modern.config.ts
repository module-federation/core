import { appTools, defineConfig } from '@modern-js/app-tools';
import {
  // DependencyReferencExportPlugin,
  IndependentSharePlugin,
  ModuleFederationPlugin,
} from '@module-federation/enhanced';
import mfConfig from './module-federation.config';
const isReShake = process.env.RE_SHAKE;
if (isReShake) {
  process.env.MF_CUSTOM_REFERENCED_EXPORTS = JSON.stringify({
    antd: ['Divider', 'Space', 'Switch', 'Button', 'Badge'],
  });
}

const webpackConfig = {

      cache: false,
}

if(isReShake){
  // @ts-ignore
  webpackConfig.entry = {
        main: 'data:application/node;base64,',
      }
}
// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },
  dev: {
    assetPrefix: 'http://localhost:3001/',
  },
  output: {
    assetPrefix: 'http://localhost:3001/',
    polyfill: 'off',
    disableTsChecker: true,
  },
  server: {
    port: 3001,
  },
  plugins: [
    appTools({
      bundler: 'webpack', // Set to 'webpack' to enable webpack
    }),
  ],
  performance: {
    chunkSplit: {
      strategy: 'split-by-module',
    },
  },
  source: {
    enableAsyncEntry: true,
    transformImport: false,
  },
  tools: {
    webpack: webpackConfig,
    bundlerChain(chain) {
         chain.optimization.moduleIds('named');
      chain.optimization.chunkIds('named');
      chain.optimization.mangleExports(false);
      // enable in dev
      chain.optimization.usedExports(true);
      // chain.optimization.minimize(false)
      chain.optimization.runtimeChunk(false);
      if(isReShake){
     chain.plugin('IndependentSharePlugin').use(IndependentSharePlugin, [
        {
          // @ts-ignore
          mfConfig,
          outputDir: 'independent-packages',
          treeshake: true,
        },
      ]);
      }else{
        chain.plugin('MF').use(ModuleFederationPlugin, [mfConfig]);
      }
    },
  },
});
