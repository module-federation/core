import { composeKeyWithSeparator } from '@module-federation/sdk/core';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';
import { FederationKernel } from '../core';
import { globalLoading, getRemoteEntryExports } from '../global';
import {
  Remote,
  RemoteEntryExports,
  RemoteInfo,
  ResourceLoadContext,
} from '../type';
import { assert, error } from './logger';
import {
  RUNTIME_001,
  RUNTIME_008,
  runtimeDescMap,
} from '@module-federation/error-codes';

const remoteEntryLoadingOrigins = new WeakMap<
  Promise<RemoteEntryExports | void>,
  FederationKernel
>();

export function isEsmRemoteType(type: RemoteInfo['type']): boolean {
  return type === 'esm' || type === 'module';
}

export function handleRemoteEntryLoaded(
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

export function getRemoteEntryUniqueKey(remoteInfo: RemoteInfo): string {
  const { entry, name } = remoteInfo;
  return composeKeyWithSeparator(name, entry);
}

export async function getRemoteEntry(params: {
  origin: FederationKernel;
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
  const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);

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
        return origin.platform.loadEntry({
          remoteInfo,
          remoteEntryExports,
          loaderHook,
          getEntryUrl,
          resourceContext,
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
    // Clear rejected entries so a later call can retry. Keep the original
    // promise identity in the cache (do not replace with a cleanup thenable).
    // Identity check: an older rejection must not delete a newer in-flight request.
    loading.then(undefined, () => {
      if (globalLoading[uniqueKey] === loading) {
        delete globalLoading[uniqueKey];
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

export function getRemoteInfo(remote: Remote): RemoteInfo {
  return {
    ...remote,
    entry: 'entry' in remote ? remote.entry : '',
    type: remote.type || DEFAULT_REMOTE_TYPE,
    entryGlobalName: remote.entryGlobalName || remote.name,
    shareScope: remote.shareScope || DEFAULT_SCOPE,
  };
}
