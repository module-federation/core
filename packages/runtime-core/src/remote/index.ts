import {
  isBrowserEnvValue,
  warn,
  ModuleInfo,
  GlobalModuleInfo,
  disposeRemoteSideEffects,
} from '@module-federation/sdk';
import { RUNTIME_004, runtimeDescMap } from '@module-federation/error-codes';
import {
  Global,
  getInfoWithoutType,
  globalLoading,
  CurrentGlobal,
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
  GlobalShareScopeMap,
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
  getFMId,
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
import {
  resolveRemoteRuntimeInstance,
  type ResolvedRemoteRuntimeInstance,
} from './resolveRemoteRuntimeInstance';

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

export class RemoteHandler {
  host: ModuleFederation;
  idToRemoteMap: Record<string, { name: string; expose: string }>;

  hooks = new PluginSystem({
    beforeRegisterRemote: new SyncWaterfallHook<{
      remote: Remote;
      origin: ModuleFederation;
    }>('beforeRegisterRemote'),
    registerRemote: new SyncWaterfallHook<{
      remote: Remote;
      origin: ModuleFederation;
    }>('registerRemote'),
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

  formatAndRegisterRemote(globalOptions: Options, userOptions: UserOptions) {
    const userRemotes = userOptions.remotes || [];

    return userRemotes.reduce((res, remote) => {
      this.registerRemote(remote, res, { force: false });
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
        await this.getRemoteModuleAndOptions({
          id,
        });
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

      const moduleOrFactory = (await module.get(
        idRes,
        expose,
        options,
        remoteSnapshot,
      )) as T;

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
      afterLoadRemoteArgs = {
        id: completeRequestId,
        expose: completeExpose,
        remote: completeRemote,
        options,
        origin: host,
      };

      if (typeof moduleWrapper === 'function') {
        return moduleWrapper as T;
      }

      return moduleOrFactory;
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

  registerRemotes(
    remotes: Remote[],
    options?: { force?: boolean; disposeSideEffects?: boolean },
  ): void {
    const { host } = this;
    remotes.forEach((remote) => {
      this.registerRemote(remote, host.options.remotes, options);
    });
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
    options?: { force?: boolean; disposeSideEffects?: boolean },
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
        this.removeRemote(registeredRemote, options);
        normalizeRemote();
        targetRemotes.push(remote);
        this.hooks.lifecycle.registerRemote.emit({ remote, origin: host });
        warn(messages.join(' '));
      }
    }
  }

  private removeRemote(
    remote: Remote,
    options?: { force?: boolean; disposeSideEffects?: boolean },
  ): void {
    try {
      const { host } = this;
      this.removeRemoteRegistration(remote);
      this.clearRemoteSnapshots(remote);

      const loadedModule = host.moduleCache.get(remote.name);
      this.disposeRemoteSideEffects(remote, loadedModule?.remoteInfo, options);

      if (loadedModule) {
        const { remoteInfo } = loadedModule;
        this.clearRemoteEntryState(remote, remoteInfo);

        const instances = CurrentGlobal.__FEDERATION__.__INSTANCES__;
        const resolved = resolveRemoteRuntimeInstance(remoteInfo, instances);
        if (resolved.instance) {
          this.releaseRuntimeInstanceShares({
            instance: resolved.instance,
            globalShareScopeMap: getGlobalShareScope(),
          });
          instances.splice(resolved.index, 1);
        } else {
          this.warnUnresolvedRuntimeInstance(remote, resolved, instances);
        }
      }
    } catch (err) {
      logger.error(
        `removeRemote failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private disposeRemoteSideEffects(
    remote: Remote,
    remoteInfo?: RemoteInfo,
    options?: { force?: boolean; disposeSideEffects?: boolean },
  ): void {
    const shouldDispose =
      options?.disposeSideEffects ??
      this.host.options.disposeSideEffects ??
      (typeof process !== 'undefined' &&
        (process.env?.['FEDERATION_DISPOSE_SIDE_EFFECTS'] === 'true' ||
          process.env?.['FEDERATION_DISPOSE_SIDE_EFFECTS'] === '1' ||
          options?.force));
    if (!shouldDispose) {
      return;
    }
    disposeRemoteSideEffects(remote.name);
    if (
      remoteInfo?.entryGlobalName &&
      remoteInfo.entryGlobalName !== remote.name
    ) {
      disposeRemoteSideEffects(remoteInfo.entryGlobalName);
    }
  }

  private removeRemoteRegistration(remote: Remote): void {
    const { remotes } = this.host.options;
    const remoteIndex = remotes.findIndex((item) => item.name === remote.name);
    if (remoteIndex !== -1) {
      remotes.splice(remoteIndex, 1);
    }
  }

  private clearRemoteSnapshots(remote: Remote): void {
    const { host } = this;
    const globalSnapshotKey = getInfoWithoutType(
      CurrentGlobal.__FEDERATION__.moduleInfo,
      getFMId(remote),
    ).key;
    delete CurrentGlobal.__FEDERATION__.moduleInfo[globalSnapshotKey];

    if ('entry' in remote) {
      host.snapshotHandler.manifestCache.delete(remote.entry);
      delete Global.__FEDERATION__.__MANIFEST_LOADING__[remote.entry];
    }

    const { hostGlobalSnapshot } = getGlobalRemoteInfo(remote, host);
    if (hostGlobalSnapshot) {
      const remoteKey =
        'remotesInfo' in hostGlobalSnapshot &&
        hostGlobalSnapshot.remotesInfo &&
        getInfoWithoutType(hostGlobalSnapshot.remotesInfo, remote.name).key;
      if (remoteKey) {
        delete hostGlobalSnapshot.remotesInfo[remoteKey];
      }
    }
  }

  private clearRemoteEntryState(remote: Remote, remoteInfo: RemoteInfo): void {
    const key = remoteInfo.entryGlobalName as keyof typeof CurrentGlobal;
    if (CurrentGlobal[key]) {
      if (Object.getOwnPropertyDescriptor(CurrentGlobal, key)?.configurable) {
        delete CurrentGlobal[key];
      } else {
        // @ts-ignore
        CurrentGlobal[key] = undefined;
      }
    }
    const remoteEntryUniqueKey = getRemoteEntryUniqueKey(remoteInfo);
    if (globalLoading[remoteEntryUniqueKey]) {
      delete globalLoading[remoteEntryUniqueKey];
    }
    this.host.moduleCache.delete(remote.name);
  }

  // Shares are keyed by the producing runtime instance, never by the
  // registration alias: `from` is the instance's own name and `useIn` only
  // ever lists it under that name.
  private releaseRuntimeInstanceShares({
    instance,
    globalShareScopeMap,
  }: {
    instance: ModuleFederation;
    globalShareScopeMap: GlobalShareScopeMap;
  }): void {
    const producerName = instance.options.name ?? instance.name;
    const instanceId = instance.options.id || producerName;

    let isAllSharedNotUsed = true;
    const needDeleteKeys: Array<[string, string, string, string]> = [];
    Object.keys(globalShareScopeMap).forEach((instId) => {
      const shareScopeMap = globalShareScopeMap[instId];
      shareScopeMap &&
        Object.keys(shareScopeMap).forEach((shareScope) => {
          const shareScopeVal = shareScopeMap[shareScope];
          shareScopeVal &&
            Object.keys(shareScopeVal).forEach((shareName) => {
              const sharedPkgs = shareScopeVal[shareName];
              sharedPkgs &&
                Object.keys(sharedPkgs).forEach((shareVersion) => {
                  const shared = sharedPkgs[shareVersion];
                  if (
                    shared &&
                    typeof shared === 'object' &&
                    shared.from === producerName
                  ) {
                    if (shared.loaded || shared.loading) {
                      shared.useIn = shared.useIn.filter(
                        (usedHostName) => usedHostName !== producerName,
                      );
                      if (shared.useIn.length) {
                        isAllSharedNotUsed = false;
                      } else {
                        needDeleteKeys.push([
                          instId,
                          shareScope,
                          shareName,
                          shareVersion,
                        ]);
                      }
                    } else {
                      needDeleteKeys.push([
                        instId,
                        shareScope,
                        shareName,
                        shareVersion,
                      ]);
                    }
                  }
                });
            });
        });
    });

    if (isAllSharedNotUsed) {
      instance.shareScopeMap = {};
      delete globalShareScopeMap[instanceId];
    }
    needDeleteKeys.forEach(([insId, shareScope, shareName, shareVersion]) => {
      delete globalShareScopeMap[insId]?.[shareScope]?.[shareName]?.[
        shareVersion
      ];
    });
  }

  // Only suspicious misses are reported. A container built without the
  // federation runtime has no instance at all, which is legitimate and silent.
  private warnUnresolvedRuntimeInstance(
    remote: Remote,
    resolved: ResolvedRemoteRuntimeInstance,
    instances: ModuleFederation[],
  ): void {
    const { registeredName, buildName, buildVersion } = resolved.identity;
    if (resolved.ambiguous) {
      logger.warn(
        `Found ${resolved.candidateCount} runtime instances matching "${resolved.level}" for remote "${remote.name}" in __FEDERATION__.__INSTANCES__; the match is ambiguous, so no instance or share scope was released.`,
      );
      return;
    }
    if (!buildVersion) {
      return;
    }
    const sameNameVersions = instances
      .filter((ins) => ins.name === registeredName || ins.name === buildName)
      .map((ins) => ins.options.version ?? ins.options.id ?? '<unknown>');
    if (sameNameVersions.length) {
      logger.warn(
        `No runtime instance named "${registeredName}"${
          buildName && buildName !== registeredName
            ? ` (or "${buildName}")`
            : ''
        } with build version "${buildVersion}" was found in __FEDERATION__.__INSTANCES__ while removing remote "${remote.name}" (found versions: ${sameNameVersions.join(', ')}), so its share scope and instance were not released.`,
      );
    }
  }
}
