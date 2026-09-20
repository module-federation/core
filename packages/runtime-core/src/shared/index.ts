import {
  RUNTIME_005,
  RUNTIME_006,
  runtimeDescMap,
} from '@module-federation/error-codes';
import { Federation } from '../global';
import {
  Options,
  ShareScopeMap,
  ShareInfos,
  Shared,
  RemoteEntryExports,
  UserOptions,
  ShareStrategy,
  InitScope,
  InitTokens,
  CallFrom,
  TreeShakingArgs,
  LoadShareExtraOptions,
  SharedLoadContext,
  SharedLoadTrigger,
} from '../type';
import { ModuleFederation } from '../core';
import {
  PluginSystem,
  AsyncHook,
  AsyncWaterfallHook,
  SyncWaterfallHook,
  SyncHook,
} from '../utils/hooks';
import {
  formatShareConfigs,
  getRegisteredShare,
  getTargetSharedOptions,
  getGlobalShareScope,
  directShare,
  shouldUseTreeShaking,
  addUseIn,
} from '../utils/share';
import {
  assert,
  error,
  addUniqueItem,
  optionsToMFContext,
  warn,
} from '../utils';
import { DEFAULT_SCOPE } from '../constant';
import type { LoadRemoteMatch } from '../remote';
import { createRemoteEntryInitOptions } from '../module';

