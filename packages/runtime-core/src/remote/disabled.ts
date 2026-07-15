import { PluginSystem } from '../utils/hooks';

const REMOTE_DISABLED_MESSAGE =
  'Remote loading is disabled by experiments.optimization.disableRemote.';

export class UnavailableRemoteModule {
  constructor() {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }
}

export class DisabledRemoteHandler {
  hooks = new PluginSystem({});

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
