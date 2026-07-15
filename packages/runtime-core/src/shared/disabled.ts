import type { LoadRemoteMatch } from '../remote';
import type { ShareScopeMap } from '../type';
import { AsyncWaterfallHook, PluginSystem } from '../utils/hooks';

export class DisabledSharedHandler {
  shareScopeMap: ShareScopeMap = {};
  hooks = new PluginSystem({
    afterResolve: new AsyncWaterfallHook<LoadRemoteMatch>('afterResolve'),
  });

  registerShared() {
    return {
      newShareInfos: {},
      allShareInfos: {},
    };
  }

  loadShare(): never {
    throw new Error(
      'Shared dependency loading is disabled by experiments.optimization.disableShared.',
    );
  }

  loadShareSync(): never {
    throw new Error(
      'Shared dependency loading is disabled by experiments.optimization.disableShared.',
    );
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
