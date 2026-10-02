import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

const injectNodeFetchPlugin: () => ModuleFederationRuntimePlugin = () => ({
  name: 'inject-node-fetch-plugin',
  beforeInit(args) {
    if (!globalThis.fetch) {
      throw new Error(
        '@module-federation/modern-js-v3 requires Node.js 18 or later.',
      );
    }
    return args;
  },
});
export default injectNodeFetchPlugin;
