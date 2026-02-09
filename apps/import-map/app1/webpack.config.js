const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(withNx(), (config) => {
  config.devtool = false;
  config.experiments = { ...(config.experiments || {}), outputModule: true };
  config.output = {
    ...config.output,
    module: true,
    scriptType: 'module',
    publicPath: 'http://127.0.0.1:3101/',
  };
  config.optimization = {
    ...config.optimization,
    runtimeChunk: false,
    splitChunks: false,
  };

  return config;
});
