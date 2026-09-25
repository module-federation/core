import type { RemoteCapability } from '../type';
import { SnapshotHandler } from '../plugins/snapshot/SnapshotHandler';
import { RemoteHandler } from './index';

export const remote: RemoteCapability = {
  create: (host) => ({
    snapshot: new SnapshotHandler(host),
    remote: new RemoteHandler(host),
  }),
};
