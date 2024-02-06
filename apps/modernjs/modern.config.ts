import { appTools, defineConfig } from '@modern-js/app-tools';
import { ModuleFederationPlugin } from '@module-federation/enhanced';
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
        new ModuleFederationPlugin({
          name: 'app1',
          remotes: {
            app2: 'app2@http://localhost:3002/static/js/remoteEntry.js',
          },
          exposes: {
            './thing': './src/test.ts',
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
