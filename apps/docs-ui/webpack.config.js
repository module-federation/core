const { composePlugins, withNx, withWeb } = require('@nx/webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withWeb(), (config) => {
  const staticAssets = ['helpers', 'layouts', 'partials', 'img'];
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: staticAssets.map((a) => ({ from: `src/app/${a}`, to: a })),
    }),
  );
  // Update th  e webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  return config;
});
