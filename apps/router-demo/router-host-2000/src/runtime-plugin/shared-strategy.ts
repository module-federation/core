import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';

// The default external policy is version-first: the version with a higher version is used preferentially, even if the version is not loaded. Internally, it must be compatible with the previous logic, mainly loading
const sharedStrategy: () => FederationRuntimePlugin = () => ({
  name: 'shared-strategy',
  beforeInit(args) {
    const { userOptions, shareInfo } = args;
    const shared = userOptions.shared;
    if (shared) {
      Object.keys(shareInfo).forEach((sharedKey) => {
        const sharedConfigs = shared[sharedKey];
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
