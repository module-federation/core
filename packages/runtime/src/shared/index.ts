import {
  getShortErrorMsg,
  RUNTIME_005,
  RUNTIME_006,
  runtimeDescMap,
} from '@module-federation/error-codes';
import { Federation } from '../global';
import {
  Options,
  ShareScopeMap,
  ShareInfos,
  Shared,
  RemoteEntryExports,
  UserOptions,
  ShareStrategy,
  InitScope,
  InitTokens,
  CallFrom,
} from '../type';
import { FederationHost } from '../core';
import {
  PluginSystem,
  AsyncHook,
  AsyncWaterfallHook,
  SyncWaterfallHook,
} from '../utils/hooks';
import {
  formatShareConfigs,
  getRegisteredShare,
  getTargetSharedOptions,
  getGlobalShareScope,
} from '../utils/share';
import { assert, addUniqueItem } from '../utils';
import { DEFAULT_SCOPE } from '../constant';
import { LoadRemoteMatch } from '../remote';

export class SharedHandler {
  host: FederationHost;
  shareScopeMap: ShareScopeMap;
  hooks = new PluginSystem({
    afterResolve: new AsyncWaterfallHook<LoadRemoteMatch>('afterResolve'),
    beforeLoadShare: new AsyncWaterfallHook<{
      pkgName: string;
      shareInfo?: Shared;
      shared: Options['shared'];
      origin: FederationHost;
    }>('beforeLoadShare'),
    // not used yet
    loadShare: new AsyncHook<[FederationHost, string, ShareInfos]>(),
    resolveShare: new SyncWaterfallHook<{
      shareScopeMap: ShareScopeMap;
      scope: string;
      pkgName: string;
      version: string;
      GlobalFederation: Federation;
      resolver: () => Shared | undefined;
    }>('resolveShare'),
    // maybe will change, temporarily for internal use only
    initContainerShareScopeMap: new SyncWaterfallHook<{
      shareScope: ShareScopeMap[string];
      options: Options;
      origin: FederationHost;
      scopeName: string;
      hostShareScopeMap?: ShareScopeMap;
    }>('initContainerShareScopeMap'),
  });
  initTokens: InitTokens;
  constructor(host: FederationHost) {
    this.host = host;
    this.shareScopeMap = {};
    this.initTokens = {};
    this._setGlobalShareScopeMap(host.options);
  }

  // register shared in shareScopeMap
  registerShared(globalOptions: Options, userOptions: UserOptions) {
    const { shareInfos, shared } = formatShareConfigs(
      globalOptions,
      userOptions,
    );

    const sharedKeys = Object.keys(shareInfos);
    sharedKeys.forEach((sharedKey) => {
      const sharedVals = shareInfos[sharedKey];
      sharedVals.forEach((sharedVal) => {
        const registeredShared = getRegisteredShare(
          this.shareScopeMap,
          sharedKey,
          sharedVal,
          this.hooks.lifecycle.resolveShare,
        );
        if (!registeredShared && sharedVal && sharedVal.lib) {
          this.setShared({
            pkgName: sharedKey,
            lib: sharedVal.lib,
            get: sharedVal.get,
            loaded: true,
            shared: sharedVal,
            from: userOptions.name,
          });
        }
      });
    });

    return {
      shareInfos,
      shared,
    };
  }

