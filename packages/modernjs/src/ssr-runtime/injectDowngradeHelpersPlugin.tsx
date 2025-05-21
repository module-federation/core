import { DOWNGRADE_FUNCTION, DOWNGRADE_KEY, FS_HREF } from '../constant';
import logger from '../logger';

import type { RuntimePluginFuture } from '@modern-js/runtime';
import { callAllDowngrade, callDowngrade, getDowngradeTag } from './downgrade';

export const mfInjectDowngradeHelpersPlugin = (): RuntimePluginFuture => ({
  name: '@module-federation/modern-js-downgrade-helpers',

  setup: (api) => {
    api.onBeforeRender(async () => {
      globalThis.FEDERATION_SSR = true;
      if (typeof window === 'undefined') {
        return;
      }
      globalThis[FS_HREF] = window.location.href;

      globalThis[DOWNGRADE_FUNCTION] ||= async function (id?: string) {
        logger.debug('==========ssr downgrade!');

        const mfDowngrade = getDowngradeTag();
        if (typeof mfDowngrade === 'boolean') {
          return callAllDowngrade();
        }
        if (Array.isArray(mfDowngrade)) {
          if (!id) {
            globalThis[DOWNGRADE_KEY] = true;
            return callAllDowngrade();
          }

          if (mfDowngrade.includes(id)) {
            return;
          }

          mfDowngrade.push(id);
          return callDowngrade(id);
        }
      };
    });
  },
});
