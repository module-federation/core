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
  InitScope,
  RemoteEntryInitOptions,
} from './type';
import {
  assert,
  warn,
  getBuilderId,
  addUniqueItem,
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
import { getGlobalShareScope } from './utils/share';
import { formatPreloadArgs, preloadAssets } from './utils/preload';
import { generatePreloadAssetsPlugin } from './plugins/generate-preload-assets';
import { snapshotPlugin } from './plugins/snapshot';
import { isBrowserEnv } from './utils/env';
import { getRemoteEntryUniqueKey, getRemoteInfo } from './utils/load';
import { globalLoading } from './global';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from './constant';
import { SnapshotHandler } from './plugins/snapshot/SnapshotHandler';
import { SharedHandler } from './shared';

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
    loadRemoteArgs = await origin.hooks.lifecycle.beforeRequest.emit({
      id,
      options: origin.options,
      origin: origin,
    });
  } catch (error) {
    loadRemoteArgs = (await origin.hooks.lifecycle.errorLoadRemote.emit({
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
    beforeRequest: new AsyncWaterfallHook<{
      id: string;
      options: Options;
      origin: FederationHost;
    }>('beforeRequest'),
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
    onLoad: new AsyncHook<
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
    >('onLoad'),
    handlePreloadModule: new SyncHook<
      {
        id: string;
        name: string;
        remote: Remote;
        remoteSnapshot: ModuleInfo;
        preloadConfig: PreloadRemoteArgs;
        origin: FederationHost;
      },
      void
    >('handlePreloadModule'),
    errorLoadRemote: new AsyncHook<
      [
        {
          id: string;
          error: unknown;
          options?: any;
          from: 'build' | 'runtime';
          lifecycle: 'onLoad' | 'beforeRequest';
          origin: FederationHost;
        },
      ],
      void | unknown
    >('errorLoadRemote'),
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
    // not used yet
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
  sharedHandler: SharedHandler;
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
    this._setGlobalShareScopeMap();
    this.snapshotHandler = new SnapshotHandler(this);
    this.sharedHandler = new SharedHandler();
    this.shareScopeMap = this.sharedHandler.shareScopeMap;
    this.registerPlugins([
      ...defaultOptions.plugins,
      ...(userOptions.plugins || []),
    ]);
    this.options = this.formatOptions(defaultOptions, userOptions);
  }

  private _setGlobalShareScopeMap(): void {
    const globalShareScopeMap = getGlobalShareScope();
    const identifier = this.options.id || this.options.name;
    if (identifier && !globalShareScopeMap[identifier]) {
      globalShareScopeMap[identifier] = this.shareScopeMap;
    }
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
        await getRemoteModuleAndOptions({
          id,
          origin: this,
        });
      const { pkgNameOrAlias, remote, expose, id: idRes } = remoteMatchInfo;
      const moduleOrFactory = (await module.get(expose, options)) as T;

      const moduleWrapper = await this.hooks.lifecycle.onLoad.emit({
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

      if (typeof moduleWrapper === 'function') {
        return moduleWrapper as T;
      }

      return moduleOrFactory;
    } catch (error) {
      const { from = 'runtime' } = options || { from: 'runtime' };

      const failOver = await this.hooks.lifecycle.errorLoadRemote.emit({
        id,
        error,
        from,
        lifecycle: 'onLoad',
        origin: this,
      });

      if (!failOver) {
        throw error;
      }

      return failOver as T;
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

    const userRemotes = userOptionsRes.remotes || [];

    const remotes = userRemotes.reduce((res, remote) => {
      this.registerRemote(remote, res, { force: false });
      return res;
    }, globalOptionsRes.remotes);

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

  private removeRemote(remote: Remote): void {
    const { name } = remote;
    const remoteIndex = this.options.remotes.findIndex(
      (item) => item.name === name,
    );
    if (remoteIndex !== -1) {
      this.options.remotes.splice(remoteIndex, 1);
    }
    const loadedModule = this.moduleCache.get(remote.name);
    if (loadedModule) {
      const key = loadedModule.remoteInfo
        .entryGlobalName as keyof typeof globalThis;
      if (globalThis[key]) {
        delete globalThis[key];
      }
      const remoteEntryUniqueKey = getRemoteEntryUniqueKey(
        loadedModule.remoteInfo,
      );
      if (globalLoading[remoteEntryUniqueKey]) {
        delete globalLoading[remoteEntryUniqueKey];
      }
      this.moduleCache.delete(remote.name);
    }
  }

  private registerRemote(
    remote: Remote,
    targetRemotes: Remote[],
    options?: { force?: boolean },
  ): void {
    const normalizeRemote = () => {
      if (remote.alias) {
        // Validate if alias equals the prefix of remote.name and remote.alias, if so, throw an error
        // As multi-level path references cannot guarantee unique names, alias being a prefix of remote.name is not supported
        const findEqual = targetRemotes.find(
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
        if (isBrowserEnv() && !remote.entry.startsWith('http')) {
          remote.entry = new URL(remote.entry, window.location.origin).href;
        }
      }
      if (!remote.shareScope) {
        remote.shareScope = DEFAULT_SCOPE;
      }
      if (!remote.type) {
        remote.type = DEFAULT_REMOTE_TYPE;
      }
    };
    const registeredRemote = targetRemotes.find(
      (item) => item.name === remote.name,
    );
    if (!registeredRemote) {
      normalizeRemote();
      targetRemotes.push(remote);
    } else {
      const messages = [
        `The remote "${remote.name}" is already registered.`,
        options?.force
          ? 'Hope you have known that OVERRIDE it may have some unexpected errors'
          : 'If you want to merge the remote, you can set "force: true".',
      ];
      if (options?.force) {
        // remove registered remote
        this.removeRemote(registeredRemote);
        normalizeRemote();
        targetRemotes.push(remote);
      }
      warn(messages.join(' '));
    }
  }

  registerRemotes(remotes: Remote[], options?: { force?: boolean }): void {
    remotes.forEach((remote) => {
      this.registerRemote(remote, this.options.remotes, {
        force: options?.force,
      });
    });
  }
}
