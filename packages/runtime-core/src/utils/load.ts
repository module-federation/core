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
import { assert, runtimeError } from './logger';
import { singleFlight } from './tool';
import { RUNTIME_001, RUNTIME_008 } from '@module-federation/error-codes';
import { ScriptLoadFailed } from '../effect/errors';
// Declare the ENV_TARGET constant that will be defined by DefinePlugin
declare const ENV_TARGET: 'web' | 'node';
const importCallback = '.then(callbacks[0]).catch(callbacks[1])';
// --- createScriptHook adapters ---
function makeDomCreateScriptAdapter(
  loaderHook: ModuleFederation['loaderHook'],
) {
  return (url: string, attrs: Record<string, any> = {}) => {
    const res = loaderHook.lifecycle.createScript.emit({ url, attrs });
    if (!res) return;
    if (res instanceof HTMLScriptElement) return res;
    return 'script' in res || 'timeout' in res ? res : undefined;
  };
}
function makeNodeCreateScriptAdapter(
  loaderHook: ModuleFederation['loaderHook'],
) {
  return (url: string, attrs: Record<string, any> = {}) => {
    const res = loaderHook.lifecycle.createScript.emit({ url, attrs });
    if (!res) return;
    return 'url' in res ? res : undefined;
  };
}
// --- Effect programs for each loader function ---
const createDynamicImportEffect =
  (
    doImport: (
      entry: string,
      resolve: (value: RemoteEntryExports) => void,
      reject: (reason?: any) => void,
    ) => void,
    errorLabel: string,
  ) =>
  ({
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
              doImport(entry, resolve, reject);
            } else {
              resolve(remoteEntryExports);
            }
          } catch (e) {
            reject(e);
          }
        }),
      catch: () =>
        new ScriptLoadFailed({
          remoteName: errorLabel,
          resourceUrl: entry,
        }),
    });
const loadEsmEntryEffect = createDynamicImportEffect(
  (entry, resolve, reject) => {
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
  },
  'esm-entry',
);
const loadSystemJsEntryEffect = createDynamicImportEffect(
  (entry, resolve, reject) => {
    //@ts-ignore
    if (typeof __system_context__ === 'undefined') {
      //@ts-ignore
      System.import(entry).then(resolve).catch(reject);
    } else {
      new Function('callbacks', `System.import("${entry}")${importCallback}`)([
        resolve,
        reject,
      ]);
    }
  },
  'system-entry',
);
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
    runtimeError(RUNTIME_001, {
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
          createScriptHook: makeDomCreateScriptAdapter(loaderHook),
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
          createScriptHook: makeNodeCreateScriptAdapter(loaderHook),
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
    const hookResult = yield* Effect.promise(async () => {
      const res = await params.loadEntryHook.emit({
        loaderHook: params.loaderHook,
        remoteInfo: params.remoteInfo,
        remoteEntryExports: params.remoteEntryExports,
      });
      return res as unknown as RemoteEntryExports | undefined;
    });
    if (hookResult) return hookResult;
    const isWeb =
      typeof ENV_TARGET !== 'undefined' ? ENV_TARGET === 'web' : isBrowserEnv();
    if (isWeb) {
      return yield* loadEntryDomEffect({
        remoteInfo: params.remoteInfo,
        remoteEntryExports: params.remoteEntryExports,
        loaderHook: params.loaderHook,
        getEntryUrl: params.getEntryUrl,
      });
    }
    return yield* loadEntryNodeEffect({
      remoteInfo: params.remoteInfo,
      loaderHook: params.loaderHook,
    });
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
  return singleFlight(globalLoading, uniqueKey, () => {
    const loadEntryHook = origin.remoteHandler.hooks.lifecycle.loadEntry;
    const loaderHook = origin.loaderHook;
    const markLoadEntryError = (error: Error) => {
      (error as Error & { __mfLoadEntryError?: true }).__mfLoadEntryError =
        true;
      return error;
    };
    const recoverFromLoadEntryError = (
      resourceUrl: string | undefined,
      remoteName: string,
    ) =>
      Effect.tryPromise({
        try: async () => {
          if (!_inErrorHandling) {
            const recovered =
              await origin.loaderHook.lifecycle.loadEntryError.emit({
                getRemoteEntry: (p) =>
                  getRemoteEntry({ ...p, _inErrorHandling: true }),
                origin,
                remoteInfo,
                remoteEntryExports,
                globalLoading,
                uniqueKey,
              });
            if (recovered)
              return recovered as RemoteEntryExports | void | undefined;
          }
          throw markLoadEntryError(
            new Error(
              runtimeError(RUNTIME_008, {
                remoteName,
                resourceUrl,
              }),
            ),
          );
        },
        catch: (e) => e as Error,
      });
    // Run the Effect program, bridging back to Promise for the globalLoading cache
    const effectProgram = getRemoteEntryEffect({
      origin,
      remoteInfo,
      remoteEntryExports,
      loaderHook,
      loadEntryHook,
      getEntryUrl,
    }).pipe(
      Effect.catchTag('ScriptLoadFailed', (err) =>
        recoverFromLoadEntryError(err.resourceUrl, err.remoteName),
      ),
      Effect.catch((err) => {
        if (
          !(err as any)?.__mfLoadEntryError &&
          err instanceof Error &&
          err.message.includes(RUNTIME_008)
        ) {
          return recoverFromLoadEntryError(
            getEntryUrl ? getEntryUrl(remoteInfo.entry) : remoteInfo.entry,
            remoteInfo.name,
          );
        }
        return Effect.fail(err as Error);
      }),
    );
    return Effect.runPromise(effectProgram).catch((err) => {
      throw err;
    }) as Promise<void | RemoteEntryExports>;
  });
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
