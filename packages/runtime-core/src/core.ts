import { isBrowserEnvValue } from '@module-federation/sdk/core';
import type {
  CreateLinkHookReturnDom,
  CreateScriptHookReturn,
  GlobalModuleInfo,
  ModuleInfo,
} from '@module-federation/sdk/core';
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
  CallFrom,
  ResourceLoadContext,
  LoadShareExtraOptions,
  SharedLoadContext,
} from './type';
import { getBuilderId, registerPlugins, getRemoteEntry, error } from './utils';
import {
  getShortErrorMsg,
  RUNTIME_010,
  runtimeDescMap,
} from '@module-federation/error-codes';
import type { Module, RemoteModuleFactory } from './module';
import {
  AsyncHook,
  AsyncWaterfallHook,
  PluginSystem,
  SyncHook,
  SyncWaterfallHook,
} from './utils/hooks';
import { DEFAULT_SCOPE } from './constant';
import type { SnapshotHandler } from './plugins/snapshot/SnapshotHandler';
import { DisabledSnapshotHandler } from './plugins/snapshot/disabled';
import type { SharedHandler } from './shared';
import { DisabledSharedHandler } from './shared/disabled';
import type { RemoteHandler } from './remote';
import { DisabledRemoteHandler } from './remote/disabled';

// ponytail: prototype capability shapes, typed loosely on purpose.
export type Capabilities = {
  shared?: {
    create(host: ModuleFederation): any;
    formatShareConfigs(g: Options, u: UserOptions): { allShareInfos: any };
  };
  remote?: { create(host: ModuleFederation): { remote: any; snapshot: any } };
  snapshot?: { plugins(): any[] };
  platform?: {
    name: string;
    isBrowser(): boolean;
    loadEntry(ctx: any): Promise<any>;
    loadScript(url: string, info: any): Promise<unknown>;
  };
};

