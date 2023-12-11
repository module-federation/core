//@ts-nocheck
import { FederationRuntimePlugin } from '@module-federation/runtime/type';
export default function (): FederationRuntimePlugin {
  return {
    name: 'custom-plugin',
    beforeInit(args) {
      if (!__webpack_runtime_id__.startsWith('webpack')) return args;
      const attach =
        typeof __webpack_require__?.federation?.attachRemote === 'function'
          ? __webpack_require__.federation.attachRemote
          : () => {
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
      // console.log('init: ', args);
      return args;
    },
    beforeLoadRemote(args) {
      return args;
    },
    createScript(args) {
      return args;
    },
    loadRemoteMatch(args) {
      // console.log('loadRemoteMatch', args);
      // randomly switch between different modules

      return args;
    },
    loadRemote(args) {
      // console.log('loadRemote: ', args);
      return args;
    },
    async loadShare(args) {
      // console.log('loadShare:', args);
    },
    async beforeLoadShare(args) {
      // console.log('beforeloadShare:', args);
      return args;
    },
  };
}
