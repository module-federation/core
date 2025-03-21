import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import helpers from '@module-federation/runtime/helpers';
import { getDataFetchInfo } from '../../runtime/utils';

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

    const key = `${name}@${version}@${dataFetchName}`;
    console.log('======= auto fetch plugin key: ', key);
    if (helpers.global.nativeGlobal.__FEDERATION__.__DATA_FETCH_MAP__[key]) {
      return args;
    }

    if (!modules.find((module) => module.moduleName === dataFetchName)) {
      console.log(
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
      key,
      fetchData,
    );

    return args;
  },
});
export default autoFetchData;
