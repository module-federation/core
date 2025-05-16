import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import {
  getDataFetchInfo,
  initDataFetchMap,
  getDataFetchItem,
  getDataFetchMap,
  isCSROnly,
  isSSRDowngrade,
} from '../../runtime/utils';
import logger from '../../runtime/logger';
import { getDataFetchMapKey } from '../../runtime/dataFetch';
import type { MF_DATA_FETCH_MAP_VALUE } from '../../interfaces/global';

const autoFetchData: () => FederationRuntimePlugin = () => ({
  name: 'auto-fetch-data-plugin',
  beforeInit(args) {
    initDataFetchMap();
    return args;
  },
  afterLoadSnapshot(args) {
    // if (typeof window !== 'undefined' && !(isCSROnly() || isSSRDowngrade() )) {
    //   if(!globalThis._MF__DATA_FETCH_ID_MAP__['_mfSSRDowngrade']){
    //     return args;
    //   }
    // }

    const { id, moduleInfo, remoteSnapshot, host } = args;
    if (typeof id === 'string' && id.includes('data')) {
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
    });
    if (!dataFetchInfo) {
      return args;
    }
    const { dataFetchId, dataFetchName } = dataFetchInfo;

    if (
      !remoteSnapshot.modules.find(
        (module) => module.moduleName === dataFetchName,
      )
    ) {
      return args;
    }

    const { modules, version } = remoteSnapshot;

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

    if (!modules.find((module) => module.moduleName === dataFetchName)) {
      logger.debug(
        '======= auto fetch plugin module name not existed',
        modules.map((i) => i.moduleName).join(', '),
      );

      return args;
    }

    const dataFetchMap = getDataFetchMap();

    const getDataFetchGetter = () =>
      host.loadRemote(dataFetchId).then((m) => {
        if (
          m &&
          typeof m === 'object' &&
          'fetchData' in m &&
          typeof m.fetchData === 'function'
        ) {
          return m.fetchData as () => Promise<unknown>;
        }
        throw new Error(
          `fetchData not found in remote ${dataFetchId}, ${JSON.stringify(m)}`,
        );
      });
    // .catch((e) => {
    //   console.log('======= auto fetch plugin fetchData error', e);
    //   return ()=>`${e}`;
    // });

    const dataFetchFnItem: MF_DATA_FETCH_MAP_VALUE[0] = [getDataFetchGetter];

    // server client must execute
    if (typeof window === 'undefined' || isCSROnly()) {
      dataFetchFnItem.push(getDataFetchGetter());
    }

    dataFetchMap.set(dataFetchMapKey, [dataFetchFnItem]);

    return args;
  },
});

export default autoFetchData;
