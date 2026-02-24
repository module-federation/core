const path = require('path');
const reactPath = path.dirname(require.resolve('react/package.json'));
const reactDomPath = path.dirname(require.resolve('react-dom/package.json'));
const swcLoader = require.resolve('swc-loader');
const styleLoader = require.resolve('style-loader');
const cssLoader = require.resolve('css-loader');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = composePlugins(withNx(), withReact(), (config, context) => {
  const workspaceDistRegex = /[\\/]packages[\\/].+[\\/]dist[\\/]/i;
  config.watchOptions = config.watchOptions || {};
  config.watchOptions.ignored = config.watchOptions.ignored || [];

  // Ensure ignored is an array
  if (!Array.isArray(config.watchOptions.ignored)) {
    config.watchOptions.ignored = [config.watchOptions.ignored];
  }

  // Add our patterns
  ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'].forEach((pattern) => {
    if (!config.watchOptions.ignored.includes(pattern)) {
      config.watchOptions.ignored.push(pattern);
    }
  });

  config.plugins.push(
    new ModuleFederationPlugin({
      runtime: false,
      name: 'manifest_host',
      remotes: {
        remote1: 'webpack_provider@http://localhost:3009/mf-manifest.json',
        'manifest-provider':
          'rspack_manifest_provider@http://localhost:3011/mf-manifest.json',
        'js-entry-provider':
          'rspack_js_entry_provider@http://localhost:3012/remoteEntry.js',
      },
      filename: 'remoteEntry.js',
      shared: {
        lodash: {},
        antd: {},
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
      dataPrefetch: true,
      runtimePlugins: [path.join(__dirname, './runtimePlugin.ts')],
      experiments: {
        provideExternalRuntime: true,
        asyncStartup: true,
      },
    }),
  );

  config.plugins.push({
    name: 'nx-dev-webpack-plugin',
    apply(compiler) {
      compiler.options.devtool = false;
      compiler.options.resolve.alias = {
        ...compiler.options.resolve.alias,
        react: reactPath,
        'react-dom': reactDomPath,
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          include: [sourcePath, runtimePluginPath],
          use: {
            loader: swcLoader,
            options: {
              sourceMaps: true,
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                  decorators: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: !isProduction,
                  },
                },
              },
            },
          },
        },
        {
          test: /\.module\.css$/,
          use: [
            styleLoader,
            {
              loader: cssLoader,
              options: {
                modules: {
                  localIdentName: '[name]__[local]__[hash:base64:5]',
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: [styleLoader, cssLoader],
        },
        {
          test: /\.(png|svg|jpe?g|gif|webp)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        runtime: false,
        name: 'manifest_host',
        remotes: {
          remote1: 'webpack_provider@http://localhost:3009/mf-manifest.json',
          'manifest-provider':
            'rspack_manifest_provider@http://localhost:3011/mf-manifest.json',
          'js-entry-provider':
            'rspack_js_entry_provider@http://localhost:3012/remoteEntry.js',
        },
        filename: 'remoteEntry.js',
        shared: {
          lodash: {},
          antd: {},
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
        dataPrefetch: true,
        runtimePlugins: [path.join(__dirname, './runtimePlugin.ts')],
        experiments: {
          provideExternalRuntime: true,
          asyncStartup: true,
        },
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src/index.html'),
      }),
    ],
    watchOptions: {
      ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
    },
    devServer: {
      static: false,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
      devMiddleware: {
        writeToDisk: true,
      },
      historyApiFallback: true,
    },
    experiments: {
      outputModule: false,
      cacheUnaffected: true,
    },
    optimization: {
      runtimeChunk: 'single',
      minimize: false,
      moduleIds: 'named',
      chunkIds: 'named',
      splitChunks: false,
    },
  });
  config.plugins.forEach((p) => {
    if (p.constructor.name === 'ModuleFederationPlugin') {
      //Temporary workaround - https://github.com/nrwl/nx/issues/16983
      p._options.library = undefined;
    }
    if (
      (p.constructor.name === 'ReactRefreshPlugin' ||
        p instanceof ReactRefreshPlugin) &&
      p.options
    ) {
      const currentExclude = p.options.exclude;
      if (Array.isArray(currentExclude)) {
        p.options.exclude = [...currentExclude, workspaceDistRegex];
      } else if (currentExclude) {
        p.options.exclude = [currentExclude, workspaceDistRegex];
      } else {
        p.options.exclude = workspaceDistRegex;
      }
    }
  });
  if (config.devServer) {
    config.devServer.client.overlay = false;
    config.devServer.devMiddleware.writeToDisk = true;
  }
  config.devtool = false;
  config.entry = './src/index.tsx';
  //Temporary workaround - https://github.com/nrwl/nx/issues/16983
  config.experiments = { outputModule: false };

  config.output = {
    ...config.output,
    scriptType: 'text/javascript',
  };
};
