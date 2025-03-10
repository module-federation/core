import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import helpers from '@module-federation/runtime/helpers';
import { getDataFetchInfo } from '../../runtime/utils';

const autoFetchData: () => FederationRuntimePlugin = () => ({
  name: 'auto-fetch-data-plugin',
  afterLoadSnapshot(args) {
    const { id, moduleInfo, remoteSnapshot, host } = args;

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

    helpers.global.nativeGlobal.__FEDERATION__.__DATA_FETCH_MAP__[key] = host
      .loadRemote(dataFetchId)
      .then((m) => {
        if (
          m &&
          typeof m === 'object' &&
          'fetchData' in m &&
          typeof m.fetchData === 'function'
        ) {
          console.log('======= auto fetch plugin fetchData', m.fetchData);
          return m.fetchData();
        }
      })
      .catch((e) => {
        console.log('======= auto fetch plugin fetchData error', e);
        return null;
      });

    return args;
  },
});
export default autoFetchData;
