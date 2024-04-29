import { Federation } from '../global';
import {
  Options,
  ShareScopeMap,
  ShareInfos,
  Shared,
  RemoteEntryExports,
  UserOptions,
} from '../type';
import {
  LoadRemoteMatch,
  FederationHost,
  getRemoteModuleAndOptions,
} from '../core';
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
} from '../utils/share';
import { assert, addUniqueItem } from '../utils';
import { DEFAULT_SCOPE } from '../constant';

export class SharedHandler {
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
    initContainerShareScopeMap: new AsyncWaterfallHook<{
      shareScope: ShareScopeMap[string];
      options: Options;
      origin: FederationHost;
    }>('initContainer'),
  });

  constructor() {
    this.shareScopeMap = {};
  }

  formatShareConfigs(globalOptions: Options, userOptions: UserOptions) {
    const shareInfos = formatShareConfigs(
      userOptions.shared || {},
      userOptions.name,
    );

    const shared = {
      ...globalOptions.shared,
    };

    Object.keys(shareInfos).forEach((shareKey) => {
      if (!shared[shareKey]) {
        shared[shareKey] = shareInfos[shareKey];
      } else {
        shareInfos[shareKey].forEach((newUserSharedOptions) => {
          const isSameVersion = shared[shareKey].find(
            (sharedVal) => sharedVal.version === newUserSharedOptions.version,
          );
          if (!isSameVersion) {
            shared[shareKey].push(newUserSharedOptions);
          }
        });
      }
    });

    return { shared, shareInfos };
  }

  // register shared in shareScopeMap
  registerShared(shareInfos: ShareInfos, userOptions: UserOptions) {
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
  }

  async loadShare<T>(
    origin: FederationHost,
    pkgName: string,
    extraOptions?: {
      customShareInfo?: Partial<Shared>;
      resolver?: (sharedOptions: ShareInfos[string]) => Shared;
    },
  ): Promise<false | (() => T | undefined)> {
    // This function performs the following steps:
    // 1. Checks if the currently loaded share already exists, if not, it throws an error
    // 2. Searches globally for a matching share, if found, it uses it directly
    // 3. If not found, it retrieves it from the current share and stores the obtained share globally.

    const shareInfo = getTargetSharedOptions({
      pkgName,
      extraOptions,
      shareInfos: origin.options.shared,
    });

    if (shareInfo?.scope) {
      await Promise.all(
        shareInfo.scope.map(async (shareScope) => {
          await Promise.all(
            this.initializeSharing(origin, shareScope, shareInfo.strategy),
          );
          return;
        }),
      );
    }
    const loadShareRes = await this.hooks.lifecycle.beforeLoadShare.emit({
      pkgName,
      shareInfo,
      shared: origin.options.shared,
      origin: origin,
    });

    const { shareInfo: shareInfoRes } = loadShareRes;

    // Assert that shareInfoRes exists, if not, throw an error
    assert(
      shareInfoRes,
      `Cannot find ${pkgName} Share in the ${origin.options.name}. Please ensure that the ${pkgName} Share parameters have been injected`,
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
      addUniqueItem(shared.useIn, origin.options.name);
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
        from: origin.options.name,
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
        from: origin.options.name,
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
    origin: FederationHost,
    shareScopeName = DEFAULT_SCOPE,
    strategy?: Shared['strategy'],
  ): Array<Promise<void>> {
    const shareScope = this.shareScopeMap;
    const hostName = origin.options.name;
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
    const promises: Promise<any>[] = [];
    const initFn = (mod: RemoteEntryExports) =>
      mod && mod.init && mod.init(shareScope[shareScopeName]);

    const initRemoteModule = async (key: string): Promise<void> => {
      const { module } = await getRemoteModuleAndOptions({
        id: key,
        origin,
      });
      if (module.getEntry) {
        const entry = await module.getEntry();
        if (!module.inited) {
          initFn(entry);
          module.inited = true;
        }
      }
    };
    Object.keys(origin.options.shared).forEach((shareName) => {
      const sharedArr = origin.options.shared[shareName];
      sharedArr.forEach((shared) => {
        if (shared.scope.includes(shareScopeName)) {
          register(shareName, shared);
        }
      });
    });
    if (strategy === 'version-first') {
      origin.options.remotes.forEach((remote) => {
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
    origin: FederationHost,
    pkgName: string,
    extraOptions?: {
      customShareInfo?: Partial<Shared>;
      resolver?: (sharedOptions: ShareInfos[string]) => Shared;
    },
  ): () => T | never {
    const shareInfo = getTargetSharedOptions({
      pkgName,
      extraOptions,
      shareInfos: origin.options.shared,
    });

    if (shareInfo?.scope) {
      shareInfo.scope.forEach((shareScope) => {
        this.initializeSharing(origin, shareScope, shareInfo.strategy);
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
      addUniqueItem(shared.useIn, origin.options.name);
    };

    if (registeredShared) {
      if (typeof registeredShared.lib === 'function') {
        addUseIn(registeredShared);
        if (!registeredShared.loaded) {
          registeredShared.loaded = true;
          if (registeredShared.from === origin.options.name) {
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
            from: origin.options.name,
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
        throw new Error(`
        The loadShareSync function was unable to load ${pkgName}. The ${pkgName} could not be found in ${origin.options.name}.
        Possible reasons for failure: \n
        1. The ${pkgName} share was registered with the 'get' attribute, but loadShare was not used beforehand.\n
        2. The ${pkgName} share was not registered with the 'lib' attribute.\n
      `);
      }

      shareInfo.lib = module;

      this.setShared({
        pkgName,
        loaded: true,
        from: origin.options.name,
        lib: shareInfo.lib,
        shared: shareInfo,
      });
      return shareInfo.lib as () => T;
    }

    throw new Error(
      `
        The loadShareSync function was unable to load ${pkgName}. The ${pkgName} could not be found in ${origin.options.name}.
        Possible reasons for failure: \n
        1. The ${pkgName} share was registered with the 'get' attribute, but loadShare was not used beforehand.\n
        2. The ${pkgName} share was not registered with the 'lib' attribute.\n
      `,
    );
  }

  initShareScopeMap(
    origin: FederationHost,
    scopeName: string,
    shareScope: ShareScopeMap[string],
  ): void {
    this.shareScopeMap[scopeName] = shareScope;
    this.hooks.lifecycle.initContainerShareScopeMap.emit({
      shareScope,
      options: origin.options,
      origin: origin,
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

      if (this.shareScopeMap[sc][pkgName][version]) {
        return;
      }

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
    });
  }
}
