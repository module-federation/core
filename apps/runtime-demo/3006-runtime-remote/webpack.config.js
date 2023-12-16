const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
registerPluginTSTranspiler();

const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

const path = require('path');
// const { withModuleFederation } = require('@nx/react/module-federation');
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

module.exports = composePlugins(
  withNx(),
  withReact(),
  async (config, context) => {
    config.plugins.push(
      new ModuleFederationPlugin({
        name: 'runtime_remote',
        // library: { type: 'var', name: 'runtime_remote' },
        filename: 'remoteEntry.js',
        exposes: {
          './Button': './src/Button.tsx',
          './Button1': './src/Button1.tsx',
        },
      }),
    );
    console.log(
      'config.optimization?.runtimeChunk',
      config.optimization?.runtimeChunk,
    );
    config.optimization.runtimeChunk = false;
    config.plugins.forEach((p) => {
      if (p.constructor.name === 'ModuleFederationPlugin') {
        //Temporary workaround - https://github.com/nrwl/nx/issues/16983
        p._options.library = undefined;
      }
    });

    //Temporary workaround - https://github.com/nrwl/nx/issues/16983
    config.experiments = { outputModule: false };

    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`
    config.output = {
      ...config.output,
      scriptType: 'text/javascript',
    };
    config.optimization = {
      runtimeChunk: false,
      minimize: false,
    };
    // const mf = await withModuleFederation(defaultConfig);
    return config;
    /** @type {import('webpack').Configuration} */
    // const parsedConfig = mf(config, context);

    // parsedConfig.plugins.forEach((p) => {
    //   if (p.constructor.name === 'ModuleFederationPlugin') {
    //     //Temporary workaround - https://github.com/nrwl/nx/issues/16983
    //     p._options.library = undefined;
    //   }
    // });

    // parsedConfig.devServer = {
    //   ...(parsedConfig.devServer || {}),
    //   //Needs to resolve static files from the dist folder (@mf-types)
    //   static: path.resolve(__dirname, '../../dist/apps/runtime-demo/remote'),
    // };

    // //Temporary workaround - https://github.com/nrwl/nx/issues/16983
    // parsedConfig.experiments = { outputModule: false };

    // // Update the webpack config as needed here.
    // // e.g. `config.plugins.push(new MyPlugin())`
    // parsedConfig.output = {
    //   ...parsedConfig.output,
    //   scriptType: 'text/javascript',
    // };

    // return parsedConfig;
  },
);
