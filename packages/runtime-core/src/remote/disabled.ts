import { PluginSystem } from '../utils/hooks';

export class DisabledRemoteHandler {
  hooks = new PluginSystem({});

  formatAndRegisterRemote() {
    return [];
  }

  loadRemote(): never {
    throw new Error(
      'Remote loading is disabled by experiments.optimization.disableRemote.',
    );
  }

  preloadRemote(): never {
    throw new Error(
      'Remote loading is disabled by experiments.optimization.disableRemote.',
    );
  }

  registerRemotes(): never {
    throw new Error(
      'Remote loading is disabled by experiments.optimization.disableRemote.',
    );
  }

  getRemoteModuleAndOptions(): never {
    throw new Error(
      'Remote loading is disabled by experiments.optimization.disableRemote.',
    );
  }

  initRawContainer(): never {
    throw new Error(
      'Remote loading is disabled by experiments.optimization.disableRemote.',
    );
  }
}
