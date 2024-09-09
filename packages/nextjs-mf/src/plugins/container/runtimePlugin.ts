import { FederationRuntimePlugin } from '@module-federation/runtime/types';

export default function (): FederationRuntimePlugin {
  return {
    name: 'next-internal-plugin',
    createScript: function (args: {
      url: string;
      attrs?: Record<string, any>;
    }) {
      // Updated type
      var url = args.url;
      var attrs = args.attrs;
      if (typeof window !== 'undefined') {
        var script = document.createElement('script');
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
      var id = args.id;
      var error = args.error;
      var from = args.from;
      console.error(id, 'offline');
      var pg = function () {
        console.error(id, 'offline', error);
        return null;
      };

      (pg as any).getInitialProps = function (ctx: any) {
        // Type assertion to add getInitialProps
        return {};
      };
      var mod;
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

      var moduleCache = args.origin.moduleCache;
      var name = args.origin.name;
      var gs = new Function('return globalThis')();
      var attachedRemote = gs[name];
      if (attachedRemote) {
        moduleCache.set(name, attachedRemote);
      }

      return args;
    },
    init: function (args: any) {
      return args;
    },
    beforeRequest: function (args: any) {
      var options = args.options;
      var id = args.id;
      var remoteName = id.split('/').shift();
      var remote = options.remotes.find(function (remote: any) {
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
      var exposeModuleFactory = args.exposeModuleFactory;
      var exposeModule = args.exposeModule;
      var id = args.id;
      var moduleOrFactory = exposeModuleFactory || exposeModule;
      if (!moduleOrFactory) return args; // Ensure moduleOrFactory is defined

      if (typeof window === 'undefined') {
        var exposedModuleExports: any;
        try {
          exposedModuleExports = moduleOrFactory();
        } catch (e) {
          exposedModuleExports = moduleOrFactory;
        }

        var handler: ProxyHandler<any> = {
          get: function (target, prop, receiver) {
            // Check if accessing a static property of the function itself
            if (
              target === exposedModuleExports &&
              typeof exposedModuleExports[prop] === 'function'
            ) {
              return function (this: unknown) {
                globalThis.usedChunks.add(id);
                return exposedModuleExports[prop].apply(this, arguments);
              };
            }

            var originalMethod = target[prop];
            if (typeof originalMethod === 'function') {
              var proxiedFunction = function (this: unknown) {
                globalThis.usedChunks.add(id);
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
          var staticProps = Object.getOwnPropertyNames(exposedModuleExports);
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
      var shareScopeMap = args.shareScopeMap;
      var scope = args.scope;
      var pkgName = args.pkgName;
      var version = args.version;
      var GlobalFederation = args.GlobalFederation;
      var host = GlobalFederation['__INSTANCES__'][0];
      if (!host) {
        return args;
      }

      if (!host.options.shared[pkgName]) {
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