  async loadShare<T>(
    pkgName: string,
    extraOptions?: {
      customShareInfo?: Partial<Shared>;
      resolver?: (sharedOptions: ShareInfos[string]) => Shared;
    },
  ): Promise<false | (() => T | undefined)> {
    const { host } = this;
    // This function performs the following steps:
    // 1. Checks if the currently loaded share already exists, if not, it throws an error
    // 2. Searches globally for a matching share, if found, it uses it directly
    // 3. If not found, it retrieves it from the current share and stores the obtained share globally.

    const shareInfo = getTargetSharedOptions({
      pkgName,
      extraOptions,
      shareInfos: host.options.shared,
    });

    if (shareInfo?.scope) {
      await Promise.all(
        shareInfo.scope.map(async (shareScope) => {
          await Promise.all(
            this.initializeSharing(shareScope, {
              strategy: shareInfo.strategy,
            }),
          );
          return;
        }),
      );
    }
    const loadShareRes = await this.hooks.lifecycle.beforeLoadShare.emit({
      pkgName,
      shareInfo,
      shared: host.options.shared,
      origin: host,
    });

    const { shareInfo: shareInfoRes } = loadShareRes;

    // Assert that shareInfoRes exists, if not, throw an error
    assert(
      shareInfoRes,
      `Cannot find ${pkgName} Share in the ${host.options.name}. Please ensure that the ${pkgName} Share parameters have been injected`,
    );

    // Retrieve from cache
    const registeredShared = getRegisteredShare(
      this.shareScopeMap,
      pkgName,
      shareInfoRes,
      this.hooks.lifecycle.resolveShare,
    );

    const addUseIn = (shared: Shared): void => {
      if (!shared.useIn) {
        shared.useIn = [];
      }
      addUniqueItem(shared.useIn, host.options.name);
    };

    if (registeredShared && registeredShared.lib) {
      addUseIn(registeredShared);
      return registeredShared.lib as () => T;
    } else if (
      registeredShared &&
      registeredShared.loading &&
      !registeredShared.loaded
    ) {
      const factory = await registeredShared.loading;
      registeredShared.loaded = true;
      if (!registeredShared.lib) {
        registeredShared.lib = factory;
      }
      addUseIn(registeredShared);
      return factory;
    } else if (registeredShared) {
      const asyncLoadProcess = async () => {
        const factory = await registeredShared.get();
        shareInfoRes.lib = factory;
        shareInfoRes.loaded = true;
        addUseIn(shareInfoRes);
        const gShared = getRegisteredShare(
          this.shareScopeMap,
          pkgName,
          shareInfoRes,
          this.hooks.lifecycle.resolveShare,
        );
        if (gShared) {
          gShared.lib = factory;
          gShared.loaded = true;
        }
        return factory as () => T;
      };
      const loading = asyncLoadProcess();
      this.setShared({
        pkgName,
        loaded: false,
        shared: registeredShared,
        from: host.options.name,
        lib: null,
        loading,
      });
      return loading;
    } else {
      if (extraOptions?.customShareInfo) {
        return false;
      }
      const asyncLoadProcess = async () => {
        const factory = await shareInfoRes.get();
        shareInfoRes.lib = factory;
        shareInfoRes.loaded = true;
        addUseIn(shareInfoRes);
        const gShared = getRegisteredShare(
          this.shareScopeMap,
          pkgName,
          shareInfoRes,
          this.hooks.lifecycle.resolveShare,
        );
        if (gShared) {
          gShared.lib = factory;
          gShared.loaded = true;
        }
        return factory as () => T;
      };
      const loading = asyncLoadProcess();
      this.setShared({
        pkgName,
        loaded: false,
        shared: shareInfoRes,
        from: host.options.name,
        lib: null,
        loading,
      });
      return loading;
    }
  }

