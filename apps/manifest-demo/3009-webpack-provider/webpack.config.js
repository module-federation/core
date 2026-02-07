// const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
// registerPluginTSTranspiler();
const path = require('path');
const reactPath = path.dirname(require.resolve('react/package.json'));
const reactDomPath = path.dirname(require.resolve('react-dom/package.json'));

const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');

module.exports = composePlugins(
  withNx(),
  withReact(),
  async (config, context) => {
    config.watchOptions = config.watchOptions || {};
    config.watchOptions.ignored = config.watchOptions.ignored || [];

    // Ensure ignored is an array
    if (!Array.isArray(config.watchOptions.ignored)) {
      config.watchOptions.ignored = [config.watchOptions.ignored];
    }

    // Add our patterns
    ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'].forEach(
      (pattern) => {
        if (!config.watchOptions.ignored.includes(pattern)) {
          config.watchOptions.ignored.push(pattern);
        }
      },
    );

    config.devServer = {
      ...config.devServer,
      devMiddleware: {
        writeToDisk: true,
      },
    };
    // publicPath must be specific url
    config.output.publicPath = 'auto';
    config.plugins.push(
      new ModuleFederationPlugin({
        name: 'webpack_provider',
        filename: 'remoteEntry.js',
        exposes: {
          './useCustomRemoteHook': './src/components/useCustomRemoteHook',
          './WebpackSvg': './src/components/WebpackSvg',
          './WebpackPng': './src/components/WebpackPng',
        },
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
        experiments: {
          externalRuntime: true,
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
        };
      },
    });
    config.optimization.runtimeChunk = false;
    config.plugins.forEach((p) => {
      if (p.constructor.name === 'ModuleFederationPlugin') {
        //Temporary workaround - https://github.com/nrwl/nx/issues/16983
        p._options.library = undefined;
      }
    });

    // This provider is only used in CI/e2e. Disable React Refresh to avoid it
    // instrumenting pre-bundled workspace packages (nested webpack runtimes),
    // which can crash at runtime with:
    //   "Cannot set properties of undefined (setting 'runtime')"
    config.plugins = (config.plugins || []).filter((p) => {
      const name = p?.constructor?.name;
      return !name || !name.includes('ReactRefresh');
    });

    const babelLoader = (config.module?.rules || []).find(
      (rule) =>
        rule &&
        typeof rule !== 'string' &&
        rule.loader?.toString().includes('babel-loader'),
    );
    if (babelLoader && typeof babelLoader !== 'string') {
      babelLoader.options = babelLoader.options || {};
      const plugins = babelLoader.options.plugins || [];
      babelLoader.options.plugins = plugins.filter((plugin) => {
        const id = Array.isArray(plugin) ? plugin[0] : plugin;
        return !(typeof id === 'string' && id.includes('react-refresh/babel'));
      });
    }

    //Temporary workaround - https://github.com/nrwl/nx/issues/16983
    config.experiments = { outputModule: false };

    config.output = {
      ...config.output,
      scriptType: 'text/javascript',
    };
    config.optimization = {
      ...config.optimization,
      runtimeChunk: false,
      splitChunks: false,
    };
    return config;
  },
);
