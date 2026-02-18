const path = require('path');
const { HtmlRspackPlugin } = require('@rspack/core');

const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/rspack');

module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    target: 'web',
    context: __dirname,
    devtool: false,
    entry: {
      main: path.resolve(__dirname, 'src/main.ts'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'http://localhost:3004/',
      clean: true,
    },
    resolve: {
      extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
      tsConfig: path.resolve(__dirname, 'tsconfig.app.json'),
    },
    module: {
      rules: [
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
      ],
    },
    plugins: [
      new HtmlRspackPlugin({
        template: path.resolve(__dirname, 'src/index.html'),
      }),
      new ModuleFederationPlugin({
        name: 'react_ts_remote',
        filename: 'remoteEntry.js',
        exposes: {
          './Module': './src/app/nx-welcome.tsx',
        },
      }),
    ],
    devServer: {
      hot: false,
      liveReload: false,
      client: {
        overlay: false,
      },
      host: '127.0.0.1',
      port: 3004,
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
    },
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
    },
    optimization: {
      runtimeChunk: false,
      minimize: false,
    },
  };
};
