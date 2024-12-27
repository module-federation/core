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
      console.log('beforeInit hook triggered', {
        userOptions,
        options,
        shareInfo,
      });
      return { userOptions, options, origin, shareInfo };
    },

    init({ options, origin }: { options: Options; origin: FederationHost }) {
      console.log('init hook triggered', { options });
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
      console.log('beforeInitContainer hook triggered', {
        shareScope,
        initScope,
        remoteEntryInitOptions,
        remoteInfo,
      });
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
      console.log('initContainer hook triggered', {
        shareScope,
        initScope,
        remoteEntryInitOptions,
        remoteInfo,
        remoteEntryExports,
        id,
        remoteSnapshot,
      });
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
      console.log('initContainerShareScopeMap hook triggered', {
        shareScope,
        options,
        scopeName,
        hostShareScopeMap,
      });
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
      if (shareInfo?.shareConfig?.layer && shareInfo.scope) {
        // Create new layered scopes for each scope
        shareInfo.scope = shareInfo.scope.map(
          (scope) => `(${shareInfo.shareConfig.layer})${scope}`,
        );
      }
      console.log('beforeLoadShare hook triggered', {
        pkgName,
        shareInfo,
        shared,
      });
      return { pkgName, shareInfo, shared, origin };
    },

    async loadShare(
      origin: FederationHost,
      pkgName: string,
      shareInfo: ShareInfos,
    ) {
      debugger;
      console.log('loadShare hook triggered', { pkgName, shareInfo });
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
      debugger;
      console.log('resolveShare hook triggered', {
        shareScopeMap,
        scope,
        pkgName,
        version,
        GlobalFederation,
        resolver,
      });

      // debugger;
      return {
        shareScopeMap,
        scope,
        pkgName,
        version,
        GlobalFederation,
        resolver,
      };
    },

    async afterResolve(args: LoadRemoteMatch) {
      console.log('afterResolve hook triggered', args);
      return args;
    },

    // 3. Remote Module Handling Phase
    beforeRegisterRemote({
      remote,
      origin,
    }: {
      remote: Remote;
      origin: FederationHost;
    }) {
      console.log('beforeRegisterRemote hook triggered', { remote });
      return { remote, origin };
    },

    registerRemote({
      remote,
      origin,
    }: {
      remote: Remote;
      origin: FederationHost;
    }) {
      console.log('registerRemote hook triggered', { remote });
      return { remote, origin };
    },

    async beforePreloadRemote({
      preloadOps,
      options,
      origin,
    }: {
      preloadOps: Array<PreloadRemoteArgs>;
      options: Options;
      origin: FederationHost;
    }) {
      console.log('beforePreloadRemote hook triggered', {
        preloadOps,
        options,
      });
    },

    async generatePreloadAssets({
      origin,
      preloadOptions,
      remote,
      remoteInfo,
      remoteSnapshot,
      globalSnapshot,
    }: {
      origin: FederationHost;
      preloadOptions: PreloadOptions[number];
      remote: Remote;
      remoteInfo: RemoteInfo;
      remoteSnapshot: ModuleInfo;
      globalSnapshot: GlobalModuleInfo;
    }) {
      console.log('generatePreloadAssets hook triggered', {
        preloadOptions,
        remote,
        remoteInfo,
        remoteSnapshot,
        globalSnapshot,
      });
      return {
        cssAssets: [],
        jsAssetsWithoutEntry: [],
        entryAssets: [],
      };
    },

    async afterPreloadRemote({
      preloadOps,
      options,
      origin,
    }: {
      preloadOps: Array<PreloadRemoteArgs>;
      options: Options;
      origin: FederationHost;
    }) {
      console.log('afterPreloadRemote hook triggered', { preloadOps, options });
    },

    async beforeRequest({
      id,
      options,
      origin,
    }: {
      id: string;
      options: Options;
      origin: FederationHost;
    }) {
      console.log('beforeRequest hook triggered', { id, options });
      return { id, options, origin };
    },

    async loadEntry({
      loaderHook,
      remoteInfo,
      remoteEntryExports,
    }: {
      loaderHook: FederationHost['loaderHook'];
      remoteInfo: RemoteInfo;
      remoteEntryExports?: RemoteEntryExports;
    }): Promise<RemoteEntryExports> {
      console.log('loadEntry hook triggered', {
        loaderHook,
        remoteInfo,
        remoteEntryExports,
      });
      return (
        remoteEntryExports || {
          get: () => async () => ({}),
          init: async () => {
            return;
          },
        }
      );
    },

    async onLoad({
      id,
      expose,
      pkgNameOrAlias,
      remote,
      options,
      origin,
      exposeModule,
      exposeModuleFactory,
      moduleInstance,
    }: {
      id: string;
      expose: string;
      pkgNameOrAlias: string;
      remote: Remote;
      options: { remoteInfo: RemoteInfo; host: FederationHost };
      origin: FederationHost;
      exposeModule: any;
      exposeModuleFactory: any;
      moduleInstance: Module;
    }) {
      console.log('onLoad hook triggered', {
        id,
        expose,
        pkgNameOrAlias,
        remote,
        options,
        exposeModule,
        exposeModuleFactory,
        moduleInstance,
      });
    },

    handlePreloadModule({
      id,
      name,
      remote,
      remoteSnapshot,
      preloadConfig,
      origin,
    }: {
      id: string;
      name: string;
      remote: Remote;
      remoteSnapshot: ModuleInfo;
      preloadConfig: PreloadRemoteArgs;
      origin: FederationHost;
    }) {
      console.log('handlePreloadModule hook triggered', {
        id,
        name,
        remote,
        remoteSnapshot,
        preloadConfig,
      });
    },

    async errorLoadRemote({
      id,
      error,
      options,
      from,
      lifecycle,
      origin,
    }: {
      id: string;
      error: unknown;
      options?: any;
      from: CallFrom;
      lifecycle: 'beforeLoadShare' | 'beforeRequest' | 'onLoad';
      origin: FederationHost;
    }) {
      console.log('errorLoadRemote hook triggered', {
        id,
        error,
        options,
        from,
        lifecycle,
      });
    },

    // 4. Module Factory and Info Phase
    getModuleInfo({ target, key }: { target: Record<string, any>; key: any }) {
      console.log('getModuleInfo hook triggered', { target, key });
      return undefined;
    },

    async getModuleFactory({
      remoteEntryExports,
      expose,
      moduleInfo,
    }: {
      remoteEntryExports: RemoteEntryExports;
      expose: string;
      moduleInfo: RemoteInfo;
    }) {
      console.log('getModuleFactory hook triggered', {
        remoteEntryExports,
        expose,
        moduleInfo,
      });
      return undefined;
    },

    // 5. Resource Loading Phase
    createScript({ url, attrs }: { url: string; attrs?: Record<string, any> }) {
      console.log('createScript hook triggered', { url, attrs });
      return undefined;
    },

    createLink({ url, attrs }: { url: string; attrs?: Record<string, any> }) {
      console.log('createLink hook triggered', { url, attrs });
      return undefined;
    },

    fetch(url: string, init: RequestInit): Promise<Response> | void | false {
      console.log('fetch hook triggered', { url, init });
      return false;
    },

    async loadEntryError({
      getRemoteEntry,
      origin,
      remoteInfo,
      remoteEntryExports,
      globalLoading,
      uniqueKey,
    }: {
      getRemoteEntry: ({
        origin,
        remoteEntryExports,
        remoteInfo,
      }: {
        origin: FederationHost;
        remoteInfo: RemoteInfo;
        remoteEntryExports?: RemoteEntryExports;
      }) => Promise<RemoteEntryExports | false | void>;
      origin: FederationHost;
      remoteInfo: RemoteInfo;
      remoteEntryExports?: RemoteEntryExports;
      globalLoading: Record<
        string,
        Promise<void | RemoteEntryExports> | undefined
      >;
      uniqueKey: string;
    }) {
      console.log('loadEntryError hook triggered', {
        getRemoteEntry,
        remoteInfo,
        remoteEntryExports,
        globalLoading,
        uniqueKey,
      });
      return undefined;
    },

    // 6. Bridge Lifecycle Phase
    beforeBridgeRender(args: Record<string, any>) {
      console.log('beforeBridgeRender hook triggered', args);
      return undefined;
    },

    afterBridgeRender(args: Record<string, any>) {
      console.log('afterBridgeRender hook triggered', args);
      return undefined;
    },

    beforeBridgeDestroy(args: Record<string, any>) {
      console.log('beforeBridgeDestroy hook triggered', args);
      return undefined;
    },

    afterBridgeDestroy(args: Record<string, any>) {
      console.log('afterBridgeDestroy hook triggered', args);
      return undefined;
    },

    // 7. Snapshot Handling Phase
    async beforeLoadRemoteSnapshot({
      options,
      moduleInfo,
    }: {
      options: Options;
      moduleInfo: Remote;
    }) {
      console.log('beforeLoadRemoteSnapshot hook triggered', {
        options,
        moduleInfo,
      });
    },

    async loadSnapshot({
      options,
      moduleInfo,
      hostGlobalSnapshot,
      globalSnapshot,
      remoteSnapshot,
    }: {
      options: Options;
      moduleInfo: Remote;
      hostGlobalSnapshot:
        | ModuleInfo
        | ManifestProvider
        | PureEntryProvider
        | undefined;
      globalSnapshot: GlobalModuleInfo;
      remoteSnapshot?: ModuleInfo | ManifestProvider | PureEntryProvider;
    }) {
      console.log('loadSnapshot hook triggered', {
        options,
        moduleInfo,
        hostGlobalSnapshot,
        globalSnapshot,
        remoteSnapshot,
      });
      return {
        options,
        moduleInfo,
        hostGlobalSnapshot,
        globalSnapshot,
        remoteSnapshot,
      };
    },

    async loadRemoteSnapshot({
      options,
      moduleInfo,
      manifestJson,
      manifestUrl,
      remoteSnapshot,
      from,
    }: {
      options: Options;
      moduleInfo: Remote;
      manifestJson?: Manifest;
      manifestUrl?: string;
      remoteSnapshot: ModuleInfo;
      from: 'global' | 'manifest';
    }) {
      console.log('loadRemoteSnapshot hook triggered', {
        options,
        moduleInfo,
        manifestJson,
        manifestUrl,
        remoteSnapshot,
        from,
      });
      return {
        options,
        moduleInfo,
        manifestJson,
        manifestUrl,
        remoteSnapshot,
        from,
      };
    },

    async afterLoadSnapshot({
      options,
      moduleInfo,
      remoteSnapshot,
    }: {
      options: Options;
      moduleInfo: Remote;
      remoteSnapshot: ModuleInfo;
    }) {
      console.log('afterLoadSnapshot hook triggered', {
        options,
        moduleInfo,
        remoteSnapshot,
      });
      return { options, moduleInfo, remoteSnapshot };
    },
  };
};
