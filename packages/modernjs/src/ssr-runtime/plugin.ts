import type { Plugin } from '@modern-js/runtime';

export const mfPluginSSR = ({ name }: { name?: string }): Plugin => ({
  name: '@module-federation/modern-js',

  setup: () => {
    return {
      async init({ context }, next) {
        if (typeof window !== 'undefined') {
          return next({ context });
        }
        globalThis.shouldUpdate = false;
        const nodeUtils = await import('@module-federation/node/utils');
        const shouldUpdate = await nodeUtils.revalidate();
        if (shouldUpdate) {
          console.log('should RELOAD', shouldUpdate);
          await nodeUtils.flushChunks();
          globalThis.shouldUpdate = true;
        }
        return next({ context });
      },
    };
  },
});
