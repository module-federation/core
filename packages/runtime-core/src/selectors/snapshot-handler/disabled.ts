import { DisabledSnapshotHandler } from '../../plugins/snapshot/disabled';

export function createSnapshotHandler() {
  return new DisabledSnapshotHandler();
}
