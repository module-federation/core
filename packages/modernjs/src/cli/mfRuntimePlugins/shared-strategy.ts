import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';

const sharedStrategy: () => FederationRuntimePlugin = () => ({
  name: 'shared-strategy-plugin',
  beforeInit(args) {
    const { shareInfo } = args;
    if (shareInfo) {
      Object.keys(shareInfo || {}).forEach((sharedKey) => {
        const sharedConfigs = shareInfo[sharedKey];
        const arraySharedConfigs = Array.isArray(sharedConfigs)
          ? sharedConfigs
          : [sharedConfigs];
        arraySharedConfigs.forEach((s) => {
          s.strategy = 'loaded-first';
        });
      });
    }
    return args;
  },
});
export default sharedStrategy;
