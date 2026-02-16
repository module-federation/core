import { isBrowserEnv, composeKeyWithSeparator } from '@module-federation/sdk';
import logger from './logger';
import {
  DOWNGRADE_KEY,
  MF_DATA_FETCH_STATUS,
  WRAP_DATA_FETCH_ID_IDENTIFIER,
  DATA_FETCH_QUERY,
  MF_DATA_FETCH_TYPE,
  DATA_FETCH_IDENTIFIER,
  DATA_FETCH_CLIENT_SUFFIX,
} from './constant';

import type { GlobalModuleInfo } from '@module-federation/sdk';
import type {
  DataFetchParams,
  MF_DATA_FETCH_MAP,
  NoSSRRemoteInfo,
  MF_SSR_DOWNGRADE,
  MF_DATA_FETCH_MAP_VALUE_PROMISE_SET,
  MF_DATA_FETCH_CACHE,
} from './types';
import type { ModuleFederation } from '@module-federation/runtime';
import { clearStore } from './data-fetch/cache';

export const getDataFetchInfo = ({
  name,
  alias,
  id,
  remoteSnapshot,
}: {
  id: string;
  name: string;
  remoteSnapshot: GlobalModuleInfo[string];
  alias?: string;
}) => {
  if (!remoteSnapshot) {
    return;
  }
  if (!('modules' in remoteSnapshot)) {
    return;
  }
  const regex = new RegExp(`^${name}(/[^/].*|)$`);
  const nameOrAlias = regex.test(id) ? name : alias || name;

  const expose = id.replace(nameOrAlias, '');
  let dataFetchName = '';
  let dataFetchId = '';
  let dataFetchKey = '';
  if (expose.startsWith('/')) {
    dataFetchName = `${expose.slice(1)}.${DATA_FETCH_IDENTIFIER}`;
    dataFetchId = `${id}.${DATA_FETCH_IDENTIFIER}`;
    dataFetchKey = `${name}${expose}.${DATA_FETCH_IDENTIFIER}`;
  } else if (expose === '') {
    dataFetchName = DATA_FETCH_IDENTIFIER;
    dataFetchId = `${id}/${DATA_FETCH_IDENTIFIER}`;
    dataFetchKey = `${name}/${DATA_FETCH_IDENTIFIER}`;
  } else {
    return;
  }

  if (!dataFetchName || !dataFetchId || !dataFetchKey) {
    return;
  }

  if (
    !remoteSnapshot.modules.find(
      (module) => module.moduleName === dataFetchName,
    )
  ) {
    return;
  }

  return {
    dataFetchName,
    dataFetchId,
    dataFetchKey,
  };
};

export function initDataFetchMap() {
  globalThis.__MF_DATA_FETCH_MAP__ ||= {};
}

export function getDataFetchItem(id: string) {
  return (globalThis.__MF_DATA_FETCH_MAP__ as MF_DATA_FETCH_MAP)?.[id];
}

export function getDataFetchMap() {
  return globalThis.__MF_DATA_FETCH_MAP__ as MF_DATA_FETCH_MAP;
}

export function getDataFetchCache() {
  return globalThis.__MF_DATA_FETCH_CACHE__ as MF_DATA_FETCH_CACHE;
}

export const flushDataFetch = () => {
  globalThis.__MF_DATA_FETCH_MAP__ = {};
  globalThis[DOWNGRADE_KEY] = undefined;
  clearStore();
};

export function setDataFetchItemLoadedStatus(id: string) {
  const dataFetchItem = getDataFetchItem(id);
  if (!dataFetchItem) {
    return;
  }
  dataFetchItem[2] = MF_DATA_FETCH_STATUS.LOADED;
}

export const wrapDataFetchId = (id?: string) => {
  return `${WRAP_DATA_FETCH_ID_IDENTIFIER}${id}${WRAP_DATA_FETCH_ID_IDENTIFIER}`;
};

export const getDataFetchIdWithErrorMsgs = (errMsgs: string) => {
  const firstIdentifierIndex = errMsgs.indexOf(WRAP_DATA_FETCH_ID_IDENTIFIER);
  if (firstIdentifierIndex === -1) {
    return undefined;
  }

  const secondIdentifierIndex = errMsgs.indexOf(
    WRAP_DATA_FETCH_ID_IDENTIFIER,
    firstIdentifierIndex + WRAP_DATA_FETCH_ID_IDENTIFIER.length,
  );

  if (secondIdentifierIndex === -1) {
    return undefined;
  }

  return errMsgs.substring(
    firstIdentifierIndex + WRAP_DATA_FETCH_ID_IDENTIFIER.length,
    secondIdentifierIndex,
  );
};

export async function fetchData(
  id: string,
  params: DataFetchParams,
  remoteInfo?: NoSSRRemoteInfo,
): Promise<unknown | undefined> {
  const callFetchData = async () => {
    const item = getDataFetchItem(id);
    if (!item) {
      return;
    }
    const [fetchDataFnArr, ..._rest] = item;

    const fetchDataFn = await fetchDataFnArr[2];
    if (!fetchDataFn) {
      return;
    }
    return fetchDataFn({
      ...params,
      _id: id,
    });
  };
  if (isBrowserEnv) {
    const dataFetchItem = getDataFetchItem(id);
    if (!dataFetchItem) {
      throw new Error(`dataFetchItem not found, id: ${id}`);
    }
    if (dataFetchItem[1]?.[0]) {
      return dataFetchItem[1][0];
    }

    if (isCSROnly()) {
      logger.debug('==========csr only!');
      return callFetchData();
    }

    if (remoteInfo) {
      return callDowngrade(id, params, remoteInfo);
    }

    const mfDowngrade = getDowngradeTag();
    if (
      mfDowngrade &&
      (typeof mfDowngrade === 'boolean' || mfDowngrade.includes(id))
    ) {
      return callDowngrade(id, { ...params, isDowngrade: true });
    }

    let res;
    let rej;
    const p = new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
    });
    dataFetchItem[1] = [p, res, rej];
    dataFetchItem[2] = MF_DATA_FETCH_STATUS.AWAIT;
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

  const { dataFetchKey } = dataFetchInfo;

  return composeKeyWithSeparator(dataFetchKey, hostInfo.name, hostInfo.version);
}

