import type { Plugin } from '@modern-js/runtime';

export const mfPluginSSR = (): Plugin => ({
  name: '@module-federation/modern-js',

  // eslint-disable-next-line max-lines-per-function
  setup: () => ({
    // eslint-disable-next-line max-lines-per-function
    async init({ context }, next) {
      if (typeof window !== 'undefined') {
        return next({ context });
      }
      console.log('modernjs plugin start: ', Date.now());
      const nodeUtils = await import('@module-federation/node/utils');
      const shouldUpdate = await nodeUtils.revalidate();
      if (shouldUpdate) {
        console.log('should HMR', shouldUpdate);
        await nodeUtils.flushChunks();
      }
      console.log('modernjs plugin end: ', Date.now());
      return next({ context });
    },
  }),
});
