import { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

export default function (): ModuleFederationRuntimePlugin {
  const debugState =
    (globalThis as any).__mfNextRuntimeDebugState ||
    ((globalThis as any).__mfNextRuntimeDebugState = {
      errorLoadRemoteLogs: 0,
      snapshotLogs: 0,
      resolveShareLogs: 0,
      beforeRequestLogs: 0,
    });

  return {
    name: 'next-internal-plugin',
    createScript: function (args: {
      url: string;
      attrs?: Record<string, any>;
    }) {
      const url = args.url;
      const attrs = args.attrs;
      if (typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        delete attrs?.['crossorigin'];

        return { script: script, timeout: 8000 };
      }
      return undefined;
    },
    errorLoadRemote: function (args: {
      id: string;
      error: any;
      from: string;
      origin: any;
    }) {
      const id = args.id;
      const error = args.error;
      const from = args.from;
      const remoteName = id.split('/').shift();
      const matchedRemote = args?.origin?.options?.remotes?.find?.(
        (remote: any) => remote?.name === remoteName,
      );
      if (debugState.errorLoadRemoteLogs < 20) {
        debugState.errorLoadRemoteLogs += 1;
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
              runId: 'nested-webpack-run5',
              hypothesisId: 'H12',
              location:
                'packages/nextjs-mf/src/plugins/container/runtimePlugin.ts:errorLoadRemote',
              message: 'errorLoadRemote triggered',
              data: {
                id,
                from,
                errorMessage: error?.message || String(error),
                remoteName,
                matchedRemoteEntry: matchedRemote?.entry,
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
      }
      //@ts-ignore
      globalThis.moduleGraphDirty = true;
      console.error(id, 'offline');
      const pg = function () {
        console.error(id, 'offline', error);
        return null;
      };

      (pg as any).getInitialProps = function (ctx: any) {
        return {};
      };
      let mod;
      if (from === 'build') {
        mod = function () {
          return {
            __esModule: true,
            default: pg,
            getServerSideProps: function () {
              return { props: {} };
            },
          };
        };
      } else {
        mod = {
          default: pg,
          getServerSideProps: function () {
            return { props: {} };
          },
        };
      }

      return mod;
    },
    beforeInit: function (args: any) {
      if (!globalThis.usedChunks) globalThis.usedChunks = new Set();
      if (
        typeof __webpack_runtime_id__ === 'string' &&
        !__webpack_runtime_id__.startsWith('webpack')
      ) {
        return args;
      }

      const moduleCache = args.origin.moduleCache;
      const name = args.origin.name;
      let gs;
      try {
        gs = new Function('return globalThis')();
      } catch (e) {
        gs = globalThis; // fallback for browsers without 'unsafe-eval' CSP policy enabled
      }
      //@ts-ignore
      const attachedRemote = gs[name];
      if (attachedRemote) {
        moduleCache.set(name, attachedRemote);
      }

      return args;
    },
    init: function (args: any) {
      return args;
    },
    beforeRequest: function (args: any) {
      const options = args.options;
      const id = args.id;
      const remoteName = id.split('/').shift();
      const remote = options.remotes.find(function (remote: any) {
        return remote.name === remoteName;
      });
      if (!remote) return args;
      const entryBefore = remote.entry;
      if (remote && remote.entry && remote.entry.includes('?t=')) {
        if (debugState.beforeRequestLogs < 30) {
          debugState.beforeRequestLogs += 1;
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
                runId: 'nested-webpack-run5',
                hypothesisId: 'H12',
                location:
                  'packages/nextjs-mf/src/plugins/container/runtimePlugin.ts:beforeRequest',
                message: 'beforeRequest kept timestamped remote entry',
                data: {
                  id,
                  remoteName,
                  entryBefore,
                  entryAfter: remote.entry,
                  inBrowser: Boolean(options?.inBrowser),
                },
                timestamp: Date.now(),
              }),
            },
          ).catch(() => {});
          // #endregion
        }
        return args;
      }
      remote.entry = remote.entry + '?t=' + Date.now();
      if (debugState.beforeRequestLogs < 30) {
        debugState.beforeRequestLogs += 1;
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
              runId: 'nested-webpack-run5',
              hypothesisId: 'H12',
              location:
                'packages/nextjs-mf/src/plugins/container/runtimePlugin.ts:beforeRequest',
              message: 'beforeRequest appended timestamp to remote entry',
              data: {
                id,
                remoteName,
                entryBefore,
                entryAfter: remote.entry,
                inBrowser: Boolean(options?.inBrowser),
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
      }
      return args;
    },
    afterResolve: function (args: any) {
      return args;
    },
    onLoad: function (args: any) {
      const exposeModuleFactory = args.exposeModuleFactory;
      const exposeModule = args.exposeModule;
      const id = args.id;
      const moduleOrFactory = exposeModuleFactory || exposeModule;
      if (!moduleOrFactory) return args;

      if (typeof window === 'undefined') {
        let exposedModuleExports: any;
        try {
          exposedModuleExports = moduleOrFactory();
        } catch (e) {
          exposedModuleExports = moduleOrFactory;
        }

        const handler: ProxyHandler<any> = {
          get: function (target, prop, receiver) {
            if (
              target === exposedModuleExports &&
              typeof exposedModuleExports[prop] === 'function'
            ) {
              return function (this: unknown) {
                globalThis.usedChunks.add(id);
                //eslint-disable-next-line
                return exposedModuleExports[prop].apply(this, arguments);
              };
            }

            const originalMethod = target[prop];
            if (typeof originalMethod === 'function') {
              const proxiedFunction = function (this: unknown) {
                globalThis.usedChunks.add(id);
                //eslint-disable-next-line
                return originalMethod.apply(this, arguments);
              };

              Object.keys(originalMethod).forEach(function (prop) {
                Object.defineProperty(proxiedFunction, prop, {
                  value: originalMethod[prop],
                  writable: true,
                  enumerable: true,
                  configurable: true,
                });
              });

              return proxiedFunction;
            }

            return Reflect.get(target, prop, receiver);
          },
        };

        if (typeof exposedModuleExports === 'function') {
          exposedModuleExports = new Proxy(exposedModuleExports, handler);

          const staticProps = Object.getOwnPropertyNames(exposedModuleExports);
          staticProps.forEach(function (prop) {
            if (typeof exposedModuleExports[prop] === 'function') {
              exposedModuleExports[prop] = new Proxy(
                exposedModuleExports[prop],
                handler,
              );
            }
          });
          return function () {
            return exposedModuleExports;
          };
        } else {
          exposedModuleExports = new Proxy(exposedModuleExports, handler);
        }

        return exposedModuleExports;
      }

      return args;
    },
    loadRemoteSnapshot(args: any) {
      const { from, remoteSnapshot, manifestUrl, manifestJson, options } = args;
      const originalPublicPath =
        remoteSnapshot && 'publicPath' in remoteSnapshot
          ? remoteSnapshot.publicPath
          : undefined;

      // ensure snapshot is loaded from manifest
      if (
        from !== 'manifest' ||
        !manifestUrl ||
        !manifestJson ||
        !('publicPath' in remoteSnapshot)
      ) {
        return args;
      }

      // re-assign publicPath based on remoteEntry location if in browser nextjs remote
      const { publicPath } = remoteSnapshot;
      if (options.inBrowser && publicPath.includes('/_next/')) {
        remoteSnapshot.publicPath = publicPath.substring(
          0,
          publicPath.lastIndexOf('/_next/') + 7,
        );
      } else {
        const serverPublicPath = manifestUrl.substring(
          0,
          manifestUrl.indexOf('mf-manifest.json'),
        );
        remoteSnapshot.publicPath = serverPublicPath;
      }

      if ('publicPath' in manifestJson.metaData) {
        manifestJson.metaData.publicPath = remoteSnapshot.publicPath;
      }

      if (debugState.snapshotLogs < 20) {
        debugState.snapshotLogs += 1;
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
              runId: 'nested-webpack-run5',
              hypothesisId: 'H12',
              location:
                'packages/nextjs-mf/src/plugins/container/runtimePlugin.ts:loadRemoteSnapshot',
              message: 'normalized remote snapshot publicPath',
              data: {
                from,
                manifestUrl,
                inBrowser: options?.inBrowser,
                originalPublicPath,
                resolvedPublicPath: remoteSnapshot.publicPath,
                manifestMetaPublicPath: manifestJson?.metaData?.publicPath,
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
      }

      return args;
    },
    resolveShare: function (args: any) {
      if (
        args.pkgName !== 'react' &&
        args.pkgName !== 'react-dom' &&
        !args.pkgName.startsWith('next/')
      ) {
        return args;
      }
      const shareScopeMap = args.shareScopeMap;
      const scope = args.scope;
      const pkgName = args.pkgName;
      const version = args.version;
      const GlobalFederation = args.GlobalFederation;
      const host = GlobalFederation['__INSTANCES__'][0];
      if (!host) {
        return args;
      }

      if (!host.options.shared[pkgName]) {
        return args;
      }
      args.resolver = function () {
        shareScopeMap[scope][pkgName][version] =
          host.options.shared[pkgName][0];
        if (debugState.resolveShareLogs < 20) {
          debugState.resolveShareLogs += 1;
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
                runId: 'nested-webpack-run2',
                hypothesisId: 'H8',
                location:
                  'packages/nextjs-mf/src/plugins/container/runtimePlugin.ts:resolveShare',
                message: 'resolveShare pinned host singleton',
                data: {
                  pkgName,
                  scope,
                  version,
                  hostName: host?.name,
                  hasShared: Boolean(host?.options?.shared?.[pkgName]?.[0]),
                },
                timestamp: Date.now(),
              }),
            },
          ).catch(() => {});
          // #endregion
        }
        return {
          shared: shareScopeMap[scope][pkgName][version],
          useTreesShaking: false,
        };
      };
      return args;
    },
    beforeLoadShare: async function (args: any) {
      return args;
    },
  };
}
