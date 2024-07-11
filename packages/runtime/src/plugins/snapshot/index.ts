import { ModuleInfo, getResourceUrl } from '@module-federation/sdk';
import { FederationRuntimePlugin } from '../../type/plugin';
import {
  error,
  isBrowserEnv,
  isPureRemoteEntry,
  isRemoteInfoWithEntry,
} from '../../utils';
import { RemoteInfo } from '../../type';

export function assignRemoteInfo(
  remoteInfo: RemoteInfo,
  remoteSnapshot: ModuleInfo,
): void {
  if (!('remoteEntry' in remoteSnapshot) || !remoteSnapshot.remoteEntry) {
    error(`The attribute remoteEntry of ${name} must not be undefined.`);
  }
  const { remoteEntry } = remoteSnapshot;

  let entryUrl = getResourceUrl(remoteSnapshot, remoteEntry);

  if (!isBrowserEnv() && !entryUrl.startsWith('http')) {
    entryUrl = `https:${entryUrl}`;
  }

  remoteInfo.type = remoteSnapshot.remoteEntryType;
  remoteInfo.entryGlobalName = remoteSnapshot.globalName;
  remoteInfo.entry = entryUrl;
  remoteInfo.version = remoteSnapshot.version;
  remoteInfo.buildVersion = remoteSnapshot.buildVersion;
}

export function snapshotPlugin(): FederationRuntimePlugin {
  return {
    name: 'snapshot-plugin',
    async afterResolve(args) {
      const { remote, origin, remoteInfo } = args;

      if (!isRemoteInfoWithEntry(remote) || !isPureRemoteEntry(remote)) {
        const { remoteSnapshot } =
          await origin.snapshotHandler.loadRemoteSnapshotInfo(remote);

        assignRemoteInfo(remoteInfo, remoteSnapshot);

        return {
          ...args,
          remoteSnapshot,
        };
      }

      return args;
    },
  };
}
