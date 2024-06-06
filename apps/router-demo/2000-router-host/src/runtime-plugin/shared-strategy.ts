import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';

// 外部策略默认为 version-first ： 优先复用版本高的，即使没加载。 内部需要兼容以前的逻辑，以加载为主
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
