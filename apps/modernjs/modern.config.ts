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
  plugins: [appTools()],
  tools: {
    webpack: (config, { webpack, appendPlugins }) => {
      if (config?.output) {
        config.output.publicPath = 'http://localhost:4001';
      }

      appendPlugins([
        new AsyncBoundaryPlugin({
          excludeChunk: chunk => chunk.name === 'app1',
        }),
        new ModuleFederationPlugin({
          name: 'app1',
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
