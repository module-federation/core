import { composeKeyWithSeparator } from '@module-federation/sdk';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';
import { globalLoading } from '../global';
import { Remote, RemoteEntryExports, RemoteInfo } from '../type';

export function getRemoteEntryUniqueKey(remoteInfo: RemoteInfo): string {
  const { entry, name } = remoteInfo;
  return composeKeyWithSeparator(name, entry);
}

export async function getRemoteEntry({
  remoteEntryExports,
  remoteInfo,
}: {
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports | undefined;
}): Promise<RemoteEntryExports | void> {
  const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  if (!globalLoading[uniqueKey]) {
    // @ts-ignore
    const loaderHooks = __webpack_require__.federation.instance.loaderHook;
    const hook = () => {
      return loaderHooks.lifecycle.loadEntry.emit({
        remoteInfo,
        remoteEntryExports,
      });
    };
    globalLoading[uniqueKey] = hook();
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
