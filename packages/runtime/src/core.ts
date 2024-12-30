import { isBrowserEnv } from '@module-federation/sdk';
import type {
  CreateScriptHookReturn,
  ModuleInfo,
} from '@module-federation/sdk';
import {
  Options,
  PreloadRemoteArgs,
  RemoteEntryExports,
  Remote,
  Shared,
  ShareInfos,
  UserOptions,
  RemoteInfo,
  ShareScopeMap,
  InitScope,
  RemoteEntryInitOptions,
  InitTokens,
  CallFrom,
} from './type';
import { getBuilderId, registerPlugins, getRemoteEntry } from './utils';
import { Module } from './module';
import {
  AsyncHook,
  AsyncWaterfallHook,
  PluginSystem,
  SyncHook,
  SyncWaterfallHook,
} from './utils/hooks';
import { generatePreloadAssetsPlugin } from './plugins/generate-preload-assets';
import { snapshotPlugin } from './plugins/snapshot';
import { getRemoteInfo } from './utils/load';
import { DEFAULT_SCOPE } from './constant';
import { SnapshotHandler } from './plugins/snapshot/SnapshotHandler';
import { SharedHandler } from './shared';
import { RemoteHandler } from './remote';
import { formatShareConfigs } from './utils/share';

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
    // maybe will change, temporarily for internal use only
    beforeInitContainer: new AsyncWaterfallHook<{
      shareScope: ShareScopeMap[string];
      initScope: InitScope;
      remoteEntryInitOptions: RemoteEntryInitOptions;
      remoteInfo: RemoteInfo;
      origin: FederationHost;
    }>('beforeInitContainer'),
    // maybe will change, temporarily for internal use only
    initContainer: new AsyncWaterfallHook<{
      shareScope: ShareScopeMap[string];
      initScope: InitScope;
      remoteEntryInitOptions: RemoteEntryInitOptions;
      remoteInfo: RemoteInfo;
      remoteEntryExports: RemoteEntryExports;
      origin: FederationHost;
      id: string;
      remoteSnapshot?: ModuleInfo;
    }>('initContainer'),
  });
  version: string = __VERSION__;
  name: string;
  moduleCache: Map<string, Module> = new Map();
  snapshotHandler: SnapshotHandler;
  sharedHandler: SharedHandler;
  remoteHandler: RemoteHandler;
  shareScopeMap: ShareScopeMap;
  loaderHook = new PluginSystem({
    // FIXME: may not be suitable , not open to the public yet
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
          attrs?: Record<string, any>;
        },
      ],
      CreateScriptHookReturn
    >(),
    createLink: new SyncHook<
      [
        {
          url: string;
          attrs?: Record<string, any>;
        },
      ],
      HTMLLinkElement | void
    >(),
    fetch: new AsyncHook<
      [string, RequestInit],
      Promise<Response> | void | false
    >(),
    loadEntryError: new AsyncHook<
      [
        {
          getRemoteEntry: typeof getRemoteEntry;
          origin: FederationHost;
          remoteInfo: RemoteInfo;
          remoteEntryExports?: RemoteEntryExports | undefined;
          globalLoading: Record<
            string,
            Promise<void | RemoteEntryExports> | undefined
          >;
          uniqueKey: string;
        },
      ],
      Promise<(() => Promise<RemoteEntryExports | undefined>) | undefined>
    >(),
    getModuleFactory: new AsyncHook<
      [
        {
          remoteEntryExports: RemoteEntryExports;
          expose: string;
          moduleInfo: RemoteInfo;
        },
      ],
      Promise<(() => Promise<Module>) | undefined>
    >(),
  });
  bridgeHook = new PluginSystem({
    beforeBridgeRender: new SyncHook<
      [Record<string, any>],
      void | Record<string, any>
    >(),
    afterBridgeRender: new SyncHook<
      [Record<string, any>],
      void | Record<string, any>
    >(),
    beforeBridgeDestroy: new SyncHook<
      [Record<string, any>],
      void | Record<string, any>
    >(),
    afterBridgeDestroy: new SyncHook<
      [Record<string, any>],
      void | Record<string, any>
    >(),
  });

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
    this.snapshotHandler = new SnapshotHandler(this);
    this.sharedHandler = new SharedHandler(this);
    this.remoteHandler = new RemoteHandler(this);
    this.shareScopeMap = this.sharedHandler.shareScopeMap;
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

  async loadShare<T>(
    pkgName: string,
    extraOptions?: {
      customShareInfo?: Partial<Shared>;
      resolver?: (sharedOptions: ShareInfos[string]) => Shared;
    },
  ): Promise<false | (() => T | undefined)> {
    return this.sharedHandler.loadShare(pkgName, extraOptions);
  }

  // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
  // 1. If the loaded shared already exists globally, then it will be reused
  // 2. If lib exists in local shared, it will be used directly
  // 3. If the local get returns something other than Promise, then it will be used directly
  loadShareSync<T>(
    pkgName: string,
    extraOptions?: {
      customShareInfo?: Partial<Shared>;
      from?: 'build' | 'runtime';
      resolver?: (sharedOptions: ShareInfos[string]) => Shared;
    },
  ): () => T | never {
    return this.sharedHandler.loadShareSync(pkgName, extraOptions);
  }

  initializeSharing(
    shareScopeName = DEFAULT_SCOPE,
    extraOptions?: {
      initScope?: InitScope;
      from?: CallFrom;
      strategy?: Shared['strategy'];
    },
  ): Array<Promise<void>> {
    return this.sharedHandler.initializeSharing(shareScopeName, extraOptions);
  }

  initRawContainer(
    name: string,
    url: string,
    container: RemoteEntryExports,
  ): Module {
    const remoteInfo = getRemoteInfo({ name, entry: url });
    const module = new Module({ host: this, remoteInfo });

    module.remoteEntryExports = container;
    this.moduleCache.set(name, module);

    return module;
  }

  // eslint-disable-next-line max-lines-per-function
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async loadRemote<T>(
    id: string,
    options?: { loadFactory?: boolean; from: CallFrom },
  ): Promise<T | null> {
    return this.remoteHandler.loadRemote(id, options);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  async preloadRemote(preloadOptions: Array<PreloadRemoteArgs>): Promise<void> {
    return this.remoteHandler.preloadRemote(preloadOptions);
  }

  initShareScopeMap(
    scopeName: string,
    shareScope: ShareScopeMap[string],
    extraOptions: { hostShareScopeMap?: ShareScopeMap } = {},
  ): void {
    this.sharedHandler.initShareScopeMap(scopeName, shareScope, extraOptions);
  }

  formatOptions(globalOptions: Options, userOptions: UserOptions): Options {
    const { shared } = formatShareConfigs(globalOptions, userOptions);
    const { userOptions: userOptionsRes, options: globalOptionsRes } =
      this.hooks.lifecycle.beforeInit.emit({
        origin: this,
        userOptions,
        options: globalOptions,
        shareInfo: shared,
      });

    const remotes = this.remoteHandler.formatAndRegisterRemote(
      globalOptionsRes,
      userOptionsRes,
    );

    const { shared: handledShared } = this.sharedHandler.registerShared(
      globalOptionsRes,
      userOptionsRes,
    );

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
      shared: handledShared,
    };

    this.hooks.lifecycle.init.emit({
      origin: this,
      options: optionsRes,
    });
    return optionsRes;
  }

  registerPlugins(plugins: UserOptions['plugins']) {
    const pluginRes = registerPlugins(plugins, [
      this.hooks,
      this.remoteHandler.hooks,
      this.sharedHandler.hooks,
      this.snapshotHandler.hooks,
      this.loaderHook,
      this.bridgeHook,
    ]);
    // Merge plugin
    this.options.plugins = this.options.plugins.reduce((res, plugin) => {
      if (!plugin) return res;
      if (res && !res.find((item) => item.name === plugin.name)) {
        res.push(plugin);
      }
      return res;
    }, pluginRes || []);
  }

  registerRemotes(remotes: Remote[], options?: { force?: boolean }): void {
    return this.remoteHandler.registerRemotes(remotes, options);
  }
}
