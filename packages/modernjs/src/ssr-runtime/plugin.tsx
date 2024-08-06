import type { Plugin } from '@modern-js/runtime';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { SSRLiveReload } from './SSRLiveReload';
console.log('mfSSRPlugin trigger');
export const mfSSRPlugin = (): Plugin => ({
  name: '@module-federation/modern-js',

  setup: () => {
    return {
      async beforeRender() {
        console.log(111, 'beforeRender');
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
        return;
      },
      hoc({ App, config }, next) {
        const AppWrapper = (props: any) => (
          <>
            <SSRLiveReload />
            <App {...props} />
          </>
        );
        return next({
          App: hoistNonReactStatics(AppWrapper, App),
          config,
        });
      },
    };
  },
});
