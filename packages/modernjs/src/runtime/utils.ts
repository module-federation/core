import type { FederationHost } from '@module-federation/enhanced/runtime';
import type { MF_DATA_FETCH_MAP, MF_SSR_DOWNGRADE } from '../interfaces/global';

export const DATA_FETCH = 'data';

export const getDataFetchInfo = ({
  name,
  alias,
  id,
}: {
  id: string;
  name: string;
  alias?: string;
}) => {
  const regex = new RegExp(`^${name}(/[^/].*|)$`);
  const nameOrAlias = regex.test(id) ? name : alias || name;

  const expose = id.replace(nameOrAlias, '');
  let dataFetchName = '';
  let dataFetchId = '';
  if (expose.startsWith('/')) {
    dataFetchName = `${expose.slice(1)}.${DATA_FETCH}`;
    dataFetchId = `${id}.${DATA_FETCH}`;
  } else if (expose === '') {
    dataFetchName = DATA_FETCH;
    dataFetchId = `${id}/${DATA_FETCH}`;
  } else {
    return;
  }

  if (!dataFetchName || !dataFetchId) {
    return;
  }

  return {
    dataFetchName,
    dataFetchId,
  };
};

export function getLoadedRemoteInfos(
  id: string,
  instance: FederationHost | null,
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

export function isSSRDowngrade() {
  return Boolean(globalThis.__MF_SSR_DOWNGRADE__);
}

export function isCSROnly() {
  return window._SSR_DATA === undefined;
}

export function initDataFetchMap() {
  globalThis.__MF_DATA_FETCH_MAP__ ||= new Map();
}

export function getDataFetchItem(id: string) {
  return (globalThis.__MF_DATA_FETCH_MAP__ as MF_DATA_FETCH_MAP)?.get(id);
}

export function getDataFetchMap() {
  return globalThis.__MF_DATA_FETCH_MAP__ as MF_DATA_FETCH_MAP;
}
