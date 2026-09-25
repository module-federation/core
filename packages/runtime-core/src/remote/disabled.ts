import type { RemoteCapability, RemoteHandlerContract } from '../type';
import { PluginSystem } from '../utils/hooks';
import { DisabledSnapshotHandler } from '../plugins/snapshot/disabled';

const REMOTE_DISABLED_MESSAGE =
  'Remote loading is disabled by experiments.optimization.disableRemote.';

export class DisabledRemoteHandler implements RemoteHandlerContract {
  hooks: RemoteHandlerContract['hooks'] = new PluginSystem(
    {} as RemoteHandlerContract['hooks']['lifecycle'],
  );
  idToRemoteMap = {};

  formatAndRegisterRemote() {
    return [];
  }

  loadRemote(): never {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }

  preloadRemote(): never {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }

  registerRemotes(): never {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }

  getRemoteModuleAndOptions(): never {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }

  initRawContainer(): never {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }
}

export const disabledRemote: RemoteCapability = {
  create: () => ({
    remote: new DisabledRemoteHandler(),
    snapshot: new DisabledSnapshotHandler(),
  }),
};
