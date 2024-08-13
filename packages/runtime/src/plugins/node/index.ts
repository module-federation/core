import { FederationRuntimePlugin } from '../../type/plugin';
import { loadEntryNode } from './loadEntry';

export function nodePlugin(): FederationRuntimePlugin {
  return {
    name: 'node-plugin',
    async loadEntry(args) {
      const { createScriptHook, remoteInfo } = args;
      const { entry, entryGlobalName, name } = remoteInfo;

      return loadEntryNode({
        entry,
        entryGlobalName,
        name,
        createScriptHook: (url, attrs) => {
          const res = createScriptHook.emit({ url, attrs });

          if (!res) return;

          if ('url' in res) {
            return res;
          }

          return;
        },
      });
    },
  };
}
