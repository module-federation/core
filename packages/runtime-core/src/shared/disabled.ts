import type { Federation } from '../global';
import type { LoadRemoteMatch } from '../remote';
import type { ShareScopeMap, Shared, SharedLoadContext } from '../type';
import {
  AsyncWaterfallHook,
  PluginSystem,
  SyncWaterfallHook,
} from '../utils/hooks';

export class DisabledSharedHandler {
  shareScopeMap: ShareScopeMap = {};
  hooks = new PluginSystem({
    afterResolve: new AsyncWaterfallHook<LoadRemoteMatch>('afterResolve'),
    resolveShare: new SyncWaterfallHook<{
      shareScopeMap: ShareScopeMap;
      scope: string;
      pkgName: string;
      version: string;
      shareInfo: Shared;
      GlobalFederation: Federation;
      resolver: () => { shared: Shared; useTreesShaking: boolean } | undefined;
      loadContext?: SharedLoadContext;
    }>('resolveShare'),
  });

  registerShared(): {
    newShareInfos: Record<string, never>;
    allShareInfos: Record<string, never>;
  } {
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
