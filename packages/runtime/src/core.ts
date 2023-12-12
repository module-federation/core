import type { ModuleInfo, GlobalModuleInfo } from '@module-federation/sdk';
import {
  Options,
  PreloadAssets,
  PreloadOptions,
  PreloadRemoteArgs,
  RemoteEntryExports,
  Remote,
  Shared,
  ShareInfos,
  UserOptions,
  RemoteInfo,
  ShareScopeMap,
} from './type';
import {
  assert,
  warn,
  getBuilderId,
  addUniqueItem,
  safeToString,
  matchRemoteWithNameAndExpose,
  registerPlugins,
} from './utils';
import { Module, ModuleOptions } from './module';
import {
  AsyncHook,
  AsyncWaterfallHook,
  PluginSystem,
  SyncHook,
  SyncWaterfallHook,
} from './utils/hooks';
import {
  getGlobalShareScope,
  formatShareConfigs,
  getRegisteredShare,
} from './utils/share';
import { formatPreloadArgs, preloadAssets } from './utils/preload';
import { generatePreloadAssetsPlugin } from './plugins/generate-preload-assets';
import { snapshotPlugin } from './plugins/snapshot';
import { isBrowserEnv } from './utils/env';
import { getRemoteInfo } from './utils/load';
import { Global } from './global';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from './constant';
import { SnapshotHandler } from './plugins/snapshot/SnapshotHandler';

interface LoadRemoteMatch {
  id: string;
  pkgNameOrAlias: string;
  expose: string;
  remote: Remote;
  options: Options;
  origin: FederationHost;
  remoteInfo: RemoteInfo;
  remoteSnapshot?: ModuleInfo;
}

export class FederationHost {
  options: Options;
  hooks = new PluginSystem({
    beforeInit: new SyncWaterfallHook<{
      userOptions: UserOptions;
      options: Options;
      origin: FederationHost;
      shareInfo: ShareInfos;
    }>('beforeInit'),
    init: new SyncHook<
      [
        {
          options: Options;
          origin: FederationHost;
        },
      ],
      void
    >(),
    beforeLoadRemote: new AsyncWaterfallHook<{
      id: string;
      options: Options;
      origin: FederationHost;
    }>('beforeLoadRemote'),
    loadRemoteMatch: new AsyncWaterfallHook<LoadRemoteMatch>('loadRemoteMatch'),
    loadRemote: new AsyncHook<
      [
        {
          id: string;
          expose: string;
          pkgNameOrAlias: string;
          remote: Remote;
          options: ModuleOptions;
          origin: FederationHost;
          exposeModule: any;
          exposeModuleFactory: any;
          moduleInstance: Module;
        },
      ],
      void
    >('loadRemote'),
    handlePreloadModule: new SyncHook<
      {
        id: string;
        name: string;
        remoteSnapshot: ModuleInfo;
        preloadConfig: PreloadRemoteArgs;
      },
      void
    >('handlePreloadModule'),
    errorLoadRemote: new AsyncHook<
      [
        {
          id: string;
          error: unknown;
        },
      ],
      void
    >('errorLoadRemote'),
    beforeLoadShare: new AsyncWaterfallHook<{
      pkgName: string;
      shareInfo?: Shared;
      shared: Options['shared'];
      origin: FederationHost;
    }>('beforeLoadShare'),
    loadShare: new AsyncHook<[FederationHost, string, ShareInfos]>(),
    beforePreloadRemote: new AsyncHook<{
      preloadOps: Array<PreloadRemoteArgs>;
      options: Options;
      origin: FederationHost;
    }>(),
    generatePreloadAssets: new AsyncHook<
      [
        {
          origin: FederationHost;
          preloadOptions: PreloadOptions[number];
          remote: Remote;
          remoteInfo: RemoteInfo;
          remoteSnapshot: ModuleInfo;
          globalSnapshot: GlobalModuleInfo;
        },
      ],
      Promise<PreloadAssets>
    >('generatePreloadAssets'),
    afterPreloadRemote: new AsyncHook<{
      preloadOps: Array<PreloadRemoteArgs>;
      options: Options;
      origin: FederationHost;
    }>(),
  });
  releaseNumber = `__RELEASE_NUMBER__`;
  version: string = `__VERSION__`;
  name: string;
  moduleCache: Map<string, Module> = new Map();
  snapshotHandler: SnapshotHandler;
  loaderHook = new PluginSystem({
    // FIXME: may not be suitable
    getModuleInfo: new SyncHook<
      [
        {
          target: Record<string, any>;
          key: any;
        },
      ],
      { value: any | undefined; key: string } | void
    >(),
    createScript: new SyncHook<
      [
        {
          url: string;
        },
      ],
      HTMLScriptElement | void
    >(),
  });
  shareScopeMap: ShareScopeMap;

