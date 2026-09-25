import { loadScriptNode } from '@module-federation/sdk/node';
import { getRemoteEntryExports } from '../global';
import type { ModuleFederation } from '../core';
import type { RemoteInfo, ResourceLoadContext } from '../type';
import { error } from '../utils/logger';
import { handleRemoteEntryLoaded } from '../utils/load';

export async function loadEntryNode({
  remoteInfo,
  loaderHook,
  resourceContext,
}: {
  remoteInfo: RemoteInfo;
  loaderHook: ModuleFederation['loaderHook'];
  resourceContext?: ResourceLoadContext;
}) {
  const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  return loadScriptNode(entry, {
    attrs: { name, globalName, type },
    loaderHook: {
      createScriptHook: (url: string, attrs: Record<string, any> = {}) => {
        const res = loaderHook.lifecycle.createScript.emit({
          url,
          attrs,
          remoteInfo,
          resourceContext: resourceContext
            ? {
                ...resourceContext,
                url,
              }
            : undefined,
        });

        if (!res) return;

        if ('url' in res) {
          return res;
        }

        return;
      },
    },
  })
    .then(() => {
      return handleRemoteEntryLoaded(name, globalName, entry);
    })
    .catch((e) => {
      const msg = e instanceof Error ? e.message : String(e);
      error(
        `Failed to load Node.js entry for remote "${name}" from "${entry}". ${msg}`,
      );
    });
}

export const node = {
  kind: 'platform' as const,
  name: 'node' as const,
  isBrowser: () => false,
  loadEntry: loadEntryNode,
  loadScript: loadScriptNode,
};
