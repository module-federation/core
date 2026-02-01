import {
  loadScript,
  loadScriptNode,
  composeKeyWithSeparator,
  isBrowserEnv,
} from '@module-federation/sdk';
import { Effect } from '@module-federation/micro-effect';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';
import { ModuleFederation } from '../core';
import { globalLoading, getRemoteEntryExports } from '../global';
import { Remote, RemoteEntryExports, RemoteInfo } from '../type';
import { assert } from './logger';
import {
  RUNTIME_001,
  RUNTIME_008,
  getShortErrorMsg,
  runtimeDescMap,
} from '@module-federation/error-codes';
import { ScriptLoadFailed } from '../effect/errors';

// Declare the ENV_TARGET constant that will be defined by DefinePlugin
declare const ENV_TARGET: 'web' | 'node';
const importCallback = '.then(callbacks[0]).catch(callbacks[1])';

// --- Effect programs for each loader function ---

const loadEsmEntryEffect = ({
  entry,
  remoteEntryExports,
}: {
  entry: string;
  remoteEntryExports: RemoteEntryExports | undefined;
}): Effect.Effect<RemoteEntryExports, ScriptLoadFailed> =>
  Effect.tryPromise({
    try: () =>
      new Promise<RemoteEntryExports>((resolve, reject) => {
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
          reject(e);
        }
      }),
    catch: () =>
      new ScriptLoadFailed({
        remoteName: 'esm-entry',
        resourceUrl: entry,
      }),
  });

const loadSystemJsEntryEffect = ({
  entry,
  remoteEntryExports,
}: {
  entry: string;
  remoteEntryExports: RemoteEntryExports | undefined;
}): Effect.Effect<RemoteEntryExports, ScriptLoadFailed> =>
  Effect.tryPromise({
    try: () =>
      new Promise<RemoteEntryExports>((resolve, reject) => {
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
          reject(e);
        }
      }),
    catch: () =>
      new ScriptLoadFailed({
        remoteName: 'system-entry',
        resourceUrl: entry,
      }),
  });