type BridgeHookContext = object;
type BridgeHookResult = {
  context: BridgeHookContext;
  result?: unknown;
};
export class ModuleFederation {
  options: Options;
  hooks = new PluginSystem({
    beforeInit: new SyncWaterfallHook<{
      userOptions: UserOptions;
      options: Options;
      origin: ModuleFederation;
      /**
       * @deprecated shareInfo will be removed soon, please use userOptions directly!
       */
      shareInfo: ShareInfos;
    }>('beforeInit'),
    init: new SyncHook<
      [
        {
          options: Options;
          origin: ModuleFederation;
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
      origin: ModuleFederation;
    }>('beforeInitContainer'),
    // maybe will change, temporarily for internal use only
    initContainer: new AsyncWaterfallHook<{
      shareScope: ShareScopeMap[string];
      initScope: InitScope;
      remoteEntryInitOptions: RemoteEntryInitOptions;
      remoteInfo: RemoteInfo;
      remoteEntryExports: RemoteEntryExports;
      origin: ModuleFederation;
      id?: string;
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
          /**
           * The producer(remote) info bound to this resource.
           * Only present when the loader is invoked in a remote-related context
           * (e.g. preloadRemote / loading remoteEntry).
           */
          remoteInfo?: RemoteInfo;
          resourceContext?: ResourceLoadContext;
        },
      ],
      CreateScriptHookReturn
    >(),
    createLink: new SyncHook<
      [
        {
          url: string;
          attrs?: Record<string, any>;
          /**
           * The producer(remote) info bound to this resource.
           * Only present when the loader is invoked in a remote-related context
           * (e.g. preloadRemote / loading remoteEntry).
           */
          remoteInfo?: RemoteInfo;
          resourceContext?: ResourceLoadContext;
        },
      ],
      CreateLinkHookReturnDom
    >(),
    fetch: new AsyncHook<
      [string, RequestInit, RemoteInfo?, ResourceLoadContext?],
      Promise<Response> | void | false
    >(),
    loadEntryError: new AsyncHook<
      [
        {
          getRemoteEntry: typeof getRemoteEntry;
          origin: ModuleFederation;
          remoteInfo: RemoteInfo;
          remoteEntryExports?: RemoteEntryExports | undefined;
          globalLoading: Record<
            string,
            Promise<void | RemoteEntryExports> | undefined
          >;
          uniqueKey: string;
        },
      ],
      Promise<Promise<RemoteEntryExports | undefined> | undefined>
    >(),
    afterLoadEntry: new AsyncHook<
      [
        {
          origin: ModuleFederation;
          remoteInfo: RemoteInfo;
          remoteEntryExports?: RemoteEntryExports | false | void;
          resourceContext?: ResourceLoadContext;
          cached?: boolean;
          error?: unknown;
          recovered?: boolean;
        },
      ],
      void
    >('afterLoadEntry'),
    beforeInitRemote: new AsyncHook<
      [
        {
          id?: string;
          remoteInfo: RemoteInfo;
          remoteSnapshot?: ModuleInfo;
          origin: ModuleFederation;
        },
      ],
      void
    >('beforeInitRemote'),
    afterInitRemote: new AsyncHook<
      [
        {
          id?: string;
          remoteInfo: RemoteInfo;
          remoteSnapshot?: ModuleInfo;
          remoteEntryExports?: RemoteEntryExports;
          error?: unknown;
          cached?: boolean;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterInitRemote'),
    beforeGetExpose: new AsyncHook<
      [
        {
          id: string;
          expose: string;
          moduleInfo: RemoteInfo;
          remoteEntryExports: RemoteEntryExports;
          origin: ModuleFederation;
        },
      ],
      void
    >('beforeGetExpose'),
    afterGetExpose: new AsyncHook<
      [
        {
          id: string;
          expose: string;
          moduleInfo: RemoteInfo;
          remoteEntryExports: RemoteEntryExports;
          moduleFactory?: RemoteModuleFactory;
          error?: unknown;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterGetExpose'),
    beforeExecuteFactory: new AsyncHook<
      [
        {
          id: string;
          expose: string;
          moduleInfo: RemoteInfo;
          loadFactory: boolean;
          origin: ModuleFederation;
        },
      ],
      void
    >('beforeExecuteFactory'),
    afterExecuteFactory: new AsyncHook<
      [
        {
          id: string;
          expose: string;
          moduleInfo: RemoteInfo;
          loadFactory: boolean;
          exposeModule?: unknown;
          error?: unknown;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterExecuteFactory'),
    getModuleFactory: new AsyncHook<
      [
        {
          remoteEntryExports: RemoteEntryExports;
          expose: string;
          moduleInfo: RemoteInfo;
        },
      ],
      RemoteModuleFactory | Promise<RemoteModuleFactory | undefined> | undefined
    >(),
  });
  bridgeHook = new PluginSystem({
    beforeBridgeRender: new SyncHook<
      [Record<string, any>, BridgeHookContext?],
      void | Record<string, any>
    >(),
    afterBridgeRender: new SyncHook<
      [Record<string, any>, BridgeHookResult?],
      void | Record<string, any>
    >(),
    beforeBridgeDestroy: new SyncHook<
      [Record<string, any>, BridgeHookContext?],
      void | Record<string, any>
    >(),
    afterBridgeDestroy: new SyncHook<
      [Record<string, any>, BridgeHookResult?],
      void | Record<string, any>
    >(),
    afterBridgeRouteSync: new SyncHook<[BridgeHookResult], void>(),
  });
  moduleInfo?: GlobalModuleInfo[string];

  capabilities: Capabilities;
  platform: Capabilities['platform'];

  constructor(userOptions: UserOptions, capabilities: Capabilities = {}) {
    this.capabilities = capabilities;
    this.platform = capabilities.platform;
    const plugins =
      capabilities.remote && capabilities.snapshot
        ? capabilities.snapshot.plugins()
        : [];
    // TODO: Validate the details of the options
    // Initialize options with default values
    const defaultOptions: Options = {
      id: getBuilderId(),
      name: userOptions.name,
      plugins,
      remotes: [],
      shared: {},
      inBrowser: isBrowserEnvValue,
    };

    this.name = userOptions.name;
    this.options = defaultOptions;
    const remote = capabilities.remote?.create(this);
    this.snapshotHandler = (remote?.snapshot ??
      new DisabledSnapshotHandler()) as SnapshotHandler;
    this.sharedHandler = (capabilities.shared?.create(this) ??
      new DisabledSharedHandler()) as SharedHandler;
    this.remoteHandler = (remote?.remote ??
      new DisabledRemoteHandler()) as RemoteHandler;
    this.shareScopeMap = this.sharedHandler.shareScopeMap;
    this.registerPlugins([
      ...defaultOptions.plugins,
      ...(userOptions.plugins || []),
    ]);
    this.options = this.formatOptions(defaultOptions, userOptions);
  }

  initOptions(userOptions: UserOptions): Options {
    if (userOptions.name && userOptions.name !== this.options.name) {
      error(getShortErrorMsg(RUNTIME_010, runtimeDescMap));
    }
    this.registerPlugins(userOptions.plugins);
    const options = this.formatOptions(this.options, userOptions);

    this.options = options;

    return options;
  }

  async loadShare<T>(
    pkgName: string,
    extraOptions?: LoadShareExtraOptions,
  ): Promise<false | (() => T | undefined)> {
    return this.sharedHandler.loadShare(pkgName, extraOptions);
  }

  // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
  // 1. If the loaded shared already exists globally, then it will be reused
  // 2. If lib exists in local shared, it will be used directly
  // 3. If the local get returns something other than Promise, then it will be used directly
  loadShareSync<T>(
    pkgName: string,
    extraOptions?: LoadShareExtraOptions,
  ): () => T | never {
    return this.sharedHandler.loadShareSync(pkgName, extraOptions);
  }

  initializeSharing(
    shareScopeName = DEFAULT_SCOPE,
    extraOptions?: {
      initScope?: InitScope;
      from?: CallFrom;
      strategy?: Shared['strategy'];
      context?: SharedLoadContext;
    },
  ): Array<Promise<void>> {
    return this.sharedHandler.initializeSharing(shareScopeName, extraOptions);
  }

  initRawContainer(
    name: string,
    url: string,
    container: RemoteEntryExports,
  ): Module {
    return this.remoteHandler.initRawContainer(name, url, container);
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
    const shared = this.capabilities.shared
      ? this.capabilities.shared.formatShareConfigs(globalOptions, userOptions)
          .allShareInfos
      : {};
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

    const { allShareInfos } = this.sharedHandler.registerShared(
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
      shared: allShareInfos,
      id: userOptionsRes.id || globalOptions.id,
    };

    this.hooks.lifecycle.init.emit({
      origin: this,
      options: optionsRes,
    });
    return optionsRes;
  }

  registerPlugins(plugins: UserOptions['plugins']) {
    this.options.plugins = registerPlugins(plugins, this);
  }
  registerRemotes(remotes: Remote[], options?: { force?: boolean }): void {
    return this.remoteHandler.registerRemotes(remotes, options);
  }

  registerShared(shared: UserOptions['shared']) {
    this.sharedHandler.registerShared(this.options, {
      ...this.options,
      shared,
    });
  }
}
