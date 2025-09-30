import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime/types';

// Ambient declarations for test/TS environments
declare global {
  // eslint-disable-next-line no-var
  var usedChunks: Set<string>;
}
// Provided by bundler at runtime; declare for TS
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __webpack_runtime_id__: any;

// Minimal semver compare tailored for x.y.z (ignores pre-release/build)
function cmpSemver(a: string, b: string): number {
  const toNums = (v: string) =>
    v
      .split('-')[0]
      .split('.')
      .map((n) => parseInt(n, 10) || 0);
  const [a1, a2, a3] = toNums(a);
  const [b1, b2, b3] = toNums(b);
  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2 - b2;
  return a3 - b3;
}

function pickHighestCommonVersion(
  a: string[],
  b: string[],
): string | undefined {
  if (!a.length || !b.length) return undefined;
  const setB = new Set(b);
  const common = a.filter((v) => setB.has(v));
  if (!common.length) return undefined;
  return common.sort(cmpSemver).pop();
}

export default function (): ModuleFederationRuntimePlugin {
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
    beforeInit: function (args) {
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
      if (remote && remote.entry && remote.entry.includes('?t=')) {
        return args;
      }
      remote.entry = remote.entry + '?t=' + Date.now();
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
                const usedChunks = (globalThis.usedChunks ||= new Set());
                usedChunks.add(id);
                //eslint-disable-next-line
                return exposedModuleExports[prop].apply(this, arguments);
              };
            }

            const originalMethod = target[prop];
            if (typeof originalMethod === 'function') {
              const proxiedFunction = function (this: unknown) {
                const usedChunks = (globalThis.usedChunks ||= new Set());
                usedChunks.add(id);
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
    loadRemoteSnapshot(args) {
      const { from, remoteSnapshot, manifestUrl, manifestJson, options } = args;

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

      return args;
    },
    resolveShare: function (args: any) {
      const { shareScopeMap, scope, pkgName } = args;

      // Only coordinate React family and Next internals through default behavior
      const isReact = pkgName === 'react';
      const isReactDom =
        pkgName === 'react-dom' || pkgName.startsWith('react-dom/');
      const isNextInternal = pkgName.startsWith('next/');
      if (!isReact && !isReactDom && !isNextInternal) return args;

      // Ensure maps exist
      const scopeMap = shareScopeMap?.[scope];
      if (!scopeMap) return args;

      // For non React deps keep default behavior
      if (!isReact && !isReactDom) return args;

      const reactMap = scopeMap['react'];
      const reactDomBaseMap = scopeMap['react-dom'];
      const reactDomClientMap = scopeMap['react-dom/client'];

      if (!reactMap || (!reactDomBaseMap && !reactDomClientMap)) return args;

      const reactVersions = Object.keys(reactMap);
      const domVersions = Object.keys(
        reactDomBaseMap || reactDomClientMap || {},
      );
      const highestCommon = pickHighestCommonVersion(
        reactVersions,
        domVersions,
      );
      if (!highestCommon) return args;

      const prevResolver = args.resolver;
      args.resolver = function () {
        const targetKey = pkgName;
        const targetMap = scopeMap[targetKey];
        if (targetMap && targetMap[highestCommon]) {
          return targetMap[highestCommon];
        }
        // Do not substitute a different share key (e.g., react-dom for react-dom/client)
        // If the exact subpath/version is missing, fall back to default resolver.
        return typeof prevResolver === 'function' ? prevResolver() : undefined;
      };

      return args;
    },
    beforeLoadShare: async function (args: any) {
      return args;
    },
  };
}
