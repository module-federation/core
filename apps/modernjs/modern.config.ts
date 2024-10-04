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
    webpack: (config, { appendPlugins }) => {
      if (config?.output) {
        config.output.publicPath = 'http://127.0.0.1:4001/';
        config.output.uniqueName = 'modern-js-app1';
      }

      appendPlugins([
        new ModuleFederationPlugin({
          name: 'app1',
          exposes: {
            './thing': './src/test.ts',
            './react-component': './src/components/react-component.tsx',
          },
          runtimePlugins: ['./runtimePlugin.ts'],
          filename: 'remoteEntry.js',
          shared: {
            'react/': {
              singleton: true,
              requiredVersion: '^18.3.1',
            },
            react: {
              singleton: true,
              requiredVersion: '^18.3.1',
            },
            'react-dom': {
              singleton: true,
              requiredVersion: '^18.3.1',
            },
            'react-dom/': {
              singleton: true,
              requiredVersion: '^18.3.1',
            },
          },
          experiments: {
            federationRuntime: 'hoisted',
          },
          dataPrefetch: true,
        }) as any,
      ]);
    },
  },
});
