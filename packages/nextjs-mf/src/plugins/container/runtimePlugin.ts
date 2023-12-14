import { FederationRuntimePlugin } from '@module-federation/runtime/type';

export default function (): FederationRuntimePlugin {
  return {
    name: 'custom-plugin',
    beforeInit(args) {
      if (!__webpack_runtime_id__.startsWith('webpack')) return args;
      const attach =
        //@ts-ignore
        typeof __webpack_require__?.federation?.attachRemote === 'function'
          ? //@ts-ignore
            __webpack_require__.federation.attachRemote
          : () => {
              //@ts-ignore
              console.error('embedded container', args.id, 'is not found');
              return false;
            };

      const { moduleCache } = args.origin;
      const { name } = args.origin;

      const attachedRemote = attach();
      if (attachedRemote) {
        moduleCache.set(name, attachedRemote);
      }

      return args;
    },
    init(args) {
      return args;
    },
    beforeLoadRemote(args) {
      return args;
    },
    // createScript(args) {
    //   return args;
    // },
    loadRemoteMatch(args) {
      return args;
    },
    loadRemote(args) {
      return args;
    },
    resolveShare(args) {
      if (
        args.pkgName !== 'react' &&
        args.pkgName !== 'react-dom' &&
        args.pkgName.startsWith('next/')
      ) {
        return args;
      }
      const { shareScopeMap, scope, pkgName, version, __FEDERATION__ } = args;

      const host = __FEDERATION__['__INSTANCES__'][0];
      if (!host) {
        return args;
      }
      args.resolver = function () {
        shareScopeMap[scope][pkgName][version] = host.options.shared[pkgName]; // replace local share scope manually with desired module
        return host.options.shared[pkgName];
      };
      return args;
    },
    async beforeLoadShare(args) {
      return args;
    },
  };
}
