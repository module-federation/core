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
      try {
        // if(typeof window !== 'undefined') {
        //   //@ts-ignore
        //   const path = new URL(document.currentScript.src);
        //   //@ts-ignore
        //   path.pathname = __webpack_require__.p;
        //   path.search = ""
        //   //@ts-ignore
        //   __webpack_require__.p = path.toString();
        // }
      } catch (e) {
        //issue
      }
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
    async init(args) {
      const host = __FEDERATION__['__INSTANCES__'][0];
      console.log('init runtime id', __webpack_runtime_id__);
      if (__webpack_runtime_id__ === 'webpack') {
        try {
          console.log('setting react');

          const react = import('react').then((exp) => {
            //@ts-ignore
            window.reactLib = () => exp;
            //@ts-ignore
            return window.reactLib;
          });
          await import('react-dom');
          //@ts-ignore
          window.hostsReact = react;
        } catch (e) {
          //
        }
      }
      if (typeof window !== 'undefined') {
        //@ts-ignore
        await window.hostsReact;
      }
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
      const exposedModuleExports = moduleOrFactory();
      const handler = {
        //@ts-ignore
        get: function (target, prop, receiver) {
          const origMethod = target[prop];
          if (typeof origMethod === 'function') {
            //@ts-ignore
            return function (...args) {
              globalThis.usedChunks.add(
                //@ts-ignore
                id,
              );

              // console.log(`function as called to ${prop}`, id);
              //@ts-ignore
              return origMethod.apply(this, args);
            };
          } else {
            return Reflect.get(target, prop, receiver);
          }
        },
      };

      return () => new Proxy(exposedModuleExports, handler);
    },
    resolveShare(args) {
      if (
        args.pkgName !== 'react' &&
        args.pkgName !== 'react-dom' &&
        !args.pkgName.startsWith('next/')
      ) {
        return args;
      }

      console.log(args.pkgName, __webpack_runtime_id__);
      const { shareScopeMap, scope, pkgName, version, GlobalFederation } = args;

      const host = GlobalFederation['__INSTANCES__'][0];
      if (__webpack_runtime_id__ === 'webpack-runtime') {
        return args;
      }
      if (!host) {
        if (typeof window !== 'undefined') {
          if (pkgName === 'react') {
            const orig = args.resolver;
            args.resolver = function () {
              //@ts-ignore
              console.log(args, ' resolver for react');
              //@ts-ignore
              shareScopeMap[scope][pkgName][version].get = window.reactLib;
              shareScopeMap[scope][pkgName][version].from = 'host';
              //@ts-ignore
              shareScopeMap[scope][pkgName][version].lib = window.reactLib;
              //@ts-ignore
              console.log(shareScopeMap[scope][pkgName][version]);
              //@ts-ignore
              console.log(window.reactLib, window.hostsReact);
              // shareScopeMap[scope][pkgName][version] = window.hostsReact; // replace local share scope manually with desired module
              // return shareScopeMap[scope][pkgName][version];
              return shareScopeMap[scope][pkgName][version];
            };
          }
        }
        return args;
      }

      console.log(host, 'exists');

      // if(typeof window !== 'undefined') {
      //   if(pkgName === 'react') {
      //     const orig = args.resolver
      //     args.resolver = function() {
      //       //@ts-ignore
      //       console.log(args, ' resolver for react', window.hostsReact)
      //       //@ts-ignore
      //       console.log(shareScopeMap[scope][pkgName][version]);
      //
      //       //@ts-ignore
      //       shareScopeMap[scope][pkgName][version] = window.hostsReact; // replace local share scope manually with desired module
      //       // return shareScopeMap[scope][pkgName][version];
      //       return orig()
      //     };
      //   }
      // }
      console.log('resolveing', host.options.shared[pkgName]);

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
