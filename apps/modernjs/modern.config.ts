import { appTools, defineConfig } from '@modern-js/app-tools';
import { ModuleFederationPlugin } from '@module-federation/enhanced';
import { pluginBabel } from '@rsbuild/plugin-babel';
// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  server: {
    port: 4001,
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
  builderPlugins: [
    pluginBabel({
      babelLoaderOptions: config => {
        ``;
        config.sourceType = 'unambiguous';
      },
    }),
  ],
  tools: {
    rspack: (config, { appendPlugins }) => {
      if (config?.output) {
        config.output.publicPath = 'http://127.0.0.1:4001/';
        config.output.uniqueName = 'modern-js-app1';
      }

      appendPlugins([
        new ModuleFederationPlugin({
          runtime: false,
          name: 'app1',
          exposes: {
            './thing': './src/test.ts',
            './react-component': './src/components/react-component.tsx',
          },
          runtimePlugins: ['./runtimePlugin.ts'],
          experiments: {
            asyncStartup: true,
          },
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
          dataPrefetch: true,
        }) as any,
      ]);
    },
  },
});
