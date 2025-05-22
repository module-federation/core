import {
  DATA_FETCH_FUNCTION,
  DOWNGRADE_KEY,
  FS_HREF,
  MF_DATA_FETCH_STATUS,
  MF_DATA_FETCH_TYPE,
} from '../constant';
import logger from '../logger';
import { getDataFetchMap, getDataFetchItem, initDataFetchMap } from '../utils';
import { callAllDowngrade, callDowngrade, getDowngradeTag } from './downgrade';

import type { RuntimePluginFuture } from '@modern-js/runtime';

type dataFetchFunctionOptions = [
  id?: string,
  data?: unknown,
  downgrade?: boolean,
];
export const injectDataFetchFunctionPlugin = (): RuntimePluginFuture => ({
  name: '@module-federation/inject-data-fetch-function-plugin',

  setup: (api) => {
    api.onBeforeRender(async () => {
      globalThis.FEDERATION_SSR = true;
      if (typeof window === 'undefined') {
        return;
      }
      const dataFetchFunction = async function (
        options: dataFetchFunctionOptions,
      ) {
        const [id, data, downgrade] = options;
        logger.debug('==========call data fetch function!');
        if (data) {
          if (!id) {
            throw new Error('id is required!');
          }
          if (!getDataFetchMap()) {
            initDataFetchMap();
          }
          const dataFetchItem = getDataFetchItem(id);
          if (dataFetchItem) {
            dataFetchItem[1]?.[1]?.(data);
            dataFetchItem[2] = MF_DATA_FETCH_STATUS.LOADED;
            return;
          }
          if (!dataFetchItem) {
            const dataFetchMap = getDataFetchMap();
            let res;
            let rej;
            const p = new Promise((resolve, reject) => {
              res = resolve;
              rej = reject;
            });

            dataFetchMap[id] = [
              [
                async () => async () => {
                  return '';
                },
                MF_DATA_FETCH_TYPE.FETCH_SERVER,
              ],
              [p, res, rej],
              MF_DATA_FETCH_STATUS.LOADED,
            ];
            res(data);
            return;
          }
        }

        if (downgrade) {
          const mfDowngrade = getDowngradeTag();
          if (!mfDowngrade) {
            globalThis[DOWNGRADE_KEY] = id ? [id] : true;
          } else if (
            Array.isArray(mfDowngrade) &&
            id &&
            !mfDowngrade.includes(id)
          ) {
            mfDowngrade.push(id);
          }
        }

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
      globalThis[FS_HREF] = window.location.href;
      globalThis[DATA_FETCH_FUNCTION] ||= [];
      const dataFetch: Array<dataFetchFunctionOptions> =
        globalThis[DATA_FETCH_FUNCTION];

      await Promise.all(
        dataFetch.map(async (options) => {
          await dataFetchFunction(options);
        }),
      );

      // @ts-ignore
      dataFetch.push = dataFetchFunction;
    });
  },
});
