import { DEFAULT_SCOPE } from '../constant';
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
} from '../type';
import { warn, error } from './logger';
import { satisfy } from './semver';
import { SyncWaterfallHook } from './hooks';
import { arrayOptions } from './tool';

export function formatShare(
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
  if (shareArgs.strategy) {
    warn(
      `"shared.strategy is deprecated, please set in initOptions.shareStrategy instead!"`,
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
    // DO NOT CHANGE
    loaded: shareArgs?.loaded || 'lib' in shareArgs ? true : undefined,
    // DO NOT CHANGE
    version: shareArgs.version ?? '0',
    scope: Array.isArray(shareArgs.scope)
      ? shareArgs.scope
      : [shareArgs.scope ?? 'default'],
    strategy: (shareArgs.strategy ?? shareStrategy) || 'version-first',
  };
}

export function formatShareConfigs(
  globalOptions: Options,
  userOptions: UserOptions,
) {
  const shareArgs = userOptions.shared || {};
  const from = userOptions.name;

  const shareInfos = Object.keys(shareArgs).reduce((res, pkgName) => {
    const arrayShareArgs = arrayOptions(shareArgs[pkgName]);
    res[pkgName] = res[pkgName] || [];
    arrayShareArgs.forEach((shareConfig) => {
      res[pkgName].push(
        formatShare(shareConfig, from, pkgName, userOptions.shareStrategy),
      );
    });
    return res;
  }, {} as ShareInfos);

  const shared = {
    ...globalOptions.shared,
  };

  Object.keys(shareInfos).forEach((shareKey) => {
    if (!shared[shareKey]) {
      shared[shareKey] = shareInfos[shareKey];
    } else {
      shareInfos[shareKey].forEach((newUserSharedOptions) => {
        const isSameVersion = shared[shareKey].find(
          (sharedVal) => sharedVal.version === newUserSharedOptions.version,
        );
        if (!isSameVersion) {
          shared[shareKey].push(newUserSharedOptions);
        }
      });
    }
  });
  return { shared, shareInfos };
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

export function findSingletonVersionOrderByVersion(
  shareScopeMap: ShareScopeMap,
  scope: string,
  pkgName: string,
): string {
  const versions = shareScopeMap[scope][pkgName];
  const callback = function (prev: string, cur: string): boolean {
    return !isLoaded(versions[prev]) && versionLt(prev, cur);
  };

  return findVersion(shareScopeMap[scope][pkgName], callback);
}

export function findSingletonVersionOrderByLoaded(
  shareScopeMap: ShareScopeMap,
  scope: string,
  pkgName: string,
): string {
  const versions = shareScopeMap[scope][pkgName];

  const callback = function (prev: string, cur: string): boolean {
    const isLoadingOrLoaded = (shared: Shared) => {
      return isLoaded(shared) || isLoading(shared);
    };
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

export function getFindShareFunction(strategy: Shared['strategy']) {
  if (strategy === 'loaded-first') {
    return findSingletonVersionOrderByLoaded;
  }
  return findSingletonVersionOrderByVersion;
}

export function getRegisteredShareFromLayer(
  localShareScopeMap: ShareScopeMap,
  pkgName: string,
  shareInfo: Shared,
  resolveShare: SyncWaterfallHook<{
    shareScopeMap: ShareScopeMap;
    scope: string;
    pkgName: string;
    version: string;
    GlobalFederation: Federation;
    resolver: () => Shared | undefined;
  }>,
): Shared | void {
  const { shareConfig, scope = DEFAULT_SCOPE, strategy } = shareInfo;
  const scopes = Array.isArray(scope) ? scope : [scope];

  if (!shareConfig?.layer) {
    return;
  }

  for (const sc of scopes) {
    const compositeScope = `(${shareConfig.layer})${sc}`;
    console.log('checking composite scope:', compositeScope);

    if (localShareScopeMap[compositeScope]?.[pkgName]) {
      const findShareFunction = getFindShareFunction(strategy);
      const maxOrSingletonVersion = findShareFunction(
        localShareScopeMap,
        compositeScope,
        pkgName,
      );
      console.log('found version in composite scope:', maxOrSingletonVersion);

      const defaultResolver = () => {
        if (shareConfig.singleton) {
          if (
            typeof shareConfig.requiredVersion === 'string' &&
            !satisfy(maxOrSingletonVersion, shareConfig.requiredVersion)
          ) {
            const msg = `Version ${maxOrSingletonVersion} from ${
              maxOrSingletonVersion &&
              localShareScopeMap[compositeScope][pkgName][maxOrSingletonVersion]
                .from
            } of shared singleton module ${pkgName} does not satisfy the requirement of ${
              shareInfo.from
            } which needs ${shareConfig.requiredVersion})`;

            if (shareConfig.strictVersion) {
              error(msg);
            } else {
              warn(msg);
            }
          }
          return localShareScopeMap[compositeScope][pkgName][
            maxOrSingletonVersion
          ];
        } else {
          if (
            shareConfig.requiredVersion === false ||
            shareConfig.requiredVersion === '*'
          ) {
            return localShareScopeMap[compositeScope][pkgName][
              maxOrSingletonVersion
            ];
          }
          if (satisfy(maxOrSingletonVersion, shareConfig.requiredVersion)) {
            return localShareScopeMap[compositeScope][pkgName][
              maxOrSingletonVersion
            ];
          }

          for (const [versionKey, versionValue] of Object.entries(
            localShareScopeMap[compositeScope][pkgName],
          )) {
            if (satisfy(versionKey, shareConfig.requiredVersion)) {
              return versionValue;
            }
          }
          return undefined;
        }
      };

      const params = {
        shareScopeMap: localShareScopeMap,
        scope: compositeScope,
        pkgName,
        version: maxOrSingletonVersion,
        GlobalFederation: Global.__FEDERATION__,
        resolver: defaultResolver,
      };
      const resolveShared = resolveShare.emit(params) || params;
      const result = resolveShared.resolver();
      if (result) return result;
    }

    // If no matching share found in layer scope, check default scope
    if (localShareScopeMap[sc]?.[pkgName]) {
      const findShareFunction = getFindShareFunction(strategy);
      const maxOrSingletonVersion = findShareFunction(
        localShareScopeMap,
        sc,
        pkgName,
      );
      console.log('found version in default scope:', maxOrSingletonVersion);

      const defaultResolver = () => {
        if (shareConfig.singleton) {
          if (
            typeof shareConfig.requiredVersion === 'string' &&
            !satisfy(maxOrSingletonVersion, shareConfig.requiredVersion)
          ) {
            const msg = `Version ${maxOrSingletonVersion} from ${
              maxOrSingletonVersion &&
              localShareScopeMap[sc][pkgName][maxOrSingletonVersion].from
            } of shared singleton module ${pkgName} does not satisfy the requirement of ${
              shareInfo.from
            } which needs ${shareConfig.requiredVersion})`;

            if (shareConfig.strictVersion) {
              error(msg);
            } else {
              warn(msg);
            }
          }
          return localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
        } else {
          if (
            shareConfig.requiredVersion === false ||
            shareConfig.requiredVersion === '*'
          ) {
            return localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
          }
          if (satisfy(maxOrSingletonVersion, shareConfig.requiredVersion)) {
            return localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
          }

          for (const [versionKey, versionValue] of Object.entries(
            localShareScopeMap[sc][pkgName],
          )) {
            if (satisfy(versionKey, shareConfig.requiredVersion)) {
              return versionValue;
            }
          }
          return undefined;
        }
      };

      const params = {
        shareScopeMap: localShareScopeMap,
        scope: sc,
        pkgName,
        version: maxOrSingletonVersion,
        GlobalFederation: Global.__FEDERATION__,
        resolver: defaultResolver,
      };
      const resolveShared = resolveShare.emit(params) || params;
      const result = resolveShared.resolver();
      if (result) return result;
    }
  }
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
    GlobalFederation: Federation;
    resolver: () => Shared | undefined;
  }>,
): Shared | void {
  if (!localShareScopeMap) {
    return;
  }
  const { shareConfig, scope = DEFAULT_SCOPE, strategy } = shareInfo;
  const scopes = Array.isArray(scope) ? scope : [scope];

  console.log(
    'getRegisteredShare - scopes:',
    scopes,
    'layer:',
    shareConfig?.layer,
  );

  // Check layer scopes first if layer exists
  if (shareConfig?.layer) {
    const layerResult = getRegisteredShareFromLayer(
      localShareScopeMap,
      pkgName,
      shareInfo,
      resolveShare,
    );
    if (layerResult) return layerResult;
  }

  // Then check original scopes
  for (const sc of scopes) {
    console.log('checking scope:', sc);
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
      );
      console.log('found version in scope:', maxOrSingletonVersion);

      //@ts-ignore
      const defaultResolver = () => {
        if (shareConfig.singleton) {
          if (
            typeof requiredVersion === 'string' &&
            !satisfy(maxOrSingletonVersion, requiredVersion)
          ) {
            const msg = `Version ${maxOrSingletonVersion} from ${
              maxOrSingletonVersion &&
              localShareScopeMap[sc][pkgName][maxOrSingletonVersion].from
            } of shared singleton module ${pkgName} does not satisfy the requirement of ${
              shareInfo.from
            } which needs ${requiredVersion})`;

            if (shareConfig.strictVersion) {
              error(msg);
            } else {
              warn(msg);
            }
          }
          return localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
        } else {
          if (requiredVersion === false || requiredVersion === '*') {
            return localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
          }
          if (satisfy(maxOrSingletonVersion, requiredVersion)) {
            return localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
          }

          for (const [versionKey, versionValue] of Object.entries(
            localShareScopeMap[sc][pkgName],
          )) {
            if (satisfy(versionKey, requiredVersion)) {
              return versionValue;
            }
          }
        }
      };
      const params = {
        shareScopeMap: localShareScopeMap,
        scope: sc,
        pkgName,
        version: maxOrSingletonVersion,
        GlobalFederation: Global.__FEDERATION__,
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