function handleRemoteEntryLoaded(
  name: string,
  globalName: string,
  entry: string,
): RemoteEntryExports {
  const { remoteEntryKey, entryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  assert(
    entryExports,
    getShortErrorMsg(RUNTIME_001, runtimeDescMap, {
      remoteName: name,
      remoteEntryUrl: entry,
      remoteEntryKey,
    }),
  );

  return entryExports;
}

const loadEntryScriptEffect = ({
  name,
  globalName,
  entry,
  loaderHook,
  getEntryUrl,
}: {
  name: string;
  globalName: string;
  entry: string;
  loaderHook: ModuleFederation['loaderHook'];
  getEntryUrl?: (url: string) => string;
}): Effect.Effect<RemoteEntryExports, ScriptLoadFailed> =>
  Effect.gen(function* () {
    const { entryExports: remoteEntryExports } = getRemoteEntryExports(
      name,
      globalName,
    );

    if (remoteEntryExports) {
      return remoteEntryExports;
    }

    const url = getEntryUrl ? getEntryUrl(entry) : entry;
    return yield* Effect.tryPromise({
      try: () =>
        loadScript(url, {
          attrs: {},
          createScriptHook: (url: string, attrs?: Record<string, any>) => {
            const res = loaderHook.lifecycle.createScript.emit({
              url,
              attrs: attrs || {},
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
        }).then(() => handleRemoteEntryLoaded(name, globalName, entry)),
      catch: () =>
        new ScriptLoadFailed({
          remoteName: name,
          resourceUrl: entry,
        }),
    });
  });

const loadEntryDomEffect = ({
  remoteInfo,
  remoteEntryExports,
  loaderHook,
  getEntryUrl,
}: {
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports;
  loaderHook: ModuleFederation['loaderHook'];
  getEntryUrl?: (url: string) => string;
}): Effect.Effect<RemoteEntryExports, ScriptLoadFailed> => {
  const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
  switch (type) {
    case 'esm':
    case 'module':
      return loadEsmEntryEffect({ entry, remoteEntryExports });
    case 'system':
      return loadSystemJsEntryEffect({ entry, remoteEntryExports });
    default:
      return loadEntryScriptEffect({
        entry,
        globalName,
        name,
        loaderHook,
        getEntryUrl,
      });
  }
};

const loadEntryNodeEffect = ({
  remoteInfo,
  loaderHook,
}: {
  remoteInfo: RemoteInfo;
  loaderHook: ModuleFederation['loaderHook'];
}): Effect.Effect<RemoteEntryExports, ScriptLoadFailed> => {
  const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (remoteEntryExports) {
    return Effect.succeed(remoteEntryExports);
  }

  return Effect.tryPromise({
    try: () =>
      loadScriptNode(entry, {
        attrs: { name, globalName, type },
        loaderHook: {
          createScriptHook: (url: string, attrs: Record<string, any> = {}) => {
            const res = loaderHook.lifecycle.createScript.emit({ url, attrs });

            if (!res) return;

            if ('url' in res) {
              return res;
            }

            return;
          },
        },
      }).then(() => handleRemoteEntryLoaded(name, globalName, entry)),
    catch: () =>
      new ScriptLoadFailed({
        remoteName: name,
        resourceUrl: entry,
      }),
  });
};

// --- Effect program for getRemoteEntry ---

const getRemoteEntryEffect = (params: {
  origin: ModuleFederation;
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports | undefined;
  loaderHook: ModuleFederation['loaderHook'];
  loadEntryHook: ModuleFederation['remoteHandler']['hooks']['lifecycle']['loadEntry'];
  getEntryUrl?: (url: string) => string;
}): Effect.Effect<RemoteEntryExports | void, ScriptLoadFailed> =>
  Effect.gen(function* () {
    const {
      origin,
      remoteInfo,
      remoteEntryExports,
      loaderHook,
      loadEntryHook,
      getEntryUrl,
    } = params;

    // Step 1: Check loadEntry hook — let plugins override
    const hookResult = yield* Effect.promise(async () => {
      const res = await loadEntryHook.emit({
        loaderHook,
        remoteInfo,
        remoteEntryExports,
      });
      // AsyncHook<..., Promise<T>> returns Promise<Promise<T>>, auto-flatten
      return res as unknown as RemoteEntryExports | undefined;
    });

    if (hookResult) {
      return hookResult;
    }

    // Step 2: Dispatch to environment-specific loader
    const isWebEnvironment =
      typeof ENV_TARGET !== 'undefined' ? ENV_TARGET === 'web' : isBrowserEnv();

    if (isWebEnvironment) {
      return yield* loadEntryDomEffect({
        remoteInfo,
        remoteEntryExports,
        loaderHook,
        getEntryUrl,
      });
    } else {
      return yield* loadEntryNodeEffect({ remoteInfo, loaderHook });
    }
  });

// --- Public API (signatures unchanged) ---

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

    // Run the Effect program, bridging back to Promise for the globalLoading cache
    const effectProgram = getRemoteEntryEffect({
      origin,
      remoteInfo,
      remoteEntryExports,
      loaderHook,
      loadEntryHook,
      getEntryUrl,
    }).pipe(
      // Error recovery via loadEntryError hook
      Effect.catchTag('ScriptLoadFailed', (err) =>
        Effect.tryPromise({
          try: async () => {
            const isScriptLoadError = err.resourceUrl !== undefined;

            if (isScriptLoadError && !_inErrorHandling) {
              const wrappedGetRemoteEntry = (
                innerParams: Parameters<typeof getRemoteEntry>[0],
              ) => {
                return getRemoteEntry({
                  ...innerParams,
                  _inErrorHandling: true,
                });
              };

              const recoveredExports =
                await origin.loaderHook.lifecycle.loadEntryError.emit({
                  getRemoteEntry: wrappedGetRemoteEntry,
                  origin,
                  remoteInfo: remoteInfo,
                  remoteEntryExports,
                  globalLoading,
                  uniqueKey,
                });

              if (recoveredExports) {
                return recoveredExports as
                  | RemoteEntryExports
                  | void
                  | undefined;
              }
            }
            throw new Error(
              getShortErrorMsg(RUNTIME_008, runtimeDescMap, {
                remoteName: err.remoteName,
                resourceUrl: err.resourceUrl,
              }),
            );
          },
          catch: (e) => e as Error,
        }),
      ),
      Effect.catch((err) => Effect.fail(err as Error)),
    );

    globalLoading[uniqueKey] = Effect.runPromise(effectProgram).catch((err) => {
      // Re-throw to maintain original error propagation behavior
      throw err;
    }) as Promise<void | RemoteEntryExports>;
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
