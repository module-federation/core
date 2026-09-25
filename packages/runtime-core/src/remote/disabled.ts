import type { RemoteHandlerContract } from '../type';
import { PluginSystem } from '../utils/hooks';

const REMOTE_DISABLED_MESSAGE =
  'Remote loading is disabled by experiments.optimization.disableRemote.';

export class DisabledRemoteHandler implements RemoteHandlerContract {
  // No lifecycle: plugins that tap remote hooks register nothing.
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
