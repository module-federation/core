import type { LoadRemoteMatch } from '../remote';
import type { ShareScopeMap, SharedHandlerContract } from '../type';
import { AsyncWaterfallHook, PluginSystem } from '../utils/hooks';

export class DisabledSharedHandler implements SharedHandlerContract {
  shareScopeMap: ShareScopeMap = {};
  // Only afterResolve: RemoteHandler emits it on every loadRemote.
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
