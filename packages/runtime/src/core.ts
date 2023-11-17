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
  getGlobalShare,
  getGlobalShareScope,
  formatShareConfigs,
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
  version: string = __VERSION__;
  name: string;
  moduleCache: Map<string, Module> = new Map();
  snapshotHandler: SnapshotHandler;
  loaderHook = new PluginSystem({
    // FIXME: may not suitable
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
  loadingShare: {
    [key: string]: Promise<any>;
  } = {};

  constructor(userOptions: UserOptions) {
    // TODO: check options detail type
    // set options default value
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
    this.snapshotHandler = new SnapshotHandler(this);
    this.registerPlugins([
      ...defaultOptions.plugins,
      ...(userOptions.plugins || []),
    ]);
    this.options = this.formatOptions(defaultOptions, userOptions);
  }

  initOptions(userOptions: UserOptions): Options {
    this.registerPlugins(userOptions.plugins);
    const options = this.formatOptions(this.options, userOptions);

    this.options = options;

    return options;
  }

  // overrideSharedOptions(shareScope: GlobalShareScope[string]): void {}

  async loadShare<T>(
    pkgName: string,
    customShareInfo?: Partial<Shared>,
  ): Promise<false | (() => T | undefined)> {
    // 1. Verify whether the currently loaded share already exists, and report an error if it does not exist
    // 2. Search globally to see if there is a matching share, and if so, use it directly
    // 3. If not, get it from the current share and store the obtained share globally.
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

    assert(
      shareInfoRes,
      `cannot find ${pkgName} Share in the ${this.options.name}. Perhaps you have not injected the ${pkgName} Share parameters`,
    );

    // get from cache
    const globalShare = getGlobalShare(pkgName, shareInfoRes);

    if (globalShare && globalShare.lib) {
      addUniqueItem(globalShare.useIn, this.options.name);
      return globalShare.lib as () => T;
    } else if (globalShare && globalShare.loading) {
      const factory = await globalShare.loading;
      addUniqueItem(globalShare.useIn, this.options.name);
      return factory;
    } else if (globalShare) {
      const asyncLoadProcess = async () => {
        const factory = await globalShare.get();
        shareInfoRes.lib = factory;
        addUniqueItem(shareInfoRes.useIn, this.options.name);
        const gShared = getGlobalShare(pkgName, shareInfoRes);
        if (gShared) {
          gShared.lib = factory;
        }
        return factory as () => T;
      };
      const loading = asyncLoadProcess();
      this.setShared({
        pkgName,
        loaded: true,
        shared: shareInfoRes,
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
        addUniqueItem(shareInfoRes.useIn, this.options.name);
        const gShared = getGlobalShare(pkgName, shareInfoRes);
        if (gShared) {
          gShared.lib = factory;
        }
        return factory as () => T;
      };
      const loading = asyncLoadProcess();
      this.setShared({
        pkgName,
        loaded: true,
        shared: shareInfoRes,
        from: this.options.name,
        lib: null,
        loading,
      });
      return loading;
    }
  }

  // There will be a lib function only if the shared set by eager or runtime init is set or the shared is successfully loaded.
  // 1. If the loaded shared already exists globally, then reuse
  // 2. If lib exists in local shared, use it directly
  // 3. If the local get returns something other than Promise, then use it directly
  loadShareSync<T>(pkgName: string): () => T | never {
    const shareInfo = this.options.shared?.[pkgName];
    const globalShare = getGlobalShare(pkgName, shareInfo);

    if (globalShare && typeof globalShare.lib === 'function') {
      addUniqueItem(globalShare.useIn, this.options.name);
      if (!globalShare.loaded) {
        globalShare.loaded = true;
        if (globalShare.from === this.options.name) {
          shareInfo.loaded = true;
        }
      }
      return globalShare.lib as () => T;
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
        The loadShareSync function failed to load ${pkgName}. Cannot find ${pkgName} in ${this.options.name}.
        Failure reason: \n
        1. Registered ${pkgName} share with the 'get' attribute, but did not use loadShare before.\n
        2. Did not register ${pkgName} share with the 'lib' attribute.\n
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
        The loadShareSync function failed to load ${pkgName}. Cannot find ${pkgName} in ${this.options.name}.
        Failure reason: \n
        1. Registered ${pkgName} share with the 'get' attribute, but did not use loadShare before.\n
        2. Did not register ${pkgName} share with the 'lib' attribute.\n
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
        Cannot find ${idRes} in ${this.options.name}. Possible cause of failure:\n
        1. ${idRes} was not injected into ${this.options.name}'s 'remotes' parameter.\n
        2. Cannot find ${idRes} in ${this.options.name}'s 'remotes' with attribute 'name' or 'alias'.
        3. The 'beforeLoadRemote' hook was provided but did not return the correct 'remoteInfo' when loading ${idRes}.
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
      `The 'beforeLoadRemote' hook was provided but did not return the correct 'remote' and 'expose' when loading ${idRes}.`,
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
      // 1. Verify whether the parameters of the obtained module are legal. There are two module request methods: pkgName + expose and alias + expose.
      // 2. Request the snapshot information of the current host and store the obtained snapshot information globally. The obtained module information is partly offline and partly online. The online module information will obtain the modules used online.
      // 3. Get the detailed information of the current module from global (remoteEntry address, expose resource address)
      // 4. After obtaining remoteEntry, call the init of the module, and then obtain the exported content of the module through get
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
   * The sharing init sequence function (only runs once per share scope).
   * Has one argument, the name of the share scope.
   * Creates a share scope if not existing
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  initializeSharing(
    shareScopeName = DEFAULT_SCOPE,
  ): boolean | Promise<boolean> {
    const shareScopeLoading = Global.__FEDERATION__.__SHARE_SCOPE_LOADING__;
    const shareScope = Global.__FEDERATION__.__SHARE__;
    const hostName = this.options.name;
    // only runs once
    if (shareScopeLoading[shareScopeName]) {
      return shareScopeLoading[shareScopeName];
    }
    // creates a new share scope if needed
    if (!shareScope[shareScopeName]) {
      shareScope[shareScopeName] = {};
    }
    // runs all init snippets from all modules reachable
    const scope = shareScope[shareScopeName];
    const register = (name: string, shared: Shared) => {
      const { version, eager } = shared;
      scope[name] = scope[name] || {};
      const versions = scope[name];
      const activeVersion = versions[version];
      const activeVersionEager = Boolean(
        activeVersion &&
          (activeVersion.eager || activeVersion.shareConfig.eager),
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

    const initRemoteModule = async (key: string): Promise<void> => {
      const { module } = await this._getRemoteModuleAndOptions(key);

      const initFn = (mod: RemoteEntryExports) =>
        mod && mod.init && mod.init(shareScope[shareScopeName]);
      const entry = await module.getEntry();
      initFn(entry);
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

    if (!promises.length) {
      return (shareScopeLoading[shareScopeName] = true);
    }
    return (shareScopeLoading[shareScopeName] = Promise.all(promises).then(
      () => (shareScopeLoading[shareScopeName] = true),
    ));
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
          // 校验 alias 是否等于 remote.name 和 remote.alias 的前缀，如果是则报错
          // 因为引用支持多级路径的引用时无法保证名称是否唯一，所以不支持 alias 为 remote.name 的前缀
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
          // FIXME: The build plugin need to support this field
          remote.type = DEFAULT_REMOTE_TYPE;
        }
        res.push(remote);
      }
      return res;
    }, globalOptionsRes.remotes);

    // register shared include lib
    const sharedKeys = Object.keys(formatShareOptions);
    sharedKeys.forEach((sharedKey) => {
      const sharedVal = formatShareOptions[sharedKey];
      const globalShare = getGlobalShare(sharedKey, sharedVal);
      if (!globalShare && sharedVal && sharedVal.lib) {
        this.setShared({
          pkgName: sharedKey,
          lib: sharedVal.lib,
          get: sharedVal.get,
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
    const target = getGlobalShareScope();
    const { version, scope = 'default', ...shareInfo } = shared;
    const scopes: string[] = Array.isArray(scope) ? scope : [scope];
    scopes.forEach((sc) => {
      if (!target[sc]) {
        target[sc] = {};
      }
      if (!target[sc][pkgName]) {
        target[sc][pkgName] = {};
      }

      if (target[sc][pkgName][version]) {
        warn(
          // eslint-disable-next-line max-len
          `The share \n ${safeToString({
            scope: sc,
            pkgName,
            version,
            from: target[sc][pkgName][version].from,
          })} has been registered`,
        );
        return;
      }

      target[sc][pkgName][version] = {
        version,
        scope: ['default'],
        ...shareInfo,
        lib,
        loaded,
        loading,
      };

      if (get) {
        target[sc][pkgName][version].get = get;
      }
    });
  }
}
