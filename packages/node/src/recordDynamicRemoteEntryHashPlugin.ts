import type { FederationRuntimePlugin } from '@module-federation/runtime';

const recordDynamicRemoteEntryHashPlugin: () => FederationRuntimePlugin =
  () => ({
    name: 'record-dynamic-remote-entry-hash-plugin',
    beforeInit(args) {
      if (!globalThis.mfHashMap) {
        globalThis.mfHashMap = {};
      }

      return args;
    },
    async onLoad(args) {
      const { moduleInstance } = args;

      if (!moduleInstance.remoteInfo) {
        return args;
      }
      const hashmap = globalThis.mfHashMap;

      if (!hashmap) {
        return args;
      }

      const { name, entry } = moduleInstance.remoteInfo;

      if (!hashmap[name]) {
        const hotReloadUtils = await import('./utils/hot-reload');
        const fetcher = hotReloadUtils.createFetcher(
          entry,
          hotReloadUtils.getFetchModule(),
          name,
          (hash) => {
            hashmap[name] = hash;
          },
        );
        await fetcher;
      }

      return args;
    },
  });
export default recordDynamicRemoteEntryHashPlugin;
