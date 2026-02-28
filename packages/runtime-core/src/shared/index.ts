import { RUNTIME_005, RUNTIME_006 } from '@module-federation/error-codes';
import { TreeShakingStatus, satisfy } from '@module-federation/sdk';
import { Global, Federation } from '../global';
import {
  Options,
  ShareScopeMap,
  ShareInfos,
  Shared,
  ShareArgs,
  RemoteEntryExports,
  UserOptions,
  ShareStrategy,
  InitScope,
  InitTokens,
  CallFrom,
  TreeShakingArgs,
  SharedGetter,
  GlobalShareScopeMap,
  LoadShareExtraOptions,
} from '../type';
import { ModuleFederation } from '../core';
import {
  PluginSystem,
  AsyncWaterfallHook,
  SyncWaterfallHook,
} from '../utils/hooks';
import { warn, error } from '../utils/logger';
import { addUniqueItem, arrayOptions, isPlainObject } from '../utils/tool';
import { assert, runtimeError } from '../utils';
import { DEFAULT_SCOPE } from '../constant';
import { LoadRemoteMatch } from '../remote';
import { Effect } from '@module-federation/micro-effect';

function formatShare(
  shareArgs: ShareArgs,
  from: string,
  name: string,
  shareStrategy?: ShareStrategy,
): Shared {
  const get: Shared['get'] =
    'get' in shareArgs
      ? shareArgs.get
      : 'lib' in shareArgs
        ? () => Promise.resolve(shareArgs.lib)
        : () =>
            Promise.resolve(() => {
              throw new Error(`Can not get shared '${name}'!`);
            });

  if (shareArgs.shareConfig?.eager && shareArgs.treeShaking)
    throw new Error(
      'Can not set "eager:true" and "treeShaking" at the same time!',
    );

  return {
    deps: [],
    useIn: [],
    from,
    loading: null,
    ...shareArgs,
    shareConfig: {
      requiredVersion: `^${shareArgs.version}`,
      singleton: false,
      eager: false,
      strictVersion: false,
      ...shareArgs.shareConfig,
    },
    get,
    loaded: shareArgs.loaded ?? ('lib' in shareArgs ? true : undefined),
    version: shareArgs.version ?? '0',
    scope: Array.isArray(shareArgs.scope)
      ? shareArgs.scope
      : [shareArgs.scope ?? 'default'],
    strategy: (shareArgs.strategy ?? shareStrategy) || 'version-first',
    treeShaking: shareArgs.treeShaking
      ? {
          ...shareArgs.treeShaking,
          mode: shareArgs.treeShaking.mode ?? 'server-calc',
          status: shareArgs.treeShaking.status ?? TreeShakingStatus.UNKNOWN,
          useIn: [],
        }
      : undefined,
  };
}

export function formatShareConfigs(
  prevOptions: Options,
  newOptions: UserOptions,
) {
  const shareArgs = newOptions.shared || {};
  const from = newOptions.name;
  const newShareInfos = Object.keys(shareArgs).reduce((res, pkgName) => {
    const arrayShareArgs = arrayOptions(shareArgs[pkgName]);
    res[pkgName] = res[pkgName] || [];
    arrayShareArgs.forEach((shareConfig) => {
      res[pkgName].push(
        formatShare(shareConfig, from, pkgName, newOptions.shareStrategy),
      );
    });
    return res;
  }, {} as ShareInfos);
  const allShareInfos = {
    ...prevOptions.shared,
  };

  Object.keys(newShareInfos).forEach((shareKey) => {
    if (!allShareInfos[shareKey]) {
      allShareInfos[shareKey] = newShareInfos[shareKey];
    } else {
      newShareInfos[shareKey].forEach((newUserSharedOptions) => {
        const isSameVersion = allShareInfos[shareKey].find(
          (sharedVal) => sharedVal.version === newUserSharedOptions.version,
        );
        if (!isSameVersion) {
          allShareInfos[shareKey].push(newUserSharedOptions);
        }
      });
    }
  });
  return { allShareInfos, newShareInfos };
}
export function shouldUseTreeShaking(
  treeShaking?: TreeShakingArgs,
  usedExports?: string[],
) {
  if (!treeShaking) {
    return false;
  }
  const { status, mode } = treeShaking;
  if (status === TreeShakingStatus.NO_USE) {
    return false;
  }

  if (status === TreeShakingStatus.CALCULATED) {
    return true;
  }

  // isMatchUsedExports inlined (Step 5d)
  if (mode === 'runtime-infer') {
    if (!usedExports) return true;
    if (!treeShaking.usedExports) return false;
    return usedExports.every((e) => treeShaking.usedExports!.includes(e));
  }

  return false;
}