export async function loadDataFetchModule(
  instance: ModuleFederation,
  id: string,
) {
  return instance.loadRemote(id).then((m) => {
    if (
      m &&
      typeof m === 'object' &&
      'fetchData' in m &&
      typeof m.fetchData === 'function'
    ) {
      return m.fetchData as (params: DataFetchParams) => Promise<unknown>;
    }
    throw new Error(
      `fetchData not found in remote ${id}, ${JSON.stringify(m)}`,
    );
  });
}

export function isDataLoaderExpose(exposeKey: string) {
  return (
    exposeKey.endsWith(DATA_FETCH_IDENTIFIER) ||
    exposeKey.endsWith(DATA_FETCH_CLIENT_SUFFIX)
  );
}

export function getDowngradeTag() {
  return globalThis[DOWNGRADE_KEY] as MF_SSR_DOWNGRADE;
}

export function callAllDowngrade() {
  const dataFetchMap = getDataFetchMap();
  if (!dataFetchMap) {
    return;
  }
  Object.keys(dataFetchMap).forEach((key) => {
    callDowngrade(key);
  });
}

export async function callDowngrade(
  id: string,
  params?: DataFetchParams,
  remoteInfo?: NoSSRRemoteInfo,
) {
  const dataFetchMap = getDataFetchMap();
  if (!dataFetchMap) {
    return;
  }
  const mfDataFetch = dataFetchMap[id];
  if (mfDataFetch?.[2] === MF_DATA_FETCH_STATUS.AWAIT) {
    mfDataFetch[2] = MF_DATA_FETCH_STATUS.LOADING;
    let promise: MF_DATA_FETCH_MAP_VALUE_PROMISE_SET[0];
    let res: MF_DATA_FETCH_MAP_VALUE_PROMISE_SET[1];
    let rej: MF_DATA_FETCH_MAP_VALUE_PROMISE_SET[2];
    if (mfDataFetch[1]) {
      promise = mfDataFetch[1][0];
      res = mfDataFetch[1][1];
      rej = mfDataFetch[1][2];
    } else {
      promise = new Promise((resolve, reject) => {
        res = resolve;
        rej = reject;
      });
      mfDataFetch[1] = [promise, res, rej];
    }
    const dataFetchType = mfDataFetch[0][1];
    if (dataFetchType === MF_DATA_FETCH_TYPE.FETCH_CLIENT) {
      try {
        mfDataFetch[0][0]().then(async (getDataFetchFn) => {
          return getDataFetchFn({
            ...params,
            isDowngrade: true,
            _id: id,
          }).then((data) => {
            mfDataFetch[2] = MF_DATA_FETCH_STATUS.LOADED;
            res && res(data);
          });
        });
      } catch (e) {
        mfDataFetch[2] = MF_DATA_FETCH_STATUS.ERROR;
        rej && rej(e);
      }
    } else if (dataFetchType === MF_DATA_FETCH_TYPE.FETCH_SERVER) {
      try {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set(DATA_FETCH_QUERY, encodeURIComponent(id));
        if (params) {
          currentUrl.searchParams.set(
            'params',
            encodeURIComponent(JSON.stringify(params)),
          );
        }
        if (remoteInfo) {
          currentUrl.searchParams.set(
            'remoteInfo',
            encodeURIComponent(JSON.stringify(remoteInfo)),
          );
        }
        const fetchServerQuery = globalThis.FEDERATION_SERVER_QUERY;
        if (fetchServerQuery && typeof fetchServerQuery === 'object') {
          Object.keys(fetchServerQuery).forEach((key) => {
            currentUrl.searchParams.set(
              key,
              JSON.stringify(fetchServerQuery[key]),
            );
          });
        }
        const fetchUrl = currentUrl.toString();
        const data = await fetch(fetchUrl).then((res) => res.json());
        mfDataFetch[2] = MF_DATA_FETCH_STATUS.LOADED;
        res && res(data);
      } catch (e) {
        mfDataFetch[2] = MF_DATA_FETCH_STATUS.ERROR;
        rej && rej(e);
      }
    }

    return promise;
  }
}

export function isCSROnly() {
  // @ts-ignore  modern.js will inject window._SSR_DATA if enable ssr
  return window._SSR_DATA === undefined;
}

export function isServerEnv() {
  return typeof window === 'undefined';
}

export function setSSREnv({
  fetchServerQuery,
}: {
  fetchServerQuery?: Record<string, unknown>;
}) {
  globalThis.FEDERATION_SSR = true;
  globalThis.FEDERATION_SERVER_QUERY = fetchServerQuery;
}

export function getLoadedRemoteInfos(
  id: string,
  instance: ModuleFederation | null,
) {
  if (!instance) {
    return;
  }
  const { name, expose } = instance.remoteHandler.idToRemoteMap[id] || {};
  if (!name) {
    return;
  }
  const module = instance.moduleCache.get(name);
  if (!module) {
    return;
  }
  const { remoteSnapshot } = instance.snapshotHandler.getGlobalRemoteInfo(
    module.remoteInfo,
  );
  return {
    ...module.remoteInfo,
    snapshot: remoteSnapshot,
    expose,
  };
}
