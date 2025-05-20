import { DATA_FETCH_QUERY } from '../../constant';
import logger from '../../logger';
import { getDataFetchMap } from '../../utils';
import { fetchData } from '../../utils/dataFetch';
import type {
  MiddlewareHandler,
  ServerPlugin,
} from '@modern-js/server-runtime';

function wrapSetTimeout(
  targetPromise: Promise<unknown>,
  delay = 20000,
  id: string,
) {
  if (targetPromise && typeof targetPromise.then === 'function') {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        logger.warn(`Data fetch for ID ${id} timed out after 20 seconds.`);
        reject(new Error(`Data fetch for ID ${id} timed out after 20 seconds`));
      }, delay);

      targetPromise
        .then((value: any) => {
          clearTimeout(timeoutId);
          resolve(value);
        })
        .catch((err: any) => {
          clearTimeout(timeoutId);
          reject(err);
        });
    });
  }
}

const middleware: MiddlewareHandler = async (ctx, next) => {
  try {
    const url = new URL(ctx.req.url);
    const dataFetchId = url.searchParams.get(DATA_FETCH_QUERY);
    const params = JSON.parse(url.searchParams.get('params') || '{}');
    if (!dataFetchId) {
      return next();
    }
    logger.debug('dataFetchId: ', dataFetchId);
    const dataFetchMap = getDataFetchMap();
    if (!dataFetchMap) {
      return next();
    }
    const fetchDataPromise = dataFetchMap[dataFetchId][1];
    if (fetchDataPromise) {
      const targetPromise = fetchDataPromise[0];
      // Ensure targetPromise is thenable
      const wrappedPromise = wrapSetTimeout(targetPromise, 20000, dataFetchId);
      if (wrappedPromise) {
        const res = await wrappedPromise;
        return ctx.json(res);
      }
      logger.error(
        `Expected a Promise from fetchDataPromise[0] for dataFetchId ${dataFetchId}, but received:`,
        targetPromise,
        'Will try call new dataFetch again...',
      );
    }

    const callFetchDataPromise = fetchData(dataFetchId, {
      ...params,
      isDowngrade: true,
    });
    const wrappedPromise = wrapSetTimeout(
      callFetchDataPromise,
      20000,
      dataFetchId,
    );
    if (wrappedPromise) {
      const res = await wrappedPromise;
      return ctx.json(res);
    }
    return next();
  } catch (e) {
    console.log('data fetch error:');
    console.error(e);
    return next();
  }
};

const dataFetchServePlugin = (): ServerPlugin => ({
  name: 'mf-data-fetch-server-plugin',
  setup: (api) => {
    api.onPrepare(() => {
      const { middlewares } = api.getServerContext();
      middlewares.push({
        name: 'module-federation-serve-manifest',
        // @ts-ignore type error
        handler: middleware,
      });
    });
  },
});

export default dataFetchServePlugin;
