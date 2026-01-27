import type { RuntimePlugin } from '@modern-js/runtime';
import { SSRLiveReload } from './SSRLiveReload';
import { flushDataFetch } from '@module-federation/bridge-react/lazy-utils';

export const mfSSRDevPlugin = (): RuntimePlugin => ({
  name: '@module-federation/modern-js',

  setup: (api) => {
    api.onBeforeRender(async () => {
      if (typeof window !== 'undefined') {
        return;
      }
      globalThis.shouldUpdate = false;
      const nodeUtils = await import('@module-federation/node/utils');
      const shouldUpdate = await nodeUtils.revalidate();
      console.log('shouldUpdate: ', shouldUpdate);
      if (shouldUpdate) {
        console.log('should RELOAD', shouldUpdate);
        await nodeUtils.flushChunks();
        flushDataFetch();
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
