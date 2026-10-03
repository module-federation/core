import {
  loadScript,
  loadScriptNode,
  isBrowserEnvValue,
} from '@module-federation/sdk';
import { ModuleFederation } from '../core';
import {
  globalLoading,
  globalLoadingMeta,
  getRemoteEntryExports,
  type RemoteEntryCacheDescriptorV1,
} from '../global';
import { readRuntimeImage } from '../runtimeImage';
import { RemoteEntryExports, RemoteInfo, ResourceLoadContext } from '../type';
import { assert, error } from './logger';
import {
  RUNTIME_001,
  RUNTIME_008,
  runtimeDescMap,
} from '@module-federation/error-codes';
import { getRemoteEntryUniqueKey, isEsmRemoteType } from './remoteInfo';

export {
  getRemoteEntryUniqueKey,
  getRemoteInfo,
  isEsmRemoteType,
} from './remoteInfo';

const importCallback = '.then(callbacks[0]).catch(callbacks[1])';
const remoteEntryLoadingOrigins = new WeakMap<
  Promise<RemoteEntryExports | void>,
  ModuleFederation
>();

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
  resourceContext,
  ignoreGlobalExports,
}: {
  name: string;
  globalName: string;
  entry: string;
  remoteInfo: RemoteInfo;
  loaderHook: ModuleFederation['loaderHook'];
  getEntryUrl?: (url: string) => string;
  resourceContext?: ResourceLoadContext;
  ignoreGlobalExports?: boolean;
}): Promise<RemoteEntryExports> {
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (remoteEntryExports && !ignoreGlobalExports) {
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
async function loadEntryDom({
  remoteInfo,
  remoteEntryExports,
  loaderHook,
  getEntryUrl,
  resourceContext,
  ignoreGlobalExports,
}: {
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports;
  loaderHook: ModuleFederation['loaderHook'];
  getEntryUrl?: (url: string) => string;
  resourceContext?: ResourceLoadContext;
  ignoreGlobalExports?: boolean;
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
    ignoreGlobalExports,
  });
}

function isRemoteEntryExports(value: unknown): value is RemoteEntryExports {
  return (
    typeof value === 'object' &&
    value !== null &&
    'get' in value &&
    typeof value.get === 'function' &&
    'init' in value &&
    typeof value.init === 'function'
  );
}

async function loadEntryNode({
  remoteInfo,
  loaderHook,
  resourceContext,
  ignoreGlobalExports,
  getEntryUrl,
}: {
  remoteInfo: RemoteInfo;
  loaderHook: ModuleFederation['loaderHook'];
  resourceContext?: ResourceLoadContext;
  ignoreGlobalExports?: boolean;
  getEntryUrl?: (url: string) => string;
}) {
  const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (remoteEntryExports && !ignoreGlobalExports) {
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
    .then((entryExports: unknown) => {
      // The SDK resolves the container evaluated by this attempt. Validate the
      // callback boundary before using it instead of rereading mutable globals.
      if (isRemoteEntryExports(entryExports)) {
        return entryExports;
      }
      if (ignoreGlobalExports) {
        throw new Error(
          'Node.js entry evaluator did not return callable get and init exports',
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

function getRemoteEntryCacheDescriptor(
  origin: ModuleFederation,
  remoteInfo: RemoteInfo,
  getEntryUrl?: (url: string) => string,
): RemoteEntryCacheDescriptorV1 | undefined {
  const image = readRuntimeImage(origin);
  if (!image) {
    return undefined;
  }
  return {
    contract: 1,
    compatibilityId: image.compatibilityId,
    target: image.target,
    entryLoadingIdentity: image.entryLoadingIdentity,
    remoteType: remoteInfo.type,
    entryGlobalName: remoteInfo.entryGlobalName,
    remoteEntryKey: getRemoteEntryUniqueKey(remoteInfo),
    entryUrlTransform: getEntryUrl,
    evaluatorOrigin:
      origin.remoteHandler.hooks.lifecycle.loadEntry.listeners.size ||
      origin.loaderHook.lifecycle.createScript.listeners.size ||
      origin.loaderHook.lifecycle.loadEntryError.listeners.size ||
      origin.loaderHook.lifecycle.fetch.listeners.size
        ? origin
        : undefined,
    entryEvaluators: {
      loadEntry: [...origin.remoteHandler.hooks.lifecycle.loadEntry.listeners],
      createScript: [...origin.loaderHook.lifecycle.createScript.listeners],
      loadEntryError: [...origin.loaderHook.lifecycle.loadEntryError.listeners],
      fetch: [...origin.loaderHook.lifecycle.fetch.listeners],
    },
  };
}

const cacheIdentityFields = [
  'compatibilityId',
  'target',
  'entryLoadingIdentity',
  'remoteType',
  'entryGlobalName',
] as const;

function assertRemoteEntryCacheCompatible(
  uniqueKey: string,
  promise: Promise<RemoteEntryExports | void>,
  next: RemoteEntryCacheDescriptorV1,
): void {
  const metadata = globalLoadingMeta[uniqueKey];
  if (!metadata) {
    return;
  }
  if (metadata.promise !== promise) {
    delete globalLoadingMeta[uniqueKey];
    return;
  }
  for (const field of cacheIdentityFields) {
    if (metadata.descriptor[field] !== next[field]) {
      error(
        `Refusing to reuse remote entry ${uniqueKey}. ${field} changed from ${metadata.descriptor[field]} to ${next[field]}.`,
      );
    }
  }
}

// Callback identity scopes cached evaluations; it does not claim semantic incompatibility.
function sameEntryEvaluator(
  current: RemoteEntryCacheDescriptorV1,
  next: RemoteEntryCacheDescriptorV1,
): boolean {
  if (
    current.evaluatorOrigin !== next.evaluatorOrigin ||
    current.entryUrlTransform !== next.entryUrlTransform
  )
    return false;
  return (
    ['loadEntry', 'createScript', 'loadEntryError', 'fetch'] as const
  ).every((hook) => {
    const currentCallbacks = current.entryEvaluators?.[hook] ?? [];
    const nextCallbacks = next.entryEvaluators?.[hook] ?? [];
    return (
      currentCallbacks.length === nextCallbacks.length &&
      currentCallbacks.every(
        (callback, index) => callback === nextCallbacks[index],
      )
    );
  });
}

function selectRemoteEntryCacheKey(
  uniqueKey: string,
  descriptor: RemoteEntryCacheDescriptorV1 | undefined,
): string {
  if (!descriptor) return uniqueKey;
  const keys = new Set([
    uniqueKey,
    ...Object.entries(globalLoadingMeta)
      .filter(
        ([, metadata]) => metadata?.descriptor.remoteEntryKey === uniqueKey,
      )
      .map(([key]) => key),
  ]);
  let compatibleKey: string | undefined;
  for (const key of keys) {
    const loading = globalLoading[key];
    const remoteEntryKey = globalLoadingMeta[key]?.descriptor.remoteEntryKey;
    if (
      !loading ||
      (remoteEntryKey !== undefined && remoteEntryKey !== uniqueKey)
    )
      continue;
    assertRemoteEntryCacheCompatible(key, loading, descriptor);
    const current = globalLoadingMeta[key]?.descriptor;
    // An unannotated legacy cache entry retains its existing reuse policy.
    if (!current || sameEntryEvaluator(current, descriptor)) {
      compatibleKey ??= key;
    }
  }
  if (compatibleKey) return compatibleKey;
  if (!globalLoading[uniqueKey]) return uniqueKey;
  let scope = 1;
  while (globalLoading[`${uniqueKey}:evaluator:${scope}`]) scope += 1;
  return `${uniqueKey}:evaluator:${scope}`;
}

export function clearRemoteEntryCache(remoteInfo: RemoteInfo): void {
  const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
  for (const key of new Set([uniqueKey, ...Object.keys(globalLoadingMeta)])) {
    const remoteEntryKey = globalLoadingMeta[key]?.descriptor.remoteEntryKey;
    if (
      remoteEntryKey === uniqueKey ||
      (key === uniqueKey && remoteEntryKey === undefined)
    ) {
      delete globalLoading[key];
      delete globalLoadingMeta[key];
    }
  }
}

export async function getRemoteEntry(params: {
  origin: ModuleFederation;
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports | undefined;
  getEntryUrl?: (url: string) => string;
  _inErrorHandling?: boolean; // Add flag to prevent recursion
  resourceContext?: ResourceLoadContext;
}): Promise<RemoteEntryExports | false | void> {
  const {
    origin,
    remoteEntryExports,
    remoteInfo,
    getEntryUrl,
    resourceContext,
    _inErrorHandling = false,
  } = params;
  if (remoteEntryExports) {
    await origin.loaderHook.lifecycle.afterLoadEntry.emit({
      origin,
      remoteInfo,
      remoteEntryExports,
      resourceContext,
      cached: true,
    });
    return remoteEntryExports;
  }

  const cacheDescriptor = getRemoteEntryCacheDescriptor(
    origin,
    remoteInfo,
    getEntryUrl,
  );
  const baseUniqueKey = getRemoteEntryUniqueKey(remoteInfo);
  const uniqueKey = selectRemoteEntryCacheKey(baseUniqueKey, cacheDescriptor);
  // Image-backed cache misses must evaluate the selected entry instead of
  // accepting exports left in a process-wide global by another evaluator.
  const ignoreGlobalExports = cacheDescriptor !== undefined;

  if (cacheDescriptor && globalLoading[uniqueKey]) {
    assertRemoteEntryCacheCompatible(
      uniqueKey,
      globalLoading[uniqueKey],
      cacheDescriptor,
    );
  }

  if (!globalLoading[uniqueKey]) {
    const loadEntryHook = origin.remoteHandler.hooks.lifecycle.loadEntry;
    const loaderHook = origin.loaderHook;
    const loading = loadEntryHook
      .emit({
        origin,
        loaderHook,
        remoteInfo,
        remoteEntryExports,
        resourceContext,
      })
      .then((res) => {
        if (res) {
          return res;
        }
        const isWebEnvironment = isBrowserEnvValue;
        if (
          isWebEnvironment &&
          cacheDescriptor &&
          !isEsmRemoteType(remoteInfo.type) &&
          remoteInfo.type !== 'system'
        ) {
          for (const [key, metadata] of Object.entries(globalLoadingMeta)) {
            if (
              metadata &&
              metadata.promise === globalLoading[key] &&
              metadata.descriptor !== cacheDescriptor &&
              metadata.descriptor.browserScript &&
              metadata.descriptor.entryGlobalName ===
                cacheDescriptor.entryGlobalName &&
              !sameEntryEvaluator(metadata.descriptor, cacheDescriptor)
            ) {
              error(
                `Refusing to evaluate remote entry ${baseUniqueKey}. Distinct browser script evaluators share physical global ${cacheDescriptor.entryGlobalName}.`,
              );
            }
          }
          cacheDescriptor.browserScript = true;
        }

        return isWebEnvironment
          ? loadEntryDom({
              remoteInfo,
              remoteEntryExports,
              loaderHook,
              getEntryUrl,
              resourceContext,
              ignoreGlobalExports,
            })
          : loadEntryNode({
              remoteInfo,
              loaderHook,
              resourceContext,
              ignoreGlobalExports,
              getEntryUrl,
            });
      })
      .then(async (res) => {
        await origin.loaderHook.lifecycle.afterLoadEntry.emit({
          origin,
          remoteInfo,
          remoteEntryExports: res,
          resourceContext,
        });
        return res;
      })
      .catch(async (loadError) => {
        const isScriptExecutionError =
          loadError instanceof Error &&
          loadError.message.includes('ScriptExecutionError');
        const isScriptLoadError =
          loadError instanceof Error &&
          loadError.message.includes(RUNTIME_008) &&
          !isScriptExecutionError;

        if (isScriptLoadError && !_inErrorHandling) {
          const wrappedGetRemoteEntry = (
            params: Parameters<typeof getRemoteEntry>[0],
          ) => {
            return getRemoteEntry({ ...params, _inErrorHandling: true });
          };

          const recoveredRemoteEntryExports =
            await origin.loaderHook.lifecycle.loadEntryError.emit({
              getRemoteEntry: wrappedGetRemoteEntry,
              origin,
              remoteInfo,
              remoteEntryExports,
              globalLoading,
              uniqueKey,
            });

          if (recoveredRemoteEntryExports) {
            await origin.loaderHook.lifecycle.afterLoadEntry.emit({
              origin,
              remoteInfo,
              remoteEntryExports: recoveredRemoteEntryExports,
              resourceContext,
              error: loadError,
              recovered: true,
            });
            return recoveredRemoteEntryExports;
          }
        }

        await origin.loaderHook.lifecycle.afterLoadEntry.emit({
          origin,
          remoteInfo,
          resourceContext,
          error: loadError,
        });
        throw loadError;
      });

    globalLoading[uniqueKey] = loading;
    if (cacheDescriptor) {
      globalLoadingMeta[uniqueKey] = {
        promise: loading,
        descriptor: cacheDescriptor,
      };
    }
    // Clear rejected entries so a later call can retry. Keep the original
    // promise identity in the cache (do not replace with a cleanup thenable).
    // Identity check: an older rejection must not delete a newer in-flight request.
    loading.then(undefined, () => {
      if (globalLoading[uniqueKey] === loading) {
        delete globalLoading[uniqueKey];
        if (globalLoadingMeta[uniqueKey]?.promise === loading) {
          delete globalLoadingMeta[uniqueKey];
        }
      }
    });
    remoteEntryLoadingOrigins.set(loading, origin);
  }

  const remoteEntryLoading = globalLoading[uniqueKey];
  if (remoteEntryLoadingOrigins.get(remoteEntryLoading) !== origin) {
    try {
      const result = await remoteEntryLoading;
      await origin.loaderHook.lifecycle.afterLoadEntry.emit({
        origin,
        remoteInfo,
        remoteEntryExports: result,
        resourceContext,
      });
      return result;
    } catch (loadError) {
      await origin.loaderHook.lifecycle.afterLoadEntry.emit({
        origin,
        remoteInfo,
        resourceContext,
        error: loadError,
      });
      throw loadError;
    }
  }

  return remoteEntryLoading;
}
