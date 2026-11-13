import {
  isBrowserEnvValue,
  warn,
  ModuleInfo,
  GlobalModuleInfo,
} from '@module-federation/sdk';
import { RUNTIME_004, runtimeDescMap } from '@module-federation/error-codes';
import {
  Global,
  getInfoWithoutType,
  globalLoading,
  CurrentGlobal,
  getRemoteFederationInstance,
} from '../global';
import {
  Options,
  UserOptions,
  PreloadAssets,
  PreloadOptions,
  PreloadRemoteArgs,
  PreloadRemoteResult,
  Remote,
  RemoteInfo,
  RemoteEntryExports,
  CallFrom,
  ResourceLoadContext,
} from '../type';
import { ModuleFederation } from '../core';
import {
  PluginSystem,
  AsyncHook,
  AsyncWaterfallHook,
  SyncHook,
  SyncWaterfallHook,
} from '../utils/hooks';
import {
  assert,
  error,
  getRemoteInfo,
  getRemoteEntryUniqueKey,
  composeRemoteRequestId,
  matchRemoteWithNameAndExpose,
  optionsToMFContext,
  logger,
} from '../utils';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';
import { Module, ModuleOptions } from '../module';
import { formatPreloadArgs, preloadAssets } from '../utils/preload';
import { getGlobalShareScope } from '../utils/share';
import { getGlobalRemoteInfo } from '../plugins/snapshot/SnapshotHandler';

export interface LoadRemoteMatch {
  id: string;
  pkgNameOrAlias: string;
  expose: string;
  remote: Remote;
  options: Options;
  origin: ModuleFederation;
  remoteInfo: RemoteInfo;
  remoteSnapshot?: ModuleInfo;
}

/** The resolved source of an object returned by a completed remote factory. */
export interface LoadedRemoteInfo {
  remoteMatchInfo?: LoadRemoteMatch;
  id: string;
  /** A runtime recovery result has no normal expose protocol or data assets. */
  recovered: boolean;
  /** False when the value is an individual export rather than its namespace. */
  isModule: boolean;
}
const getRemoteEntry = (remote: Remote): string | undefined =>
  'entry' in remote ? remote.entry : undefined;

const clearRemoteSnapshotCache = (
  host: ModuleFederation,
  remote: Remote,
  remoteInfo?: RemoteInfo,
): void => {
  const remoteNames = new Set(
    [remote.name, remoteInfo?.name].filter(Boolean) as string[],
  );
  const remoteEntries = new Set(
    [getRemoteEntry(remote), remoteInfo?.entry].filter(Boolean) as string[],
  );
  const globalModuleInfo = Global.__FEDERATION__.moduleInfo;

  const { hostGlobalSnapshot } = getGlobalRemoteInfo(remote, host);
  if (hostGlobalSnapshot?.remotesInfo) {
    remoteNames.forEach((remoteName) => {
      const remoteRecord = getInfoWithoutType(
        hostGlobalSnapshot.remotesInfo,
        remoteName,
      );
      if (remoteRecord.value) {
        delete hostGlobalSnapshot.remotesInfo[remoteRecord.key];
      }
    });
  }

  remoteEntries.forEach((entry) => {
    host.snapshotHandler.manifestCache.delete(entry);
  });

  Object.keys(globalModuleInfo).forEach((moduleKey) => {
    const snapshot = globalModuleInfo[moduleKey];
    const snapshotBuildVersion =
      snapshot && 'buildVersion' in snapshot
        ? snapshot.buildVersion
        : undefined;
    // Another build can already occupy the same registration/manifest URL.
    if (
      remoteInfo?.buildVersion &&
      snapshot &&
      snapshotBuildVersion &&
      snapshotBuildVersion !== remoteInfo.buildVersion
    )
      return;
    remoteNames.forEach((remoteName) => {
      if (
        moduleKey === remoteName ||
        [...remoteEntries].some(
          (entry) => moduleKey === `${remoteName}:${entry}`,
        ) ||
        (remoteInfo?.version &&
          moduleKey === `${remoteName}:${remoteInfo.version}`)
      ) {
        delete globalModuleInfo[moduleKey];
      }
    });
  });

  remoteEntries.forEach((entry) => {
    host.snapshotHandler.manifestCache.delete(entry);
    delete Global.__FEDERATION__.__MANIFEST_LOADING__[entry];
  });
};

