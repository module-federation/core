const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
registerPluginTSTranspiler();

const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.devtool = false;

  return config;
});
