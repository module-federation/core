import { FederationRuntimePlugin } from '../../type/plugin';
import { loadEntryDom } from './loadEntry';

export function domPlugin(): FederationRuntimePlugin {
  return {
    name: 'dom-plugin',
    async loadEntry(args) {
      const { createScriptHook, remoteInfo, remoteEntryExports } = args;
      const { entry, entryGlobalName, name, type } = remoteInfo;

      return loadEntryDom({
        entry,
        entryGlobalName,
        name,
        type,
        remoteEntryExports,
        createScriptHook: (url, attrs) => {
          const res = createScriptHook.emit({ url, attrs });

          if (!res) return;

          if (res instanceof HTMLScriptElement) {
            return res;
          }

          if ('script' in res || 'timeout' in res) {
            return res;
          }

          return;
        },
      });
    },
  };
}
