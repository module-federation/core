const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
registerPluginTSTranspiler();

const { composePlugins, withNx, withReact } = require('@nx/rspack');

const path = require('path');
// const { withModuleFederation } = require('@nx/react/module-federation');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced-rspack');

module.exports = composePlugins(
  withNx(),
  withReact(),
  async (config, context) => {
    config.context = path.join(
      context.context.root,
      'apps/manifest-demo/3010-rspack-provider',
    );
    // @nx/rspack not sync the latest rspack changes currently, so just override rules
    config.module.rules = [
      {
        test: /\.tsx$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            sourceMap: true,
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                },
              },
            },
          },
        },
        type: 'javascript/auto',
      },
    ];
    config.resolve = {
      extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
      tsConfigPath: path.resolve(__dirname, 'tsconfig.app.json'),
    };
    // publicPath must be specific url
    config.output.publicPath = 'http://localhost:3010/';

    config.plugins.push(
      new ModuleFederationPlugin({
        name: 'rspack_provider',
        filename: 'remoteEntry.js',
        exposes: {
          './ButtonOldAnt': './src/components/ButtonOldAnt',
        },
        shared: {
          lodash: {},
          antd: {},
          react: {},
          'react/': {},
          'react-dom': {},
          'react-dom/': {},
        },
        manifest: true,
      }),
    );
    (config.devServer = {
      // devDeps are installed in root package.json , so shared.version can not be gotten
      client: {
        overlay: false,
      },
      port: 3010,
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
      });
    config.output.clean = true;

    return config;
  },
);