  constructor(userOptions: UserOptions) {
    // TODO: Validate the details of the options
    // Initialize options with default values
    const defaultOptions: Options = {
      id: getBuilderId(),
      name: userOptions.name,
      plugins: [snapshotPlugin(), generatePreloadAssetsPlugin()],
      remotes: [],
      shared: {},
      inBrowser: isBrowserEnv(),
    };

    this.name = userOptions.name;
    this.options = defaultOptions;
    this.shareScopeMap = {};
    this._setGlobalShareScopeMap();
    this.snapshotHandler = new SnapshotHandler(this);
    this.registerPlugins([
      ...defaultOptions.plugins,
      ...(userOptions.plugins || []),
    ]);
    this.options = this.formatOptions(defaultOptions, userOptions);
  }

  private _setGlobalShareScopeMap(): void {
    const globalShareScopeMap = getGlobalShareScope();
    if (this.options.name && !globalShareScopeMap[this.options.name]) {
      globalShareScopeMap[this.options.name] = this.shareScopeMap;
    }
  }

  initOptions(userOptions: UserOptions): Options {
    this.registerPlugins(userOptions.plugins);
    const options = this.formatOptions(this.options, userOptions);

    this.options = options;

    return options;
  }

  // overrideSharedOptions(shareScope: GlobalShareScopeMap[string]): void {}

