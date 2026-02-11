const path = require('path');
const reactPath = path.dirname(require.resolve('react/package.json'));
const reactDomPath = path.dirname(require.resolve('react-dom/package.json'));
// const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');
// registerPluginTSTranspiler();
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/webpack');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

const WORKSPACE_DIST_PATTERN = /[\\/]packages[\\/][^\\/]+[\\/]dist[\\/]/;

function hasBabelLoader(rule) {
  const uses = Array.isArray(rule?.use)
    ? rule.use
    : rule?.use
      ? [rule.use]
      : [];
  return uses.some(
    (useEntry) =>
      useEntry &&
      typeof useEntry === 'object' &&
      typeof useEntry.loader === 'string' &&
      useEntry.loader.includes('babel-loader'),
  );
}

function appendExclude(existingExclude, pattern) {
  if (!existingExclude) {
    return pattern;
  }
  if (Array.isArray(existingExclude)) {
    return [...existingExclude, pattern];
  }
  return [existingExclude, pattern];
}

function excludeWorkspaceDistFromBabel(rules = []) {
  for (const rule of rules) {
    if (Array.isArray(rule.oneOf)) {
      excludeWorkspaceDistFromBabel(rule.oneOf);
    }
    if (Array.isArray(rule.rules)) {
      excludeWorkspaceDistFromBabel(rule.rules);
    }
    if (hasBabelLoader(rule)) {
      rule.exclude = appendExclude(rule.exclude, WORKSPACE_DIST_PATTERN);
    }
  }
}

function extendReactRefreshExcludes(plugins = []) {
  for (const plugin of plugins) {
    if (plugin?.constructor?.name !== 'ReactRefreshPlugin') {
      continue;
    }
    const existingExclude = plugin.options?.exclude;
    if (!existingExclude) {
      plugin.options.exclude = WORKSPACE_DIST_PATTERN;
      continue;
    }
    if (Array.isArray(existingExclude)) {
      plugin.options.exclude = [...existingExclude, WORKSPACE_DIST_PATTERN];
      continue;
    }
    plugin.options.exclude = [existingExclude, WORKSPACE_DIST_PATTERN];
  }
}

module.exports = composePlugins(withNx(), withReact(), (config, context) => {
  excludeWorkspaceDistFromBabel(config.module?.rules || []);
  extendReactRefreshExcludes(config.plugins || []);
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
      };
    },
  });
  config.plugins.forEach((p) => {
    if (p.constructor.name === 'ModuleFederationPlugin') {
      //Temporary workaround - https://github.com/nrwl/nx/issues/16983
      p._options.library = undefined;
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
  config.optimization = {
    ...config.optimization,
    runtimeChunk: 'single',
    minimize: false,
    moduleIds: 'named',
    chunkIds: 'named',
    splitChunks: false,
  };
  config.output.publicPath = 'http://localhost:3013/';
  return config;
});
