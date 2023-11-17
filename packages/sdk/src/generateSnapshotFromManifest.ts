import {
  Manifest,
  ProviderModuleInfo,
  ModuleInfo,
  BasicProviderModuleInfo,
  ConsumerModuleInfo,
  ManifestProvider,
} from './types';
import { MANIFEST_EXT } from './constant';

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

// 优先级：overrides > remotes
// eslint-disable-next-line max-lines-per-function
export function generateSnapshotFromManifest(
  manifest: Manifest,
  options: IOptions = {},
): ProviderModuleInfo {
  const { remotes = {}, overrides = {}, version } = options;
  let remoteSnapshot: ProviderModuleInfo;

  const getPublicPath = (): string => {
    if ('publicPath' in manifest.metaData) {
      return manifest.metaData.publicPath;
    } else {
      return manifest.metaData.getPublicPath;
    }
  };

  const overridesKeys = Object.keys(overrides);

  let remotesInfo: ConsumerModuleInfo['remotesInfo'] = {};

  // 如果没传 remotes ，仅读取 manifest 里的 remotes
  if (!Object.keys(remotes).length) {
    remotesInfo =
      manifest.remotes?.reduce((res, next) => {
        let matchedVersion: string;
        const name = next.federationContainerName;
        // garfishModuleName
        // overrides 优先级最高
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
      }, {} as ConsumerModuleInfo['remotesInfo']) || {};
  }

  // 若指定了 remotes（deploy 场景），需要再遍历一遍
  Object.keys(remotes).forEach(
    key =>
      (remotesInfo[key] = {
        // overrides 会改写依赖关系
        matchedVersion: overridesKeys.includes(key) ?
          overrides[key] :
          remotes[key],
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
  } = manifest.metaData;
  const { exposes } = manifest;

  const basicRemoteSnapshot: BasicProviderModuleInfo = {
    version: version ? version : '',
    buildVersion,
    globalName,
    remoteEntry: simpleJoinRemoteEntry(remoteEntryPath, remoteEntryName),
    remoteEntryType,
    remoteTypes: simpleJoinRemoteEntry(remoteTypes.path, remoteTypes.name),
    remotesInfo,
    shared: manifest?.shared.map(item => ({
      assets: item.assets,
      sharedName: item.name,
    })),
    modules: exposes?.map(expose => ({
      moduleName: expose.name,
      modulePath: expose.path,
      assets: expose.assets,
    })),
  };

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

  return remoteSnapshot;
}

export function isManifestProvider(
  moduleInfo: ModuleInfo | ManifestProvider,
): moduleInfo is ManifestProvider {
  if (
    'remoteEntry' in moduleInfo &&
    moduleInfo.remoteEntry.endsWith(MANIFEST_EXT)
  ) {
    return true;
  } else {
    return false;
  }
}
