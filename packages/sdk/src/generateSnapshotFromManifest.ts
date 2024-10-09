import {
  Manifest,
  ProviderModuleInfo,
  ModuleInfo,
  BasicProviderModuleInfo,
  ConsumerModuleInfo,
  ManifestProvider,
} from './types';
import { MANIFEST_EXT } from './constant';
import { isBrowserEnv } from './env';

interface IOptions {
  remotes?: Record<string, string>;
  overrides?: Record<string, string>;
  version?: string;
}

export const simpleJoinRemoteEntry = (rPath: string, rName: string): string => {
  if (!rPath) {
    return rName;
  }
  const transformPath = (str: string) => {
    if (str === '.') {
      return '';
    }
    if (str.startsWith('./')) {
      return str.replace('./', '');
    }
    if (str.startsWith('/')) {
      const strWithoutSlash = str.slice(1);
      if (strWithoutSlash.endsWith('/')) {
        return strWithoutSlash.slice(0, -1);
      }
      return strWithoutSlash;
    }
    return str;
  };

  const transformedPath = transformPath(rPath);

  if (!transformedPath) {
    return rName;
  }

  if (transformedPath.endsWith('/')) {
    return `${transformedPath}${rName}`;
  }

  return `${transformedPath}/${rName}`;
};

export function inferAutoPublicPath(url: string): string {
  return url
    .replace(/#.*$/, '')
    .replace(/\?.*$/, '')
    .replace(/\/[^\/]+$/, '/');
}

// Priority: overrides > remotes
// eslint-disable-next-line max-lines-per-function
export function generateSnapshotFromManifest(
  manifest: Manifest,
  options: IOptions = {},
): ProviderModuleInfo {
  const { remotes = {}, overrides = {}, version } = options;
  let remoteSnapshot: ProviderModuleInfo;

  const getPublicPath = (): string => {
    if ('publicPath' in manifest.metaData) {
      if (manifest.metaData.publicPath === 'auto' && version) {
        // use same implementation as publicPath auto runtime module implements
        return inferAutoPublicPath(version);
      }
      return manifest.metaData.publicPath;
    } else {
      return manifest.metaData.getPublicPath;
    }
  };

  const overridesKeys = Object.keys(overrides);

  let remotesInfo: ConsumerModuleInfo['remotesInfo'] = {};

  // If remotes are not provided, only the remotes in the manifest will be read
  if (!Object.keys(remotes).length) {
    remotesInfo =
      manifest.remotes?.reduce(
        (res, next) => {
          let matchedVersion: string;
          const name = next.federationContainerName;
          // overrides have higher priority
          if (overridesKeys.includes(name)) {
            matchedVersion = overrides[name];
          } else {
            if ('version' in next) {
              matchedVersion = next.version;
            } else {
              matchedVersion = next.entry;
            }
          }
          res[name] = {
            matchedVersion,
          };
          return res;
        },
        {} as ConsumerModuleInfo['remotesInfo'],
      ) || {};
  }

  // If remotes (deploy scenario) are specified, they need to be traversed again
  Object.keys(remotes).forEach(
    (key) =>
      (remotesInfo[key] = {
        // overrides will override dependencies
        matchedVersion: overridesKeys.includes(key)
          ? overrides[key]
          : remotes[key],
      }),
  );

  const {
    remoteEntry: {
      path: remoteEntryPath,
      name: remoteEntryName,
      type: remoteEntryType,
    },
    types: remoteTypes,
    buildInfo: { buildVersion },
    globalName,
    ssrRemoteEntry,
  } = manifest.metaData;
  const { exposes } = manifest;

  let basicRemoteSnapshot: BasicProviderModuleInfo = {
    version: version ? version : '',
    buildVersion,
    globalName,
    remoteEntry: simpleJoinRemoteEntry(remoteEntryPath, remoteEntryName),
    remoteEntryType,
    remoteTypes: simpleJoinRemoteEntry(remoteTypes.path, remoteTypes.name),
    remoteTypesZip: remoteTypes.zip || '',
    remoteTypesAPI: remoteTypes.api || '',
    remotesInfo,
    shared: manifest?.shared.map((item) => ({
      assets: item.assets,
      sharedName: item.name,
      version: item.version,
    })),
    modules: exposes?.map((expose) => ({
      moduleName: expose.name,
      modulePath: expose.path,
      assets: expose.assets,
    })),
  };

  if (manifest.metaData?.prefetchInterface) {
    const prefetchInterface = manifest.metaData.prefetchInterface;

    basicRemoteSnapshot = {
      ...basicRemoteSnapshot,
      prefetchInterface,
    };
  }

  if (manifest.metaData?.prefetchEntry) {
    const { path, name, type } = manifest.metaData.prefetchEntry;

    basicRemoteSnapshot = {
      ...basicRemoteSnapshot,
      prefetchEntry: simpleJoinRemoteEntry(path, name),
      prefetchEntryType: type,
    };
  }

  if ('publicPath' in manifest.metaData) {
    remoteSnapshot = {
      ...basicRemoteSnapshot,
      publicPath: getPublicPath(),
    };
  } else {
    remoteSnapshot = {
      ...basicRemoteSnapshot,
      getPublicPath: getPublicPath(),
    };
  }

  if (ssrRemoteEntry) {
    const fullSSRRemoteEntry = simpleJoinRemoteEntry(
      ssrRemoteEntry.path,
      ssrRemoteEntry.name,
    );
    remoteSnapshot.ssrRemoteEntry = fullSSRRemoteEntry;
    remoteSnapshot.ssrRemoteEntryType =
      ssrRemoteEntry.type || 'commonjs-module';
  }

  return remoteSnapshot;
}

export function isManifestProvider(
  moduleInfo: ModuleInfo | ManifestProvider,
): moduleInfo is ManifestProvider {
  if (
    'remoteEntry' in moduleInfo &&
    moduleInfo.remoteEntry.includes(MANIFEST_EXT)
  ) {
    return true;
  } else {
    return false;
  }
}
