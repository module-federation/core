import type { Plugin } from '@modern-js/runtime';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { SSRLiveReload } from './SSRLiveReload';

export const mfSSRPlugin = (): Plugin => ({
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
      wrapRoot(App) {
        const AppWrapper = (props: any) => (
          <>
            <SSRLiveReload />
            <App {...props} />
          </>
        );
        return hoistNonReactStatics(AppWrapper, App);
      },
    };
  },
});
