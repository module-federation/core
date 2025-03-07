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
    if (helpers.global.nativeGlobal.__FEDERATION__.__DATA_FETCH_MAP__[key]) {
      return args;
    }

    if (modules.find((module) => module.moduleName === dataFetchName)) {
      return args;
    }

    helpers.global.nativeGlobal.__FEDERATION__.__DATA_FETCH_MAP__[key] = host
      .loadRemote(dataFetchId)
      .then((m) => {
        if (
          m &&
          typeof m === 'object' &&
          'prefetch' in m &&
          typeof m.prefetch === 'function'
        ) {
          return m.prefetch();
        }
      });

    return args;
  },
});
export default autoFetchData;
