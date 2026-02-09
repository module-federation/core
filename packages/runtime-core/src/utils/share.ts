import { DEFAULT_SCOPE } from '../constant';
import { Module, TreeShakingStatus } from '@module-federation/sdk';
import { Global, Federation } from '../global';
import {
  GlobalShareScopeMap,
  Shared,
  ShareArgs,
  ShareInfos,
  ShareScopeMap,
  LoadShareExtraOptions,
  UserOptions,
  Options,
  ShareStrategy,
  TreeShakingArgs,
  SharedGetter,
} from '../type';
import { warn, error } from './logger';
import { satisfy } from './semver';
import { SyncWaterfallHook } from './hooks';
import { addUniqueItem, arrayOptions } from './tool';

declare const FEDERATION_OPTIMIZE_NO_IMPORTMAP: boolean;
const USE_IMPORTMAP =
  typeof FEDERATION_OPTIMIZE_NO_IMPORTMAP === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_IMPORTMAP
    : true;

const createImportGetter = (specifier: string): SharedGetter => {
  const dynamicImport = (target: string) => {
    if (typeof FEDERATION_ALLOW_NEW_FUNCTION !== 'undefined') {
      return new Function('specifier', 'return import(specifier)')(target);
    }
    return import(
      /* webpackIgnore: true */
      /* @vite-ignore */
      target
    );
  };

  return () =>
    dynamicImport(specifier).then((module) => () => module as Module);
};

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
  } else if (
    USE_IMPORTMAP &&
    'import' in shareArgs &&
    typeof shareArgs.import === 'string'
  ) {
    get = createImportGetter(shareArgs.import);
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

  if (mode === 'runtime-infer') {
    if (!usedExports) {
      return true;
    }
    return isMatchUsedExports(treeShaking, usedExports);
  }

  return false;
}

/**
 * compare version a and b, return true if a is less than b
 */
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
  if (satisfy(transformInvalidVersion(a), `<=${transformInvalidVersion(b)}`)) {
    return true;
  } else {
    return false;
  }
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

const isLoading = (shared: {
  loading?: null | Promise<any>;
  loaded?: boolean;
  lib?: () => unknown;
}) => {
  return Boolean(shared.loading);
};

const isMatchUsedExports = (
  treeShaking?: TreeShakingArgs,
  usedExports?: string[],
) => {
  if (!treeShaking || !usedExports) {
    return false;
  }

  const { usedExports: treeShakingUsedExports } = treeShaking;

  if (!treeShakingUsedExports) {
    return false;
  }

  if (usedExports.every((e) => treeShakingUsedExports.includes(e))) {
    return true;
  }

  return false;
};

function findSingletonVersionOrderByVersion(
  shareScopeMap: ShareScopeMap,
  scope: string,
  pkgName: string,
  treeShaking?: TreeShakingArgs,
): {
  version: string;
  useTreesShaking: boolean;
} {
  const versions = shareScopeMap[scope][pkgName];
  let version = '';
  let useTreesShaking = shouldUseTreeShaking(treeShaking);
  // return false means use prev version
  const callback = function (prev: string, cur: string): boolean {
    if (useTreesShaking) {
      if (!versions[prev].treeShaking) {
        return true;
      }
      if (!versions[cur].treeShaking) {
        return false;
      }
      return !isLoaded(versions[prev].treeShaking) && versionLt(prev, cur);
    }
    return !isLoaded(versions[prev]) && versionLt(prev, cur);
  };

  if (useTreesShaking) {
    version = findVersion(shareScopeMap[scope][pkgName], callback);
    if (version) {
      return {
        version,
        useTreesShaking,
      };
    }
    useTreesShaking = false;
  }

  return {
    version: findVersion(shareScopeMap[scope][pkgName], callback),
    useTreesShaking,
  };
}

const isLoadingOrLoaded = (shared: {
  loading?: null | Promise<any>;
  loaded?: boolean;
  lib?: () => unknown;
}) => {
  return isLoaded(shared) || isLoading(shared);
};

