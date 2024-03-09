import { FederationRuntimePlugin } from '@module-federation/runtime/types';
export default function (): FederationRuntimePlugin {
  return {
    name: 'next-internal-plugin',
    errorLoadRemote({ id, error, from, origin }) {
      console.error(id, 'offline');
      const pg = function () {
        console.error(id, 'offline', error);
        return null;
      };

      pg.getInitialProps = function (ctx: any) {
        return {};
      };
      let mod;
      if (from === 'build') {
        mod = () => ({
          __esModule: true,
          default: pg,
          getServerSideProps: () => ({ props: {} }),
        });
      } else {
        mod = {
          default: pg,
          getServerSideProps: () => ({ props: {} }),
        };
      }

      return mod;
    },
    beforeInit(args) {
      const { userOptions, shareInfo } = args;
      const { shared } = userOptions;
      if (!globalThis.usedChunks) globalThis.usedChunks = new Set();
      if (shared) {
        Object.keys(shared || {}).forEach((sharedKey) => {
          if (!shared[sharedKey].strategy) {
            shareInfo[sharedKey].strategy = 'loaded-first';
          }
        });
      }

      if (
        typeof __webpack_runtime_id__ === 'string' &&
        !__webpack_runtime_id__.startsWith('webpack')
      ) {
        return args;
      }

      // if (__webpack_runtime_id__ && !__webpack_runtime_id__.startsWith('webpack')) return args;
      const { moduleCache, name } = args.origin;
      const gs = new Function('return globalThis')();
      const attachedRemote = gs[name];
      if (attachedRemote) {
        moduleCache.set(name, attachedRemote);
      }

      return args;
    },
    init(args) {
      return args;
    },
    beforeRequest(args) {
      return args;
    },
    createScript({ url }) {
      return;
    },
    afterResolve(args) {
      return args;
    },
    onLoad(args) {
      const { exposeModuleFactory, exposeModule, id } = args;
      const moduleOrFactory = exposeModuleFactory || exposeModule;
      if (!moduleOrFactory) return; // Ensure moduleOrFactory is defined
      let exposedModuleExports: any = moduleOrFactory();

      if (typeof window === 'undefined') {
        const handler: ProxyHandler<any> = {
          get(target, prop, receiver) {
            // Check if accessing a static property of the function itself
            if (
              target === exposedModuleExports &&
              typeof exposedModuleExports[prop] === 'function'
            ) {
              return function (this: unknown, ...args: any[]) {
                globalThis.usedChunks.add(id);
                return exposedModuleExports[prop].apply(this, args);
              };
            }

            const originalMethod = target[prop];
            if (typeof originalMethod === 'function') {
              const proxiedFunction = function (this: unknown, ...args: any[]) {
                globalThis.usedChunks.add(id);
                return originalMethod.apply(this, args);
              };

              // Copy all enumerable properties from the original method to the proxied function
              Object.keys(originalMethod).forEach((prop) => {
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
          staticProps.forEach((prop) => {
            if (typeof exposedModuleExports[prop] === 'function') {
              exposedModuleExports[prop] = new Proxy(
                exposedModuleExports[prop],
                handler,
              );
            }
          });
        } else {
          // For objects, just wrap the exported object itself
          exposedModuleExports = new Proxy(exposedModuleExports, handler);
        }

        return () => exposedModuleExports;
      }

      return args;
    },

    resolveShare(args) {
      if (
        args.pkgName !== 'react' &&
        args.pkgName !== 'react-dom' &&
        !args.pkgName.startsWith('next/')
      ) {
        return args;
      }
      const { shareScopeMap, scope, pkgName, version, GlobalFederation } = args;
      const host = GlobalFederation['__INSTANCES__'][0];
      if (!host) {
        return args;
      }
      args.resolver = function () {
        shareScopeMap[scope][pkgName][version] = host.options.shared[pkgName]; // replace local share scope manually with desired module
        return shareScopeMap[scope][pkgName][version];
      };
      return args;
    },
    async beforeLoadShare(args) {
      return args;
    },
  };
}
