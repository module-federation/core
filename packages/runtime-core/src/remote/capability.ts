import type { ModuleFederation } from '../core';
import { RemoteHandler } from './index';
import { SnapshotHandler } from '../plugins/snapshot/SnapshotHandler';

export const remote = {
  kind: 'remote' as const,
  create: (host: ModuleFederation) => ({
    snapshot: new SnapshotHandler(host),
    remote: new RemoteHandler(host),
  }),
};
