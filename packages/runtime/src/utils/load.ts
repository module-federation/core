import { composeKeyWithSeparator, isBrowserEnv } from '@module-federation/sdk';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';
import { globalLoading } from '../global';
import { Remote, RemoteEntryExports, RemoteInfo } from '../type';
import { FederationHost } from '../core';
import { loadEntryNode } from '../plugins/node/loadEntry';
import { loadEntryDom } from '../plugins/dom/loadEntry';

function loadEntryNodeFallback({
  remoteInfo,
  createScriptHook,
}: {
  remoteInfo: RemoteInfo;
  createScriptHook: FederationHost['loaderHook']['lifecycle']['createScript'];
}) {
  return loadEntryNode({
    entry: remoteInfo.entry,
    entryGlobalName: remoteInfo.entryGlobalName,
    name: remoteInfo.name,
    createScriptHook: (url, attrs) => {
      const res = createScriptHook.emit({ url, attrs });

      if (!res) return;

      if ('url' in res) {
        return res;
      }

      return;
    },
  });
}

function loadEntryDomFallback({
  remoteInfo,
  remoteEntryExports,
  createScriptHook,
}: {
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports;
  createScriptHook: FederationHost['loaderHook']['lifecycle']['createScript'];
}) {
  return loadEntryDom({
    entry: remoteInfo.entry,
    entryGlobalName: remoteInfo.entryGlobalName,
    name: remoteInfo.name,
    type: remoteInfo.type,
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
}

export function getRemoteEntryUniqueKey(remoteInfo: RemoteInfo): string {
  const { entry, name } = remoteInfo;
  return composeKeyWithSeparator(name, entry);
}

export async function getRemoteEntry({
  origin,
  remoteEntryExports,
  remoteInfo,
}: {
  origin: FederationHost;
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports | undefined;
}): Promise<RemoteEntryExports | false | void> {
  const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  if (!globalLoading[uniqueKey]) {
    const loadEntryHook = origin.remoteHandler.hooks.lifecycle.loadEntry;
    if (loadEntryHook.listeners.size) {
      globalLoading[uniqueKey] = loadEntryHook
        .emit({
          createScriptHook: origin.loaderHook.lifecycle.createScript,
          remoteInfo,
          remoteEntryExports,
        })
        .then((res) => res || undefined);
    } else {
      const createScriptHook = origin.loaderHook.lifecycle.createScript;
      if (!isBrowserEnv()) {
        globalLoading[uniqueKey] = loadEntryNodeFallback({
          remoteInfo,
          createScriptHook,
        });
      } else {
        globalLoading[uniqueKey] = loadEntryDomFallback({
          remoteInfo,
          remoteEntryExports,
          createScriptHook,
        });
      }
    }
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
