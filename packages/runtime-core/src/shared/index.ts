import { RUNTIME_005, RUNTIME_006 } from '@module-federation/error-codes';
import { TreeShakingStatus } from '@module-federation/sdk';
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
  AsyncHook,
  AsyncWaterfallHook,
  SyncWaterfallHook,
} from '../utils/hooks';
import { warn, error } from '../utils/logger';
import { satisfy } from '../utils/semver';
import { addUniqueItem, arrayOptions, isPlainObject } from '../utils/tool';
import { assert, runtimeError } from '../utils';
import { DEFAULT_SCOPE } from '../constant';
import { LoadRemoteMatch } from '../remote';
import { Effect } from '@module-federation/micro-effect';

// --- Share utility functions (merged from utils/share.ts) ---

function formatShare(
  shareArgs: ShareArgs,
  from: string,
  name: string,
  shareStrategy?: ShareStrategy,
): Shared {
  let get: Shared['get'];
  if ('get' in shareArgs) {
    // eslint-disable-next-line prefer-destructuring
    get = shareArgs.get;
  } else if ('lib' in shareArgs) {
    get = () => Promise.resolve(shareArgs.lib);
  } else {
    get = () =>
      Promise.resolve(() => {
        throw new Error(`Can not get shared '${name}'!`);
      });
  }

  if (shareArgs.shareConfig?.eager && shareArgs.treeShaking) {
    throw new Error(
      'Can not set "eager:true" and "treeShaking" at the same time!',
    );
  }

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
    loaded: shareArgs?.loaded || 'lib' in shareArgs ? true : undefined,
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
  const transformInvalidVersion = (version: string) => {
    const isNumberVersion = !Number.isNaN(Number(version));
    if (isNumberVersion) {
      const splitArr = version.split('.');
      let validVersion = version;
      for (let i = 0; i < 3 - splitArr.length; i++) {
        validVersion += '.0';
      }
      return validVersion;
    }
    return version;
  };
  return satisfy(transformInvalidVersion(a), `<=${transformInvalidVersion(b)}`);
}

