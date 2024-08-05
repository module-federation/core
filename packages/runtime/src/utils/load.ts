import { composeKeyWithSeparator } from '@module-federation/sdk';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';
import { globalLoading } from '../global';
import { Remote, RemoteEntryExports, RemoteInfo } from '../type';
import { FederationHost } from '../core';

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
    const loadEntryHookRes = origin.loaderHook.lifecycle.loadEntry.emit({
      origin,
      remoteInfo,
      remoteEntryExports,
    });
    globalLoading[uniqueKey] = loadEntryHookRes;
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
