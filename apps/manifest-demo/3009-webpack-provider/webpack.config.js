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
    const debugRunId = `mf-provider-refresh-${Date.now()}`;
    const workspaceDistRegex = /[\\/]packages[\\/].+[\\/]dist[\\/]/i;
    let debugModuleLogCount = 0;
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
      setupMiddlewares: (middlewares, devServer) => {
        const fs = require('fs');
        const outputPath =
          devServer &&
          devServer.compiler &&
          devServer.compiler.options &&
          devServer.compiler.options.output &&
          devServer.compiler.options.output.path;
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
              hypothesisId: 'H14',
              location:
                'apps/manifest-demo/3009-webpack-provider/webpack.config.js:48',
              message: 'provider devServer setup',
              data: {
                port: devServer && devServer.options && devServer.options.port,
                outputPath,
                hasManifest: outputPath
                  ? fs.existsSync(path.join(outputPath, 'mf-manifest.json'))
                  : false,
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
        middlewares.unshift((req, res, next) => {
          const reqUrl = req && req.url ? req.url : '';
          if (
            reqUrl.includes('mf-manifest.json') ||
            reqUrl.includes('remoteEntry.js') ||
            reqUrl.includes('@mf-types.zip')
          ) {
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
                  hypothesisId: 'H15',
                  location:
                    'apps/manifest-demo/3009-webpack-provider/webpack.config.js:59',
                  message: 'provider incoming request',
                  data: {
                    url: reqUrl,
                    method: req && req.method,
                    hasManifest: outputPath
                      ? fs.existsSync(path.join(outputPath, 'mf-manifest.json'))
                      : false,
                  },
                  timestamp: Date.now(),
                }),
              },
            ).catch(() => {});
            // #endregion
          }
          next();
        });
        return middlewares;
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
            hypothesisId: 'H8',
            location:
              'apps/manifest-demo/3009-webpack-provider/webpack.config.js:93',
            message: 'provider plugin inventory',
            data: {
              name: p?.constructor?.name,
              hasOptions: Boolean(p && p.options),
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
      if (p.constructor.name === 'ModuleFederationPlugin') {
        //Temporary workaround - https://github.com/nrwl/nx/issues/16983
        p._options.library = undefined;
      }
    });
    config.plugins = (config.plugins || []).filter(
      (p) => p?.constructor?.name !== 'ReactRefreshPlugin',
    );
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
        hypothesisId: 'H11',
        location:
          'apps/manifest-demo/3009-webpack-provider/webpack.config.js:106',
        message: 'removed ReactRefreshPlugin from provider',
        data: {
          plugins: (config.plugins || [])
            .map((x) => x?.constructor?.name)
            .slice(0, 20),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

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
    config.plugins.push({
      name: 'agent-provider-refresh-debug-plugin',
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
              hypothesisId: 'H8',
              location:
                'apps/manifest-demo/3009-webpack-provider/webpack.config.js:120',
              message: 'provider compiler plugins snapshot',
              data: {
                mode: compiler.options.mode,
                plugins: (compiler.options.plugins || [])
                  .map((x) => x?.constructor?.name)
                  .slice(0, 20),
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
        compiler.hooks.normalModuleFactory.tap(
          'agent-provider-refresh-debug-plugin',
          (nmf) => {
            nmf.hooks.afterResolve.tap(
              'agent-provider-refresh-debug-plugin',
              (resolveData) => {
                const createData = resolveData && resolveData.createData;
                if (!createData || debugModuleLogCount > 60) {
                  return;
                }
                const resource = createData.resource || '';
                const request = createData.request || '';
                const isDtsPluginDist =
                  resource.includes('/packages/dts-plugin/dist/') ||
                  request.includes('/packages/dts-plugin/dist/');
                const isWorkspaceDist =
                  workspaceDistRegex.test(resource) ||
                  workspaceDistRegex.test(request);
                if (!isWorkspaceDist && !isDtsPluginDist) {
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
                      hypothesisId: isDtsPluginDist ? 'H9' : 'H10',
                      location:
                        'apps/manifest-demo/3009-webpack-provider/webpack.config.js:154',
                      message: 'provider afterResolve module check',
                      data: {
                        resource,
                        request,
                        isWorkspaceDist,
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
        compiler.hooks.thisCompilation.tap(
          'agent-provider-refresh-debug-plugin',
          (compilation) => {
            compilation.hooks.processAssets.tap(
              {
                name: 'agent-provider-refresh-debug-plugin',
                stage:
                  compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
              },
              (assets) => {
                const remoteEntryAsset = assets['remoteEntry.js'];
                const source =
                  remoteEntryAsset && remoteEntryAsset.source
                    ? String(remoteEntryAsset.source())
                    : '';
                const hasRefreshRuntimeRef =
                  source.includes('$Refresh$.runtime');
                const hasRefreshSigRef = source.includes('$Refresh$.sig');
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
                      hypothesisId: 'H10',
                      location:
                        'apps/manifest-demo/3009-webpack-provider/webpack.config.js:184',
                      message: 'remoteEntry refresh markers',
                      data: {
                        hasRemoteEntry: Boolean(remoteEntryAsset),
                        hasRefreshRuntimeRef,
                        hasRefreshSigRef,
                        remoteEntrySize: source.length,
                      },
                      timestamp: Date.now(),
                    }),
                  },
                ).catch(() => {});
                // #endregion
                const jsAssetNames = Object.keys(assets).filter((name) =>
                  name.endsWith('.js'),
                );
                const refreshTaggedAssets = jsAssetNames
                  .map((name) => {
                    const assetSource =
                      assets[name] && assets[name].source
                        ? String(assets[name].source())
                        : '';
                    return {
                      name,
                      hasRefreshRuntime:
                        assetSource.includes('$Refresh$.runtime'),
                      hasRefreshSig: assetSource.includes('$Refresh$.sig'),
                      size: assetSource.length,
                    };
                  })
                  .filter(
                    (entry) => entry.hasRefreshRuntime || entry.hasRefreshSig,
                  );
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
                      hypothesisId: 'H12',
                      location:
                        'apps/manifest-demo/3009-webpack-provider/webpack.config.js:206',
                      message: 'provider emitted js refresh scan',
                      data: {
                        hash: compilation.hash,
                        assetCount: jsAssetNames.length,
                        refreshTaggedCount: refreshTaggedAssets.length,
                        refreshTaggedAssets: refreshTaggedAssets.slice(0, 20),
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
        compiler.hooks.done.tap(
          'agent-provider-refresh-debug-plugin',
          (stats) => {
            const fs = require('fs');
            const outputPath =
              (stats &&
                stats.compilation &&
                stats.compilation.outputOptions &&
                stats.compilation.outputOptions.path) ||
              '';
            let hasManifest = false;
            let hasRemoteEntry = false;
            let remoteHasRefreshRuntime = false;
            let remoteHasRefreshSig = false;
            let remoteSize = 0;
            try {
              if (outputPath) {
                const manifestPath = path.join(outputPath, 'mf-manifest.json');
                const remotePath = path.join(outputPath, 'remoteEntry.js');
                hasManifest = fs.existsSync(manifestPath);
                hasRemoteEntry = fs.existsSync(remotePath);
                if (hasRemoteEntry) {
                  const remoteContent = fs.readFileSync(remotePath, 'utf-8');
                  remoteSize = remoteContent.length;
                  remoteHasRefreshRuntime =
                    remoteContent.includes('$Refresh$.runtime');
                  remoteHasRefreshSig = remoteContent.includes('$Refresh$.sig');
                }
              }
            } catch {
              // ignore diagnostics failures
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
                  hypothesisId: 'H13',
                  location:
                    'apps/manifest-demo/3009-webpack-provider/webpack.config.js:243',
                  message: 'provider done output diagnostics',
                  data: {
                    hash: stats && stats.hash,
                    outputPath,
                    hasManifest,
                    hasRemoteEntry,
                    remoteHasRefreshRuntime,
                    remoteHasRefreshSig,
                    remoteSize,
                  },
                  timestamp: Date.now(),
                }),
              },
            ).catch(() => {});
            // #endregion
          },
        );
      },
    });
    return config;
  },
);
