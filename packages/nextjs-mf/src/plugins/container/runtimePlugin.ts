import { FederationRuntimePlugin } from '@module-federation/runtime/types';

export default function (): FederationRuntimePlugin {
  return {
    name: 'next-internal-plugin',
    createScript: function (args: {
      url: string;
      attrs?: Record<string, any>;
    }) {
      // Updated type
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
      console.error(id, 'offline');
      const pg = function () {
        console.error(id, 'offline', error);
        return null;
      };

      (pg as any).getInitialProps = function (ctx: any) {
        // Type assertion to add getInitialProps
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
    beforeInit(args) {
      if (!globalThis.usedChunks) globalThis.usedChunks = new Set();
      if (
        typeof __webpack_runtime_id__ === 'string' &&
        !__webpack_runtime_id__.startsWith('webpack')
      ) {
        return args;
      }

      const moduleCache = args.origin.moduleCache;
      const name = args.origin.name;
      const gs = new Function('return globalThis')();
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
      if (!moduleOrFactory) return args; // Ensure moduleOrFactory is defined

      if (typeof window === 'undefined') {
        let exposedModuleExports: any;
        try {
          exposedModuleExports = moduleOrFactory();
        } catch (e) {
          exposedModuleExports = moduleOrFactory;
        }

        const handler: ProxyHandler<any> = {
          get: function (target, prop, receiver) {
            // Check if accessing a static property of the function itself
            if (
              target === exposedModuleExports &&
              typeof exposedModuleExports[prop] === 'function'
            ) {
              return function (this: unknown) {
                globalThis.usedChunks.add(id);
                // eslint-disable-next-line prefer-rest-params
                return exposedModuleExports[prop].apply(this, arguments);
              };
            }

            const originalMethod = target[prop];
            if (typeof originalMethod === 'function') {
              const proxiedFunction = function (this: unknown) {
                globalThis.usedChunks.add(id);
                // eslint-disable-next-line prefer-rest-params
                return originalMethod.apply(this, arguments);
              };

              // Copy all enumerable properties from the original method to the proxied function
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
          // If the module export is a function, we create a proxy that can handle both its
          // call (as a function) and access to its properties (including static methods).
          exposedModuleExports = new Proxy(exposedModuleExports, handler);

          // Proxy static properties specifically
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
          // For objects, just wrap the exported object itself
          exposedModuleExports = new Proxy(exposedModuleExports, handler);
        }

        return exposedModuleExports;
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
      // if not next host then bail
      if (!host.options.shared['next/router']) {
        return args;
      }
      //handle react host next remote, disable resolving when not next host
      args.resolver = function () {
        shareScopeMap[scope][pkgName][version] =
          host.options.shared[pkgName][0]; // replace local share scope manually with desired module
        return shareScopeMap[scope][pkgName][version];
      };
      return args;
    },
    beforeLoadShare: async function (args: any) {
      return args;
    },
  };
}
