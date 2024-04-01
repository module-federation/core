import { appTools, defineConfig } from '@modern-js/app-tools';
import {
  ModuleFederationPlugin,
  AsyncBoundaryPlugin,
} from '@module-federation/enhanced';
// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
  },
  plugins: [appTools()],
  tools: {
    webpack: (config, { webpack, appendPlugins }) => {
      config.output.publicPath = 'auto';

      appendPlugins([
        new AsyncBoundaryPlugin({
          excludeChunk: chunk => chunk.name === 'app1',
        }),
        new ModuleFederationPlugin({
          name: 'app1',
          exposes: {
            './thing': './src/test.ts',
          },
          runtimePlugins: [
            {
              import: './runtimePlugin.ts',
              async: true,
            },
          ],
          shared: {
            react: { singleton: true },
            'react-dom': { singleton: true },
          },
        }),
      ]);
    },
  },
});
