//@ts-nocheck
import { FederationRuntimePlugin } from '@module-federation/runtime/type';
// const globalThisVal = new Function('return globalThis')();

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
      // const host = globalThisVal['__FEDERATION__']['__INSTANCES__'][0]; //first instance is always host?
      // if (host) {
      //   // if (host.name !== args.origin.name) {
      //   //   Object.keys(args.origin.shareScopeMap?.default || {}).forEach(
      //   //     (key) => {
      //   //       if (
      //   //         key === 'react' ||
      //   //         key === 'react-dom' ||
      //   //         key.startsWith('next/')
      //   //       ) {
      //   //         delete args.origin.shareScopeMap?.default[key];
      //   //       }
      //   //     },
      //   //   );
      //   // }
      // }
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
    loadShare(args) {
      console.log('loadShare:', args);
      return args;
    },
    async beforeLoadShare(args) {
      // console.log('beforeLoadShare:', args);
      return args;
    },
  };
}
