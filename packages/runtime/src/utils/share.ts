import { DEFAULT_SCOPE } from '../constant';
import { Global } from '../global';
import { GlobalShareScopeMap, Shared, ShareArgs, ShareInfos, ShareScopeMap } from '../type';
import { warn } from './logger';
import { satisfy } from './semver';

export function formatShare(shareArgs: ShareArgs, from: string): Shared {
  let get: Shared['get'];
  if ('get' in shareArgs) {
    // eslint-disable-next-line prefer-destructuring
    get = shareArgs.get;
  } else {
    // @ts-ignore ignore
    get = () => Promise.resolve(shareArgs.lib);
  }
  return {
    deps: [],
    useIn: [],
    from,
    shareConfig: {
      requiredVersion: `^${shareArgs.version}`,
      singleton: false,
      eager: false,
    },
    loading: null,
    ...shareArgs,
    get,
    loaded:'lib' in shareArgs ? true : undefined ,
    scope: Array.isArray(shareArgs.scope) ? shareArgs.scope : ['default'],
    strategy: shareArgs.strategy || 'version-first',
  };
}

export function formatShareConfigs(
  shareArgs: {
    [pkgName: string]: ShareArgs;
  },
  from: string,
): ShareInfos {
  if (!shareArgs) {
    return {};
  }
  return Object.keys(shareArgs).reduce((res, pkgName) => {
    res[pkgName] = formatShare(shareArgs[pkgName], from);
    return res;
  }, {} as ShareInfos);
}

function versionLt(a: string, b: string): boolean {
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

const findVersion = (
  shareScopeMap:ShareScopeMap,
  scope: string,
  pkgName: string,
  cb?: (prev: string, cur: string) => boolean,
): string => {
  const versions = shareScopeMap[scope][pkgName];
  const callback =
    cb ||
    function (prev: string, cur: string): boolean {
      return versionLt(prev, cur);
    };

  return Object.keys(versions).reduce((prev: number | string, cur) => {
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

function findSingletonVersionOrderByVersion(
  shareScopeMap:ShareScopeMap,
  scope: string,
  pkgName: string,
): string {
  const versions = shareScopeMap[scope][pkgName];
  const callback = function (prev: string, cur: string): boolean {
    return !versions[prev].loaded && versionLt(prev, cur);
  };

  return findVersion(shareScopeMap,scope, pkgName, callback);
}

function findSingletonVersionOrderByLoaded(
  shareScopeMap:ShareScopeMap,
  scope: string,
  pkgName: string,
): string {
  const versions = shareScopeMap[scope][pkgName];
  const callback = function (prev: string, cur: string): boolean {
    if (versions[cur].loaded) {
      if (versions[prev].loaded) {
        return Boolean(versionLt(prev, cur));
      } else {
        return true;
      }
    }
    if (versions[prev].loaded) {
      return false;
    }
    return versionLt(prev, cur);
  };

  return findVersion(shareScopeMap,scope, pkgName, callback);
}

function getFindShareFunction(strategy: Shared['strategy']) {
  if (strategy === 'loaded-first') {
    return findSingletonVersionOrderByLoaded;
  }
  return findSingletonVersionOrderByVersion;
}

// Details about shared resources
// TODO: Implement strictVersion for alignment with module federation.
export function getRegisteredShare(
  instanceName:string,
  pkgName: string,
  shareInfo: ShareInfos[keyof ShareInfos],
): Shared | void {
  const globalShares = Global.__FEDERATION__.__SHARE__;
  const localShareScopeMap= globalShares[instanceName]
  if(!localShareScopeMap){
    return;
  }
  const { shareConfig, scope = DEFAULT_SCOPE, strategy } = shareInfo;
  const scopes = Array.isArray(scope) ? scope : [scope];
  for (const sc of scopes) {
    if (shareConfig && localShareScopeMap[sc] && localShareScopeMap[sc][pkgName]) {
      const { requiredVersion } = shareConfig;
      // eslint-disable-next-line max-depth
      if (shareConfig.singleton) {
        const singletonVersion = getFindShareFunction(strategy)(localShareScopeMap,sc, pkgName);
        // eslint-disable-next-line max-depth
        if (
          typeof requiredVersion === 'string' &&
          !satisfy(singletonVersion, requiredVersion)
        ) {
          warn(
            `Version ${singletonVersion} from ${
              singletonVersion &&
              localShareScopeMap[sc][pkgName][singletonVersion].from
            } of shared singleton module ${pkgName} does not satisfy the requirement of ${
              shareInfo.from
            } which needs ${requiredVersion})`,
          );
        }
        return localShareScopeMap[sc][pkgName][singletonVersion];
      } else {
        const maxVersion = getFindShareFunction(strategy)(localShareScopeMap,sc, pkgName);

        // eslint-disable-next-line max-depth
        if (requiredVersion === false || requiredVersion === '*') {
          return localShareScopeMap[sc][pkgName][maxVersion];
        }

        // eslint-disable-next-line max-depth
        if (satisfy(maxVersion, requiredVersion)) {
          return localShareScopeMap[sc][pkgName][maxVersion];
        }

        // eslint-disable-next-line max-depth
        for (const [versionKey, versionValue] of Object.entries(
          localShareScopeMap[sc][pkgName],
        )) {
          // eslint-disable-next-line max-depth
          if (satisfy(versionKey, requiredVersion)) {
            return versionValue;
          }
        }
      }
    }
  }
}

export function getGlobalShareScope(): GlobalShareScopeMap {
  return Global.__FEDERATION__.__SHARE__;
}
