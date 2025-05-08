import { isBrowserEnv, composeKeyWithSeparator } from '@module-federation/sdk';
import helpers from '@module-federation/runtime/helpers';
import { getDataFetchInfo, isSSRDowngrade } from './utils';

export async function fetchData(id: string): Promise<unknown | undefined> {
  if (isBrowserEnv()) {
    if (!globalThis._MF__DATA_FETCH_ID_MAP__) {
      globalThis._MF__DATA_FETCH_ID_MAP__ = {};
    }
    if (globalThis._MF__DATA_FETCH_ID_MAP__[id]) {
      return;
    }
    if (isSSRDowngrade()) {
      console.log('==========ssr downgrade!');
      // wip...
      // fetch("host/server")
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
