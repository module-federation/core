import { DEFAULT_SCOPE } from '../constant';
import { TreeshakeStatus } from '@module-federation/sdk';
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
  TreeShakeArgs,
  SharedGetter,
} from '../type';
import { warn, error } from './logger';
import { satisfy } from './semver';
import { SyncWaterfallHook } from './hooks';
import { arrayOptions } from './tool';

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
    treeshakeStatus: TreeshakeStatus.UNKNOWN,
    treeshakeStrategy: 'server',
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

export const isLoaded = (shared: Shared) => {
  return Boolean(shared.loaded) || typeof shared.lib === 'function';
};

const isLoading = (shared: Shared) => {
  return Boolean(shared.loading);
};

const isMatchUsedExports = (
  targetShared: Shared,
  treeshakeStrategy: Shared['treeshakeStrategy'],
  usedExports?: string[],
) => {
  const targetUsedExports = targetShared.usedExports;
  if (!usedExports || !targetUsedExports) {
    return true;
  }
  if (targetShared.treeshakeStatus === TreeshakeStatus.CALCULATED) {
    return true;
  }
  if (targetShared.treeshakeStatus === TreeshakeStatus.NO_USE) {
    return false;
  }

  if (treeshakeStrategy === 'server') {
    return false;
  }

  if (usedExports.every((e) => targetUsedExports.includes(e))) {
    return true;
  }
  return false;
};

function findSingletonVersionOrderByVersion(
  shareScopeMap: ShareScopeMap,
  scope: string,
  pkgName: string,
  treeshakeStrategy: Shared['treeshakeStrategy'],
  usedExports?: string[],
): string {
  const versions = shareScopeMap[scope][pkgName];
  const callback = function (prev: string, cur: string): boolean {
    if (!isMatchUsedExports(versions[cur], treeshakeStrategy, usedExports)) {
      return false;
    }

    if (!isMatchUsedExports(versions[prev], treeshakeStrategy, usedExports)) {
      return true;
    }

    if (versions[cur].treeshakeStatus !== versions[prev].treeshakeStatus) {
      return Boolean(
        versions[cur].treeshakeStatus - versions[prev].treeshakeStatus,
      );
    }

    return !isLoaded(versions[prev]) && versionLt(prev, cur);
  };

  return findVersion(shareScopeMap[scope][pkgName], callback);
}

const isLoadingOrLoaded = (shared: Shared) => {
  return isLoaded(shared) || isLoading(shared);
};

function findSingletonVersionOrderByLoaded(
  shareScopeMap: ShareScopeMap,
  scope: string,
  pkgName: string,
  treeshakeStrategy: Shared['treeshakeStrategy'],
  usedExports?: string[],
): string {
  const versions = shareScopeMap[scope][pkgName];

  const callback = function (prev: string, cur: string): boolean {
    if (!isMatchUsedExports(versions[cur], treeshakeStrategy, usedExports)) {
      return false;
    }

    if (!isMatchUsedExports(versions[prev], treeshakeStrategy, usedExports)) {
      return true;
    }

    if (versions[cur].treeshakeStatus !== versions[prev].treeshakeStatus) {
      return Boolean(
        versions[cur].treeshakeStatus - versions[prev].treeshakeStatus,
      );
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

  return findVersion(shareScopeMap[scope][pkgName], callback);
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
    resolver: () => Shared | undefined;
  }>,
): Shared | void {
  if (!localShareScopeMap) {
    return;
  }
  const {
    shareConfig,
    scope = DEFAULT_SCOPE,
    strategy,
    treeshakeStrategy,
    usedExports,
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
      const maxOrSingletonVersion = findShareFunction(
        localShareScopeMap,
        sc,
        pkgName,
        treeshakeStrategy,
      );

      const defaultResolver = () => {
        const shared = localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
        if (!isMatchUsedExports(shared, treeshakeStrategy, usedExports)) {
          for (const [versionKey, versionValue] of Object.entries(
            localShareScopeMap[sc][pkgName],
          )) {
            if (
              !isMatchUsedExports(versionValue, treeshakeStrategy, usedExports)
            ) {
              continue;
            }
            if (requiredVersion === false || requiredVersion === '*') {
              return versionValue;
            }
            if (satisfy(versionKey, requiredVersion)) {
              return versionValue;
            }
          }
        }
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
          return shared;
        } else {
          if (requiredVersion === false || requiredVersion === '*') {
            return shared;
          }
          if (satisfy(maxOrSingletonVersion, requiredVersion)) {
            return shared;
          }

          for (const [versionKey, versionValue] of Object.entries(
            localShareScopeMap[sc][pkgName],
          )) {
            if (satisfy(versionKey, requiredVersion)) {
              return versionValue;
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

  return Object.assign(
    {},
    resolver(shareInfos[pkgName]),
    extraOptions?.customShareInfo,
  );
}

export async function callShareGetter(
  shared: Shared,
): Promise<ReturnType<SharedGetter>> {
  if (shared.treeshakeStatus === TreeshakeStatus.NO_USE) {
    return shared.fallback ? shared.fallback() : shared.get();
  }

  if (shared.reShakeGet) {
    return shared.reShakeGet();
  }

  return shared.get();
}
