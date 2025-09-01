import { DATA_FETCH_QUERY, MF_DATA_FETCH_STATUS } from '../constant';
import {
  getDataFetchMap,
  fetchData,
  initDataFetchMap,
  loadDataFetchModule,
} from '../utils';
import { SEPARATOR, MANIFEST_EXT } from '@module-federation/sdk';
import logger from '../logger';

import type { NoSSRRemoteInfo } from '../types';
import type { MiddlewareHandler } from 'hono';

function wrapSetTimeout(
  targetPromise: Promise<unknown>,
  delay = 20000,
  id: string,
) {
  if (targetPromise && typeof targetPromise.then === 'function') {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        logger.debug(`Data fetch for ID ${id} timed out after 20 seconds.`);
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

const dataFetchServerMiddleware: MiddlewareHandler = async (ctx, next) => {
  let url: URL;
  let dataFetchKey: string | null;
  let params: Record<string, unknown>;
  let remoteInfo: NoSSRRemoteInfo;
  try {
    url = new URL(ctx.req.url);
    dataFetchKey = getDecodeQuery(url, DATA_FETCH_QUERY);
    params = JSON.parse(getDecodeQuery(url, 'params') || '{}');
    const remoteInfoQuery = getDecodeQuery(url, 'remoteInfo');
    remoteInfo = remoteInfoQuery ? JSON.parse(remoteInfoQuery) : null;
  } catch (e) {
    logger.error('fetch data from server, error: ', e);
    return next();
  }

  if (!dataFetchKey) {
    return next();
  }
  logger.debug('fetch data from server, dataFetchKey: ', dataFetchKey);
  logger.debug(
    'fetch data from server, moduleInfo: ',
    globalThis.__FEDERATION__?.moduleInfo,
  );
  try {
    const dataFetchMap = getDataFetchMap();
    if (!dataFetchMap) {
      initDataFetchMap();
    }
    const fetchDataPromise = dataFetchMap[dataFetchKey]?.[1];
    logger.debug(
      'fetch data from server, fetchDataPromise: ',
      fetchDataPromise,
    );
    if (
      fetchDataPromise &&
      dataFetchMap[dataFetchKey]?.[2] !== MF_DATA_FETCH_STATUS.ERROR
    ) {
      const targetPromise = fetchDataPromise[0];
      // Ensure targetPromise is thenable
      const wrappedPromise = wrapSetTimeout(targetPromise, 20000, dataFetchKey);
      if (wrappedPromise) {
        const res = await wrappedPromise;
        logger.debug('fetch data from server, fetchDataPromise res: ', res);
        return ctx.json(res);
      }
      logger.error(
        `Expected a Promise from fetchDataPromise[0] for dataFetchKey ${dataFetchKey}, but received:`,
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
        } else if (
          !('entry' in remote) ||
          !remote.entry.includes(MANIFEST_EXT)
        ) {
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

    const dataFetchItem = dataFetchMap[dataFetchKey];
    logger.debug('fetch data from server, dataFetchItem: ', dataFetchItem);
    if (dataFetchItem) {
      const callFetchDataPromise = fetchData(dataFetchKey, {
        ...params,
        isDowngrade: !remoteInfo,
        _id: dataFetchKey,
      });
      const wrappedPromise = wrapSetTimeout(
        callFetchDataPromise,
        20000,
        dataFetchKey,
      );
      if (wrappedPromise) {
        const res = await wrappedPromise;
        logger.debug('fetch data from server, dataFetchItem res: ', res);
        return ctx.json(res);
      }
    }

    const remoteId = dataFetchKey.split(SEPARATOR)[0];
    const hostInstance = globalThis.__FEDERATION__.__INSTANCES__[0];
    if (!hostInstance) {
      throw new Error('host instance not found!');
    }
    const dataFetchFn = await loadDataFetchModule(hostInstance, remoteId);
    const data = await dataFetchFn({
      ...params,
      isDowngrade: !remoteInfo,
      _id: dataFetchKey,
    });
    logger.debug('fetch data from server, loadDataFetchModule res: ', data);
    return ctx.json(data);
  } catch (e) {
    logger.error('server plugin data fetch error: ', e);
    ctx.status(500);
    return ctx.text(`failed to fetch ${remoteInfo.name} data, error:\n ${e}`);
  }
};

export default dataFetchServerMiddleware;
