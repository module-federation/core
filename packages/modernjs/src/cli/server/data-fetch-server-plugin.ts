import { DATA_FETCH_QUERY } from '../../constant';
import logger from '../../runtime/logger';
import type { ServerPluginLegacy } from '@modern-js/server-core';

export default (): ServerPluginLegacy => ({
  name: 'mf-data-fetch-server-plugin',
  setup() {
    return {
      config(config) {
        if (!config.render) {
          config.render = {
            middleware: [],
          };
        } else if (!config.render.middleware) {
          config.render.middleware = [];
        }

        config.render!.middleware!.push(
          async (ctx: { request: any }, next: () => any) => {
            const { request } = ctx;
            try {
              const url = new URL(request.url);
              const dataFetchId = url.searchParams.get(DATA_FETCH_QUERY);
              if (!dataFetchId) {
                return next();
              }
              logger.debug('dataFetchId: ', dataFetchId);

              const fetchDataPromise =
                globalThis.nativeGlobal.__FEDERATION__.__DATA_FETCH_MAP__.get(
                  dataFetchId,
                );
              if (!fetchDataPromise) {
                return next();
              }

              const fetchDataFn = await fetchDataPromise;
              if (!fetchDataFn) {
                return next();
              }
              return fetchDataFn();
            } catch (e) {
              console.log('data fetch error:');
              console.error(e);
              return next();
            }
          },
        );
        return config;
      },
    };
  },
});
