import { injectDataFetch } from './inject-data-fetch';
import {
  getDataFetchInfo,
  initDataFetchMap,
  getDataFetchItem,
  getDataFetchMap,
  isCSROnly,
  getDataFetchMapKey,
  isDataLoaderExpose,
  loadDataFetchModule,
  isServerEnv,
} from '../utils';
import logger from '../logger';
import {
  MF_DATA_FETCH_TYPE,
  MF_DATA_FETCH_STATUS,
  DATA_FETCH_CLIENT_SUFFIX,
} from '../constant';

import type { MF_DATA_FETCH_MAP_VALUE } from '../types';
import type { FederationRuntimePlugin } from '@module-federation/runtime';

const autoFetchData: () => FederationRuntimePlugin = () => ({
  name: 'auto-fetch-data-plugin',
  beforeInit(args) {
    initDataFetchMap();
    injectDataFetch();
    return args;
  },
  afterLoadSnapshot(args) {
    const { id, moduleInfo, remoteSnapshot, host } = args;
    if (typeof id === 'string' && isDataLoaderExpose(id)) {
      return args;
    }
    if (!remoteSnapshot || !id || !('modules' in remoteSnapshot)) {
      return args;
    }

    const { name, alias } = moduleInfo;
    const dataFetchInfo = getDataFetchInfo({
      name,
      alias,
      id,
      remoteSnapshot,
    });
    if (!dataFetchInfo) {
      return args;
    }
    const { dataFetchId, dataFetchName } = dataFetchInfo;

    const dataFetchMapKey = getDataFetchMapKey(dataFetchInfo, {
      name: host.name,
      version: host.options.version,
    });
    logger.debug(
      '======= auto fetch plugin dataFetchMapKey: ',
      dataFetchMapKey,
    );

    if (!dataFetchMapKey) {
      return args;
    }

    const dataFetchItem = getDataFetchItem(dataFetchMapKey);
    if (dataFetchItem) {
      return args;
    }

    const dataFetchMap = getDataFetchMap();
    const hasSSRAsset = Boolean(remoteSnapshot.ssrRemoteEntry);
    const hasDataFetchClient = Boolean(
      remoteSnapshot.modules.find(
        (module) =>
          module.moduleName === `${dataFetchName}${DATA_FETCH_CLIENT_SUFFIX}`,
      ),
    );
    const downgradeType = hasDataFetchClient
      ? MF_DATA_FETCH_TYPE.FETCH_CLIENT
      : hasSSRAsset
        ? MF_DATA_FETCH_TYPE.FETCH_SERVER
        : MF_DATA_FETCH_TYPE.FETCH_CLIENT;
    let finalDataFetchId = dataFetchId;

    if (!isServerEnv()) {
      finalDataFetchId =
        downgradeType === MF_DATA_FETCH_TYPE.FETCH_CLIENT
          ? hasDataFetchClient
            ? `${dataFetchId}${DATA_FETCH_CLIENT_SUFFIX}`
            : dataFetchId
          : dataFetchId;
    }

    const getDataFetchGetter = () =>
      loadDataFetchModule(host, finalDataFetchId);

    const dataFetchFnItem: MF_DATA_FETCH_MAP_VALUE[0] = [
      getDataFetchGetter,
      downgradeType,
    ];

    // server client must execute
    if (typeof window === 'undefined' || isCSROnly()) {
      dataFetchFnItem.push(getDataFetchGetter());
    }

    dataFetchMap[dataFetchMapKey] = [
      dataFetchFnItem,
      undefined,
      MF_DATA_FETCH_STATUS.AWAIT,
    ];

    return args;
  },
});

export default autoFetchData;
