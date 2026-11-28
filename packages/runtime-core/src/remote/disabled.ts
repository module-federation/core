import type { RemoteCapability, RemoteHandlerContract } from '../type';
import { AsyncHook, PluginSystem } from '../utils/hooks';
import { DisabledSnapshotHandler } from '../plugins/snapshot/disabled';

const REMOTE_DISABLED_MESSAGE =
  'Remote loading is disabled by experiments.optimization.disableRemote.';

export class DisabledRemoteHandler implements RemoteHandlerContract {
  // getRemoteEntry emits loadEntry for shared fallback entries, which load without remotes.
  hooks: RemoteHandlerContract['hooks'] = new PluginSystem({
    loadEntry: new AsyncHook(),
  } as RemoteHandlerContract['hooks']['lifecycle']);

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