  /**
   * This function initializes the sharing sequence (executed only once per share scope).
   * It accepts one argument, the name of the share scope.
   * If the share scope does not exist, it creates one.
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  initializeSharing(
    shareScopeName = DEFAULT_SCOPE,
    extraOptions?: {
      initScope?: InitScope;
      from?: CallFrom;
      strategy?: ShareStrategy;
    },
  ): Array<Promise<void>> {
    const { host } = this;
    const from = extraOptions?.from;
    const strategy = extraOptions?.strategy;
    let initScope = extraOptions?.initScope;
    const promises: Promise<any>[] = [];
    if (from !== 'build') {
      const { initTokens } = this;
      if (!initScope) initScope = [];
      let initToken = initTokens[shareScopeName];
      if (!initToken)
        initToken = initTokens[shareScopeName] = { from: this.host.name };
      if (initScope.indexOf(initToken) >= 0) return promises;
      initScope.push(initToken);
    }

    const shareScope = this.shareScopeMap;
    const hostName = host.options.name;
    // Creates a new share scope if necessary
    if (!shareScope[shareScopeName]) {
      shareScope[shareScopeName] = {};
    }
    // Executes all initialization snippets from all accessible modules
    const scope = shareScope[shareScopeName];
    const register = (name: string, shared: Shared) => {
      const { version, eager } = shared;
      scope[name] = scope[name] || {};
      const versions = scope[name];
      const activeVersion = versions[version];
      const activeVersionEager = Boolean(
        activeVersion &&
          (activeVersion.eager || activeVersion.shareConfig?.eager),
      );
      if (
        !activeVersion ||
        (activeVersion.strategy !== 'loaded-first' &&
          !activeVersion.loaded &&
          (Boolean(!eager) !== !activeVersionEager
            ? eager
            : hostName > activeVersion.from))
      ) {
        versions[version] = shared;
      }
    };
    const initFn = (mod: RemoteEntryExports) =>
      mod && mod.init && mod.init(shareScope[shareScopeName], initScope);

    const initRemoteModule = async (key: string): Promise<void> => {
      const { module } = await host.remoteHandler.getRemoteModuleAndOptions({
        id: key,
      });
      if (module.getEntry) {
        let remoteEntryExports: RemoteEntryExports;
        try {
          remoteEntryExports = await module.getEntry();
        } catch (error) {
          remoteEntryExports =
            (await host.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
              id: key,
              error,
              from: 'runtime',
              lifecycle: 'beforeLoadShare',
              origin: host,
            })) as RemoteEntryExports;
        }
        if (!module.inited) {
          await initFn(remoteEntryExports);
          module.inited = true;
        }
      }
    };
    Object.keys(host.options.shared).forEach((shareName) => {
      const sharedArr = host.options.shared[shareName];
      sharedArr.forEach((shared) => {
        if (shared.scope.includes(shareScopeName)) {
          register(shareName, shared);
        }
      });
    });
    // TODO: strategy==='version-first' need to be removed in the future
    if (
      host.options.shareStrategy === 'version-first' ||
      strategy === 'version-first'
    ) {
      host.options.remotes.forEach((remote) => {
        if (remote.shareScope === shareScopeName) {
          promises.push(initRemoteModule(remote.name));
        }
      });
    }

    return promises;
  }

  // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
  // 1. If the loaded shared already exists globally, then it will be reused
  // 2. If lib exists in local shared, it will be used directly
  // 3. If the local get returns something other than Promise, then it will be used directly
  loadShareSync<T>(
    pkgName: string,
    extraOptions?: {
      from?: 'build' | 'runtime';
      customShareInfo?: Partial<Shared>;
      resolver?: (sharedOptions: ShareInfos[string]) => Shared;
    },
  ): () => T | never {
    const { host } = this;
    const shareInfo = getTargetSharedOptions({
      pkgName,
      extraOptions,
      shareInfos: host.options.shared,
    });

    if (shareInfo?.scope) {
      shareInfo.scope.forEach((shareScope) => {
        this.initializeSharing(shareScope, { strategy: shareInfo.strategy });
      });
    }
    const registeredShared = getRegisteredShare(
      this.shareScopeMap,
      pkgName,
      shareInfo,
      this.hooks.lifecycle.resolveShare,
    );

    const addUseIn = (shared: Shared): void => {
      if (!shared.useIn) {
        shared.useIn = [];
      }
      addUniqueItem(shared.useIn, host.options.name);
    };

    if (registeredShared) {
      if (typeof registeredShared.lib === 'function') {
        addUseIn(registeredShared);
        if (!registeredShared.loaded) {
          registeredShared.loaded = true;
          if (registeredShared.from === host.options.name) {
            shareInfo.loaded = true;
          }
        }
        return registeredShared.lib as () => T;
      }
      if (typeof registeredShared.get === 'function') {
        const module = registeredShared.get();
        if (!(module instanceof Promise)) {
          addUseIn(registeredShared);
          this.setShared({
            pkgName,
            loaded: true,
            from: host.options.name,
            lib: module,
            shared: registeredShared,
          });
          return module;
        }
      }
    }

    if (shareInfo.lib) {
      if (!shareInfo.loaded) {
        shareInfo.loaded = true;
      }
      return shareInfo.lib as () => T;
    }

    if (shareInfo.get) {
      const module = shareInfo.get();

      if (module instanceof Promise) {
        const errorCode =
          extraOptions?.from === 'build' ? RUNTIME_005 : RUNTIME_006;
        throw new Error(
          getShortErrorMsg(errorCode, runtimeDescMap, {
            hostName: host.options.name,
            sharedPkgName: pkgName,
          }),
        );
      }

      shareInfo.lib = module;

      this.setShared({
        pkgName,
        loaded: true,
        from: host.options.name,
        lib: shareInfo.lib,
        shared: shareInfo,
      });
      return shareInfo.lib as () => T;
    }

    throw new Error(
      getShortErrorMsg(RUNTIME_006, runtimeDescMap, {
        hostName: host.options.name,
        sharedPkgName: pkgName,
      }),
    );
  }

  initShareScopeMap(
    scopeName: string,
    shareScope: ShareScopeMap[string],
    extraOptions: { hostShareScopeMap?: ShareScopeMap } = {},
  ): void {
    const { host } = this;
    this.shareScopeMap[scopeName] = shareScope;
    this.hooks.lifecycle.initContainerShareScopeMap.emit({
      shareScope,
      options: host.options,
      origin: host,
      scopeName,
      hostShareScopeMap: extraOptions.hostShareScopeMap,
    });
  }

  private setShared({
    pkgName,
    shared,
    from,
    lib,
    loading,
    loaded,
    get,
  }: {
    pkgName: string;
    shared: Shared;
    from: string;
    lib: any;
    loaded?: boolean;
    loading?: Shared['loading'];
    get?: Shared['get'];
  }): void {
    const { version, scope = 'default', ...shareInfo } = shared;
    const scopes: string[] = Array.isArray(scope) ? scope : [scope];
    scopes.forEach((sc) => {
      if (!this.shareScopeMap[sc]) {
        this.shareScopeMap[sc] = {};
      }
      if (!this.shareScopeMap[sc][pkgName]) {
        this.shareScopeMap[sc][pkgName] = {};
      }

      if (!this.shareScopeMap[sc][pkgName][version]) {
        this.shareScopeMap[sc][pkgName][version] = {
          version,
          scope: ['default'],
          ...shareInfo,
          lib,
          loaded,
          loading,
        };
        if (get) {
          this.shareScopeMap[sc][pkgName][version].get = get;
        }
        return;
      }

      const registeredShared = this.shareScopeMap[sc][pkgName][version];
      if (loading && !registeredShared.loading) {
        registeredShared.loading = loading;
      }
    });
  }

  private _setGlobalShareScopeMap(hostOptions: Options): void {
    const globalShareScopeMap = getGlobalShareScope();
    const identifier = hostOptions.id || hostOptions.name;
    if (identifier && !globalShareScopeMap[identifier]) {
      globalShareScopeMap[identifier] = this.shareScopeMap;
    }
  }
}