export const findVersion = (
  shareVersionMap: ShareScopeMap[string][string],
  cb?: (prev: string, cur: string) => boolean,
): string => {
  const callback =
    cb ||
    function (prev: string, cur: string): boolean {
      return versionLt(prev, cur);
    };

  return Object.keys(shareVersionMap).reduce((prev: number | string, cur) => {
    if (!prev) {
      return cur;
    }
    if (callback(prev as string, cur)) {
      return cur;
    }

    // default version is '0' https://github.com/webpack/webpack/blob/main/lib/sharing/ProvideSharedModule.js#L136
    if (prev === '0') {
      return cur;
    }

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
const isLoadingOrLoaded = (shared: {
  loading?: null | Promise<any>;
  loaded?: boolean;
  lib?: () => unknown;
}) => {
  return isLoaded(shared) || Boolean(shared.loading);
};

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

  // Step 5b: inline the singleton finder callbacks directly
  const findShareFn =
    strategy === 'loaded-first'
      ? (
          shareScopeMap: ShareScopeMap,
          sc: string,
          pkg: string,
          ts?: TreeShakingArgs,
        ) =>
          findSingletonVersion(
            shareScopeMap,
            sc,
            pkg,
            ts,
            (versions, useTreesShaking) => (prev, cur) => {
              if (useTreesShaking) {
                if (!versions[prev].treeShaking) return true;
                if (!versions[cur].treeShaking) return false;
                if (isLoadingOrLoaded(versions[cur].treeShaking)) {
                  return isLoadingOrLoaded(versions[prev].treeShaking)
                    ? Boolean(versionLt(prev, cur))
                    : true;
                }
                if (isLoadingOrLoaded(versions[prev].treeShaking)) return false;
              }
              if (isLoadingOrLoaded(versions[cur])) {
                return isLoadingOrLoaded(versions[prev])
                  ? Boolean(versionLt(prev, cur))
                  : true;
              }
              if (isLoadingOrLoaded(versions[prev])) return false;
              return versionLt(prev, cur);
            },
          )
      : (
          shareScopeMap: ShareScopeMap,
          sc: string,
          pkg: string,
          ts?: TreeShakingArgs,
        ) =>
          findSingletonVersion(
            shareScopeMap,
            sc,
            pkg,
            ts,
            (versions, useTreesShaking) => (prev, cur) => {
              if (useTreesShaking) {
                if (!versions[prev].treeShaking) return true;
                if (!versions[cur].treeShaking) return false;
                return (
                  !isLoaded(versions[prev].treeShaking) && versionLt(prev, cur)
                );
              }
              return !isLoaded(versions[prev]) && versionLt(prev, cur);
            },
          );

  for (const sc of scopes) {
    if (
      shareConfig &&
      localShareScopeMap[sc] &&
      localShareScopeMap[sc][pkgName]
    ) {
      const { requiredVersion } = shareConfig;
      const { version: maxOrSingletonVersion, useTreesShaking } = findShareFn(
        localShareScopeMap,
        sc,
        pkgName,
        treeShaking,
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
    if (!sharedOptions) {
      return undefined;
    }
    const shareVersionMap: ShareScopeMap[string][string] = {};
    sharedOptions.forEach((shared) => {
      shareVersionMap[shared.version] = shared;
    });
    const callback = function (prev: string, cur: string): boolean {
      return !isLoaded(shareVersionMap[prev]) && versionLt(prev, cur);
    };

    const maxVersion = findVersion(shareVersionMap, callback);
    return shareVersionMap[maxVersion];
  };

  const resolver = extraOptions?.resolver ?? defaultResolver;

  const merge = <T extends Record<string, any>>(
    ...sources: Array<Partial<T> | undefined>
  ): T => {
    const out = {} as T;
    for (const src of sources) {
      if (!src) continue;
      for (const [key, value] of Object.entries(src)) {
        const prev = (out as any)[key];
        if (isPlainObject(prev) && isPlainObject(value)) {
          (out as any)[key] = merge(prev, value);
        } else if (value !== undefined) {
          (out as any)[key] = value;
        }
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
  if (!shared.useIn) {
    shared.useIn = [];
  }
  addUniqueItem(shared.useIn, from);
};

export function directShare(
  shared: Shared,
  useTreesShaking?: boolean,
): Shared | TreeShakingArgs {
  if (useTreesShaking && shared.treeShaking) {
    return shared.treeShaking;
  }

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

function loadFoundAsync<T>(
  handler: SharedHandler,
  pkgName: string,
  registeredShared: Shared,
  targetShared: Shared | TreeShakingArgs,
  useTreesShaking: boolean | undefined,
  hostName: string,
) {
  const loading = (async () => {
    const factory = await targetShared.get!();
    addUseIn(targetShared, hostName);
    targetShared.loaded = true;
    targetShared.lib = factory;
    return factory as () => T;
  })();
  handler.setShared({
    pkgName,
    loaded: false,
    shared: registeredShared,
    from: hostName,
    lib: null,
    loading,
    treeShaking: useTreesShaking
      ? (targetShared as TreeShakingArgs)
      : undefined,
  });
  return loading;
}

function loadNotFoundAsync<T>(
  handler: SharedHandler,
  pkgName: string,
  shareOptionsRes: Shared,
  targetShared: Shared | TreeShakingArgs,
  useTreeShaking: boolean,
  hostName: string,
) {
  const loading = (async () => {
    const factory = await targetShared.get!();
    targetShared.lib = factory;
    targetShared.loaded = true;
    addUseIn(targetShared, hostName);
    const { shared: gShared, useTreesShaking: gUseTreeShaking } =
      resolveRegistered(handler, pkgName, shareOptionsRes);
    if (gShared) {
      const targetGShared = directShare(gShared, gUseTreeShaking);
      targetGShared.lib = factory;
      targetGShared.loaded = true;
      gShared.from = shareOptionsRes.from;
    }
    return factory as () => T;
  })();
  handler.setShared({
    pkgName,
    loaded: false,
    shared: shareOptionsRes,
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
          loadFoundAsync<T>(
            handler,
            pkgName,
            registeredShared,
            targetShared,
            useTreesShaking,
            hostName,
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
        loadNotFoundAsync<T>(
          handler,
          pkgName,
          shareOptionsRes,
          targetShared,
          _useTreeShaking,
          hostName,
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
    // not used yet
    loadShare: new AsyncHook<[ModuleFederation, string, ShareInfos]>(),
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
            ('shareConfig' in activeVersion &&
              activeVersion.shareConfig?.eager)),
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
            origin: host,
          })) as RemoteEntryExports;
      } finally {
        if (remoteEntryExports?.init) {
          module.remoteEntryExports = remoteEntryExports;
          await module.init();
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

    if (shareOptions?.scope) {
      shareOptions.scope.forEach((shareScope) => {
        this.initializeSharing(shareScope, { strategy: shareOptions.strategy });
      });
    }
    const { shared: registeredShared, useTreesShaking } =
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
          return module;
        }
      }
    }

    if (shareOptions.lib) {
      if (!shareOptions.loaded) {
        shareOptions.loaded = true;
      }
      return shareOptions.lib as () => T;
    }

    if (shareOptions.get) {
      const module = shareOptions.get();

      if (module instanceof Promise) {
        const errorCode =
          extraOptions?.from === 'build' ? RUNTIME_005 : RUNTIME_006;
        throw new Error(
          runtimeError(errorCode, {
            hostName: host.options.name,
            sharedPkgName: pkgName,
          }),
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
      return shareOptions.lib as () => T;
    }

    throw new Error(
      runtimeError(RUNTIME_006, {
        hostName: host.options.name,
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

  // Step 5e: simplified mergeAttrs
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

    const mergeAttrs = (shared: Shared) => {
      const target = (
        treeShaking ? shared.treeShaking! : shared
      ) as TreeShakingArgs;
      if (loaded && !target.loaded) target.loaded = loaded;
      if (loading && !target.loading) target.loading = loading;
      if (get && !target.get) target.get = get;
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
