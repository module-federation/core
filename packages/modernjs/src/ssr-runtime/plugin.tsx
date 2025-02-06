import type { RuntimePluginFuture } from '@modern-js/runtime';
import { SSRLiveReload } from './SSRLiveReload';

export const mfSSRPlugin = (): RuntimePluginFuture => ({
  name: '@module-federation/modern-js',

  setup: (api) => {
    api.onBeforeRender(async () => {
      if (typeof window !== 'undefined') {
        return;
      }
      globalThis.shouldUpdate = false;
      const nodeUtils = await import('@module-federation/node/utils');
      const shouldUpdate = await nodeUtils.revalidate();
      if (shouldUpdate) {
        console.log('should RELOAD', shouldUpdate);
        await nodeUtils.flushChunks();
        globalThis.shouldUpdate = true;
      }
    });
    api.wrapRoot((App) => {
      const AppWrapper = (props: any) => (
        <>
          <SSRLiveReload />
          <App {...props} />
        </>
      );
      return AppWrapper;
    });
  },
});
