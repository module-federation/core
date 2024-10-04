import type { FederationRuntimePlugin } from '@module-federation/runtime';

const sharedStrategy: () => FederationRuntimePlugin = () => ({
  name: 'shared-strategy',
  beforeInit(args) {
    const { userOptions } = args;
    const shared = userOptions.shared;
    if (shared) {
      Object.keys(shared).forEach((sharedKey) => {
        const sharedConfigs = shared[sharedKey];
        const arraySharedConfigs = Array.isArray(sharedConfigs)
          ? sharedConfigs
          : [sharedConfigs];
        arraySharedConfigs.forEach((s) => {
          s.strategy = 'loaded-first';
        });
      });
      console.warn(
        `[Module Federation Data Prefetch]: Your shared strategy is set to 'loaded-first', this is a necessary condition for data prefetch`,
      );
    }
    return args;
  },
});

export default sharedStrategy;
