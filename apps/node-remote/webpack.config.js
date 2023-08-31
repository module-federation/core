const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const {UniversalFederationPlugin} = require('@module-federation/node');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.plugins.push(new UniversalFederationPlugin({
    name: 'host',
  }));
  return config;
});
