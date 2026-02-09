import type { RuntimePlugin } from '@modern-js/runtime';
import { SSRLiveReload } from './SSRLiveReload';
import { flushDataFetch } from '@module-federation/bridge-react/lazy-utils';

let remoteHotReloadController:
  | {
      check: (force?: boolean) => Promise<boolean>;
    }
  | undefined;

export const mfSSRDevPlugin = (): RuntimePlugin => ({
  name: '@module-federation/modern-js-v3',

  setup: (api) => {
    api.onBeforeRender(async () => {
      if (typeof window !== 'undefined') {
        return;
      }
      globalThis.shouldUpdate = false;
      const nodeUtils = await import('@module-federation/node/utils');
      if (!remoteHotReloadController) {
        remoteHotReloadController = nodeUtils.ensureRemoteHotReload({
          enabled: process.env['MF_REMOTE_HOT_RELOAD'] !== 'false',
          intervalMs: Number(
            process.env['MF_REMOTE_REVALIDATE_INTERVAL_MS'] || 10_000,
          ),
          immediate: true,
        });
      }

      const shouldUpdate = await remoteHotReloadController.check(false);
      if (shouldUpdate) {
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
