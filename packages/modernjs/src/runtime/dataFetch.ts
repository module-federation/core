import { isBrowserEnv, composeKeyWithSeparator } from '@module-federation/sdk';
import {
  getDataFetchInfo,
  isCSROnly,
  isSSRDowngrade,
  getDataFetchItem,
} from './utils';
import logger from './logger';
import { DATA_FETCH_QUERY } from '../constant';

export async function fetchData(id: string): Promise<unknown | undefined> {
  const callFetchData = async () => {
    const item = getDataFetchItem(id);
    if (!item) {
      return;
    }
    const [fetchDataFnArr, ..._rest] = item;

    const fetchDataFn = await fetchDataFnArr[1];
    if (!fetchDataFn) {
      return;
    }
    return fetchDataFn();
  };
  if (isBrowserEnv()) {
    const dataFetchItem = getDataFetchItem(id);
    if (!dataFetchItem) {
      throw new Error(`dataFetchItem not found, id: ${id}`);
    }
    if (dataFetchItem[1]?.[0]) {
      return dataFetchItem[1][0];
    }

    if (isSSRDowngrade()) {
      logger.debug('==========ssr downgrade!');
      // TODO: 根据是否设置 .data.client 区分处理
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set(DATA_FETCH_QUERY, id);
      const fetchUrl = currentUrl.toString();
      const data = await fetch(fetchUrl).then((res) => res.json());
      return data;
    }

    if (isCSROnly()) {
      logger.debug('==========csr only!');
      return callFetchData();
    }

    let res;
    let rej;
    const p = new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
    });
    dataFetchItem[1] = [p, res, rej];
    return dataFetchItem[1][0];
  }

  return callFetchData();
}

export function getDataFetchMapKey(
  dataFetchInfo?: ReturnType<typeof getDataFetchInfo>,
  hostInfo?: { name: string; version?: string },
) {
  if (!dataFetchInfo || !hostInfo) {
    return;
  }

  const { dataFetchId } = dataFetchInfo;

  return composeKeyWithSeparator(dataFetchId, hostInfo.name, hostInfo.version);
}
