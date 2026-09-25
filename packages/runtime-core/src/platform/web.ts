import { loadScript } from '@module-federation/sdk/core';
import { RUNTIME_008, runtimeDescMap } from '@module-federation/error-codes';
import type { ModuleFederation } from '../index';
import { getRemoteEntryExports } from '../global';
import type {
  Platform,
  RemoteEntryExports,
  RemoteInfo,
  ResourceLoadContext,
} from '../type';
import { error } from '../utils/logger';
import { handleRemoteEntryLoaded, isEsmRemoteType } from '../utils/load';

const importCallback = '.then(callbacks[0]).catch(callbacks[1])';

const esmRemoteEntryLoadErrorMessages = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'error loading dynamically imported module',
];

function isEsmRemoteEntryLoadError(err: unknown): boolean {
  if (!(err instanceof TypeError)) {
    return false;
  }

  return esmRemoteEntryLoadErrorMessages.some((loadErrorMessage) =>
    err.message.includes(loadErrorMessage),
  );
}

async function loadEsmEntry({
  entry,
  remoteEntryExports,
  name,
  getEntryUrl,
}: {
  entry: string;
  remoteEntryExports: RemoteEntryExports | undefined;
  name: string;
  getEntryUrl?: (url: string) => string;
}): Promise<RemoteEntryExports> {
  return new Promise<RemoteEntryExports>((resolve, reject) => {
    const rejectEntry = (loadError: unknown) => {
      if (isEsmRemoteEntryLoadError(loadError)) {
        const originalMsg =
          loadError instanceof Error ? loadError.message : String(loadError);
        try {
          error(
            RUNTIME_008,
            runtimeDescMap,
            {
              remoteName: name,
              resourceUrl: url,
            },
            originalMsg,
          );
        } catch (runtimeError) {
          reject(runtimeError);
          return;
        }
      }

      reject(loadError);
    };

    const url = getEntryUrl ? getEntryUrl(entry) : entry;
    try {
      if (!remoteEntryExports) {
        if (typeof FEDERATION_ALLOW_NEW_FUNCTION !== 'undefined') {
          new Function('callbacks', `import("${url}")${importCallback}`)([
            resolve,
            rejectEntry,
          ]);
        } else {
          import(/* webpackIgnore: true */ /* @vite-ignore */ url)
            .then(resolve)
            .catch(rejectEntry);
        }
      } else {
        resolve(remoteEntryExports);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      error(`Failed to load ESM entry from "${url}". ${msg}`);
    }
  });
}

async function loadSystemJsEntry({
  entry,
  remoteEntryExports,
}: {
  entry: string;
  remoteEntryExports: RemoteEntryExports | undefined;
}): Promise<RemoteEntryExports> {
  return new Promise<RemoteEntryExports>((resolve, reject) => {
    try {
      if (!remoteEntryExports) {
        //@ts-ignore
        if (typeof __system_context__ === 'undefined') {
          //@ts-ignore
          System.import(entry).then(resolve).catch(reject);
        } else {
          new Function(
            'callbacks',
            `System.import("${entry}")${importCallback}`,
          )([resolve, reject]);
        }
      } else {
        resolve(remoteEntryExports);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      error(`Failed to load SystemJS entry from "${entry}". ${msg}`);
    }
  });
}

async function loadEntryScript({
  name,
  globalName,
  entry,
  remoteInfo,
  loaderHook,
  getEntryUrl,
  resourceContext,
}: {
  name: string;
  globalName: string;
  entry: string;
  remoteInfo: RemoteInfo;
  loaderHook: ModuleFederation['loaderHook'];
  getEntryUrl?: (url: string) => string;
  resourceContext?: ResourceLoadContext;
}): Promise<RemoteEntryExports> {
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  // if getEntryUrl is passed, use the getEntryUrl to get the entry url
  const url = getEntryUrl ? getEntryUrl(entry) : entry;
  return loadScript(url, {
    attrs: {},
    createScriptHook: (url, attrs) => {
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

      if (res instanceof HTMLScriptElement) {
        return res;
      }

      if ('script' in res || 'timeout' in res) {
        return res;
      }

      return;
    },
  }).then(
    () => {
      // loadScript resolved: script was fetched, executed without throwing, and
      // did not trigger a ScriptExecutionError listener. Now verify the global was registered.
      return handleRemoteEntryLoaded(name, globalName, entry);
    },
    (loadError: unknown) => {
      // loadScript rejected — one of three causes, all with descriptive messages:
      //   ScriptNetworkError  — URL unreachable, 404, CORS, etc.
      //   ScriptExecutionError — script fetched OK but IIFE threw during execution
      //   timeout             — script took too long to load
      // Errors thrown inside handleRemoteEntryLoaded above are NOT caught here.
      const originalMsg =
        loadError instanceof Error ? loadError.message : String(loadError);
      error(
        RUNTIME_008,
        runtimeDescMap,
        {
          remoteName: name,
          resourceUrl: url,
        },
        originalMsg,
      );
    },
  );
}
export async function loadEntryDom({
  remoteInfo,
  remoteEntryExports,
  loaderHook,
  getEntryUrl,
  resourceContext,
}: {
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports;
  loaderHook: ModuleFederation['loaderHook'];
  getEntryUrl?: (url: string) => string;
  resourceContext?: ResourceLoadContext;
}) {
  const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
  if (isEsmRemoteType(type)) {
    return loadEsmEntry({ entry, remoteEntryExports, name, getEntryUrl });
  }

  if (type === 'system') {
    return loadSystemJsEntry({ entry, remoteEntryExports });
  }

  return loadEntryScript({
    entry,
    globalName,
    name,
    remoteInfo,
    loaderHook,
    getEntryUrl,
    resourceContext,
  });
}

export const web: Platform = {
  target: 'web',
  isBrowser: () => true,
  loadScript,
  loadEntry: loadEntryDom,
};
