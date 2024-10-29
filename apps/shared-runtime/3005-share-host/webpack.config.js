const path = require('path');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

module.exports = composePlugins(withNx(), withReact(), (config, context) => {
  config.watchOptions = {
    ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
  };

  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'runtime_host',
      experiments: { federationRuntime: 'use-host' },
      remotes: {
        remote1: 'runtime_remote1@http://127.0.0.1:3006/mf-manifest.json',
      },
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button.tsx',
      },
      dts: {
        tsConfigPath: path.resolve(__dirname, 'tsconfig.app.json'),
      },
      shareStrategy: 'loaded-first',
      shared: {
        lodash: {
          singleton: true,
          requiredVersion: '^4.0.0',
        },
        antd: {
          singleton: true,
          requiredVersion: '^4.0.0',
        },
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
  config.optimization = {
    runtimeChunk: false,
    minimize: false,
    moduleIds: 'named',
  };
  // const mf = await withModuleFederation(defaultConfig);
  return config;
});
