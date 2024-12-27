//never use issuerLayer in this plugin
import type { FederationRuntimePlugin, RemoteEntryExports } from '../type';
import type { FederationHost } from '../core';
import type {
  Options,
  UserOptions,
  ShareInfos,
  RemoteInfo,
  InitScope,
  RemoteEntryInitOptions,
  ShareScopeMap,
  Remote,
  Shared,
  PreloadRemoteArgs,
  PreloadOptions,
  CallFrom,
} from '../type';
import type {
  ModuleInfo,
  GlobalModuleInfo,
  Manifest,
  ManifestProvider,
  PureEntryProvider,
} from '@module-federation/sdk';
import type { LoadRemoteMatch } from '../remote';
import type { Federation } from '../global';
import type { Module } from '../module';

// Safely handle inspect for both Node.js and browser environments
const safeInspect = (
  obj: any,
  options?: { depth?: number | null; colors?: boolean },
) => {
  try {
    // Use eval(require()) to avoid bundler issues
    const util = eval('require("util")');
    return util.inspect(obj, options);
  } catch {
    // Fallback for browser environment
    return JSON.stringify(obj, null, 2);
  }
};

export const layersPlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 'layers-plugin',

    // 1. Core Initialization Phase
    beforeInit({
      userOptions,
      options,
      origin,
      shareInfo,
    }: {
      userOptions: UserOptions;
      options: Options;
      origin: FederationHost;
      shareInfo: ShareInfos;
    }) {
      console.log(
        'beforeInit hook triggered',
        safeInspect(
          {
            userOptions,
            options,
            shareInfo,
          },
          { depth: null, colors: true },
        ),
      );
      return { userOptions, options, origin, shareInfo };
    },

    init({ options, origin }: { options: Options; origin: FederationHost }) {
      console.log(
        'init hook triggered',
        safeInspect({ options }, { depth: null, colors: true }),
      );
    },

    beforeInitContainer({
      shareScope,
      initScope,
      remoteEntryInitOptions,
      remoteInfo,
      origin,
    }: {
      shareScope: ShareScopeMap[string];
      initScope: InitScope;
      remoteEntryInitOptions: RemoteEntryInitOptions;
      remoteInfo: RemoteInfo;
      origin: FederationHost;
    }) {
      console.log(
        'beforeInitContainer hook triggered',
        safeInspect(
          {
            shareScope,
            initScope,
            remoteEntryInitOptions,
            remoteInfo,
          },
          { depth: null, colors: true },
        ),
      );
      return {
        shareScope,
        initScope,
        remoteEntryInitOptions,
        remoteInfo,
        origin,
      };
    },

    async initContainer({
      shareScope,
      initScope,
      remoteEntryInitOptions,
      remoteInfo,
      remoteEntryExports,
      origin,
      id,
      remoteSnapshot,
    }: {
      shareScope: ShareScopeMap[string];
      initScope: InitScope;
      remoteEntryInitOptions: RemoteEntryInitOptions;
      remoteInfo: RemoteInfo;
      remoteEntryExports: RemoteEntryExports;
      origin: FederationHost;
      id: string;
      remoteSnapshot?: ModuleInfo;
    }) {
      console.log(
        'initContainer hook triggered',
        safeInspect(
          {
            shareScope,
            initScope,
            remoteEntryInitOptions,
            remoteInfo,
            remoteEntryExports,
            id,
            remoteSnapshot,
          },
          { depth: null, colors: true },
        ),
      );
      return {
        shareScope,
        initScope,
        remoteEntryInitOptions,
        remoteInfo,
        remoteEntryExports,
        id,
        remoteSnapshot,
        origin,
      };
    },

    // 2. Shared Module Handling Phase
    initContainerShareScopeMap({
      shareScope,
      options,
      origin,
      scopeName,
      hostShareScopeMap,
    }: {
      shareScope: ShareScopeMap[string];
      options: Options;
      origin: FederationHost;
      scopeName: string;
      hostShareScopeMap?: ShareScopeMap;
    }) {
      console.log(
        'initContainerShareScopeMap hook triggered',
        safeInspect(
          {
            shareScope,
            options,
            scopeName,
            hostShareScopeMap,
          },
          { depth: null, colors: true },
        ),
      );
      return { shareScope, options, origin, scopeName, hostShareScopeMap };
    },

    async beforeLoadShare({
      pkgName,
      shareInfo,
      shared,
      origin,
    }: {
      pkgName: string;
      shareInfo?: Shared;
      shared: Options['shared'];
      origin: FederationHost;
    }) {
      console.log(
        'beforeLoadShare hook triggered',
        safeInspect(
          { pkgName, shareInfo, shared },
          { depth: null, colors: true },
        ),
      );

      // If there's layer information in the share config, modify the pkgName to include layer
      if (shareInfo?.shareConfig?.layer) {
        const layeredPkgName = `${pkgName}@layer:${shareInfo.shareConfig.layer}`;
        return { pkgName: layeredPkgName, shareInfo, shared, origin };
      }

      return { pkgName, shareInfo, shared, origin };
    },

    async loadShare(
      origin: FederationHost,
      pkgName: string,
      shareInfo: ShareInfos,
    ) {
      console.log(
        'loadShare hook triggered',
        safeInspect({ pkgName, shareInfo }, { depth: null, colors: true }),
      );
    },

    resolveShare({
      shareScopeMap,
      scope,
      pkgName,
      version,
      GlobalFederation,
      resolver,
    }: {
      shareScopeMap: ShareScopeMap;
      scope: string;
      pkgName: string;
      version: string;
      GlobalFederation: Federation;
      resolver: () => Shared | undefined;
    }) {
      console.log(
        'resolveShare hook triggered',
        safeInspect(
          {
            shareScopeMap,
            scope,
            pkgName,
            version,
            GlobalFederation,
          },
          { depth: null, colors: true },
        ),
      );

      // Check if this is a layered package request
      const [basePkgName, layerInfo] = pkgName.split('@layer:');

      // If this is a layered request, try to find the layered version first
      if (layerInfo) {
        const originalResolver = resolver;
        return {
          shareScopeMap,
          scope,
          pkgName: basePkgName,
          version,
          GlobalFederation,
          resolver: () => {
            const share = originalResolver();
            if (share?.shareConfig?.layer === layerInfo) {
              return share;
            }
            // If no layered version found, return undefined to continue resolution
            return undefined;
          },
        };
      }

      // For non-layered requests, only return non-layered shares
      const originalResolver = resolver;
      return {
        shareScopeMap,
        scope,
        pkgName,
        version,
        GlobalFederation,
        resolver: () => {
          const share = originalResolver();
          if (!share?.shareConfig?.layer) {
            return share;
          }
          // If only layered version found for non-layered request, return undefined
          return undefined;
        },
      };
    },

    async afterResolve(args: LoadRemoteMatch) {
      console.log(
        'afterResolve hook triggered',
        safeInspect(args, { depth: null, colors: true }),
      );
      return args;
    },
  };
};
