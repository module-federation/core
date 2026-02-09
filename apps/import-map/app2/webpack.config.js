const { composePlugins, withNx } = require('@nx/webpack');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');

module.exports = composePlugins(withNx(), (config) => {
  if (!config.devServer) {
    config.devServer = {};
  }
  config.devServer.headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers':
      'X-Requested-With, content-type, Authorization',
  };
  config.devServer.allowedHosts = 'all';

  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'import_map_remote',
      filename: 'remoteEntry.js',
      library: { type: 'module' },
      exposes: {
        './hello': './src/hello.ts',
      },
    }),
  );

  config.devtool = false;
  config.experiments = { ...(config.experiments || {}), outputModule: true };
  config.output = {
    ...config.output,
    module: true,
    scriptType: 'module',
    publicPath: 'http://127.0.0.1:3102/',
  };
  config.optimization = {
    ...config.optimization,
    runtimeChunk: false,
    splitChunks: false,
  };

  return config;
});
