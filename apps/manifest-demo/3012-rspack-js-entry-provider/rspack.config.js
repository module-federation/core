const path = require('path');
const { HtmlRspackPlugin } = require('@rspack/core');
const reactPath = path.dirname(require.resolve('react/package.json'));
const reactDomPath = path.dirname(require.resolve('react-dom/package.json'));

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
      main: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'http://localhost:3012/',
      clean: true,
    },
    resolve: {
      extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
      tsConfig: path.resolve(__dirname, 'tsconfig.app.json'),
    },
    module: {
      rules: [
        {
          test: /\.jsx$/,
          use: {
            loader: 'builtin:swc-loader',
            options: {
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
      {
        name: 'alias-plugin',
        apply(compiler) {
          compiler.options.resolve.alias = {
            ...compiler.options.resolve.alias,
            react: reactPath,
            'react-dom': reactDomPath,
          };
        },
      },
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
    ],
    devServer: {
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
    },
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
    },
    optimization: {
      runtimeChunk: false,
      minimize: false,
      splitChunks: false,
    },
  };
};
