import { appTools, defineConfig } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin,
  IndependentSharedPlugin,
} from '@module-federation/enhanced';
import mfConfig from './module-federation.config';

if (process.env.SHAKE) {
  process.env.MF_CUSTOM_REFERENCED_EXPORTS = JSON.stringify({
    antd: ['Button'],
  });
}
// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },
  dev: {
    assetPrefix: 'http://localhost:3002/',
  },
  output: {
    assetPrefix: 'http://localhost:3002/',
    polyfill: 'off',
    disableTsChecker: true,
  },
  server: {
    port: 3002,
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
    webpack: {
      cache: false,
      // entry: {
      //   main: 'data:application/node;base64,',
      //   // main: '/Users/bytedance/work_test/shared-treeshake/webpack-project/provider/src/test-entry.ts',
      // },
    },
    bundlerChain(chain) {
      chain.optimization.moduleIds('named');
      chain.optimization.chunkIds('named');
      chain.optimization.mangleExports(false);
      // enable in dev
      chain.optimization.usedExports(true);
      // chain.optimization.minimize(false)
      chain.optimization.runtimeChunk(false);
      chain.plugin('MF').use(ModuleFederationPlugin, [mfConfig]);
      // chain.plugin('IndependentSharedPlugin').use(IndependentSharedPlugin, [
      //   {
      //     // @ts-ignore
      //     mfConfig,
      //     outputDir: 'independent-packages',
      //     treeshake: true,
      //   },
      // ]);

      // chain
      //   .plugin('DependencyReferencExportPlugin')
      //   .use(DependencyReferencExportPlugin, [mfConfig]);
      // chain.plugin('IndependentCompilerPlugin').use(IndependentCompilerPlugin, [
      //   {
      //     mfConfig,
      //   },
      // ]);
    },
  },
});
