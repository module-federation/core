import type { ModuleInfo } from '@module-federation/sdk';
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
} from './type';
import {
  assert,
  getBuilderId,
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
import { generatePreloadAssetsPlugin } from './plugins/generate-preload-assets';
import { snapshotPlugin } from './plugins/snapshot';
import { isBrowserEnv } from './utils/env';
import { getRemoteInfo } from './utils/load';
import { DEFAULT_SCOPE } from './constant';
import { SnapshotHandler } from './plugins/snapshot/SnapshotHandler';
import { SharedHandler } from './shared';
import { RemoteHandler } from './remote';

export interface LoadRemoteMatch {
  id: string;
  pkgNameOrAlias: string;
  expose: string;
  remote: Remote;
  options: Options;
  origin: FederationHost;
  remoteInfo: RemoteInfo;
  remoteSnapshot?: ModuleInfo;
}

export async function getRemoteModuleAndOptions(options: {
  id: string;
  origin: FederationHost;
}): Promise<{
  module: Module;
  moduleOptions: ModuleOptions;
  remoteMatchInfo: LoadRemoteMatch;
}> {
  const { id, origin } = options;
  let loadRemoteArgs;

  try {
    loadRemoteArgs =
      await origin.remoteHandler.hooks.lifecycle.beforeRequest.emit({
        id,
        options: origin.options,
        origin: origin,
      });
  } catch (error) {
    loadRemoteArgs =
      (await origin.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
        id,
        options: origin.options,
        origin: origin,
        from: 'runtime',
        error,
        lifecycle: 'beforeRequest',
      })) as {
        id: string;
        options: Options;
        origin: FederationHost;
      };

    if (!loadRemoteArgs) {
      throw error;
    }
  }

  const { id: idRes } = loadRemoteArgs;

  const remoteSplitInfo = matchRemoteWithNameAndExpose(
    origin.options.remotes,
    idRes,
  );

  assert(
    remoteSplitInfo,
    `
      Unable to locate ${idRes} in ${
        origin.options.name
      }. Potential reasons for failure include:\n
      1. ${idRes} was not included in the 'remotes' parameter of ${
        origin.options.name || 'the host'
      }.\n
      2. ${idRes} could not be found in the 'remotes' of ${
        origin.options.name
      } with either 'name' or 'alias' attributes.
      3. ${idRes} is not online, injected, or loaded.
      4. ${idRes}  cannot be accessed on the expected.
      5. The 'beforeRequest' hook was provided but did not return the correct 'remoteInfo' when attempting to load ${idRes}.
    `,
  );

  const { remote: rawRemote } = remoteSplitInfo;
  const remoteInfo = getRemoteInfo(rawRemote);
  const matchInfo =
    await origin.sharedHandler.hooks.lifecycle.afterResolve.emit({
      id: idRes,
      ...remoteSplitInfo,
      options: origin.options,
      origin: origin,
      remoteInfo,
    });

  const { remote, expose } = matchInfo;
  assert(
    remote && expose,
    `The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${idRes}.`,
  );
  let module: Module | undefined = origin.moduleCache.get(remote.name);

  const moduleOptions: ModuleOptions = {
    host: origin,
    remoteInfo,
  };

  if (!module) {
    module = new Module(moduleOptions);
    origin.moduleCache.set(remote.name, module);
  }
  return {
    module,
    moduleOptions,
    remoteMatchInfo: matchInfo,
  };
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
        },
      ],
      HTMLScriptElement | void
    >(),
    createLink: new SyncHook<
      [
        {
          url: string;
        },
      ],
      HTMLLinkElement | void
    >(),
    // only work for manifest , so not open to the public yet
    fetch: new AsyncHook<
      [string, RequestInit],
      Promise<Response> | void | false
    >('fetch'),
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
    this.sharedHandler = new SharedHandler(this.options);
    this.remoteHandler = new RemoteHandler();
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
    return this.sharedHandler.loadShare(this, pkgName, extraOptions);
  }

  // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
  // 1. If the loaded shared already exists globally, then it will be reused
  // 2. If lib exists in local shared, it will be used directly
  // 3. If the local get returns something other than Promise, then it will be used directly
  loadShareSync<T>(
    pkgName: string,
    extraOptions?: {
      customShareInfo?: Partial<Shared>;
      resolver?: (sharedOptions: ShareInfos[string]) => Shared;
    },
  ): () => T | never {
    return this.sharedHandler.loadShareSync(this, pkgName, extraOptions);
  }

  initializeSharing(
    shareScopeName = DEFAULT_SCOPE,
    strategy?: Shared['strategy'],
  ): Array<Promise<void>> {
    return this.sharedHandler.initializeSharing(this, shareScopeName, strategy);
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
    options?: { loadFactory?: boolean; from: 'build' | 'runtime' },
  ): Promise<T | null> {
    return this.remoteHandler.loadRemote(this, id, options);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  async preloadRemote(preloadOptions: Array<PreloadRemoteArgs>): Promise<void> {
    return this.remoteHandler.preloadRemote(this, preloadOptions);
  }

  initShareScopeMap(
    scopeName: string,
    shareScope: ShareScopeMap[string],
  ): void {
    this.sharedHandler.initShareScopeMap(this, scopeName, shareScope);
  }

  private formatOptions(
    globalOptions: Options,
    userOptions: UserOptions,
  ): Options {
    const { shared, shareInfos } = this.sharedHandler.formatShareConfigs(
      globalOptions,
      userOptions,
    );
    const { userOptions: userOptionsRes, options: globalOptionsRes } =
      this.hooks.lifecycle.beforeInit.emit({
        origin: this,
        userOptions,
        options: globalOptions,
        shareInfo: shared,
      });

    const remotes = this.remoteHandler.formatRemote(
      this,
      globalOptionsRes,
      userOptionsRes,
    );

    this.sharedHandler.registerShared(shareInfos, userOptions);

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

  registerPlugins(plugins: UserOptions['plugins']) {
    const pluginRes = registerPlugins(plugins, [
      this.hooks,
      this.remoteHandler.hooks,
      this.sharedHandler.hooks,
      this.snapshotHandler.hooks,
      this.loaderHook,
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
    return this.remoteHandler.registerRemotes(this, remotes, options);
  }
}