function findSingletonVersionOrderByLoaded(
  shareScopeMap: ShareScopeMap,
  scope: string,
  pkgName: string,
  treeShaking?: TreeShakingArgs,
): {
  version: string;
  useTreesShaking: boolean;
} {
  const versions = shareScopeMap[scope][pkgName];
  let version = '';
  let useTreesShaking = shouldUseTreeShaking(treeShaking);

  // return false means use prev version
  const callback = function (prev: string, cur: string): boolean {
    if (useTreesShaking) {
      if (!versions[prev].treeShaking) {
        return true;
      }
      if (!versions[cur].treeShaking) {
        return false;
      }
      if (isLoadingOrLoaded(versions[cur].treeShaking)) {
        if (isLoadingOrLoaded(versions[prev].treeShaking)) {
          return Boolean(versionLt(prev, cur));
        } else {
          return true;
        }
      }
      if (isLoadingOrLoaded(versions[prev].treeShaking)) {
        return false;
      }
    }

    if (isLoadingOrLoaded(versions[cur])) {
      if (isLoadingOrLoaded(versions[prev])) {
        return Boolean(versionLt(prev, cur));
      } else {
        return true;
      }
    }
    if (isLoadingOrLoaded(versions[prev])) {
      return false;
    }
    return versionLt(prev, cur);
  };

  if (useTreesShaking) {
    version = findVersion(shareScopeMap[scope][pkgName], callback);
    if (version) {
      return {
        version,
        useTreesShaking,
      };
    }
    useTreesShaking = false;
  }

  return {
    version: findVersion(shareScopeMap[scope][pkgName], callback),
    useTreesShaking,
  };
}

function getFindShareFunction(strategy: Shared['strategy']) {
  if (strategy === 'loaded-first') {
    return findSingletonVersionOrderByLoaded;
  }
  return findSingletonVersionOrderByVersion;
}

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
  for (const sc of scopes) {
    if (
      shareConfig &&
      localShareScopeMap[sc] &&
      localShareScopeMap[sc][pkgName]
    ) {
      const { requiredVersion } = shareConfig;
      const findShareFunction = getFindShareFunction(strategy);
      const { version: maxOrSingletonVersion, useTreesShaking } =
        findShareFunction(localShareScopeMap, sc, pkgName, treeShaking);

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
          return {
            shared,
            useTreesShaking,
          };
        } else {
          if (requiredVersion === false || requiredVersion === '*') {
            return {
              shared,
              useTreesShaking,
            };
          }
          if (satisfy(maxOrSingletonVersion, requiredVersion)) {
            return {
              shared,
              useTreesShaking,
            };
          }

          const _usedTreeShaking = shouldUseTreeShaking(treeShaking);
          if (_usedTreeShaking) {
            for (const [versionKey, versionValue] of Object.entries(
              localShareScopeMap[sc][pkgName],
            )) {
              if (
                !shouldUseTreeShaking(
                  versionValue.treeShaking,
                  treeShaking?.usedExports,
                )
              ) {
                continue;
              }

              if (satisfy(versionKey, requiredVersion)) {
                return {
                  shared: versionValue,
                  useTreesShaking: _usedTreeShaking,
                };
              }
            }
          }
          for (const [versionKey, versionValue] of Object.entries(
            localShareScopeMap[sc][pkgName],
          )) {
            if (satisfy(versionKey, requiredVersion)) {
              return {
                shared: versionValue,
                useTreesShaking: false,
              };
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
      return (
        // TODO: consider multiple treeShaking shared scenes
        !isLoaded(shareVersionMap[prev]) && versionLt(prev, cur)
      );
    };

    const maxVersion = findVersion(shareVersionMap, callback);
    return shareVersionMap[maxVersion];
  };

  const resolver = extraOptions?.resolver ?? defaultResolver;
  const isPlainObject = (val: unknown): val is Record<string, any> => {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
  };

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
