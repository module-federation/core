const path = require('path');
const { ModuleFederationPlugin } = require('../../../../dist/src');

/** @type {import("../../../../").Configuration} */
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'runtime_plugin_cwd_relative',
      runtimePlugins: [
        path.relative(process.cwd(), path.join(__dirname, 'runtime-plugin.js')),
      ],
    }),
  ],
};
