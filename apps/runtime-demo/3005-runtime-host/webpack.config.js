const path = require('path');
const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
registerPluginTSTranspiler();
const { ModuleFederationPlugin } = require('@module-federation/enhanced');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  config.plugins.push(
    new ModuleFederationPlugin({
      name: 'runtime_host',
      remotes: {
        remote2: 'runtime_remote2@http://localhost:3007/remoteEntry.js',
      },
      // library: { type: 'var', name: 'runtime_remote' },
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button.tsx',
      },
      runtimePlugins: [path.join(__dirname, './runtimePlugin.ts')],
    }),
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
});
