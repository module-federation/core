import { SnapshotHandler } from '../../plugins/snapshot/SnapshotHandler';
import { DisabledSnapshotHandler } from '../../plugins/snapshot/disabled';

declare const FEDERATION_OPTIMIZE_NO_REMOTE: boolean;

const useRemote =
  typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_REMOTE
    : true;

export function createSnapshotHandler(
  host: ConstructorParameters<typeof SnapshotHandler>[0],
) {
  return useRemote ? new SnapshotHandler(host) : new DisabledSnapshotHandler();
}
