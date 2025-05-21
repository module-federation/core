import { isBrowserEnv, composeKeyWithSeparator } from '@module-federation/sdk';
import { isCSROnly } from '../utils';
import logger from '../logger';
import { callDowngrade, getDowngradeTag } from '../ssr-runtime/downgrade';
import {
  DOWNGRADE_KEY,
  MF_DATA_FETCH_STATUS,
  WRAP_DATA_FETCH_ID_IDENTIFIER,
} from '../constant';
import { DATA_FETCH_IDENTIFIER } from '@module-federation/rsbuild-plugin/constant';

import type { GlobalModuleInfo } from '@module-federation/sdk';
import type { DataFetchParams, MF_DATA_FETCH_MAP } from '../interfaces/global';

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
  if (expose.startsWith('/')) {
    dataFetchName = `${expose.slice(1)}.${DATA_FETCH_IDENTIFIER}`;
    dataFetchId = `${id}.${DATA_FETCH_IDENTIFIER}`;
  } else if (expose === '') {
    dataFetchName = DATA_FETCH_IDENTIFIER;
    dataFetchId = `${id}/${DATA_FETCH_IDENTIFIER}`;
  } else {
    return;
  }

  if (!dataFetchName || !dataFetchId) {
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

export const flushDataFetch = () => {
  globalThis.__MF_DATA_FETCH_MAP__ = {};
  globalThis[DOWNGRADE_KEY] = undefined;
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
  noSSR?: boolean,
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
    return fetchDataFn(params);
  };
  if (isBrowserEnv()) {
    const dataFetchItem = getDataFetchItem(id);
    if (!dataFetchItem) {
      throw new Error(`dataFetchItem not found, id: ${id}`);
    }
    if (dataFetchItem[1]?.[0]) {
      return dataFetchItem[1][0];
    }

    if (noSSR) {
      return callDowngrade(id, params);
    }

    const mfDowngrade = getDowngradeTag();
    if (mfDowngrade) {
      if (typeof mfDowngrade === 'boolean') {
        return callDowngrade(id, params);
      }
      if (mfDowngrade.includes(id)) {
        return callDowngrade(id, params);
      }
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

  const { dataFetchId } = dataFetchInfo;

  return composeKeyWithSeparator(dataFetchId, hostInfo.name, hostInfo.version);
}
