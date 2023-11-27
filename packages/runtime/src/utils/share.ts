import { DEFAULT_SCOPE } from '../constant';
import { Global } from '../global';
import { GlobalShareScope, Shared, ShareArgs, ShareInfos } from '../type';
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
  if (satisfy(a, `<=${b}`)) {
    return true;
  } else {
    return false;
  }
}

const findVersion = (
  scope: string,
  pkgName: string,
  cb?: (prev: string, cur: string) => boolean,
): string => {
  const globalShares = Global.__FEDERATION__.__SHARE__;
  const versions = globalShares[scope][pkgName];
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
  scope: string,
  pkgName: string,
): string {
  const globalShares = Global.__FEDERATION__.__SHARE__;
  const versions = globalShares[scope][pkgName];
  const callback = function (prev: string, cur: string): boolean {
    return !versions[prev].loaded && versionLt(prev, cur);
  };

  return findVersion(scope, pkgName, callback);
}

function findSingletonVersionOrderByLoaded(
  scope: string,
  pkgName: string,
): string {
  const globalShares = Global.__FEDERATION__.__SHARE__;
  const versions = globalShares[scope][pkgName];
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

  return findVersion(scope, pkgName, callback);
}

// Details about shared resources
// TODO: Implement strictVersion for alignment with module federation.
export function getGlobalShare(
  pkgName: string,
  shareInfo: ShareInfos[keyof ShareInfos],
): Shared | void {
  const globalShares = Global.__FEDERATION__.__SHARE__;
  const { shareConfig, scope = DEFAULT_SCOPE, strategy } = shareInfo;
  const scopes = Array.isArray(scope) ? scope : [scope];
  for (const sc of scopes) {
    if (shareConfig && globalShares[sc] && globalShares[sc][pkgName]) {
      const { requiredVersion } = shareConfig;
      // eslint-disable-next-line max-depth
      if (shareConfig.singleton) {
        const singletonVersion =
          strategy === 'loaded-first'
            ? findSingletonVersionOrderByLoaded(sc, pkgName)
            : findSingletonVersionOrderByVersion(sc, pkgName);
        // eslint-disable-next-line max-depth
        if (
          typeof requiredVersion === 'string' &&
          !satisfy(singletonVersion, requiredVersion)
        ) {
          warn(
            `Version ${singletonVersion} from ${
              singletonVersion &&
              globalShares[sc][pkgName][singletonVersion].from
            } of shared singleton module ${pkgName} does not satisfy the requirement of ${
              shareInfo.from
            } which needs ${requiredVersion})`,
          );
        }
        return globalShares[sc][pkgName][singletonVersion];
      } else {
        const maxVersion = findSingletonVersionOrderByLoaded(sc, pkgName);

        // eslint-disable-next-line max-depth
        if (requiredVersion === false || requiredVersion === '*') {
          return globalShares[sc][pkgName][maxVersion];
        }

        // eslint-disable-next-line max-depth
        if (satisfy(maxVersion, requiredVersion)) {
          return globalShares[sc][pkgName][maxVersion];
        }

        // eslint-disable-next-line max-depth
        for (const [versionKey, versionValue] of Object.entries(
          globalShares[sc][pkgName],
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

export function getGlobalShareScope(): GlobalShareScope {
  return Global.__FEDERATION__.__SHARE__;
}