export class SharedHandler {
  host: ModuleFederation;
  shareScopeMap: ShareScopeMap;
  hooks = new PluginSystem({
    beforeRegisterShare: new SyncWaterfallHook<{
      pkgName: string;
      shared: Shared;
      origin: ModuleFederation;
    }>('beforeRegisterShare'),
    afterRegisterShare: new SyncHook<
      [
        {
          pkgName: string;
          scope: string;
          shared: Shared;
          previousShared?: Shared;
          registeredShared?: Shared;
          shareScopeMap: ShareScopeMap;
          trigger: SharedLoadTrigger;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterRegisterShare'),
    afterResolve: new AsyncWaterfallHook<LoadRemoteMatch>('afterResolve'),
    beforeLoadShare: new AsyncWaterfallHook<{
      pkgName: string;
      shareInfo?: Shared;
      shared: Options['shared'];
      origin: ModuleFederation;
      loadContext?: SharedLoadContext;
    }>('beforeLoadShare'),
    // not used yet
    loadShare: new AsyncHook<[ModuleFederation, string, ShareInfos]>(),
    afterLoadShare: new SyncHook<
      [
        {
          pkgName: string;
          shareInfo?: Partial<Shared>;
          selectedShared?: Partial<Shared>;
          shared: Options['shared'];
          shareScopeMap: ShareScopeMap;
          lifecycle: 'loadShare' | 'loadShareSync';
          loadContext?: SharedLoadContext;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterLoadShare'),
    errorLoadShare: new SyncHook<
      [
        {
          pkgName: string;
          shareInfo?: Partial<Shared>;
          shared: Options['shared'];
          shareScopeMap: ShareScopeMap;
          lifecycle: 'loadShare' | 'loadShareSync';
          origin: ModuleFederation;
          error?: unknown;
          recovered?: boolean;
          loadContext?: SharedLoadContext;
        },
      ],
      void
    >('errorLoadShare'),
    resolveShare: new SyncWaterfallHook<{
      shareScopeMap: ShareScopeMap;
      scope: string;
      pkgName: string;
      version: string;
      shareInfo: Shared;
      GlobalFederation: Federation;
      resolver: () => { shared: Shared; useTreesShaking: boolean } | undefined;
      loadContext?: SharedLoadContext;
    }>('resolveShare'),
    // maybe will change, temporarily for internal use only
    initContainerShareScopeMap: new SyncWaterfallHook<{
      shareScope: ShareScopeMap[string];
      options: Options;
      origin: ModuleFederation;
      scopeName: string;
      hostShareScopeMap?: ShareScopeMap;
    }>('initContainerShareScopeMap'),
  });
  initTokens: InitTokens;
  constructor(host: ModuleFederation) {
    this.host = host;
    this.shareScopeMap = {};
    this.initTokens = {};
    this._setGlobalShareScopeMap(host.options);
  }

  private emitAfterRegisterShare(
    pkgName: string,
    input: {
      scope: string;
      shared: Shared;
      previousShared?: Shared;
      registeredShared?: Shared;
      trigger: SharedLoadTrigger;
    },
  ): void {
    this.hooks.lifecycle.afterRegisterShare.emit({
      pkgName,
      ...input,
      shareScopeMap: this.shareScopeMap,
      origin: this.host,
    });
  }

  private emitAfterLoadShare({
    lifecycle,
    pkgName,
    shareInfo,
    selectedShared,
    loadContext,
  }: {
    lifecycle: 'loadShare' | 'loadShareSync';
    pkgName: string;
    shareInfo?: Partial<Shared>;
    selectedShared?: Partial<Shared>;
    loadContext?: SharedLoadContext;
  }): void {
    try {
      this.hooks.lifecycle.afterLoadShare.emit({
        pkgName,
        shareInfo,
        selectedShared,
        shared: this.host.options.shared,
        shareScopeMap: this.shareScopeMap,
        lifecycle,
        loadContext,
        origin: this.host,
      });
    } catch (error) {
      warn(error);
    }
  }

  private emitErrorLoadShare({
    lifecycle,
    pkgName,
    shareInfo,
    error,
    recovered,
    loadContext,
  }: {
    lifecycle: 'loadShare' | 'loadShareSync';
    pkgName: string;
    shareInfo?: Partial<Shared>;
    error?: unknown;
    recovered?: boolean;
    loadContext?: SharedLoadContext;
  }): void {
    try {
      this.hooks.lifecycle.errorLoadShare.emit({
        pkgName,
        shareInfo,
        shared: this.host.options.shared,
        shareScopeMap: this.shareScopeMap,
        lifecycle,
        origin: this.host,
        error,
        recovered,
        loadContext,
      });
    } catch (hookError) {
      warn(hookError);
    }
  }

  // register shared in shareScopeMap
  registerShared(globalOptions: Options, userOptions: UserOptions) {
    const { newShareInfos, allShareInfos } = formatShareConfigs(
      globalOptions,
      userOptions,
    );

    const sharedKeys = Object.keys(newShareInfos);
    sharedKeys.forEach((sharedKey) => {
      const sharedVals = newShareInfos[sharedKey];
      sharedVals.forEach((sharedVal) => {
        sharedVal.scope.forEach((sc) => {
          this.hooks.lifecycle.beforeRegisterShare.emit({
            origin: this.host,
            pkgName: sharedKey,
            shared: sharedVal,
          });
          const registeredShared = this.shareScopeMap[sc]?.[sharedKey];
          const previousAtVersion = registeredShared?.[sharedVal.version];
          if (!registeredShared) {
            this.setShared({
              pkgName: sharedKey,
              lib: sharedVal.lib,
              get: sharedVal.get,
              loaded: sharedVal.loaded || Boolean(sharedVal.lib),
              shared: sharedVal,
              from: userOptions.name,
            });
          }
          this.emitAfterRegisterShare(sharedKey, {
            scope: sc,
            shared: sharedVal,
            previousShared: previousAtVersion,
            registeredShared:
              this.shareScopeMap[sc]?.[sharedKey]?.[sharedVal.version],
            trigger: 'runtime',
          });
        });
      });
    });

    return {
      newShareInfos,
      allShareInfos,
    };
  }

  async loadShare<T>(
    pkgName: string,
    extraOptions?: LoadShareExtraOptions,
  ): Promise<false | (() => T | undefined)> {
    const { host } = this;
    let loadContext = extraOptions?.context;
    // This function performs the following steps:
    // 1. Checks if the currently loaded share already exists, if not, it throws an error
    // 2. Searches globally for a matching share, if found, it uses it directly
    // 3. If not found, it retrieves it from the current share and stores the obtained share globally.

    const shareOptions = getTargetSharedOptions({
      pkgName,
      extraOptions,
      shareInfos: host.options.shared,
    });
    let shareOptionsRes: Shared | undefined = shareOptions;

    try {
      if (shareOptions?.scope) {
        await Promise.all(
          shareOptions.scope.map(async (shareScope) => {
            await Promise.all(
              this.initializeSharing(shareScope, {
                strategy: shareOptions.strategy,
                context: loadContext,
              }),
            );
            return;
          }),
        );
      }
      const loadShareRes = await this.hooks.lifecycle.beforeLoadShare.emit({
        pkgName,
        shareInfo: shareOptions,
        shared: host.options.shared,
        origin: host,
        loadContext,
      });

      shareOptionsRes = loadShareRes.shareInfo;
      loadContext = loadShareRes.loadContext || loadContext;

      // Assert that shareInfoRes exists, if not, throw an error
      assert(
        shareOptionsRes,
        `Cannot find shared "${pkgName}" in host "${host.options.name}". Ensure the shared config for "${pkgName}" is declared in the federation plugin options and the host has been initialized before loading shares.`,
      );
      const resolvedShareOptions = shareOptionsRes;

      const { shared: registeredShared, useTreesShaking } =
        getRegisteredShare(
          this.shareScopeMap,
          pkgName,
          shareOptionsRes,
          this.hooks.lifecycle.resolveShare,
          loadContext,
        ) || {};

      if (registeredShared) {
        const targetShared = directShare(registeredShared, useTreesShaking);
        if (targetShared.lib) {
          addUseIn(targetShared, host.options.name);
          this.emitAfterLoadShare({
            lifecycle: 'loadShare',
            pkgName,
            shareInfo: resolvedShareOptions,
            selectedShared: registeredShared,
            loadContext,
          });
          return targetShared.lib as () => T;
        } else if (targetShared.loading && !targetShared.loaded) {
          const factory = await targetShared.loading;
          targetShared.loaded = true;
          if (!targetShared.lib) {
            targetShared.lib = factory;
          }
          addUseIn(targetShared, host.options.name);
          this.emitAfterLoadShare({
            lifecycle: 'loadShare',
            pkgName,
            shareInfo: resolvedShareOptions,
            selectedShared: registeredShared,
            loadContext,
          });
          return factory;
        } else {
          const asyncLoadProcess = async () => {
            const factory = await targetShared.get!();
            addUseIn(targetShared, host.options.name);
            targetShared.loaded = true;
            targetShared.lib = factory;
            return factory as () => T;
          };
          const loading = asyncLoadProcess();
          this.setShared({
            pkgName,
            loaded: false,
            shared: registeredShared,
            from: host.options.name,
            lib: null,
            loading,
            treeShaking: useTreesShaking
              ? (targetShared as TreeShakingArgs)
              : undefined,
          });
          const factory = await loading;
          this.emitAfterLoadShare({
            lifecycle: 'loadShare',
            pkgName,
            shareInfo: resolvedShareOptions,
            selectedShared: registeredShared,
            loadContext,
          });
          return factory;
        }
      } else {
        if (extraOptions?.customShareInfo) {
          this.emitErrorLoadShare({
            lifecycle: 'loadShare',
            pkgName,
            shareInfo: resolvedShareOptions,
            recovered: true,
            loadContext,
          });
          return false;
        }
        const _useTreeShaking = shouldUseTreeShaking(
          resolvedShareOptions.treeShaking,
        );
        const targetShared = directShare(resolvedShareOptions, _useTreeShaking);

        const asyncLoadProcess = async () => {
          const factory = await targetShared.get!();
          targetShared.lib = factory;
          targetShared.loaded = true;
          addUseIn(targetShared, host.options.name);
          const { shared: gShared, useTreesShaking: gUseTreeShaking } =
            getRegisteredShare(
              this.shareScopeMap,
              pkgName,
              resolvedShareOptions,
              this.hooks.lifecycle.resolveShare,
              loadContext,
            ) || {};
          if (gShared) {
            const targetGShared = directShare(gShared, gUseTreeShaking);
            targetGShared.lib = factory;
            targetGShared.loaded = true;
            gShared.from = resolvedShareOptions.from;
          }
          return factory as () => T;
        };
        const loading = asyncLoadProcess();
        this.setShared({
          pkgName,
          loaded: false,
          shared: resolvedShareOptions,
          from: host.options.name,
          lib: null,
          loading,
          treeShaking: _useTreeShaking
            ? (targetShared as TreeShakingArgs)
            : undefined,
        });
        const factory = await loading;
        this.emitAfterLoadShare({
          lifecycle: 'loadShare',
          pkgName,
          shareInfo: resolvedShareOptions,
          selectedShared: resolvedShareOptions,
          loadContext,
        });
        return factory;
      }
    } catch (shareError) {
      this.emitErrorLoadShare({
        lifecycle: 'loadShare',
        pkgName,
        shareInfo: shareOptionsRes,
        error: shareError,
        loadContext,
      });
      throw shareError;
    }
  }

  /**
   * This function initializes the sharing sequence (executed only once per share scope).
   * It accepts one argument, the name of the share scope.
   * If the share scope does not exist, it creates one.
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  initializeSharing(
    shareScopeName = DEFAULT_SCOPE,
    extraOptions?: {
      initScope?: InitScope;
      from?: CallFrom;
      strategy?: ShareStrategy;
      context?: SharedLoadContext;
    },
  ): Array<Promise<void>> {
    const { host } = this;
    const from = extraOptions?.from;
    const strategy = extraOptions?.strategy;
    const trigger: SharedLoadTrigger =
      extraOptions?.context?.trigger || from || 'runtime';
    let initScope = extraOptions?.initScope;
    const promises: Promise<any>[] = [];
    if (from !== 'build') {
      const { initTokens } = this;
      if (!initScope) initScope = [];
      let initToken = initTokens[shareScopeName];
      if (!initToken)
        initToken = initTokens[shareScopeName] = { from: this.host.name };
      if (initScope.indexOf(initToken) >= 0) return promises;
      initScope.push(initToken);
    }

    const shareScope = this.shareScopeMap;
    const hostName = host.options.name;
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
      const existingShared = versions[version];
      const activeVersion: Shared =
        existingShared && (directShare(existingShared) as Shared);
      const activeVersionEager = Boolean(
        activeVersion &&
        (('eager' in activeVersion && activeVersion.eager) ||
          ('shareConfig' in activeVersion && activeVersion.shareConfig?.eager)),
      );
      const shouldReplace = Boolean(
        !activeVersion ||
        (activeVersion.strategy !== 'loaded-first' &&
          !activeVersion.loaded &&
          (Boolean(!eager) !== !activeVersionEager
            ? eager
            : hostName > versions[version].from)),
      );
      if (shouldReplace) {
        versions[version] = shared;
      }
      this.emitAfterRegisterShare(name, {
        scope: shareScopeName,
        shared,
        previousShared: existingShared,
        registeredShared: versions[version],
        trigger,
      });
    };

    const initRemoteModule = async (key: string): Promise<void> => {
      const { module } = await host.remoteHandler.getRemoteModuleAndOptions({
        id: key,
      });
      let remoteEntryExports: RemoteEntryExports | undefined = undefined;
      const resourceContext = {
        initiator: 'loadShare' as const,
        id: key,
        resourceType: 'remoteEntry' as const,
        url: module.remoteInfo.entry,
      };
      try {
        remoteEntryExports = await module.getEntry(undefined, resourceContext);
      } catch (error) {
        remoteEntryExports =
          (await host.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
            id: key,
            error,
            from: 'runtime',
            lifecycle: 'beforeLoadShare',
            remote: module.remoteInfo,
            origin: host,
          })) as RemoteEntryExports;
        if (!remoteEntryExports) {
          return;
        }
      } finally {
        // prevent self load loop: when host load self , the initTokens is not the same
        if (remoteEntryExports?.init && !module.initing) {
          module.remoteEntryExports = remoteEntryExports;
          await module.init(
            undefined,
            undefined,
            initScope,
            undefined,
            resourceContext,
          );
        }
      }
    };
    Object.keys(host.options.shared).forEach((shareName) => {
      const sharedArr = host.options.shared[shareName];
      sharedArr.forEach((shared) => {
        if (shared.scope.includes(shareScopeName)) {
          register(shareName, shared);
        }
      });
    });
    // TODO: strategy==='version-first' need to be removed in the future
    if (
      host.options.shareStrategy === 'version-first' ||
      strategy === 'version-first'
    ) {
      host.options.remotes.forEach((remote) => {
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
    pkgName: string,
    extraOptions?: LoadShareExtraOptions,
  ): () => T | never {
    const { host } = this;
    const loadContext = extraOptions?.context;
    const shareOptions = getTargetSharedOptions({
      pkgName,
      extraOptions,
      shareInfos: host.options.shared,
    });

    try {
      if (shareOptions?.scope) {
        shareOptions.scope.forEach((shareScope) => {
          this.initializeSharing(shareScope, {
            strategy: shareOptions.strategy,
            from: extraOptions?.from,
            context: loadContext,
          });
        });
      }
      const { shared: registeredShared } =
        getRegisteredShare(
          this.shareScopeMap,
          pkgName,
          shareOptions,
          this.hooks.lifecycle.resolveShare,
          loadContext,
        ) || {};

      if (registeredShared) {
        if (typeof registeredShared.lib === 'function') {
          addUseIn(registeredShared, host.options.name);
          if (!registeredShared.loaded) {
            registeredShared.loaded = true;
            if (registeredShared.from === host.options.name) {
              shareOptions.loaded = true;
            }
          }
          this.emitAfterLoadShare({
            lifecycle: 'loadShareSync',
            pkgName,
            shareInfo: shareOptions,
            selectedShared: registeredShared,
            loadContext,
          });
          return registeredShared.lib as () => T;
        }
        if (typeof registeredShared.get === 'function') {
          const module = registeredShared.get();
          if (!(module instanceof Promise)) {
            addUseIn(registeredShared, host.options.name);
            this.setShared({
              pkgName,
              loaded: true,
              from: host.options.name,
              lib: module,
              shared: registeredShared,
            });
            this.emitAfterLoadShare({
              lifecycle: 'loadShareSync',
              pkgName,
              shareInfo: shareOptions,
              selectedShared: registeredShared,
              loadContext,
            });
            return module;
          }
        }
      }

      if (shareOptions.lib) {
        if (!shareOptions.loaded) {
          shareOptions.loaded = true;
        }
        this.emitAfterLoadShare({
          lifecycle: 'loadShareSync',
          pkgName,
          shareInfo: shareOptions,
          selectedShared: shareOptions,
          loadContext,
        });
        return shareOptions.lib as () => T;
      }

      if (shareOptions.get) {
        const module = shareOptions.get();

        if (module instanceof Promise) {
          const errorCode =
            extraOptions?.from === 'build' ? RUNTIME_005 : RUNTIME_006;
          error(
            errorCode,
            runtimeDescMap,
            {
              hostName: host.options.name,
              sharedPkgName: pkgName,
            },
            undefined,
            optionsToMFContext(host.options),
          );
        }

        shareOptions.lib = module;

        this.setShared({
          pkgName,
          loaded: true,
          from: host.options.name,
          lib: shareOptions.lib,
          shared: shareOptions,
        });
        this.emitAfterLoadShare({
          lifecycle: 'loadShareSync',
          pkgName,
          shareInfo: shareOptions,
          selectedShared: shareOptions,
          loadContext,
        });
        return shareOptions.lib as () => T;
      }

      error(
        RUNTIME_006,
        runtimeDescMap,
        {
          hostName: host.options.name,
          sharedPkgName: pkgName,
        },
        undefined,
        optionsToMFContext(host.options),
      );
    } catch (shareError) {
      this.emitErrorLoadShare({
        lifecycle: 'loadShareSync',
        pkgName,
        shareInfo: shareOptions,
        error: shareError,
        loadContext,
      });
      throw shareError;
    }
  }

  initShareScopeMap(
    scopeName: string,
    shareScope: ShareScopeMap[string],
    extraOptions: { hostShareScopeMap?: ShareScopeMap } = {},
  ): void {
    const { host } = this;
    Object.assign(this.shareScopeMap, extraOptions.hostShareScopeMap);
    this.shareScopeMap[scopeName] = shareScope;
    this.hooks.lifecycle.initContainerShareScopeMap.emit({
      shareScope,
      options: host.options,
      origin: host,
      scopeName,
      hostShareScopeMap: extraOptions.hostShareScopeMap,
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
    treeShaking,
  }: {
    pkgName: string;
    shared: Shared;
    from: string;
    lib: any;
    loaded?: boolean;
    loading?: Shared['loading'];
    get?: Shared['get'];
    treeShaking?: TreeShakingArgs;
  }): void {
    const { version, scope = 'default', ...shareInfo } = shared;
    const scopes: string[] = Array.isArray(scope) ? scope : [scope];

    const mergeAttrs = (shared: Shared) => {
      const merge = <K extends keyof TreeShakingArgs>(
        s: TreeShakingArgs,
        key: K,
        val: TreeShakingArgs[K],
      ): void => {
        if (val && !s[key]) {
          s[key] = val;
        }
      };
      const targetShared = (
        treeShaking ? shared.treeShaking! : shared
      ) as TreeShakingArgs;
      merge(targetShared, 'loaded', loaded);
      merge(targetShared, 'loading', loading);
      merge(targetShared, 'get', get);
      merge(targetShared, 'lib', lib);
    };
    scopes.forEach((sc) => {
      if (!this.shareScopeMap[sc]) {
        this.shareScopeMap[sc] = {};
      }
      if (!this.shareScopeMap[sc][pkgName]) {
        this.shareScopeMap[sc][pkgName] = {};
      }

      if (!this.shareScopeMap[sc][pkgName][version]) {
        this.shareScopeMap[sc][pkgName][version] = {
          version,
          scope: [sc],
          ...shareInfo,
          lib,
        };
      }

      const registeredShared = this.shareScopeMap[sc][pkgName][version];
      mergeAttrs(registeredShared);
      if (from && registeredShared.from !== from) {
        registeredShared.from = from;
      }
    });
  }

  private _setGlobalShareScopeMap(hostOptions: Options): void {
    const globalShareScopeMap = getGlobalShareScope();
    const identifier = hostOptions.id || hostOptions.name;
    if (identifier && !globalShareScopeMap[identifier]) {
      globalShareScopeMap[identifier] = this.shareScopeMap;
    }
  }
}
