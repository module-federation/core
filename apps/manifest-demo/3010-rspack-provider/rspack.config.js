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
      main: path.resolve(__dirname, 'src/index.ts'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'http://localhost:3010/',
      clean: true,
    },
    resolve: {
      extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
      tsConfig: path.resolve(__dirname, 'tsconfig.app.json'),
      alias: {
        react: reactPath,
        'react-dom': reactDomPath,
      },
    },
    module: {
      parser: {
        'css/auto': {
          namedExports: false,
        },
      },
      rules: [
        {
          test: /\.tsx$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          use: {
            loader: 'builtin:swc-loader',
            options: {
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
      ],
    },
    experiments: {
      css: true,
    },
    plugins: [
      new HtmlRspackPlugin({
        template: path.resolve(__dirname, 'src/index.html'),
        excludeChunks: ['rspack_provider'],
      }),
      new ModuleFederationPlugin({
        name: 'rspack_provider',
        filename: 'remoteEntry.js',
        exposes: {
          './ButtonOldAnt': './src/components/ButtonOldAnt',
        },
        shared: {
          lodash: {},
          antd: {},
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
          asyncStartup: true,
          externalRuntime: true,
        },
      }),
    ],
    devServer: {
      host: '::',
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