export function versionLt(a: string, b: string): boolean {
  const normalize = (version: string) => {
    if (Number.isNaN(Number(version))) return version;
    const parts = version.split('.');
    return parts.length >= 3
      ? version
      : `${version}${'.0'.repeat(3 - parts.length)}`;
  };
  return satisfy(normalize(a), `<=${normalize(b)}`);
}

export const findVersion = (
  shareVersionMap: ShareScopeMap[string][string],
  cb?: (prev: string, cur: string) => boolean,
): string => {
  const callback = cb || ((prev: string, cur: string) => versionLt(prev, cur));
  return Object.keys(shareVersionMap).reduce((prev: number | string, cur) => {
    if (!prev || callback(prev as string, cur) || prev === '0') return cur;
    return prev;
  }, 0) as string;
};

export const isLoaded = (shared: {
  loading?: null | Promise<any>;
  loaded?: boolean;
  lib?: () => unknown;
}) => {
  return Boolean(shared.loaded) || typeof shared.lib === 'function';
};

// isLoadingOrLoaded kept as function (used in multiple places in singleton callbacks) (Step 5d)
const isLoadingOrLoaded = (s: {
  loading?: null | Promise<any>;
  loaded?: boolean;
  lib?: () => unknown;
}) => isLoaded(s) || Boolean(s.loading);

function findSingletonVersion(
  shareScopeMap: ShareScopeMap,
  scope: string,
  pkgName: string,
  treeShaking: TreeShakingArgs | undefined,
  makeCallback: (
    versions: ShareScopeMap[string][string],
    useTreesShaking: boolean,
  ) => (prev: string, cur: string) => boolean,
): { version: string; useTreesShaking: boolean } {
  const versions = shareScopeMap[scope][pkgName];
  let useTreesShaking = shouldUseTreeShaking(treeShaking);

  if (useTreesShaking) {
    const callback = makeCallback(versions, true);
    const version = findVersion(versions, callback);
    if (version) {
      return { version, useTreesShaking };
    }
    useTreesShaking = false;
  }

  const callback = makeCallback(versions, false);
  return {
    version: findVersion(versions, callback),
    useTreesShaking,
  };
}

type ShareComparatorFactory = (
  versions: ShareScopeMap[string][string],
  useTreesShaking: boolean,
) => (prev: string, cur: string) => boolean;

const makeLoadedFirstComparator: ShareComparatorFactory =
  (versions, useTreesShaking) => (prev, cur) => {
    if (useTreesShaking) {
      const prevTs = versions[prev].treeShaking;
      const curTs = versions[cur].treeShaking;
      if (!prevTs) return true;
      if (!curTs) return false;
      const curLoaded = isLoadingOrLoaded(curTs);
      const prevLoaded = isLoadingOrLoaded(prevTs);
      if (curLoaded) return prevLoaded ? versionLt(prev, cur) : true;
      if (prevLoaded) return false;
    }
    const curLoaded = isLoadingOrLoaded(versions[cur]);
    const prevLoaded = isLoadingOrLoaded(versions[prev]);
    if (curLoaded) return prevLoaded ? versionLt(prev, cur) : true;
    if (prevLoaded) return false;
    return versionLt(prev, cur);
  };

