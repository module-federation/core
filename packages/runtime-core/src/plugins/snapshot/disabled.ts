import { getGlobalSnapshot } from '../../global';
import type { ModuleFederation } from '../../core';
import type { Options, Remote } from '../../type';
import { AsyncHook, PluginSystem } from '../../utils/hooks';
import type { SnapshotHandler } from './SnapshotHandler';

const SNAPSHOT_DISABLED_MESSAGE =
  'Snapshot loading is disabled by experiments.optimization.disableRemote.';

export class DisabledSnapshotHandler {
  hooks = new PluginSystem({
    beforeLoadRemoteSnapshot: new AsyncHook<
      [
        {
          options: Options;
          moduleInfo: Remote;
          origin: ModuleFederation;
        },
      ],
      void
    >('beforeLoadRemoteSnapshot'),
  });
  manifestCache = new Map<string, never>();

  loadRemoteSnapshotInfo(
    ..._args: Parameters<SnapshotHandler['loadRemoteSnapshotInfo']>
  ): ReturnType<SnapshotHandler['loadRemoteSnapshotInfo']> {
    throw new Error(SNAPSHOT_DISABLED_MESSAGE);
  }

  getGlobalRemoteInfo(
    _moduleInfo: Remote,
  ): ReturnType<SnapshotHandler['getGlobalRemoteInfo']> {
    return {
      hostGlobalSnapshot: undefined,
      globalSnapshot: getGlobalSnapshot(),
      remoteSnapshot: undefined,
    };
  }
}
