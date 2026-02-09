import {
  isBrowserEnv,
  warn,
  composeKeyWithSeparator,
  safeToString,
  ModuleInfo,
  GlobalModuleInfo,
} from '@module-federation/sdk';
import { RUNTIME_002, RUNTIME_004 } from '@module-federation/error-codes';
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
  Remote,
  RemoteInfo,
  RemoteEntryExports,
  InitScope,
  ShareScopeMap,
  RemoteEntryInitOptions,
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
  getFMId,
  getRemoteEntry,
  getRemoteInfo,
  getRemoteEntryUniqueKey,
  matchRemoteWithNameAndExpose,
  processModuleAlias,
  logger,
  runtimeError,
} from '../utils';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';
import { Module, ModuleOptions } from '../module';
import { formatPreloadArgs, preloadAssets } from '../utils/preload';
import { getGlobalShareScope } from '../shared';
import { getGlobalRemoteInfo } from '../plugins/snapshot/SnapshotHandler';
import { Effect } from '@module-federation/micro-effect';

function collectRemoteShareKeys(
  globalShareScopeMap: GlobalShareScopeMap,
  remoteName: string,
): {
  keysToDelete: Array<[string, string, string, string]>;
  allUnused: boolean;
} {
  let allUnused = true;
  const keysToDelete: Array<[string, string, string, string]> = [];
  for (const instId of Object.keys(globalShareScopeMap)) {
    const scopes = globalShareScopeMap[instId];
    if (!scopes) continue;
    for (const scope of Object.keys(scopes)) {
      const names = scopes[scope];
      if (!names) continue;
      for (const name of Object.keys(names)) {
        const versions = names[name];
        if (!versions) continue;
        for (const version of Object.keys(versions)) {
          const shared = versions[version];
          if (
            !shared ||
            typeof shared !== 'object' ||
            shared.from !== remoteName
          )
            continue;
          if (shared.loaded || shared.loading) {
            shared.useIn = shared.useIn.filter((h) => h !== remoteName);
            if (shared.useIn.length) {
              allUnused = false;
            } else {
              keysToDelete.push([instId, scope, name, version]);
            }
          } else {
            keysToDelete.push([instId, scope, name, version]);
          }
        }
      }
    }
  }
  return { keysToDelete, allUnused };
}

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

// --- Effect programs ---

