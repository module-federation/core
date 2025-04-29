const path = require('path');
// const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
// registerPluginTSTranspiler();
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

module.exports = composePlugins(withNx(), withReact(), (config, context) => {
  config.watchOptions = {
    ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
  };

  // const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;
  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'bundle_size',
      experiments: {
        externalRuntime: false,
        asyncStartup: true,
        optimization: {
          disableSnapshot: true,
          target: 'web',
        },
      },
      remotes: {},
      // library: { type: 'var', name: 'runtime_remote' },
      filename: 'remoteEntry.js',
      exposes: {
        './HelloWorld': './src/HelloWorld.tsx',
      },
      dts: {
        tsConfigPath: path.resolve(__dirname, 'tsconfig.app.json'),
      },
      shareStrategy: 'loaded-first',
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react/': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
        'react-dom/': {
          singleton: true,
          requiredVersion: '^18.2.0',
        },
      },
    }),
  );
  if (!config.devServer) {
    config.devServer = {};
  }
  config.devServer.host = '127.0.0.1';
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
  config.optimization.runtimeChunk = false;
  config.optimization.innerGraph = true;
  config.optimization.minimize = true;
  // config.optimization.moduleIds = 'named'
  // const mf = await withModuleFederation(defaultConfig);
  return config;
});
