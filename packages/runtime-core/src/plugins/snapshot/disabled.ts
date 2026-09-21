import type { ModuleFederation } from '../../core';
import type { Options, Remote } from '../../type';
import { AsyncHook, PluginSystem } from '../../utils/hooks';

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

  loadRemoteSnapshotInfo(): never {
    throw new Error(SNAPSHOT_DISABLED_MESSAGE);
  }
}
