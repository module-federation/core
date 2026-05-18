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
import { LoadRemoteMatch } from '../remote';
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
    afterResolve: new AsyncWaterfallHook<LoadRemoteMatch>('afterResolve'),
    beforeLoadShare: new AsyncWaterfallHook<{
      pkgName: string;
      shareInfo?: Shared;
      shared: Options['shared'];
      origin: ModuleFederation;
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

  private emitAfterLoadShare({
    lifecycle,
    pkgName,
    shareInfo,
    selectedShared,
  }: {
    lifecycle: 'loadShare' | 'loadShareSync';
    pkgName: string;
    shareInfo?: Partial<Shared>;
    selectedShared?: Partial<Shared>;
  }): void {
    try {
      this.hooks.lifecycle.afterLoadShare.emit({
        pkgName,
        shareInfo,
        selectedShared,
        shared: this.host.options.shared,
        shareScopeMap: this.shareScopeMap,
        lifecycle,
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
  }: {
    lifecycle: 'loadShare' | 'loadShareSync';
    pkgName: string;
    shareInfo?: Partial<Shared>;
    error?: unknown;
    recovered?: boolean;
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
    extraOptions?: {
      customShareInfo?: Partial<Shared>;
      resolver?: (sharedOptions: ShareInfos[string]) => Shared;
    },
  ): Promise<false | (() => T | undefined)> {
    const { host } = this;
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
      });

      shareOptionsRes = loadShareRes.shareInfo;

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
        });
        return factory;
      }
    } catch (shareError) {
      this.emitErrorLoadShare({
        lifecycle: 'loadShare',
        pkgName,
        shareInfo: shareOptionsRes,
        error: shareError,
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
    },
  ): Array<Promise<void>> {
    const { host } = this;
    const from = extraOptions?.from;
    const strategy = extraOptions?.strategy;
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
      const activeVersion: Shared =
        versions[version] && (directShare(versions[version]) as Shared);
      const activeVersionEager = Boolean(
        activeVersion &&
        (('eager' in activeVersion && activeVersion.eager) ||
          ('shareConfig' in activeVersion && activeVersion.shareConfig?.eager)),
      );
      if (
        !activeVersion ||
        (activeVersion.strategy !== 'loaded-first' &&
          !activeVersion.loaded &&
          (Boolean(!eager) !== !activeVersionEager
            ? eager
            : hostName > versions[version].from))
      ) {
        versions[version] = shared;
      }
    };

    const initRemoteModule = async (key: string): Promise<void> => {
      const { module } = await host.remoteHandler.getRemoteModuleAndOptions({
        id: key,
      });
      let remoteEntryExports: RemoteEntryExports | undefined = undefined;
      try {
        remoteEntryExports = await module.getEntry();
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
          await module.init(undefined, undefined, initScope);
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
    extraOptions?: {
      from?: 'build' | 'runtime';
      customShareInfo?: Partial<Shared>;
      resolver?: (sharedOptions: ShareInfos[string]) => Shared;
    },
  ): () => T | never {
    const { host } = this;
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
          });
        });
      }
      const { shared: registeredShared } =
        getRegisteredShare(
          this.shareScopeMap,
          pkgName,
          shareOptions,
          this.hooks.lifecycle.resolveShare,
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
