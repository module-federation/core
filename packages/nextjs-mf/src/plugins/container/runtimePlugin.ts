import { FederationRuntimePlugin } from '@module-federation/runtime/types';
console.log('runtime plugin exists');
export default function (): FederationRuntimePlugin {
  return {
    name: 'next-internal-plugin',
    errorLoadRemote({ id, error, from, origin }) {
      console.error(id, 'offline', error);
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
      const gs = (globalThis as any) || new Function('return globalThis')();
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
    // onLoad(args) {
    //   return args;
    // },
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