  async loadShare<T>(
    pkgName: string,
    customShareInfo?: Partial<Shared>,
  ): Promise<false | (() => T | undefined)> {
    // This function performs the following steps:
    // 1. Checks if the currently loaded share already exists, if not, it throws an error
    // 2. Searches globally for a matching share, if found, it uses it directly
    // 3. If not found, it retrieves it from the current share and stores the obtained share globally.
    const shareInfo = Object.assign(
      {},
      this.options.shared?.[pkgName],
      customShareInfo,
    );

    const loadShareRes = await this.hooks.lifecycle.beforeLoadShare.emit({
      pkgName,
      shareInfo,
      shared: this.options.shared,
      origin: this,
    });

    const { shareInfo: shareInfoRes } = loadShareRes;

    // Assert that shareInfoRes exists, if not, throw an error
    assert(
      shareInfoRes,
      `Cannot find ${pkgName} Share in the ${this.options.name}. Please ensure that the ${pkgName} Share parameters have been injected`,
    );

    // Retrieve from cache
    const registeredShared = getRegisteredShare(
      this.options.name,
      pkgName,
      shareInfoRes,
    );

    const addUseIn = (shared: Shared): void => {
      if (!shared.useIn) {
        shared.useIn = [];
      }
      addUniqueItem(shared.useIn, this.options.name);
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
          this.options.name,
          pkgName,
          shareInfoRes,
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
        from: this.options.name,
        lib: null,
        loading,
      });
      return loading;
    } else {
      if (customShareInfo) {
        return false;
      }
      const asyncLoadProcess = async () => {
        const factory = await shareInfoRes.get();
        shareInfoRes.lib = factory;
        shareInfoRes.loaded = true;
        addUseIn(shareInfoRes);
        const gShared = getRegisteredShare(
          this.options.name,
          pkgName,
          shareInfoRes,
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
        from: this.options.name,
        lib: null,
        loading,
      });
      return loading;
    }
  }

  // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
  // 1. If the loaded shared already exists globally, then it will be reused
  // 2. If lib exists in local shared, it will be used directly
  // 3. If the local get returns something other than Promise, then it will be used directly
  loadShareSync<T>(pkgName: string): () => T | never {
    const shareInfo = this.options.shared?.[pkgName];
    const registeredShared = getRegisteredShare(
      this.options.name,
      pkgName,
      shareInfo,
    );

    if (registeredShared && typeof registeredShared.lib === 'function') {
      addUniqueItem(registeredShared.useIn, this.options.name);
      if (!registeredShared.loaded) {
        registeredShared.loaded = true;
        if (registeredShared.from === this.options.name) {
          shareInfo.loaded = true;
        }
      }
      return registeredShared.lib as () => T;
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
        The loadShareSync function was unable to load ${pkgName}. The ${pkgName} could not be found in ${this.options.name}.
        Possible reasons for failure: \n
        1. The ${pkgName} share was registered with the 'get' attribute, but loadShare was not used beforehand.\n
        2. The ${pkgName} share was not registered with the 'lib' attribute.\n
      `);
      }

      shareInfo.lib = module;

      this.setShared({
        pkgName,
        loaded: true,
        from: this.options.name,
        lib: shareInfo.lib,
        shared: shareInfo,
      });
      return shareInfo.lib as () => T;
    }

    throw new Error(
      `
        The loadShareSync function was unable to load ${pkgName}. The ${pkgName} could not be found in ${this.options.name}.
        Possible reasons for failure: \n
        1. The ${pkgName} share was registered with the 'get' attribute, but loadShare was not used beforehand.\n
        2. The ${pkgName} share was not registered with the 'lib' attribute.\n
      `,
    );
  }

  private async _getRemoteModuleAndOptions(id: string): Promise<{
    module: Module;
    moduleOptions: ModuleOptions;
    remoteMatchInfo: LoadRemoteMatch;
  }> {
    const loadRemoteArgs = await this.hooks.lifecycle.beforeLoadRemote.emit({
      id,
      options: this.options,
      origin: this,
    });

    const { id: idRes } = loadRemoteArgs;

    const remoteSplitInfo = matchRemoteWithNameAndExpose(
      this.options.remotes,
      idRes,
    );

    assert(
      remoteSplitInfo,
      `
        Unable to locate ${idRes} in ${
          this.options.name
        }. Potential reasons for failure include:\n
        1. ${idRes} was not included in the 'remotes' parameter of ${
          this.options.name || 'the host'
        }.\n
        2. ${idRes} could not be found in the 'remotes' of ${
          this.options.name
        } with either 'name' or 'alias' attributes.
        3. ${idRes} is not online, injected, or loaded.
        4. ${idRes}  cannot be accessed on the expected.
        5. The 'beforeLoadRemote' hook was provided but did not return the correct 'remoteInfo' when attempting to load ${idRes}.
      `,
    );

    const { remote: rawRemote } = remoteSplitInfo;
    const remoteInfo = getRemoteInfo(rawRemote);
    const matchInfo = await this.hooks.lifecycle.loadRemoteMatch.emit({
      id: idRes,
      ...remoteSplitInfo,
      options: this.options,
      origin: this,
      remoteInfo,
    });

    const { remote, expose } = matchInfo;
    assert(
      remote && expose,
      `The 'beforeLoadRemote' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${idRes}.`,
    );
    let module: Module | undefined = this.moduleCache.get(remote.name);

    const moduleOptions: ModuleOptions = {
      hostInfo: {
        name: this.options.name,
        version: this.options.version || 'custom',
      },
      remoteInfo,
      shared: this.options.shared || {},
      plugins: this.options.plugins,
      loaderHook: this.loaderHook,
    };

    if (!module) {
      module = new Module(moduleOptions);
      this.moduleCache.set(remote.name, module);
    }
    return {
      module,
      moduleOptions,
      remoteMatchInfo: matchInfo,
    };
  }

  // eslint-disable-next-line max-lines-per-function
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async loadRemote<T>(
    id: string,
    options?: { loadFactory?: boolean },
  ): Promise<T | null> {
    try {
      const { loadFactory = true } = options || { loadFactory: true };
      // 1. Validate the parameters of the retrieved module. There are two module request methods: pkgName + expose and alias + expose.
      // 2. Request the snapshot information of the current host and globally store the obtained snapshot information. The retrieved module information is partially offline and partially online. The online module information will retrieve the modules used online.
      // 3. Retrieve the detailed information of the current module from global (remoteEntry address, expose resource address)
      // 4. After retrieving remoteEntry, call the init of the module, and then retrieve the exported content of the module through get
      // id: pkgName(@federation/app1) + expose(button) = @federation/app1/button
      // id: alias(app1) + expose(button) = app1/button
      // id: alias(app1/utils) + expose(loadash/sort) = app1/utils/loadash/sort
      const { module, moduleOptions, remoteMatchInfo } =
        await this._getRemoteModuleAndOptions(id);
      const { pkgNameOrAlias, remote, expose, id: idRes } = remoteMatchInfo;
      const moduleOrFactory = (await module.get(expose, options)) as T;

      await this.hooks.lifecycle.loadRemote.emit({
        id: idRes,
        pkgNameOrAlias,
        expose,
        exposeModule: loadFactory ? moduleOrFactory : undefined,
        exposeModuleFactory: loadFactory ? undefined : moduleOrFactory,
        remote,
        options: moduleOptions,
        moduleInstance: module,
        origin: this,
      });
      return moduleOrFactory;
    } catch (error) {
      this.hooks.lifecycle.errorLoadRemote.emit({
        id,
        error,
      });
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  async preloadRemote(preloadOptions: Array<PreloadRemoteArgs>): Promise<void> {
    await this.hooks.lifecycle.beforePreloadRemote.emit({
      preloadOptions,
      options: this.options,
      origin: this,
    });

    const preloadOps: PreloadOptions = formatPreloadArgs(
      this.options.remotes,
      preloadOptions,
    );

    await Promise.all(
      preloadOps.map(async (ops) => {
        const { remote } = ops;
        const remoteInfo = getRemoteInfo(remote);
        const { globalSnapshot, remoteSnapshot } =
          await this.snapshotHandler.loadRemoteSnapshotInfo(remote);

        const assets = await this.hooks.lifecycle.generatePreloadAssets.emit({
          origin: this,
          preloadOptions: ops,
          remote,
          remoteInfo,
          globalSnapshot,
          remoteSnapshot,
        });
        if (!assets) {
          return;
        }
        preloadAssets(remoteInfo, this, assets);
      }),
    );
  }

  /**
   * This function initializes the sharing sequence (executed only once per share scope).
   * It accepts one argument, the name of the share scope.
   * If the share scope does not exist, it creates one.
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  initializeSharing(shareScopeName = DEFAULT_SCOPE): Array<Promise<void>> {
    const globalShareScope = Global.__FEDERATION__.__SHARE__;
    const hostName = this.options.name;
    if (!globalShareScope[hostName]) {
      globalShareScope[hostName] = {};
    }
    const shareScope = globalShareScope[hostName];

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
        (!activeVersion.loaded &&
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
      const { module } = await this._getRemoteModuleAndOptions(key);
      const entry = await module.getEntry();
      if(!module.inited){
        initFn(entry);
        module.inited = true
      }
    };
    Object.keys(this.options.shared).forEach((shareName) => {
      const shared = this.options.shared[shareName];
      if (shared.scope.includes(shareScopeName)) {
        register(shareName, shared);
      }
    });
    this.options.remotes.forEach((remote) => {
      if (remote.shareScope === shareScopeName) {
        promises.push(initRemoteModule(remote.name));
      }
    });
    return promises;
  }

  initShareScopeMap(
    scopeName: string,
    shareScope: ShareScopeMap[string],
  ): void {
    // compat prev consumers
    if ('version' in shareScope && typeof shareScope['version'] !== 'object') {
      return;
    }
    if ('region' in shareScope && typeof shareScope['region'] !== 'object') {
      return;
    }

    this.shareScopeMap[scopeName] = shareScope;
  }

  private formatOptions(
    globalOptions: Options,
    userOptions: UserOptions,
  ): Options {
    const formatShareOptions = formatShareConfigs(
      userOptions.shared || {},
      userOptions.name,
    );
    const shared = {
      ...globalOptions.shared,
      ...formatShareOptions,
    };

    const { userOptions: userOptionsRes, options: globalOptionsRes } =
      this.hooks.lifecycle.beforeInit.emit({
        origin: this,
        userOptions,
        options: globalOptions,
        shareInfo: shared,
      });

    const userRemotes = userOptionsRes.remotes || [];

    const remotes = userRemotes.reduce((res, remote) => {
      if (!res.find((item) => item.name === remote.name)) {
        if (remote.alias) {
          // Validate if alias equals the prefix of remote.name and remote.alias, if so, throw an error
          // As multi-level path references cannot guarantee unique names, alias being a prefix of remote.name is not supported
          const findEqual = res.find(
            (item) =>
              remote.alias &&
              (item.name.startsWith(remote.alias) ||
                item.alias?.startsWith(remote.alias)),
          );
          assert(
            !findEqual,
            `The alias ${remote.alias} of remote ${
              remote.name
            } is not allowed to be the prefix of ${
              findEqual && findEqual.name
            } name or alias`,
          );
        }
        // Set the remote entry to a complete path
        if ('entry' in remote) {
          if (isBrowserEnv()) {
            remote.entry = new URL(remote.entry, window.location.origin).href;
          }
        }
        if (!remote.shareScope) {
          remote.shareScope = DEFAULT_SCOPE;
        }
        if (!remote.type) {
          // FIXME: The build plugin needs to support this field
          remote.type = DEFAULT_REMOTE_TYPE;
        }
        res.push(remote);
      }
      return res;
    }, globalOptionsRes.remotes);

    // register shared in shareScopeMap
    const sharedKeys = Object.keys(formatShareOptions);
    sharedKeys.forEach((sharedKey) => {
      const sharedVal = formatShareOptions[sharedKey];
      const registeredShared = getRegisteredShare(
        userOptions.name,
        sharedKey,
        sharedVal,
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

    const plugins = [...globalOptionsRes.plugins];

    if (userOptionsRes.plugins) {
      userOptionsRes.plugins.forEach((plugin) => {
        if (!plugins.includes(plugin)) {
          plugins.push(plugin);
        }
      });
    }

    const optionsRes: Options = {
      ...globalOptions,
      ...userOptions,
      plugins,
      remotes,
      shared,
    };

    this.hooks.lifecycle.init.emit({
      origin: this,
      options: optionsRes,
    });
    return optionsRes;
  }

  private registerPlugins(plugins: UserOptions['plugins']) {
    registerPlugins(plugins, [
      this.hooks,
      this.snapshotHandler.hooks,
      this.loaderHook,
    ]);
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
    shared: ShareInfos[keyof ShareInfos];
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
        warn(
          // eslint-disable-next-line max-len
          `The share \n ${safeToString({
            scope: sc,
            pkgName,
            version,
            from: this.shareScopeMap[sc][pkgName][version].from,
          })} has been registered`,
        );
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
