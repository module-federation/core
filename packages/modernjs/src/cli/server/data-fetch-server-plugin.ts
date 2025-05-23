import { DATA_FETCH_QUERY, MF_DATA_FETCH_STATUS } from '../../constant';
import logger from '../../logger';
import { getDataFetchMap } from '../../utils';
import {
  fetchData,
  initDataFetchMap,
  loadDataFetchModule,
} from '../../utils/dataFetch';
import { SEPARATOR } from '@module-federation/sdk';
import type {
  MiddlewareHandler,
  ServerPlugin,
} from '@modern-js/server-runtime';
import type { NoSSRRemoteInfo } from '../../interfaces/global';

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

function addProtocol(url: string) {
  if (url.startsWith('//')) {
    return 'https:' + url;
  }
  return url;
}

const getDecodeQuery = (url: URL, name: string) => {
  const res = url.searchParams.get(name);
  if (!res) {
    return null;
  }
  return decodeURIComponent(res);
};

const middleware: MiddlewareHandler = async (ctx, next) => {
  let url: URL;
  let dataFetchId: string | null;
  let params: Record<string, unknown>;
  let remoteInfo: NoSSRRemoteInfo;
  try {
    url = new URL(ctx.req.url);
    dataFetchId = getDecodeQuery(url, DATA_FETCH_QUERY);
    params = JSON.parse(getDecodeQuery(url, 'params') || '{}');
    const remoteInfoQuery = getDecodeQuery(url, 'remoteInfo');
    remoteInfo = remoteInfoQuery ? JSON.parse(remoteInfoQuery) : null;
  } catch (e) {
    //TODO: remove me
    console.log('fetch data from server, error: ', e);
    console.error(e);
    return next();
  }

  if (!dataFetchId) {
    return next();
  }
  logger.log('fetch data from server, dataFetchId: ', dataFetchId);
  //TODO: remove me
  console.log(
    'fetch data from server, moduleInfo: ',
    globalThis.__FEDERATION__?.moduleInfo,
  );
  try {
    const dataFetchMap = getDataFetchMap();
    if (!dataFetchMap) {
      initDataFetchMap();
    }
    const fetchDataPromise = dataFetchMap[dataFetchId]?.[1];
    //TODO: remove me
    console.log('fetch data from server, fetchDataPromise: ', fetchDataPromise);
    if (
      fetchDataPromise &&
      dataFetchMap[dataFetchId]?.[2] !== MF_DATA_FETCH_STATUS.ERROR
    ) {
      logger.log(
        'fetch data from server, fetchDataPromise: ',
        fetchDataPromise,
      );
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

    if (remoteInfo) {
      try {
        const hostInstance = globalThis.__FEDERATION__.__INSTANCES__[0];
        const remoteEntry = `${addProtocol(remoteInfo.ssrPublicPath) + remoteInfo.ssrRemoteEntry}`;
        if (!hostInstance) {
          throw new Error('host instance not found!');
        }
        const remote = hostInstance.options.remotes.find(
          (remote) => remote.name === remoteInfo.name,
        );
        logger.debug('find remote: ', JSON.stringify(remote));
        if (!remote) {
          hostInstance.registerRemotes([
            {
              name: remoteInfo.name,
              entry: remoteEntry,
              entryGlobalName: remoteInfo.globalName,
            },
          ]);
        } else {
          const { hostGlobalSnapshot, remoteSnapshot } =
            hostInstance.snapshotHandler.getGlobalRemoteInfo(remoteInfo);
          logger.debug(
            'find hostGlobalSnapshot: ',
            JSON.stringify(hostGlobalSnapshot),
          );
          logger.debug('find remoteSnapshot: ', JSON.stringify(remoteSnapshot));

          if (!hostGlobalSnapshot || !remoteSnapshot) {
            if ('version' in remote) {
              // @ts-ignore
              delete remote.version;
            }
            // @ts-ignore
            remote.entry = remoteEntry;
            remote.entryGlobalName = remoteInfo.globalName;
          }
        }
      } catch (e) {
        ctx.status(500);
        return ctx.text(
          `failed to fetch ${remoteInfo.name} data, error:\n ${e}`,
        );
      }
    }

    const dataFetchItem = dataFetchMap[dataFetchId];
    //TODO: remove me
    console.log('fetch data from server, dataFetchItem: ', dataFetchItem);
    if (dataFetchItem) {
      logger.log('fetch data from server, dataFetchItem: ', dataFetchItem);
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
    }

    const remoteId = dataFetchId.split(SEPARATOR)[0];
    const hostInstance = globalThis.__FEDERATION__.__INSTANCES__[0];
    if (!hostInstance) {
      throw new Error('host instance not found!');
    }
    const dataFetchFn = await loadDataFetchModule(hostInstance, remoteId);
    const data = await dataFetchFn({ ...params, isDowngrade: !remoteInfo });
    return ctx.json(data);
  } catch (e) {
    console.log('server plugin data fetch error: ', e);
    ctx.status(500);
    return ctx.text(`failed to fetch ${remoteInfo.name} data, error:\n ${e}`);
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
