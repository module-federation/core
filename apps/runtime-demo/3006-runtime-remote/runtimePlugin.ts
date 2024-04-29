import { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';

export default function (): FederationRuntimePlugin {
  return {
    name: 'custom-plugin-build',
    beforeInit(args) {
      console.log('[build time inject] beforeInit: ', args);

      const { userOptions, shareInfo } = args;
      const { shared } = userOptions;

      if (shared) {
        Object.keys(shared || {}).forEach((sharedKey) => {
          const sharedItem = shared[sharedKey];
          if (!Array.isArray(sharedItem)) {
            if (!sharedItem.strategy) {
              sharedItem.strategy = 'loaded-first';
            }
          }
        });
      }
      return args;
    },
    beforeLoadShare(args) {
      if (args.shareInfo) {
        args.shareInfo.strategy = 'loaded-first';
      }
      console.log('[build time inject] beforeLoadShare: ', args);

      return args;
    },
  };
}