export class RemoteHandler {
  host: ModuleFederation;
  idToRemoteMap: Record<string, { name: string; expose: string }>;
  private loadedRemoteInfo = new WeakMap<
    object,
    Map<string, LoadedRemoteInfo>
  >();

  hooks = new PluginSystem({
    beforeRegisterRemote: new SyncWaterfallHook<{
      remote: Remote;
      origin: ModuleFederation;
    }>('beforeRegisterRemote'),
    registerRemote: new SyncWaterfallHook<{
      remote: Remote;
      origin: ModuleFederation;
    }>('registerRemote'),
    beforeRemoveRemote: new SyncHook<
      [{ remote: Remote; origin: ModuleFederation }],
      { remove: () => void } | void
    >('beforeRemoveRemote'),
    removeRemote: new AsyncHook<
      [
        {
          remote: Remote;
          origin: ModuleFederation;
          /** Resolved identity captured before user removal hooks mutate caches. */
          remoteInfo?: RemoteInfo;
        },
      ],
      void
    >('removeRemote'),
    beforeRequest: new AsyncWaterfallHook<{
      id: string;
      options: Options;
      origin: ModuleFederation;
    }>('beforeRequest'),
    afterMatchRemote: new AsyncHook<
      [
        {
          id: string;
          options: Options;
          remote?: Remote;
          expose?: string;
          remoteInfo?: RemoteInfo;
          error?: unknown;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterMatchRemote'),
    /** Resolve a module without loading its container. The normal success
     * lifecycle and provenance apply equally to plugin and container factories. */
    beforeLoadRemote: new AsyncHook<
      [LoadRemoteMatch],
      { factory: () => unknown } | void
    >('beforeLoadRemote'),
    onLoad: new AsyncHook<
      [
        {
          id: string;
          expose: string;
          pkgNameOrAlias: string;
          remote: Remote;
          options: ModuleOptions;
          origin: ModuleFederation;
          exposeModule: any;
          exposeModuleFactory: any;
          moduleInstance: Module;
        },
      ],
      unknown
    >('onLoad'),
    afterLoadRemote: new AsyncHook<
      [
        {
          id: string;
          expose?: string;
          remote?: RemoteInfo;
          options?: {
            loadFactory?: boolean;
            from?: CallFrom;
          };
          error?: unknown;
          recovered?: boolean;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterLoadRemote'),
    handlePreloadModule: new SyncHook<
      [
        {
          id: string;
          name: string;
          remote: Remote;
          remoteSnapshot: ModuleInfo;
          preloadConfig: PreloadRemoteArgs;
          origin: ModuleFederation;
        },
      ],
      void
    >('handlePreloadModule'),
    errorLoadRemote: new AsyncHook<
      [
        {
          id: string;
          error: unknown;
          options?: any;
          from: CallFrom;
          lifecycle:
            | 'beforeRequest'
            | 'beforeLoadShare'
            | 'afterResolve'
            | 'onLoad';
          remote?: RemoteInfo;
          expose?: string;
          origin: ModuleFederation;
        },
      ],
      void | unknown
    >('errorLoadRemote'),
    beforePreloadRemote: new AsyncHook<
      [
        {
          preloadOps: Array<PreloadRemoteArgs>;
          options: Options;
          origin: ModuleFederation;
        },
      ]
    >('beforePreloadRemote'),
    generatePreloadAssets: new AsyncHook<
      [
        {
          origin: ModuleFederation;
          preloadOptions: PreloadOptions[number];
          remote: Remote;
          remoteInfo: RemoteInfo;
          remoteSnapshot: ModuleInfo;
          globalSnapshot: GlobalModuleInfo;
        },
      ],
      Promise<PreloadAssets>
    >('generatePreloadAssets'),
    afterPreloadRemote: new AsyncHook<
      [
        {
          preloadOps: Array<PreloadRemoteArgs>;
          options: Options;
          origin: ModuleFederation;
          results: PreloadRemoteResult[];
          error?: unknown;
        },
      ]
    >('afterPreloadRemote'),
    // TODO: Move to loaderHook
    loadEntry: new AsyncHook<
      [
        {
          origin: ModuleFederation;
          loaderHook: ModuleFederation['loaderHook'];
          remoteInfo: RemoteInfo;
          remoteEntryExports?: RemoteEntryExports;
          resourceContext?: ResourceLoadContext;
        },
      ],
      Promise<RemoteEntryExports | void> | RemoteEntryExports | void
    >(),
  });

  constructor(host: ModuleFederation) {
    this.host = host;
    this.idToRemoteMap = {};
  }

  /** Look up this instance's completed load without resolving or loading again. */
  getLoadedRemoteInfo(value: unknown): LoadedRemoteInfo | undefined {
    if (!value || (typeof value !== 'object' && typeof value !== 'function'))
      return;
    const matches = this.loadedRemoteInfo.get(value);
    if (!matches?.size) return;
    if (matches.size !== 1) {
      throw new Error(
        'The preloaded remote value has multiple expose or version identities. Return an unambiguous MF module namespace instead.',
      );
    }
    return matches.values().next().value;
  }

  private rememberLoadedRemote(
    value: unknown,
    match?: LoadRemoteMatch,
    recoveredId?: string,
  ): void {
    if (!value || (typeof value !== 'object' && typeof value !== 'function'))
      return;
    const snapshot = match?.remoteSnapshot;
    const metadata =
      match && snapshot && 'modules' in snapshot
        ? snapshot.modules.find(
            (item) =>
              item.modulePath === match.expose ||
              item.moduleName === match.expose.replace(/^\.\//, ''),
          )
        : undefined;
    // Alias requests for the same source coalesce. Reusing one value across
    // exposes or deployments must not silently choose the last completed load.
    const key = JSON.stringify(
      match
        ? [
            match.remote.name,
            match.expose,
            match.remoteInfo.entry,
            match.remoteInfo.version,
            match.remoteInfo.buildVersion,
            snapshot?.version,
            snapshot?.buildVersion,
            snapshot && 'remoteEntry' in snapshot
              ? snapshot.remoteEntry
              : undefined,
            snapshot && 'ssrRemoteEntry' in snapshot
              ? snapshot.ssrRemoteEntry
              : undefined,
            snapshot && 'publicPath' in snapshot
              ? snapshot.publicPath
              : undefined,
            metadata?.render,
            metadata?.servicePath,
            snapshot && 'serviceBaseUrl' in snapshot
              ? snapshot.serviceBaseUrl
              : undefined,
          ]
        : ['recovered', recoveredId],
    );
    const remember = (item: unknown, isModule: boolean) => {
      if (!item || (typeof item !== 'object' && typeof item !== 'function'))
        return;
      let matches = this.loadedRemoteInfo.get(item);
      if (!matches) {
        matches = new Map();
        this.loadedRemoteInfo.set(item, matches);
      }
      const previous = matches.get(key);
      if (!previous || isModule)
        matches.set(key, {
          remoteMatchInfo: match,
          id: match?.id || recoveredId!,
          recovered: !match,
          isModule,
        });
    };
    remember(value, true);
    let descriptors: ReturnType<typeof Object.getOwnPropertyDescriptors>;
    try {
      descriptors = Object.getOwnPropertyDescriptors(value);
    } catch {
      // Provenance collection must not turn a successfully loaded Proxy into
      // a runtime failure. Its namespace is still associated with this load.
      return;
    }
    // Inspect data exports without evaluating arbitrary namespace getters.
    // The default getter is the standard ESM interop boundary and is needed
    // for preloaded default imports. A throwing getter must not break loading.
    for (const [name, descriptor] of Object.entries(descriptors)) {
      if ('value' in descriptor) remember(descriptor.value, false);
      else if (name === 'default' && descriptor.get) {
        try {
          remember(descriptor.get.call(value), false);
        } catch {
          /* Leave the getter's error to its actual consumer. */
        }
      }
    }
  }

  private observeModuleFactory(
    factory: (...args: any[]) => unknown,
    match?: LoadRemoteMatch,
    recoveredId?: string,
  ) {
    const remember = (result: unknown) => {
      this.rememberLoadedRemote(result, match, recoveredId);
      return result;
    };
    return function (this: unknown, ...args: unknown[]) {
      const value = factory.apply(this, args);
      // The native Promise method checks internal slots across realms. Do not
      // read value.then: a synchronous namespace can export that business name.
      if (value && (typeof value === 'object' || typeof value === 'function')) {
        try {
          return Promise.prototype.then.call(value, remember);
        } catch {
          // Ordinary values (including custom thenables) stay synchronous.
        }
      }
      return remember(value);
    };
  }

  formatAndRegisterRemote(globalOptions: Options, userOptions: UserOptions) {
    const userRemotes = userOptions.remotes || [];

    return userRemotes.reduce((res, remote) => {
      // Rebuilt bundlers may repeat their original bootstrap configuration.
      // The persistent runtime registration remains authoritative.
      if (!res.some((item) => item.name === remote.name))
        this.registerRemote(remote, res);
      return res;
    }, globalOptions.remotes);
  }

  setIdToRemoteMap(id: string, remoteMatchInfo: LoadRemoteMatch) {
    const { remote, expose } = remoteMatchInfo;
    const { name, alias } = remote;
    this.idToRemoteMap[id] = { name: remote.name, expose };
    if (alias && id.startsWith(name)) {
      const idWithAlias = id.replace(name, alias);
      this.idToRemoteMap[idWithAlias] = { name: remote.name, expose };
      return;
    }

    if (alias && id.startsWith(alias)) {
      const idWithName = id.replace(alias, name);
      this.idToRemoteMap[idWithName] = { name: remote.name, expose };
    }
  }

  // eslint-disable-next-line max-lines-per-function
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async loadRemote<T>(
    id: string,
    options?: { loadFactory?: boolean; from: CallFrom },
  ): Promise<T | null> {
    const { host } = this;
    const startMatchInfo = matchRemoteWithNameAndExpose(
      host.options.remotes,
      id,
    );
    let completeRequestId = id;
    let completeExpose = startMatchInfo?.expose;
    let completeRemote = startMatchInfo
      ? getRemoteInfo(startMatchInfo.remote)
      : undefined;
    let afterLoadRemoteArgs:
      | Parameters<
          RemoteHandler['hooks']['lifecycle']['afterLoadRemote']['emit']
        >[0]
      | undefined;

    try {
      const { loadFactory = true } = options || {
        loadFactory: true,
      };
      // 1. Validate the parameters of the retrieved module. There are two module request methods: pkgName + expose and alias + expose.
      // 2. Request the snapshot information of the current host and globally store the obtained snapshot information. The retrieved module information is partially offline and partially online. The online module information will retrieve the modules used online.
      // 3. Retrieve the detailed information of the current module from global (remoteEntry address, expose resource address)
      // 4. After retrieving remoteEntry, call the init of the module, and then retrieve the exported content of the module through get
      // id: pkgName(@federation/app1) + expose(button) = @federation/app1/button
      // id: alias(app1) + expose(button) = app1/button
      // id: alias(app1/utils) + expose(loadash/sort) = app1/utils/loadash/sort
      const { module, moduleOptions, remoteMatchInfo } =
        await this.getRemoteModuleAndOptions({ id });
      const {
        pkgNameOrAlias,
        remote,
        expose,
        id: idRes,
        remoteSnapshot,
      } = remoteMatchInfo;
      completeRequestId = idRes;
      completeExpose = expose;
      completeRemote = getRemoteInfo(remote);

      const resolved =
        await this.hooks.lifecycle.beforeLoadRemote.emit(remoteMatchInfo);
      const moduleOrFactory = (
        resolved
          ? await module.getModuleExports(
              idRes,
              expose,
              resolved.factory,
              options,
            )
          : await module.get(idRes, expose, options, remoteSnapshot)
      ) as T;

      const moduleWrapper = await this.hooks.lifecycle.onLoad.emit({
        id: idRes,
        pkgNameOrAlias,
        expose,
        exposeModule: loadFactory ? moduleOrFactory : undefined,
        exposeModuleFactory: loadFactory ? undefined : moduleOrFactory,
        remote,
        options: moduleOptions,
        moduleInstance: module,
        origin: host,
      });

      this.setIdToRemoteMap(id, remoteMatchInfo);
      if (idRes !== id) this.setIdToRemoteMap(idRes, remoteMatchInfo);
      afterLoadRemoteArgs = {
        id: completeRequestId,
        expose: completeExpose,
        remote: completeRemote,
        options,
        origin: host,
      };

      const result =
        typeof moduleWrapper === 'function'
          ? (moduleWrapper as T)
          : moduleOrFactory;
      if (!loadFactory && typeof result === 'function') {
        return this.observeModuleFactory(
          result as (...args: any[]) => unknown,
          remoteMatchInfo,
        ) as T;
      }
      this.rememberLoadedRemote(result, remoteMatchInfo);
      return result;
    } catch (error) {
      const { from = 'runtime' } = options || { from: 'runtime' };

      let failOver;
      try {
        failOver = await this.hooks.lifecycle.errorLoadRemote.emit({
          id,
          error,
          from,
          lifecycle: 'onLoad',
          expose: completeExpose,
          remote: completeRemote,
          origin: host,
        });
      } catch (hookError) {
        afterLoadRemoteArgs = {
          id: completeRequestId,
          expose: completeExpose,
          remote: completeRemote,
          options,
          error: hookError,
          origin: host,
        };
        throw hookError;
      }

      if (!failOver) {
        afterLoadRemoteArgs = {
          id: completeRequestId,
          expose: completeExpose,
          remote: completeRemote,
          options,
          error,
          origin: host,
        };
        throw error;
      }

      afterLoadRemoteArgs = {
        id: completeRequestId,
        expose: completeExpose,
        remote: completeRemote,
        options,
        error,
        origin: host,
        recovered: true,
      };

      if (options?.loadFactory === false && typeof failOver === 'function') {
        return this.observeModuleFactory(
          failOver as (...args: any[]) => unknown,
          undefined,
          id,
        ) as T;
      }
      this.rememberLoadedRemote(failOver, undefined, id);
      return failOver as T;
    } finally {
      if (afterLoadRemoteArgs) {
        await this.hooks.lifecycle.afterLoadRemote.emit(afterLoadRemoteArgs);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  async preloadRemote(preloadOptions: Array<PreloadRemoteArgs>): Promise<void> {
    const { host } = this;
    const preloadResults: PreloadRemoteResult[] = [];

    await this.hooks.lifecycle.beforePreloadRemote.emit({
      preloadOps: preloadOptions,
      options: host.options,
      origin: host,
    });

    const preloadOps: PreloadOptions = formatPreloadArgs(
      host.options.remotes,
      preloadOptions,
    );

    const createPreloadAssetOps = (ops: PreloadOptions[number]) => {
      const { preloadConfig, remote } = ops;
      const exposes = preloadConfig.exposes || [];

      if (!exposes.length) {
        return [
          {
            ops,
            id: `${remote.name}/*`,
          },
        ];
      }

      return exposes.map((expose) => ({
        ops: {
          ...ops,
          preloadConfig: {
            ...preloadConfig,
            exposes: [expose],
          },
        },
        id: composeRemoteRequestId(remote.name, expose),
      }));
    };

    let preloadError: Error | undefined;

    await Promise.all(
      preloadOps.flatMap(createPreloadAssetOps).map(async (assetOps) => {
        const { ops, id: preloadId } = assetOps;
        const { remote, preloadConfig } = ops;
        const remoteInfo = getRemoteInfo(remote);
        try {
          const { globalSnapshot, remoteSnapshot } =
            await host.snapshotHandler.loadRemoteSnapshotInfo({
              moduleInfo: remote,
              id: preloadId,
              initiator: 'preloadRemote',
            });

          const assets = await this.hooks.lifecycle.generatePreloadAssets.emit({
            origin: host,
            preloadOptions: ops,
            remote,
            remoteInfo,
            globalSnapshot,
            remoteSnapshot,
          });
          if (!assets) {
            return;
          }
          const results = await preloadAssets(
            remoteInfo,
            host,
            assets,
            true,
            {
              initiator: 'preloadRemote',
              id: preloadId,
            },
            preloadConfig.recordPreloadedAssets,
          );
          preloadResults.push({
            remote,
            remoteInfo,
            preloadConfig,
            id: preloadId,
            results,
          });
        } catch (error) {
          preloadResults.push({
            remote,
            remoteInfo,
            preloadConfig,
            id: preloadId,
            results: [
              {
                url: remoteInfo.entry,
                status: 'error',
                resourceType: /\.json(?:$|[?#])/i.test(remoteInfo.entry)
                  ? 'manifest'
                  : 'remoteEntry',
                initiator: 'preloadRemote',
                id: preloadId,
                error,
              },
            ],
          });
        }
      }),
    );

    const failedResults = preloadResults.flatMap((preloadResult) =>
      preloadResult.results.filter(
        (result) => result.status === 'error' || result.status === 'timeout',
      ),
    );
    if (failedResults.length > 0) {
      preloadError = new Error(
        `preloadRemote failed to load ${failedResults.length} resource(s).`,
      );
      Object.assign(preloadError, {
        results: preloadResults,
        failedResults,
      });
    }

    await this.hooks.lifecycle.afterPreloadRemote.emit({
      preloadOps: preloadOptions,
      options: host.options,
      origin: host,
      results: preloadResults,
      error: preloadError,
    });

    if (preloadError) {
      throw preloadError;
    }
  }

  private updateQueue: Promise<void> = Promise.resolve();

  private prepareRemotes(remotes: Remote[]): Remote[] {
    assert(Array.isArray(remotes), 'Remotes must be an array');
    const names = new Set<string>();
    const prepared = remotes.map((remote) => {
      assert(
        remote && typeof remote.name === 'string' && remote.name.length > 0,
        'Remote name is required',
      );
      assert(!names.has(remote.name), `Duplicate remote: ${remote.name}`);
      names.add(remote.name);
      const result = { ...remote };
      if (Array.isArray(remote.shareScope))
        result.shareScope = [...remote.shareScope];
      if ('entry' in result) {
        assert(
          typeof result.entry === 'string' && result.entry.length > 0,
          'Remote entry is required',
        );
        if (
          isBrowserEnvValue &&
          typeof window !== 'undefined' &&
          !result.entry.startsWith('http')
        )
          result.entry = new URL(result.entry, window.location.origin).href;
      } else
        assert(
          'version' in result &&
            typeof result.version === 'string' &&
            result.version.length > 0,
          'Remote entry or version is required',
        );
      result.shareScope ||= DEFAULT_SCOPE;
      result.type ||= DEFAULT_REMOTE_TYPE;
      return result;
    });
    const existing = this.host.options.remotes;
    const final = [
      ...existing.filter((remote) => !names.has(remote.name)),
      ...prepared,
    ];
    for (const remote of final)
      if (remote.alias) {
        assert(
          typeof remote.alias === 'string',
          'Remote alias must be a string',
        );
        assert(
          !final.some(
            (other) =>
              other !== remote &&
              (other.name.startsWith(remote.alias!) ||
                other.alias?.startsWith(remote.alias!)),
          ),
          `Remote alias conflicts with another registration: ${remote.alias}`,
        );
      }
    return prepared;
  }

  registerRemotes(remotes: Remote[], options?: { force?: boolean }): void {
    const { host } = this;
    remotes.forEach((remote) => {
      this.registerRemote(remote, host.options.remotes, {
        force: options?.force,
      });
    });
  }

  updateRemotes(remotes: Remote[]): Promise<void> {
    let captured: Remote[];
    try {
      // Capture caller-owned values immediately; validate again when the queue runs.
      captured = this.prepareRemotes(remotes);
    } catch (error) {
      return Promise.reject(error);
    }
    const operation = this.updateQueue.then(async () => {
      const prepared = this.prepareRemotes(captured);
      for (const remote of prepared) {
        const previous = this.host.options.remotes.find(
          (item) => item.name === remote.name,
        );
        if (previous) await this.removeRemote(previous);
      }
      for (const remote of prepared)
        this.registerRemote(remote, this.host.options.remotes);
    });
    this.updateQueue = operation.catch(() => {});
    return operation;
  }

  initRawContainer(
    name: string,
    url: string,
    container: RemoteEntryExports,
  ): Module {
    const { host } = this;
    const remoteInfo = getRemoteInfo({ name, entry: url });
    const module = new Module({ host, remoteInfo });

    module.remoteEntryExports = container;
    host.moduleCache.set(name, module);

    return module;
  }

  async getRemoteModuleAndOptions(options: { id: string }): Promise<{
    module: Module;
    moduleOptions: ModuleOptions;
    remoteMatchInfo: LoadRemoteMatch;
  }> {
    const { host } = this;
    const { id } = options;
    let loadRemoteArgs;

    try {
      loadRemoteArgs = await this.hooks.lifecycle.beforeRequest.emit({
        id,
        options: host.options,
        origin: host,
      });
    } catch (error) {
      loadRemoteArgs = (await this.hooks.lifecycle.errorLoadRemote.emit({
        id,
        options: host.options,
        origin: host,
        from: 'runtime',
        error,
        lifecycle: 'beforeRequest',
      })) as {
        id: string;
        options: Options;
        origin: ModuleFederation;
      };

      if (!loadRemoteArgs) {
        throw error;
      }
    }

    const { id: idRes } = loadRemoteArgs;

    const remoteSplitInfo = matchRemoteWithNameAndExpose(
      host.options.remotes,
      idRes,
    );
    if (!remoteSplitInfo) {
      try {
        error(
          RUNTIME_004,
          runtimeDescMap,
          {
            hostName: host.options.name,
            requestId: idRes,
          },
          undefined,
          optionsToMFContext(host.options),
        );
      } catch (matchError) {
        await this.hooks.lifecycle.afterMatchRemote.emit({
          id: idRes,
          options: host.options,
          error: matchError,
          origin: host,
        });
        throw matchError;
      }
    }

    const { remote: rawRemote } = remoteSplitInfo;
    const remoteInfo = getRemoteInfo(rawRemote);
    await this.hooks.lifecycle.afterMatchRemote.emit({
      id: idRes,
      ...remoteSplitInfo,
      options: host.options,
      remoteInfo,
      origin: host,
    });
    const matchInfo =
      await host.sharedHandler.hooks.lifecycle.afterResolve.emit({
        id: idRes,
        ...remoteSplitInfo,
        options: host.options,
        origin: host,
        remoteInfo,
      });

    const { remote, expose } = matchInfo;
    assert(
      remote && expose,
      `The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${idRes}.`,
    );
    let module: Module | undefined = host.moduleCache.get(remote.name);

    const moduleOptions: ModuleOptions = {
      host: host,
      remoteInfo,
    };

    if (!module) {
      module = new Module(moduleOptions);
      host.moduleCache.set(remote.name, module);
    }
    return {
      module,
      moduleOptions,
      remoteMatchInfo: matchInfo,
    };
  }

  registerRemote(
    remote: Remote,
    targetRemotes: Remote[],
    options?: { force?: boolean },
  ): void {
    const { host } = this;
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
        if (
          isBrowserEnvValue &&
          typeof window !== 'undefined' &&
          !remote.entry.startsWith('http')
        ) {
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
    this.hooks.lifecycle.beforeRegisterRemote.emit({ remote, origin: host });
    const registeredRemote = targetRemotes.find(
      (item) => item.name === remote.name,
    );
    if (!registeredRemote) {
      normalizeRemote();
      targetRemotes.push(remote);
      this.hooks.lifecycle.registerRemote.emit({ remote, origin: host });
    } else {
      const messages = [
        `The remote "${remote.name}" is already registered.`,
        'Please note that overriding it may cause unexpected errors.',
      ];
      if (options?.force) {
        // remove registered remote
        this.removeRemoteLegacy(registeredRemote);
        normalizeRemote();
        targetRemotes.push(remote);
        this.hooks.lifecycle.registerRemote.emit({ remote, origin: host });
        warn(messages.join(' '));
      }
    }
  }

  async removeRemote(remote: Remote): Promise<void> {
    const remove = this.prepareRemoteRemoval(remote);
    const remoteInfo = this.host.moduleCache.get(remote.name)?.remoteInfo;
    try {
      await this.hooks.lifecycle.removeRemote.emit({
        remote,
        origin: this.host,
        remoteInfo: remoteInfo ? { ...remoteInfo } : undefined,
      });
      remove();
    } catch (err) {
      logger.error(
        `removeRemote failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err;
    }
  }

  private prepareRemoteRemoval(remote: Remote): () => void {
    const { host } = this;
    const { name } = remote;
    const loadedModule = host.moduleCache.get(remote.name);
    const custom = this.hooks.lifecycle.beforeRemoveRemote.emit({
      remote,
      origin: host,
    }) as { remove: () => void } | undefined;
    const remoteIns = loadedModule
      ? getRemoteFederationInstance(loadedModule.remoteInfo)
      : undefined;
    return () => {
      custom?.remove();
      const remoteIndex = host.options.remotes.findIndex(
        (item) => item.name === name,
      );
      if (remoteIndex !== -1) {
        host.options.remotes.splice(remoteIndex, 1);
      }
      clearRemoteSnapshotCache(host, remote, loadedModule?.remoteInfo);
      if (custom) return;
      if (loadedModule) {
        const remoteInfo = loadedModule.remoteInfo;
        const key = remoteInfo.entryGlobalName as keyof typeof CurrentGlobal;
        if (CurrentGlobal[key]) {
          if (
            Object.getOwnPropertyDescriptor(CurrentGlobal, key)?.configurable
          ) {
            delete CurrentGlobal[key];
          } else {
            // @ts-ignore
            CurrentGlobal[key] = undefined;
          }
        }
        const remoteEntryUniqueKey = getRemoteEntryUniqueKey(
          loadedModule.remoteInfo,
        );
        if (globalLoading[remoteEntryUniqueKey]) {
          delete globalLoading[remoteEntryUniqueKey];
        }
        if (remoteIns) {
          const scopes = getGlobalShareScope();
          let used = false;
          for (const scopeMap of Object.values(scopes))
            for (const packages of Object.values(scopeMap))
              for (const versions of Object.values(packages))
                for (const [version, shared] of Object.entries(versions)) {
                  if (shared.from !== remoteInfo.name) continue;
                  if (shared.loaded || shared.loading)
                    shared.useIn = shared.useIn.filter(
                      (name) => name !== remoteInfo.name,
                    );
                  if ((shared.loaded || shared.loading) && shared.useIn.length)
                    used = true;
                  else delete versions[version];
                }
          if (!used) {
            remoteIns.shareScopeMap = {};
            delete scopes[remoteIns.options.id || remoteIns.name];
          }
          const instances = CurrentGlobal.__FEDERATION__.__INSTANCES__;
          const index = instances.indexOf(remoteIns);
          if (index !== -1) instances.splice(index, 1);
        }
        host.moduleCache.delete(remote.name);
      }
    };
  }

  // Preserve the existing synchronous force-registration contract.
  // Coordinated SSR updates use the asynchronous removal path above.
  private removeRemoteLegacy(remote: Remote): void {
    try {
      this.prepareRemoteRemoval(remote)();
    } catch (err) {
      logger.error(
        `removeRemote failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
