// const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
// registerPluginTSTranspiler();

const { composePlugins, withNx, withReact } = require('@nx/rspack');

const path = require('path');
// const { withModuleFederation } = require('@nx/react/module-federation');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/rspack');

module.exports = composePlugins(
  withNx(),
  withReact(),
  async (config, context) => {
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    };
    config.context = path.join(
      context.context.root,
      'apps/manifest-demo/3012-rspack-js-entry-provider',
    );
    // @nx/rspack not sync the latest rspack changes currently, so just override rules
    config.module.rules = [
      {
        test: /\.jsx$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            sourceMap: true,
            jsc: {
              parser: {
                syntax: 'ecmascript',
                jsx: true,
              },
              transform: {
                react: {
                  pragma: 'React.createElement',
                  pragmaFrag: 'React.Fragment',
                  throwIfNamespace: true,
                  development: false,
                  useBuiltins: false,
                },
              },
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.jpg/,
        type: 'asset/resource',
      },
    ];
    config.resolve = {
      extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
      tsConfig: path.resolve(__dirname, 'tsconfig.app.json'),
    };
    // publicPath must be specific url
    config.output.publicPath = 'http://localhost:3012/';

    config.plugins.push(
      new ModuleFederationPlugin({
        name: 'rspack_js_entry_provider',
        filename: 'remoteEntry.js',
        exposes: {
          './Component': './src/App.jsx',
        },
        shared: {
          'react/': {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
          react: {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
          'react-dom/': {
            singleton: true,
            requiredVersion: '^18.3.1',
          },
        },
        manifest: false,
        experiments: {
          externalRuntime: true,
        },
      }),
    );
    (config.devServer = {
      // devDeps are installed in root package.json , so shared.version can not be gotten
      client: {
        overlay: false,
      },
      port: 3012,
      devMiddleware: {
        writeToDisk: true,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers':
          'X-Requested-With, content-type, Authorization',
      },
    }),
      (config.optimization = {
        ...config.optimization,
        runtimeChunk: false,
        minimize: false,
        splitChunks: false,
      });
    config.output.clean = true;

    return config;
  },
);
