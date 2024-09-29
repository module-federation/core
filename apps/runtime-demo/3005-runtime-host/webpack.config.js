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
      name: 'runtime_host',
      experiments: { federationRuntime: 'hoisted' },
      remotes: {
        // remote2: 'runtime_remote2@http://localhost:3007/remoteEntry.js',
        remote1: 'runtime_remote1@http://127.0.0.1:3006/mf-manifest.json',
        // remote1: `promise new Promise((resolve)=>{
        //   const raw = 'runtime_remote1@http://127.0.0.1:3006/remoteEntry.js'
        //   const [_, remoteUrlWithVersion] = raw.split('@')
        //   const script = document.createElement('script')
        //   script.src = remoteUrlWithVersion
        //   script.onload = () => {
        //     const proxy = {
        //       get: (request) => window.runtime_remote1.get(request),
        //       init: (arg) => {
        //         try {
        //           return window.runtime_remote1.init(arg)
        //         } catch(e) {
        //           console.log('runtime_remote1 container already initialized')
        //         }
        //       }
        //     }
        //     resolve(proxy)
        //   }
        //   document.head.appendChild(script);
        // })`,
      },
      // library: { type: 'var', name: 'runtime_remote' },
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