const makeVersionFirstComparator: ShareComparatorFactory =
  (versions, useTreesShaking) => (prev, cur) => {
    if (useTreesShaking) {
      if (!versions[prev].treeShaking) return true;
      if (!versions[cur].treeShaking) return false;
      return !isLoaded(versions[prev].treeShaking) && versionLt(prev, cur);
    }
    return !isLoaded(versions[prev]) && versionLt(prev, cur);
  };

// Step 5b & 5c: findSingletonVersionOrderByVersion, findSingletonVersionOrderByLoaded,
// and getFindShareFunction removed; callbacks inlined directly in getRegisteredShare.

export function getRegisteredShare(
  localShareScopeMap: ShareScopeMap,
  pkgName: string,
  shareInfo: Shared,
  resolveShare: SyncWaterfallHook<{
    shareScopeMap: ShareScopeMap;
    scope: string;
    pkgName: string;
    version: string;
    shareInfo: Shared;
    GlobalFederation: Federation;
    resolver: () => { shared: Shared; useTreesShaking: boolean } | undefined;
  }>,
): { shared: Shared; useTreesShaking: boolean } | void {
  if (!localShareScopeMap) {
    return;
  }
  const {
    shareConfig,
    scope = DEFAULT_SCOPE,
    strategy,
    treeShaking,
  } = shareInfo;
  const scopes = Array.isArray(scope) ? scope : [scope];

  const comparatorFactory =
    strategy === 'loaded-first'
      ? makeLoadedFirstComparator
      : makeVersionFirstComparator;

  for (const sc of scopes) {
    if (
      shareConfig &&
      localShareScopeMap[sc] &&
      localShareScopeMap[sc][pkgName]
    ) {
      const { requiredVersion } = shareConfig;
      const { version: maxOrSingletonVersion, useTreesShaking } =
        findSingletonVersion(
          localShareScopeMap,
          sc,
          pkgName,
          treeShaking,
          comparatorFactory,
        );

      // Step 5c: simplified defaultResolver
      const defaultResolver = () => {
        const shared = localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
        if (shareConfig.singleton) {
          if (
            typeof requiredVersion === 'string' &&
            !satisfy(maxOrSingletonVersion, requiredVersion)
          ) {
            const msg = `Version ${maxOrSingletonVersion} from ${
              maxOrSingletonVersion && shared.from
            } of shared singleton module ${pkgName} does not satisfy the requirement of ${
              shareInfo.from
            } which needs ${requiredVersion})`;

            if (shareConfig.strictVersion) {
              error(msg);
            } else {
              warn(msg);
            }
          }
          return { shared, useTreesShaking };
        }

        if (requiredVersion === false || requiredVersion === '*') {
          return { shared, useTreesShaking };
        }
        if (satisfy(maxOrSingletonVersion, requiredVersion)) {
          return { shared, useTreesShaking };
        }

        const _usedTreeShaking = shouldUseTreeShaking(treeShaking);
        for (const useTs of _usedTreeShaking ? [true, false] : [false]) {
          for (const [versionKey, versionValue] of Object.entries(
            localShareScopeMap[sc][pkgName],
          )) {
            if (
              useTs &&
              !shouldUseTreeShaking(
                versionValue.treeShaking,
                treeShaking?.usedExports,
              )
            )
              continue;
            if (satisfy(versionKey, requiredVersion)) {
              return { shared: versionValue, useTreesShaking: useTs };
            }
          }
        }
        return;
      };
      const params = {
        shareScopeMap: localShareScopeMap,
        scope: sc,
        pkgName,
        version: maxOrSingletonVersion,
        GlobalFederation: Global.__FEDERATION__,
        shareInfo,
        resolver: defaultResolver,
      };
      const resolveShared = resolveShare.emit(params) || params;
      return resolveShared.resolver();
    }
  }
}

export function getGlobalShareScope(): GlobalShareScopeMap {
  return Global.__FEDERATION__.__SHARE__;
}

