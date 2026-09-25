import type { LoadRemoteMatch } from '../remote';
import type {
  ShareScopeMap,
  SharedCapability,
  SharedHandlerContract,
} from '../type';
import { AsyncWaterfallHook, PluginSystem } from '../utils/hooks';

const SHARED_DISABLED_MESSAGE =
  'Shared dependency loading is disabled by experiments.optimization.disableShared.';

export class DisabledSharedHandler implements SharedHandlerContract {
  shareScopeMap: ShareScopeMap = {};
  hooks: SharedHandlerContract['hooks'] = new PluginSystem({
    afterResolve: new AsyncWaterfallHook<LoadRemoteMatch>('afterResolve'),
  } as SharedHandlerContract['hooks']['lifecycle']);

  formatShareInfos() {
    return {};
  }

  registerShared() {
    return {
      newShareInfos: {},
      allShareInfos: {},
    };
  }

  loadShare(): never {
    throw new Error(SHARED_DISABLED_MESSAGE);
  }

  loadShareSync(): never {
    throw new Error(SHARED_DISABLED_MESSAGE);
  }

  initializeSharing(): [] {
    return [];
  }

  initShareScopeMap(
    scopeName: string,
    shareScope: ShareScopeMap[string],
  ): void {
    this.shareScopeMap[scopeName] = shareScope;
  }
}

export const disabledShared: SharedCapability = {
  create: () => new DisabledSharedHandler(),
};
