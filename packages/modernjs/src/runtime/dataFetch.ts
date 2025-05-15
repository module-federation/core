import { isBrowserEnv, composeKeyWithSeparator } from '@module-federation/sdk';
import helpers from '@module-federation/runtime/helpers';
import { getDataFetchInfo, isCSROnly, isSSRDowngrade } from './utils';
import logger from './logger';
import { DATA_FETCH_QUERY } from '../constant';

export async function fetchData(id: string): Promise<unknown | undefined> {
  const fn = async () => {
    const fetchDataPromise =
      helpers.global.nativeGlobal.__FEDERATION__.__DATA_FETCH_MAP__.get(id);
    if (!fetchDataPromise) {
      return;
    }

    const fetchDataFn = await fetchDataPromise;
    if (!fetchDataFn) {
      return;
    }
    return fetchDataFn();
  };
  if (isBrowserEnv()) {
    if (!globalThis._MF__DATA_FETCH_ID_MAP__) {
      globalThis._MF__DATA_FETCH_ID_MAP__ = {};
    }

    if (globalThis._MF__DATA_FETCH_ID_MAP__[id]) {
      return;
    }

    if (isSSRDowngrade()) {
      logger.debug('==========ssr downgrade!');
      // const
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set(DATA_FETCH_QUERY, id);
      const fetchUrl = currentUrl.toString();
      const data = await fetch(fetchUrl).then((res) => res.json());
      return data;
    }

    if (isCSROnly()) {
      logger.debug('==========csr only!');
      return fn();
    }

    let res;
    let rej;
    const p = new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
    });
    globalThis._MF__DATA_FETCH_ID_MAP__[id] = [p, res, rej];
    return globalThis._MF__DATA_FETCH_ID_MAP__[id][0];
  }

  return fn();
}

export function getDataFetchMapKey(
  remoteInfo?: {
    name: string;
    version?: string;
  },
  dataFetchInfo?: ReturnType<typeof getDataFetchInfo>,
) {
  if (!dataFetchInfo || !remoteInfo) {
    return;
  }

  const { name, version } = remoteInfo;

  return composeKeyWithSeparator(name, dataFetchInfo.dataFetchName, version);
}
