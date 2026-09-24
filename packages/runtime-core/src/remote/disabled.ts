import { createRemoteHandlerHooks, type RemoteHandlerHooks } from './hooks';

const REMOTE_DISABLED_MESSAGE =
  'Remote loading is disabled by experiments.optimization.disableRemote.';

export class UnavailableRemoteModule {
  constructor() {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }
}

export class DisabledRemoteHandler {
  hooks: RemoteHandlerHooks = createRemoteHandlerHooks();
  idToRemoteMap: Record<string, { name: string; expose: string }> = {};

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
