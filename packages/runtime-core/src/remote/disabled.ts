import type { ModuleFederation } from '../core';
import type { UserOptions } from '../type';

const REMOTE_DISABLED_MESSAGE =
  'Remote loading is not composed into this runtime. Configure `remotes`, or compose the remote capability from @module-federation/runtime-core/remote.';

export class UnavailableRemoteModule {
  constructor() {
    throw new Error(REMOTE_DISABLED_MESSAGE);
  }
}

export class DisabledRemoteHandler {
  hooks: ModuleFederation['slots']['remote']['hooks'];
  idToRemoteMap: ModuleFederation['slots']['remote']['idToRemoteMap'];

  constructor(host: ModuleFederation) {
    this.hooks = host.slots.remote.hooks;
    this.idToRemoteMap = host.slots.remote.idToRemoteMap;
  }

  formatAndRegisterRemote(_globalOptions: unknown, userOptions: UserOptions) {
    if (userOptions.remotes?.length) {
      throw new Error(REMOTE_DISABLED_MESSAGE);
    }
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