const preloadRemoteEffect = (
  handler: RemoteHandler,
  preloadOptions: Array<PreloadRemoteArgs>,
): Effect.Effect<void> =>
  Effect.gen(function* () {
    const { host } = handler;
    yield* Effect.promise(() =>
      handler.hooks.lifecycle.beforePreloadRemote.emit({
        preloadOps: preloadOptions,
        options: host.options,
        origin: host,
      }),
    );
    yield* Effect.forEach(
      formatPreloadArgs(host.options.remotes, preloadOptions),
      (ops) =>
        Effect.promise(async () => {
          const remoteInfo = getRemoteInfo(ops.remote);
          const { globalSnapshot, remoteSnapshot } =
            await host.snapshotHandler.loadRemoteSnapshotInfo({
              moduleInfo: ops.remote,
            });
          const assets =
            await handler.hooks.lifecycle.generatePreloadAssets.emit({
              origin: host,
              preloadOptions: ops,
              remote: ops.remote,
              remoteInfo,
              globalSnapshot,
              remoteSnapshot,
            });
          if (assets) preloadAssets(remoteInfo, host, assets);
        }),
      { concurrency: 'parallel' },
    );
  });

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
      void
    >('onLoad'),
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
    // TODO: Move to loaderHook
    loadEntry: new AsyncHook<
      [
        {
          loaderHook: ModuleFederation['loaderHook'];
          remoteInfo: RemoteInfo;
          remoteEntryExports?: RemoteEntryExports;
        },
      ],
      Promise<RemoteEntryExports>
    >(),
  });

  constructor(host: ModuleFederation) {
    this.host = host;
    this.idToRemoteMap = {};
  }

  formatAndRegisterRemote(globalOptions: Options, userOptions: UserOptions) {
    const userRemotes = userOptions.remotes || [];

    return userRemotes.reduce(
      (res, remote) => (
        this.registerRemote(remote, res, { force: false }), res
      ),
      globalOptions.remotes,
    );
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
    try {
      const loadFactory = options?.loadFactory !== false;
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
      if (typeof moduleWrapper === 'function') {
        return moduleWrapper as T;
      }

      return moduleOrFactory;
    } catch (error) {
      const from = options?.from ?? 'runtime';

      const failOver = await this.hooks.lifecycle.errorLoadRemote.emit({
        id,
        error,
        from,
        lifecycle: 'onLoad',
        origin: host,
      });

      if (!failOver) {
        throw error;
      }

      return failOver as T;
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  async preloadRemote(preloadOptions: Array<PreloadRemoteArgs>): Promise<void> {
    return Effect.runPromise(preloadRemoteEffect(this, preloadOptions));
  }

  registerRemotes(remotes: Remote[], options?: { force?: boolean }): void {
    const { host } = this;
    remotes.forEach((remote) =>
      this.registerRemote(remote, host.options.remotes, {
        force: options?.force,
      }),
    );
  }

  async getRemoteModuleAndOptions(options: { id: string }): Promise<{
    module: Module;
    moduleOptions: ModuleOptions;
    remoteMatchInfo: LoadRemoteMatch;
  }> {
    const { host } = this;
    const { id } = options;
    const loadRemoteArgs = await this.hooks.lifecycle.beforeRequest
      .emit({ id, options: host.options, origin: host })
      .catch(async (error) => {
        const fallback = (await this.hooks.lifecycle.errorLoadRemote.emit({
          id,
          options: host.options,
          origin: host,
          from: 'runtime',
          error,
          lifecycle: 'beforeRequest',
        })) as { id: string; options: Options; origin: ModuleFederation };
        if (!fallback) throw error;
        return fallback;
      });

    const { id: idRes } = loadRemoteArgs;

    const remoteSplitInfo = matchRemoteWithNameAndExpose(
      host.options.remotes,
      idRes,
    );
    assert(
      remoteSplitInfo,
      runtimeError(RUNTIME_004, {
        hostName: host.options.name,
        requestId: idRes,
      }),
    );
    const remoteInfo = getRemoteInfo(remoteSplitInfo.remote);
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
    const moduleOptions: ModuleOptions = { host, remoteInfo };
    const cached = host.moduleCache.get(remote.name);
    const module = cached ?? new Module(moduleOptions);
    if (!cached) host.moduleCache.set(remote.name, module);
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
        const findEqual = targetRemotes.find(
          (item) =>
            remote.alias &&
            (item.name.startsWith(remote.alias) ||
              item.alias?.startsWith(remote.alias)),
        );
        assert(
          !findEqual,
          `The alias ${remote.alias} of remote ${remote.name} is not allowed to be the prefix of ${findEqual && findEqual.name} name or alias`,
        );
      }
      if ('entry' in remote) {
        if (isBrowserEnv() && !remote.entry.startsWith('http')) {
          remote.entry = new URL(remote.entry, window.location.origin).href;
        }
      }
      if (!remote.shareScope) remote.shareScope = DEFAULT_SCOPE;
      if (!remote.type) remote.type = DEFAULT_REMOTE_TYPE;
    };
    this.hooks.lifecycle.beforeRegisterRemote.emit({ remote, origin: host });
    const registeredRemote = targetRemotes.find(
      (item) => item.name === remote.name,
    );
    if (registeredRemote) {
      if (!options?.force) return;
      this.removeRemote(registeredRemote);
      warn(
        `The remote "${remote.name}" is already registered. Please note that overriding it may cause unexpected errors.`,
      );
    }
    normalizeRemote();
    targetRemotes.push(remote);
    this.hooks.lifecycle.registerRemote.emit({ remote, origin: host });
  }

  _ensureEntry(
    mod: Module,
    options: {
      init?: boolean;
      id?: string;
      remoteSnapshot?: ModuleInfo;
    } = {},
  ): Effect.Effect<RemoteEntryExports> {
    return Effect.gen(function* () {
      let remoteEntryExports = mod.remoteEntryExports;
      if (!remoteEntryExports) {
        remoteEntryExports = (yield* Effect.promise(() =>
          getRemoteEntry({
            origin: mod.host,
            remoteInfo: mod.remoteInfo,
            remoteEntryExports: mod.remoteEntryExports,
          }),
        )) as RemoteEntryExports | undefined;

        assert(
          remoteEntryExports,
          `remoteEntryExports is undefined \n ${safeToString(mod.remoteInfo)}`,
        );
        mod.remoteEntryExports = remoteEntryExports;
      }

      if (options.init && !mod.inited) {
        if (mod.initPromise) {
          yield* Effect.promise(() => mod.initPromise);
          return remoteEntryExports;
        }

        mod.initing = true;
        mod.initPromise = (async () => {
          const hostShareScopeMap = mod.host.shareScopeMap;
          const shareScopeValue = mod.remoteInfo.shareScope || 'default';
          const shareScopeKeys = Array.isArray(shareScopeValue)
            ? shareScopeValue
            : [shareScopeValue];
          shareScopeKeys.forEach((key) => {
            hostShareScopeMap[key] ||= {};
          });

          const remoteEntryInitOptions: RemoteEntryInitOptions = {
            version: mod.remoteInfo.version || '',
            shareScopeKeys: Array.isArray(shareScopeValue)
              ? shareScopeKeys
              : shareScopeValue,
          };
          Object.defineProperty(remoteEntryInitOptions, 'shareScopeMap', {
            value: hostShareScopeMap,
            enumerable: false,
          });

          const initScope: InitScope = [];
          const initContainerOptions =
            await mod.host.hooks.lifecycle.beforeInitContainer.emit({
              shareScope: hostShareScopeMap[shareScopeKeys[0]],
              // @ts-ignore shareScopeMap will be set by Object.defineProperty
              remoteEntryInitOptions,
              initScope,
              remoteInfo: mod.remoteInfo,
              origin: mod.host,
            });

          if (typeof remoteEntryExports?.init === 'undefined') {
            error(
              runtimeError(RUNTIME_002, {
                hostName: mod.host.name,
                remoteName: mod.remoteInfo.name,
                remoteEntryUrl: mod.remoteInfo.entry,
                remoteEntryKey: mod.remoteInfo.entryGlobalName,
              }),
            );
          }

          await remoteEntryExports.init(
            initContainerOptions.shareScope,
            initContainerOptions.initScope,
            initContainerOptions.remoteEntryInitOptions,
          );

          await mod.host.hooks.lifecycle.initContainer.emit({
            ...initContainerOptions,
            id: options.id,
            remoteSnapshot: options.remoteSnapshot,
            remoteEntryExports,
          });
          mod.inited = true;
        })();

        try {
          yield* Effect.promise(() => mod.initPromise as Promise<void>);
        } finally {
          mod.initing = false;
          mod.initPromise = undefined;
        }
      }

      return remoteEntryExports;
    });
  }

  _getModule(
    mod: Module,
    id: string,
    expose: string,
    options?: { loadFactory?: boolean },
    remoteSnapshot?: ModuleInfo,
  ): Effect.Effect<any> {
    const handler = this;
    return Effect.gen(function* () {
      const { loadFactory = true } = options || { loadFactory: true };
      const remoteEntryExports = yield* handler._ensureEntry(mod, {
        init: true,
        id,
        remoteSnapshot,
      });
      mod.lib = remoteEntryExports;

      const moduleFactory = yield* Effect.promise(async () => {
        const result =
          await mod.host.loaderHook.lifecycle.getModuleFactory.emit({
            remoteEntryExports,
            expose,
            moduleInfo: mod.remoteInfo,
          });
        return result || (await remoteEntryExports.get(expose));
      });

      assert(
        moduleFactory,
        `${getFMId(mod.remoteInfo)} remote don't export ${expose}.`,
      );
      const wrapModuleFactory = mod.wraperFactory(
        moduleFactory,
        processModuleAlias(mod.remoteInfo.name, expose),
      );
      if (!loadFactory) return wrapModuleFactory;
      return yield* Effect.promise(() => wrapModuleFactory());
    });
  }

  private removeRemote(remote: Remote): void {
    try {
      const { host } = this;
      const { name } = remote;
      const remoteIndex = host.options.remotes.findIndex(
        (item) => item.name === name,
      );
      if (remoteIndex !== -1) host.options.remotes.splice(remoteIndex, 1);
      const loadedModule = host.moduleCache.get(remote.name);
      if (!loadedModule) return;
      const remoteInfo = loadedModule.remoteInfo;
      const key = remoteInfo.entryGlobalName as keyof typeof CurrentGlobal;

      if (CurrentGlobal[key]) {
        if (Object.getOwnPropertyDescriptor(CurrentGlobal, key)?.configurable)
          delete CurrentGlobal[key];
        // @ts-ignore
        else CurrentGlobal[key] = undefined;
      }
      const remoteEntryUniqueKey = getRemoteEntryUniqueKey(
        loadedModule.remoteInfo,
      );
      if (globalLoading[remoteEntryUniqueKey])
        delete globalLoading[remoteEntryUniqueKey];
      host.snapshotHandler.manifestCache.delete(remoteInfo.entry);

      let remoteInsId = remoteInfo.buildVersion
        ? composeKeyWithSeparator(remoteInfo.name, remoteInfo.buildVersion)
        : remoteInfo.name;
      const remoteInsIndex =
        CurrentGlobal.__FEDERATION__.__INSTANCES__.findIndex((ins) =>
          remoteInfo.buildVersion
            ? ins.options.id === remoteInsId
            : ins.name === remoteInsId,
        );
      if (remoteInsIndex !== -1) {
        const remoteIns =
          CurrentGlobal.__FEDERATION__.__INSTANCES__[remoteInsIndex];
        remoteInsId = remoteIns.options.id || remoteInsId;
        const globalShareScopeMap = getGlobalShareScope();

        const { keysToDelete, allUnused } = collectRemoteShareKeys(
          globalShareScopeMap,
          remoteInfo.name,
        );

        if (allUnused) {
          remoteIns.shareScopeMap = {};
          delete globalShareScopeMap[remoteInsId];
        }
        keysToDelete.forEach(([insId, shareScope, shareName, shareVersion]) => {
          delete globalShareScopeMap[insId]?.[shareScope]?.[shareName]?.[
            shareVersion
          ];
        });
        CurrentGlobal.__FEDERATION__.__INSTANCES__.splice(remoteInsIndex, 1);
      }

      const { hostGlobalSnapshot } = getGlobalRemoteInfo(remote, host);
      if (
        hostGlobalSnapshot &&
        'remotesInfo' in hostGlobalSnapshot &&
        hostGlobalSnapshot.remotesInfo
      ) {
        const remoteKey = getInfoWithoutType(
          hostGlobalSnapshot.remotesInfo,
          remote.name,
        ).key;
        if (remoteKey) {
          delete hostGlobalSnapshot.remotesInfo[remoteKey];
          delete Global.__FEDERATION__.__MANIFEST_LOADING__[remoteKey];
        }
      }

      host.moduleCache.delete(remote.name);
    } catch (err) {
      logger.log('removeRemote fail: ', err);
    }
  }
}
