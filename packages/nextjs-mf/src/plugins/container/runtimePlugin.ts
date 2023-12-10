//@ts-nocheck
import { FederationRuntimePlugin } from '@module-federation/runtime/type';
export default function (): FederationRuntimePlugin {
  return {
    name: 'custom-plugin',
    beforeInit(args) {
      if (!__webpack_runtime_id__.startsWith('webpack')) return args;
      console.log('beforeInit: ', args);
      const attach =
        typeof __webpack_require__?.federation?.attachRemote === 'function'
          ? __webpack_require__.federation.attachRemote
          : () => {
              console.error('embedded container', args.id, 'is not found');
              return false;
            };

      const { moduleCache } = args.origin;
      const { name } = args.origin;

      const hasRemote = moduleCache.has(name);
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
      const webpackRequire = __webpack_require__;
      const isInternalRuntmie = __webpack_runtime_id__.startsWith('webpack');
      const isDifferentOrigin = args.id !== args.origin.name;
      console.log(args.id, args.origin.name, __webpack_runtime_id__);

      if (!isInternalRuntmie) return args;
      if (isDifferentOrigin) return args;

      //
      //   console.log('beofreLoadRemote', args.id);
      //   const attach =
      //     typeof webpackRequire?.federation?.attachRemote === 'function'
      //       ? webpackRequire.federation.attachRemote
      //       : () => {
      //           console.error('embedded container', args.id, 'is not found');
      //           return false;
      //         };

      //   const isDocumentUndefined = typeof document === 'undefined';
      //   const attachedRemote = attach();
      //   if (isDocumentUndefined && attachedRemote) {
      //     const { moduleCache } = args.origin;
      //     const { name } = args.origin;
      //     moduleCache.set(name, attachedRemote);
      //   }
      return args;
    },
    createScript(args) {
      // anything can be script loader
      // console.log('createScript', args);
      // console.log(args);
      // return fetch(args.url).then((res) => {
      //   res.text().then((text) => {
      //     eval(text);
      //   });
      // });
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
