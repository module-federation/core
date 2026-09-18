import type { SnapshotHandler } from '../../plugins/snapshot/SnapshotHandler';
import { DisabledSnapshotHandler } from '../../plugins/snapshot/disabled';

export function createSnapshotHandler(): SnapshotHandler {
  return new DisabledSnapshotHandler() as unknown as SnapshotHandler;
}