export function getTargetSharedOptions(options: {
  pkgName: string;
  extraOptions?: LoadShareExtraOptions;
  shareInfos: ShareInfos;
}) {
  const { pkgName, extraOptions, shareInfos } = options;
  const defaultResolver = (sharedOptions: ShareInfos[string]) => {
    if (!sharedOptions) return undefined;
    const shareVersionMap = Object.fromEntries(
      sharedOptions.map((shared) => [shared.version, shared]),
    ) as ShareScopeMap[string][string];
    const maxVersion = findVersion(
      shareVersionMap,
      (prev, cur) => !isLoaded(shareVersionMap[prev]) && versionLt(prev, cur),
    );
    return shareVersionMap[maxVersion];
  };

  const resolver = extraOptions?.resolver ?? defaultResolver;

  const merge = <T extends Record<string, any>>(
    ...sources: Array<Partial<T> | undefined>
  ): T => {
    const out = {} as T;
    for (const src of sources) {
      if (!src) continue;
      for (const [k, v] of Object.entries(src)) {
        (out as any)[k] =
          isPlainObject((out as any)[k]) && isPlainObject(v)
            ? merge((out as any)[k], v)
            : v !== undefined
              ? v
              : (out as any)[k];
      }
    }
    return out;
  };

  return merge(resolver(shareInfos[pkgName]), extraOptions?.customShareInfo);
}

export const addUseIn = (
  shared: { useIn?: Array<string> },
  from: string,
): void => {
  shared.useIn ??= [];
  addUniqueItem(shared.useIn, from);
};

export function directShare(
  shared: Shared,
  useTreesShaking?: boolean,
): Shared | TreeShakingArgs {
  if (useTreesShaking && shared.treeShaking) return shared.treeShaking;
  return shared;
}

// --- SharedHandler and supporting functions ---

function resolveRegistered(
  handler: SharedHandler,
  pkgName: string,
  shareOptions: Shared,
) {
  return (
    getRegisteredShare(
      handler.shareScopeMap,
      pkgName,
      shareOptions,
      handler.hooks.lifecycle.resolveShare,
    ) || { shared: undefined, useTreesShaking: undefined }
  );
}

function loadSharedAsync<T>(
  handler: SharedHandler,
  pkgName: string,
  shared: Shared,
  targetShared: Shared | TreeShakingArgs,
  useTreeShaking: boolean | undefined,
  hostName: string,
  resolveGlobal: boolean,
) {
  const loading = (async () => {
    const factory = await targetShared.get!();
    targetShared.lib = factory;
    targetShared.loaded = true;
    addUseIn(targetShared, hostName);
    if (resolveGlobal) {
      const { shared: gShared, useTreesShaking: gUseTreeShaking } =
        resolveRegistered(handler, pkgName, shared);
      if (gShared) {
        const targetGShared = directShare(gShared, gUseTreeShaking);
        targetGShared.lib = factory;
        targetGShared.loaded = true;
        gShared.from = shared.from;
      }
    }
    return factory as () => T;
  })();
  handler.setShared({
    pkgName,
    loaded: false,
    shared,
    from: hostName,
    lib: null,
    loading,
    treeShaking: useTreeShaking ? (targetShared as TreeShakingArgs) : undefined,
  });
  return loading;
}

