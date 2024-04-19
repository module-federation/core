import { appTools, defineConfig } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin,
  AsyncBoundaryPlugin,
} from '@module-federation/enhanced';
// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  dev: {
    port: 3007,
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
        config.output.publicPath = 'http://localhost:3007/';
      }

      appendPlugins([
        new AsyncBoundaryPlugin({
          excludeChunk: (chunk) => chunk.name === 'nested_remote',
          eager: (module) => /\.federation/.test(module?.request || ''),
        }),
        new ModuleFederationPlugin({
          name: 'nested_remote',
          exposes: {
            './Content': './src/components/Content.tsx',
          },
          remotes: {
            remote: 'remote@http://localhost:3006/mf-manifest.json',
          },
          shared: {
            react: { singleton: true },
            'react-dom': { singleton: true },
          },
        }),
      ]);
    },
  },
});
