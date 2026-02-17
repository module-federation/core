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

const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = composePlugins(withNx(), withReact(), (config, context) => {
  // Exclude all workspace package dist folders from React Refresh
  const workspaceDistRegex = /[\\/]packages[\\/].+[\\/]dist[\\/]/i;
  const debugRunId = `manifest-refresh-${Date.now()}`;
  let debugModuleLogCount = 0;

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
    // #region agent log
    fetch('http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '7e9739',
      },
      body: JSON.stringify({
        sessionId: '7e9739',
        runId: debugRunId,
        hypothesisId: 'H5',
        location: 'apps/manifest-demo/webpack-host/webpack.config.js:91',
        message: 'plugin inventory',
        data: {
          name: p?.constructor?.name,
          keys: Object.keys(p || {}).slice(0, 8),
          hasOptions: Boolean(p && p.options),
          applySig: p && p.apply ? String(p.apply).slice(0, 120) : 'none',
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (p.constructor.name === 'ModuleFederationPlugin') {
      //Temporary workaround - https://github.com/nrwl/nx/issues/16983
      p._options.library = undefined;
    }

    // Keep Fast Refresh for app source, but skip workspace dist CJS modules.
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
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: debugRunId,
            hypothesisId: 'H1',
            location: 'apps/manifest-demo/webpack-host/webpack.config.js:107',
            message: 'ReactRefreshPlugin exclude patched',
            data: {
              pluginName: p.constructor.name,
              excludeType: typeof p.options.exclude,
              exclude: Array.isArray(p.options.exclude)
                ? p.options.exclude.map((v) => String(v))
                : String(p.options.exclude),
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
    }
  });
  config.plugins.push({
    name: 'agent-refresh-debug-plugin',
    apply(compiler) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: debugRunId,
            hypothesisId: 'H2',
            location: 'apps/manifest-demo/webpack-host/webpack.config.js:116',
            message: 'debug plugin apply',
            data: {
              mode: compiler.options.mode,
              pluginCount: (compiler.options.plugins || []).length,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: debugRunId,
            hypothesisId: 'H6',
            location: 'apps/manifest-demo/webpack-host/webpack.config.js:119',
            message: 'compiler plugins snapshot',
            data: {
              plugins: (compiler.options.plugins || [])
                .map((x) => x?.constructor?.name)
                .slice(0, 20),
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
      const rules =
        (compiler.options.module && compiler.options.module.rules) || [];
      const babelRuleWithRefresh = rules.filter((rule) => {
        if (!rule || typeof rule !== 'object' || !rule.loader) {
          return false;
        }
        if (!String(rule.loader).includes('babel-loader')) {
          return false;
        }
        const plugins = rule.options && rule.options.plugins;
        return (
          Array.isArray(plugins) &&
          plugins.some((p) =>
            Array.isArray(p)
              ? String(p[0]).includes('react-refresh/babel')
              : String(p).includes('react-refresh/babel'),
          )
        );
      });
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: debugRunId,
            hypothesisId: 'H4',
            location: 'apps/manifest-demo/webpack-host/webpack.config.js:136',
            message: 'babel refresh plugin presence',
            data: {
              ruleCount: rules.length,
              babelRefreshRuleCount: babelRuleWithRefresh.length,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
      compiler.hooks.normalModuleFactory.tap(
        'agent-refresh-debug-plugin',
        (nmf) => {
          nmf.hooks.afterResolve.tap(
            'agent-refresh-debug-plugin',
            (resolveData) => {
              const createData = resolveData && resolveData.createData;
              if (!createData || debugModuleLogCount > 200) {
                return;
              }
              const resource = createData.resource || '';
              const request = createData.request || '';
              const matchResource = createData.matchResource || '';
              const isWorkspaceDist =
                workspaceDistRegex.test(resource) ||
                workspaceDistRegex.test(request) ||
                workspaceDistRegex.test(matchResource);
              const hitsKnownProblem =
                resource.includes('/packages/dts-plugin/dist/') ||
                request.includes('/packages/dts-plugin/dist/') ||
                resource.includes('/packages/sdk/dist/') ||
                request.includes('/packages/sdk/dist/');
              if (!isWorkspaceDist && !hitsKnownProblem) {
                return;
              }
              debugModuleLogCount += 1;
              const loaderList = Array.isArray(createData.loaders)
                ? createData.loaders.map((l) => l && l.loader).filter(Boolean)
                : [];
              const hasRefreshLoader = loaderList.some(
                (l) =>
                  String(l).includes(
                    'react-refresh-webpack-plugin/lib/loader',
                  ) ||
                  String(l).includes('@pmmmwh/react-refresh-webpack-plugin'),
              );
              const isDtsPluginDist =
                resource.includes('/packages/dts-plugin/dist/') ||
                request.includes('/packages/dts-plugin/dist/');
              // #region agent log
              fetch(
                'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Debug-Session-Id': '7e9739',
                  },
                  body: JSON.stringify({
                    sessionId: '7e9739',
                    runId: debugRunId,
                    hypothesisId: isDtsPluginDist ? 'H7' : 'H3',
                    location:
                      'apps/manifest-demo/webpack-host/webpack.config.js:151',
                    message: 'afterResolve module check',
                    data: {
                      resource,
                      request,
                      matchResource,
                      isWorkspaceDist,
                      hitsKnownProblem,
                      isDtsPluginDist,
                      hasRefreshLoader,
                      loaderCount: loaderList.length,
                      loaders: loaderList.slice(0, 8),
                    },
                    timestamp: Date.now(),
                  }),
                },
              ).catch(() => {});
              // #endregion
            },
          );
        },
      );
    },
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
