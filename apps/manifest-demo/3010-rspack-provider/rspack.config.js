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
      'apps/manifest-demo/3010-rspack-provider',
    );
    config.module.parser = {
      'css/auto': {
        namedExports: false,
      },
    };

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
                  refresh: true,
                },
              },
            },
          },
        },
        type: 'javascript/auto',
      },
    ];
    config.experiments = {
      css: true,
    };
    config.resolve = {
      extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
      tsConfig: path.resolve(__dirname, 'tsconfig.app.json'),
    };
    // publicPath must be specific url
    config.output.publicPath = 'http://localhost:3010/';

    const rspackPlugin = config.plugins.find((plugin) => {
      return plugin.name === 'HtmlRspackPlugin';
    });

    if (rspackPlugin && rspackPlugin._args && rspackPlugin._args[0]) {
      rspackPlugin._args[0].excludeChunks = ['rspack_provider'];
    } else {
      console.warn(
        'HtmlRspackPlugin not found or has unexpected structure. Skipping excludeChunks configuration.',
      );
    }

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
          // 'react/': {
          //   singleton: true,
          //   requiredVersion: '^18.3.1',
          // },
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
        dataPrefetch: true,
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
        splitChunks: false,
      });
    config.output.clean = true;

    return config;
  },
);
