import type { SnapshotHandlerContract } from '../../type';
import { PluginSystem } from '../../utils/hooks';

const SNAPSHOT_DISABLED_MESSAGE =
  'Remote snapshots are disabled by experiments.optimization.disableRemote.';

export class DisabledSnapshotHandler implements SnapshotHandlerContract {
  hooks: SnapshotHandlerContract['hooks'] = new PluginSystem(
    {} as SnapshotHandlerContract['hooks']['lifecycle'],
  );
  manifestCache = new Map();

  loadRemoteSnapshotInfo(): never {
    throw new Error(SNAPSHOT_DISABLED_MESSAGE);
  }

  getGlobalRemoteInfo(): never {
    throw new Error(SNAPSHOT_DISABLED_MESSAGE);
  }
}
