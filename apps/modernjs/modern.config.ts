import { appTools, defineConfig } from '@modern-js/app-tools';
import { ModuleFederationPlugin } from '@module-federation/enhanced';
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
      }

      appendPlugins([
        new ModuleFederationPlugin({
          name: 'app1',
          async: {
            excludeChunk: chunk => chunk.name === 'app1',
            eager: module => /\.federation/.test(module?.request || ''),
          },
          exposes: {
            './thing': './src/test.ts',
          },
          runtimePlugins: ['./runtimePlugin.ts'],
          shared: {
            react: { singleton: true },
            'react-dom': { singleton: true },
          },
        }),
      ]);
    },
  },
});
