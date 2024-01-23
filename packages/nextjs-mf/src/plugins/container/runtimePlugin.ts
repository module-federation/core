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
      console.log(args.pkgName);
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
