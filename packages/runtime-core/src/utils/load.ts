import {
  loadScript,
  loadScriptNode,
  composeKeyWithSeparator,
  isBrowserEnvValue,
} from '@module-federation/sdk';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';
import { ModuleFederation } from '../core';
import { globalLoading, getRemoteEntryExports } from '../global';
import { Remote, RemoteEntryExports, RemoteInfo } from '../type';
import { assert, error } from './logger';
import {
  RUNTIME_001,
  RUNTIME_008,
  runtimeDescMap,
} from '@module-federation/error-codes';

// Declare the ENV_TARGET constant that will be defined by DefinePlugin
declare const ENV_TARGET: 'web' | 'node';
const importCallback = '.then(callbacks[0]).catch(callbacks[1])';

async function loadEsmEntry({
  entry,
  remoteEntryExports,
}: {
  entry: string;
  remoteEntryExports: RemoteEntryExports | undefined;
}): Promise<RemoteEntryExports> {
  return new Promise<RemoteEntryExports>((resolve, reject) => {
    try {
      if (!remoteEntryExports) {
        if (typeof FEDERATION_ALLOW_NEW_FUNCTION !== 'undefined') {
          new Function('callbacks', `import("${entry}")${importCallback}`)([
            resolve,
            reject,
          ]);
        } else {
          import(/* webpackIgnore: true */ /* @vite-ignore */ entry)
            .then(resolve)
            .catch(reject);
        }
      } else {
        resolve(remoteEntryExports);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      error(`Failed to load ESM entry from "${entry}". ${msg}`);
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

function handleRemoteEntryLoaded(
  name: string,
  globalName: string,
  entry: string,
): RemoteEntryExports {
  const { remoteEntryKey, entryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (!entryExports) {
    error(RUNTIME_001, runtimeDescMap, {
      remoteName: name,
      remoteEntryUrl: entry,
      remoteEntryKey,
    });
  }

  return entryExports;
}

async function loadEntryScript({
  name,
  globalName,
  entry,
  remoteInfo,
  loaderHook,
  getEntryUrl,
}: {
  name: string;
  globalName: string;
  entry: string;
  remoteInfo: RemoteInfo;
  loaderHook: ModuleFederation['loaderHook'];
  getEntryUrl?: (url: string) => string;
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
async function loadEntryDom({
  remoteInfo,
  remoteEntryExports,
  loaderHook,
  getEntryUrl,
}: {
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports;
  loaderHook: ModuleFederation['loaderHook'];
  getEntryUrl?: (url: string) => string;
}) {
  const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
  switch (type) {
    case 'esm':
    case 'module':
      return loadEsmEntry({ entry, remoteEntryExports });
    case 'system':
      return loadSystemJsEntry({ entry, remoteEntryExports });
    default:
      return loadEntryScript({
        entry,
        globalName,
        name,
        remoteInfo,
        loaderHook,
        getEntryUrl,
      });
  }
}

async function loadEntryNode({
  remoteInfo,
  loaderHook,
}: {
  remoteInfo: RemoteInfo;
  loaderHook: ModuleFederation['loaderHook'];
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

export function getRemoteEntryUniqueKey(remoteInfo: RemoteInfo): string {
  const { entry, name } = remoteInfo;
  return composeKeyWithSeparator(name, entry);
}

export async function getRemoteEntry(params: {
  origin: ModuleFederation;
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports | undefined;
  getEntryUrl?: (url: string) => string;
  _inErrorHandling?: boolean; // Add flag to prevent recursion
}): Promise<RemoteEntryExports | false | void> {
  const {
    origin,
    remoteEntryExports,
    remoteInfo,
    getEntryUrl,
    _inErrorHandling = false,
  } = params;
  const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  if (!globalLoading[uniqueKey]) {
    const loadEntryHook = origin.remoteHandler.hooks.lifecycle.loadEntry;
    const loaderHook = origin.loaderHook;

    globalLoading[uniqueKey] = loadEntryHook
      .emit({
        loaderHook,
        remoteInfo,
        remoteEntryExports,
      })
      .then((res) => {
        if (res) {
          return res;
        }
        // Use ENV_TARGET if defined, otherwise fallback to isBrowserEnvValue
        const isWebEnvironment =
          typeof ENV_TARGET !== 'undefined'
            ? ENV_TARGET === 'web'
            : isBrowserEnvValue;

        return isWebEnvironment
          ? loadEntryDom({
              remoteInfo,
              remoteEntryExports,
              loaderHook,
              getEntryUrl,
            })
          : loadEntryNode({ remoteInfo, loaderHook });
      })
      .catch(async (err) => {
        const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
        // ScriptExecutionError means the script downloaded fine but its IIFE
        // threw at runtime — retrying would reproduce the same error, so exclude it.
        const isScriptExecutionError =
          err instanceof Error && err.message.includes('ScriptExecutionError');
        const isScriptLoadError =
          err instanceof Error &&
          err.message.includes(RUNTIME_008) &&
          !isScriptExecutionError;

        if (isScriptLoadError && !_inErrorHandling) {
          const wrappedGetRemoteEntry = (
            params: Parameters<typeof getRemoteEntry>[0],
          ) => {
            return getRemoteEntry({ ...params, _inErrorHandling: true });
          };

          const RemoteEntryExports =
            await origin.loaderHook.lifecycle.loadEntryError.emit({
              getRemoteEntry: wrappedGetRemoteEntry,
              origin,
              remoteInfo: remoteInfo,
              remoteEntryExports,
              globalLoading,
              uniqueKey,
            });

          if (RemoteEntryExports) {
            return RemoteEntryExports;
          }
        }
        throw err;
      });
  }

  return globalLoading[uniqueKey];
}

export function getRemoteInfo(remote: Remote): RemoteInfo {
  return {
    ...remote,
    entry: 'entry' in remote ? remote.entry : '',
    type: remote.type || DEFAULT_REMOTE_TYPE,
    entryGlobalName: remote.entryGlobalName || remote.name,
    shareScope: remote.shareScope || DEFAULT_SCOPE,
  };
}