const loadShareEffect = <T>(
  handler: SharedHandler,
  pkgName: string,
  extraOptions?: {
    customShareInfo?: Partial<Shared>;
    resolver?: (sharedOptions: ShareInfos[string]) => Shared;
  },
): Effect.Effect<false | (() => T | undefined)> =>
  Effect.gen(function* () {
    const { host } = handler;
    const hostName = host.options.name;

    const shareOptions = getTargetSharedOptions({
      pkgName,
      extraOptions,
      shareInfos: host.options.shared,
    });

    if (shareOptions?.scope) {
      yield* Effect.forEach(
        shareOptions.scope,
        (shareScope: string) =>
          Effect.promise(() =>
            Promise.all(
              handler.initializeSharing(shareScope, {
                strategy: shareOptions.strategy,
              }),
            ),
          ),
        { concurrency: 'parallel' },
      );
    }

    const loadShareRes = yield* Effect.promise(() =>
      handler.hooks.lifecycle.beforeLoadShare.emit({
        pkgName,
        shareInfo: shareOptions,
        shared: host.options.shared,
        origin: host,
      }),
    );

    const { shareInfo: shareOptionsRes } = loadShareRes;

    assert(
      shareOptionsRes,
      `Cannot find ${pkgName} Share in the ${hostName}. Please ensure that the ${pkgName} Share parameters have been injected`,
    );

    const { shared: registeredShared, useTreesShaking } = resolveRegistered(
      handler,
      pkgName,
      shareOptionsRes,
    );

    if (registeredShared) {
      const targetShared = directShare(registeredShared, useTreesShaking);
      if (targetShared.lib) {
        addUseIn(targetShared, hostName);
        return targetShared.lib as () => T;
      } else if (targetShared.loading && !targetShared.loaded) {
        const factory = yield* Effect.promise(() => targetShared.loading!);
        targetShared.loaded = true;
        if (!targetShared.lib) {
          targetShared.lib = factory;
        }
        addUseIn(targetShared, hostName);
        return factory;
      } else {
        return yield* Effect.promise(() =>
          loadSharedAsync<T>(
            handler,
            pkgName,
            registeredShared,
            targetShared,
            useTreesShaking,
            hostName,
            false,
          ),
        );
      }
    } else {
      if (extraOptions?.customShareInfo) {
        return false;
      }
      const _useTreeShaking = shouldUseTreeShaking(shareOptionsRes.treeShaking);
      const targetShared = directShare(shareOptionsRes, _useTreeShaking);
      return yield* Effect.promise(() =>
        loadSharedAsync<T>(
          handler,
          pkgName,
          shareOptionsRes,
          targetShared,
          _useTreeShaking,
          hostName,
          true,
        ),
      );
    }
  });

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
    resolveShare: new SyncWaterfallHook<{
      shareScopeMap: ShareScopeMap;
      scope: string;
      pkgName: string;
      version: string;
      shareInfo: Shared;
      GlobalFederation: Federation;
      resolver: () => { shared: Shared; useTreesShaking: boolean } | undefined;
    }>('resolveShare'),
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

  // register shared in shareScopeMap
  registerShared(globalOptions: Options, userOptions: UserOptions) {
    const { newShareInfos, allShareInfos } = formatShareConfigs(
      globalOptions,
      userOptions,
    );

    Object.entries(newShareInfos).forEach(([sharedKey, sharedVals]) => {
      sharedVals.forEach((sharedVal) => {
        sharedVal.scope.forEach((sc) => {
          this.hooks.lifecycle.beforeRegisterShare.emit({
            origin: this.host,
            pkgName: sharedKey,
            shared: sharedVal,
          });
          if (!this.shareScopeMap[sc]?.[sharedKey]) {
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
    return Effect.runPromise(loadShareEffect<T>(this, pkgName, extraOptions));
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
      initScope ??= [];
      let initToken = initTokens[shareScopeName];
      if (!initToken)
        initToken = initTokens[shareScopeName] = { from: this.host.name };
      if (initScope.indexOf(initToken) >= 0) return promises;
      initScope.push(initToken);
    }

    const hostName = host.options.name;
    const scope = (this.shareScopeMap[shareScopeName] ||= {});
    const register = (name: string, shared: Shared) => {
      const { version, eager } = shared;
      const versions = (scope[name] ||= {});
      const av =
        versions[version] && (directShare(versions[version]) as Shared);
      const avEager = av && (av.eager || av.shareConfig?.eager);
      if (
        !av ||
        (av.strategy !== 'loaded-first' &&
          !av.loaded &&
          (Boolean(!eager) !== !avEager
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
            origin: host,
          })) as RemoteEntryExports;
      } finally {
        // prevent self load loop: when host load self , the initTokens is not the same
        if (remoteEntryExports?.init && !module.initing) {
          module.remoteEntryExports = remoteEntryExports;
          await module.init(undefined, undefined, initScope);
        }
      }
    };
    Object.keys(host.options.shared).forEach((shareName) => {
      host.options.shared[shareName].forEach((shared) => {
        if (shared.scope.includes(shareScopeName)) register(shareName, shared);
      });
    });
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
  private resolveSyncShared<T>(
    pkgName: string,
    shared: Shared | undefined,
    hostName: string,
    options: {
      allowPromise: boolean;
      shareOptions?: Shared;
      from?: 'build' | 'runtime';
    },
  ): (() => T) | undefined {
    if (!shared) return;
    if (typeof shared.lib === 'function') {
      addUseIn(shared, hostName);
      if (!shared.loaded) {
        shared.loaded = true;
        if (options.shareOptions && shared.from === hostName)
          options.shareOptions.loaded = true;
      }
      return shared.lib as () => T;
    }
    if (typeof shared.get !== 'function') return;
    const module = shared.get();
    if (module instanceof Promise) {
      if (!options.allowPromise) {
        const errorCode = options.from === 'build' ? RUNTIME_005 : RUNTIME_006;
        throw new Error(
          runtimeError(errorCode, { hostName, sharedPkgName: pkgName }),
        );
      }
      return;
    }
    addUseIn(shared, hostName);
    shared.lib = module;
    this.setShared({
      pkgName,
      loaded: true,
      from: hostName,
      lib: module,
      shared,
    });
    return module as () => T;
  }

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

    if (shareOptions?.scope) {
      shareOptions.scope.forEach((shareScope) => {
        this.initializeSharing(shareScope, { strategy: shareOptions.strategy });
      });
    }
    const { shared: registeredShared } =
      getRegisteredShare(
        this.shareScopeMap,
        pkgName,
        shareOptions,
        this.hooks.lifecycle.resolveShare,
      ) || {};

    const hostName = host.options.name;
    const resolvedFromGlobal = this.resolveSyncShared<T>(
      pkgName,
      registeredShared,
      hostName,
      { allowPromise: true, shareOptions },
    );
    if (resolvedFromGlobal) return resolvedFromGlobal;

    const resolvedLocal = this.resolveSyncShared<T>(
      pkgName,
      shareOptions,
      hostName,
      {
        allowPromise: false,
        from: extraOptions?.from,
      },
    );
    if (resolvedLocal) return resolvedLocal;

    throw new Error(
      runtimeError(RUNTIME_006, {
        hostName,
        sharedPkgName: pkgName,
      }),
    );
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

  setShared({
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
    for (const sc of scopes) {
      if (!this.shareScopeMap[sc]) this.shareScopeMap[sc] = {};
      if (!this.shareScopeMap[sc][pkgName])
        this.shareScopeMap[sc][pkgName] = {};
      if (!this.shareScopeMap[sc][pkgName][version]) {
        this.shareScopeMap[sc][pkgName][version] = {
          version,
          scope: [sc],
          ...shareInfo,
          lib,
        };
      }
      const reg = this.shareScopeMap[sc][pkgName][version];
      const target = (treeShaking ? reg.treeShaking! : reg) as TreeShakingArgs;
      if (loaded && !target.loaded) target.loaded = loaded;
      if (loading && !target.loading) target.loading = loading;
      if (get && !target.get) target.get = get;
      if (from && reg.from !== from) reg.from = from;
    }
  }

  private _setGlobalShareScopeMap(hostOptions: Options): void {
    const globalShareScopeMap = getGlobalShareScope();
    const identifier = hostOptions.id || hostOptions.name;
    if (identifier && !globalShareScopeMap[identifier]) {
      globalShareScopeMap[identifier] = this.shareScopeMap;
    }
  }
}
