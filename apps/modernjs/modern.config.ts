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
    checkSyntax: false,
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
      // Ensure React resolves to the client build (not the react-server subset)
      // Some bundler setups include the 'react-server' condition by default, which
      // points 'react' to react.shared-subset.* with no runtime exports.
      // Force aliases to the standard client entry points and drop the condition.
      (config.resolve ||= {});
      (config.resolve.alias ||= {});
      Object.assign(config.resolve.alias, {
        react: require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
        'react/jsx-runtime': require.resolve('react/jsx-runtime'),
        'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
      });
      if (Array.isArray((config as any).resolve?.conditionNames)) {
        (config as any).resolve.conditionNames = (config as any).resolve.conditionNames.filter(
          (c: string) => c !== 'react-server',
        );
      }
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
