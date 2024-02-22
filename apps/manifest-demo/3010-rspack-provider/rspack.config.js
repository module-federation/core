const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
registerPluginTSTranspiler();

const { composePlugins, withNx, withReact } = require('@nx/rspack');

const path = require('path');
// const { withModuleFederation } = require('@nx/react/module-federation');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced-rspack');

module.exports = composePlugins(
  withNx(),
  withReact(),
  async (config, context) => {
    config.context = path.join(
      context.context.root,
      'apps/manifest-demo/3010-rspack-provider',
    );
    config.module.rules.push({
      test: /\.tsx$/,
      use: {
        loader: 'builtin:swc-loader',
        options: {
          sourceMap: true,
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
          },
        },
      },
      type: 'javascript/auto',
    });
    config.resolve = {
      extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
      tsConfigPath: path.resolve(__dirname, 'tsconfig.app.json'),
    };
    config.plugins.push(
      new ModuleFederationPlugin({
        name: 'runtime_remote2',
        // library: { type: 'var', name: 'runtime_remote' },
        filename: 'remoteEntry.js',
        exposes: {
          './ButtonOldAnt': './src/components/ButtonOldAnt',
        },
        shared: {
          lodash: {},
          antd: {},
          react: {},
          'react/': {},
          'react-dom': {},
          'react-dom/': {},
        },
        manifest: true,
      }),
    );
    // config.optimization.runtimeChunk = false;
    // config.plugins.forEach((p) => {
    //   if (p.constructor.name === 'ModuleFederationPlugin') {
    //     //Temporary workaround - https://github.com/nrwl/nx/issues/16983
    //     p._options.library = undefined;
    //   }
    // });

    // //Temporary workaround - https://github.com/nrwl/nx/issues/16983
    // config.experiments = { outputModule: false };

    // // Update the webpack config as needed here.
    // // e.g. `config.plugins.push(new MyPlugin())`
    // config.output = {
    //   ...config.output,
    //   scriptType: 'text/javascript',
    // };
    config.optimization = {
      ...config.optimization,
      runtimeChunk: false,
      minimize: false,
    };
    // const mf = await withModuleFederation(defaultConfig);
    return config;
  },
);
