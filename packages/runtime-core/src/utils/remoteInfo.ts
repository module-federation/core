import { composeKeyWithSeparator } from '@module-federation/sdk';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';
import type { Remote, RemoteInfo } from '../type';

export function isEsmRemoteType(type: RemoteInfo['type']): boolean {
  return type === 'esm' || type === 'module';
}

export function getRemoteEntryUniqueKey(remoteInfo: RemoteInfo): string {
  return composeKeyWithSeparator(remoteInfo.name, remoteInfo.entry);
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
