import type { Federation } from '../global';
import type {
  Options,
  ShareScopeMap,
  ShareInfos,
  Shared,
  SharedLoadContext,
  SharedLoadTrigger,
} from '../type';
import type { ModuleFederation } from '../core';
import type { LoadRemoteMatch } from '../remote';
import {
  PluginSystem,
  AsyncHook,
  AsyncWaterfallHook,
  SyncWaterfallHook,
  SyncHook,
} from '../utils/hooks';

export const createSharedHooks = () =>
  new PluginSystem({
    beforeRegisterShare: new SyncWaterfallHook<{
      pkgName: string;
      shared: Shared;
      origin: ModuleFederation;
    }>('beforeRegisterShare'),
    afterRegisterShare: new SyncHook<
      [
        {
          pkgName: string;
          scope: string;
          shared: Shared;
          previousShared?: Shared;
          registeredShared?: Shared;
          shareScopeMap: ShareScopeMap;
          trigger: SharedLoadTrigger;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterRegisterShare'),
    afterResolve: new AsyncWaterfallHook<LoadRemoteMatch>('afterResolve'),
    beforeLoadShare: new AsyncWaterfallHook<{
      pkgName: string;
      shareInfo?: Shared;
      shared: Options['shared'];
      origin: ModuleFederation;
      loadContext?: SharedLoadContext;
    }>('beforeLoadShare'),
    // not used yet
    loadShare: new AsyncHook<[ModuleFederation, string, ShareInfos]>(),
    afterLoadShare: new SyncHook<
      [
        {
          pkgName: string;
          shareInfo?: Partial<Shared>;
          selectedShared?: Partial<Shared>;
          shared: Options['shared'];
          shareScopeMap: ShareScopeMap;
          lifecycle: 'loadShare' | 'loadShareSync';
          loadContext?: SharedLoadContext;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterLoadShare'),
    errorLoadShare: new SyncHook<
      [
        {
          pkgName: string;
          shareInfo?: Partial<Shared>;
          shared: Options['shared'];
          shareScopeMap: ShareScopeMap;
          lifecycle: 'loadShare' | 'loadShareSync';
          origin: ModuleFederation;
          error?: unknown;
          recovered?: boolean;
          loadContext?: SharedLoadContext;
        },
      ],
      void
    >('errorLoadShare'),
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
    // maybe will change, temporarily for internal use only
    initContainerShareScopeMap: new SyncWaterfallHook<{
      shareScope: ShareScopeMap[string];
      options: Options;
      origin: ModuleFederation;
      scopeName: string;
      hostShareScopeMap?: ShareScopeMap;
    }>('initContainerShareScopeMap'),
  });

export type SharedHooks = ReturnType<typeof createSharedHooks>;
