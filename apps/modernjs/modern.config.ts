import { appTools, defineConfig } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin,
  AsyncBoundaryPlugin,
} from '@module-federation/enhanced';
// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    port: 4001,
  },
  runtime: {
    router: true,
  },
  security: {
    checkSyntax: true,
  },
  source: {
    // downgrade @module-federation related pkgs
    include: [
      // should set module-federation in outer repo
      /universe\/packages/,
      /core\/packages/,
    ],
  },
  // source: {
  //   enableAsyncEntry: true,
  // },
  plugins: [appTools()],
  tools: {
    babel(config) {
      config.sourceType = 'unambiguous';
    },
    webpack: (config, { webpack, appendPlugins }) => {
      if (config?.output) {
        config.output.publicPath = 'http://localhost:4001/';
        config.output.uniqueName = 'modern-js-app1';
      }

      appendPlugins([
        new AsyncBoundaryPlugin({
          excludeChunk: chunk => chunk.name === 'app1',
          eager: module => /\.federation/.test(module?.request || ''),
        }),
        new ModuleFederationPlugin({
          name: 'app1',
          exposes: {
            './thing': './src/test.ts',
            './react-component': './src/components/react-component.tsx',
          },
          runtimePlugins: ['./runtimePlugin.ts'],
          shared: {
            react: { singleton: true },
            'react-dom': { singleton: true },
          },
          dataPrefetch: true,
        }),
      ]);
    },
  },
});
