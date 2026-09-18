import { SnapshotHandler } from '../../plugins/snapshot/SnapshotHandler';

export function createSnapshotHandler(
  host: ConstructorParameters<typeof SnapshotHandler>[0],
): SnapshotHandler {
  return new SnapshotHandler(host);
}
