import { loadScriptNode } from '@module-federation/sdk/node';
import { getRemoteEntryExports } from '../global';
import type {
  NodePlatform,
  RemoteEntryExports,
  LoadEntryOptions,
} from '../type';
import { error } from '../utils/logger';
import { handleRemoteEntryLoaded } from '../utils/load';

function isRemoteEntryExports(value: unknown): value is RemoteEntryExports {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    'get' in value &&
    typeof value.get === 'function' &&
    'init' in value &&
    typeof value.init === 'function'
  );
}

export async function loadEntryNode({
  remoteInfo,
  loaderHook,
  resourceContext,
  getEntryUrl,
  entryLoadingContext,
}: LoadEntryOptions) {
  const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  const customLoading =
    entryLoadingContext?.custom ||
    Boolean(getEntryUrl) ||
    loaderHook.lifecycle.createScript.listeners.size > 0 ||
    loaderHook.lifecycle.fetch.listeners.size > 0 ||
    loaderHook.lifecycle.loadEntryError.listeners.size > 0;
  // A process-global export has no evaluator provenance. Contextual loads
  // deduplicate through globalLoading and must use their own SDK result, even
  // when this request has no hooks: a previous custom load may own the global.
  const isolatedLoading = Boolean(entryLoadingContext) || customLoading;
  if (remoteEntryExports && !isolatedLoading) {
    return remoteEntryExports;
  }

  const url = getEntryUrl ? getEntryUrl(entry) : entry;
  return loadScriptNode(url, {
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
    .then((loaded: unknown) => {
      // The SDK declares Promise<void>, but transports the evaluated exports
      // through its callback. Validate that external payload before use.
      if (isRemoteEntryExports(loaded)) {
        return loaded;
      }
      if (isolatedLoading) {
        error(
          `Node entry evaluator for remote "${name}" did not return callable get/init exports.`,
        );
      }
      return handleRemoteEntryLoaded(name, globalName, entry);
    })
    .catch((e) => {
      const msg = e instanceof Error ? e.message : String(e);
      error(
        `Failed to load Node.js entry for remote "${name}" from "${entry}". ${msg}`,
      );
    });
}

export const node: NodePlatform = {
  isBrowser: () => false,
  loadScript: loadScriptNode,
  loadScriptNode,
  loadEntry: loadEntryNode,
};
