import type { RemoteHandler } from './index';
import { AsyncHook, PluginSystem } from '../utils/hooks';

const REMOTE_DISABLED_MESSAGE =
  'Remote loading is disabled by experiments.optimization.disableRemote.';

export class UnavailableRemoteModule {
  constructor() {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }
}

export class DisabledRemoteHandler {
  // getRemoteEntry emits loadEntry for shared fallback entries, which load without remotes.
  hooks = new PluginSystem<
    Pick<RemoteHandler['hooks']['lifecycle'], 'loadEntry'>
  >({
    loadEntry: new AsyncHook(),
  });

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
