import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import helpers from '@module-federation/runtime/helpers';
import { getDataFetchInfo } from '../../runtime/utils';
import logger from '../../runtime/logger';
import { getDataFetchMapKey } from '../../runtime/dataFetch';

const autoFetchData: () => FederationRuntimePlugin = () => ({
  name: 'auto-fetch-data-plugin',
  afterLoadSnapshot(args) {
    if (typeof window !== 'undefined') {
      return args;
    }

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

    const { modules, version } = remoteSnapshot;

    const dataFetchMapKey = getDataFetchMapKey(
      { name, version },
      dataFetchInfo,
    );
    logger.debug(
      '======= auto fetch plugin dataFetchMapKey: ',
      dataFetchMapKey,
    );

    if (!dataFetchMapKey) {
      return args;
    }

    if (
      helpers.global.nativeGlobal.__FEDERATION__.__DATA_FETCH_MAP__[
        dataFetchMapKey
      ]
    ) {
      return args;
    }

    if (!modules.find((module) => module.moduleName === dataFetchName)) {
      logger.debug(
        '======= auto fetch plugin module name not existed',
        modules.map((i) => i.moduleName).join(', '),
      );

      return args;
    }

    const fetchData = host
      .loadRemote(dataFetchId)
      .then((m) => {
        if (
          m &&
          typeof m === 'object' &&
          'fetchData' in m &&
          typeof m.fetchData === 'function'
        ) {
          return m.fetchData as () => Promise<unknown>;
        }
      })
      .catch((e) => {
        console.log('======= auto fetch plugin fetchData error', e);
        return undefined;
      });

    helpers.global.nativeGlobal.__FEDERATION__.__DATA_FETCH_MAP__.set(
      dataFetchMapKey,
      fetchData,
    );

    return args;
  },
});

export default autoFetchData;
