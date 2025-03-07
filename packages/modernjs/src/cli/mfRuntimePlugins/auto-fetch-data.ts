import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';

const autoFetchData: () => FederationRuntimePlugin = () => ({
  name: 'auto-fetch-data-plugin',
  loadSnapshot(args) {
    const { id, moduleInfo, remoteSnapshot } = args;

    if (!('modules' in moduleInfo) || !id) {
      return args;
    }

    if (hasData(remoteSnapshot)) {
      mfModule.data = fetchData();
    }

    return args;
  },
});
export default autoFetchData;
