import type { ModuleFederation } from '@module-federation/runtime';
import type { WebpackRequire } from './types';

declare const __webpack_require__: WebpackRequire;
declare const __non_webpack_require__: (id: string) => any;

const getGlobalInstances = (): ModuleFederation[] =>
  new Function('return globalThis')()['__FEDERATION__']?.['__INSTANCES__'] ||
  [];

export const resolveFile = (rootOutputDir: string, chunkId: string): string => {
  const path = __non_webpack_require__('path');
  return path.join(__dirname, rootOutputDir + __webpack_require__.u(chunkId));
};

export const returnFromCache = (remoteName: string): string | null => {
  for (const instance of getGlobalInstances()) {
    const moduleContainer = instance.moduleCache.get(remoteName);
    if (moduleContainer?.remoteInfo) return moduleContainer.remoteInfo.entry;
  }
  return null;
};

export const returnFromGlobalInstances = (
  remoteName: string,
): string | null => {
  for (const instance of getGlobalInstances()) {
    for (const remote of instance.options.remotes) {
      if (remote.name === remoteName || remote.alias === remoteName) {
        console.log('Backup remote entry found:', remote.entry);
        return remote.entry;
      }
    }
  }
  return null;
};

export const resolveUrl = (
  remoteName: string,
  chunkName: string,
): URL | null => {
  try {
    return Object.assign(new URL(chunkName, __webpack_require__.p), {
      mfMetadata: {
        chunkName,
        publicPath: __webpack_require__.p,
        remoteName,
        rootOutputDir: __webpack_require__.federation.rootOutputDir || '',
        resolvedFrom: 'public-path' as const,
      },
    });
  } catch {
    const entryUrl =
      returnFromCache(remoteName) || returnFromGlobalInstances(remoteName);
    if (!entryUrl) return null;

    const url = new URL(entryUrl);
    const path = __non_webpack_require__('path');
    const urlPath = url.pathname;
    const lastSlashIndex = urlPath.lastIndexOf('/');
    const directoryPath =
      lastSlashIndex >= 0 ? urlPath.substring(0, lastSlashIndex + 1) : '/';
    const rootDir = __webpack_require__.federation.rootOutputDir || '';
    const combinedPath = path
      .join(directoryPath, rootDir, chunkName)
      .replace(/\\/g, '/');

    return Object.assign(new URL(combinedPath, url.origin), {
      mfMetadata: {
        chunkName,
        publicPath: __webpack_require__.p,
        remoteName,
        rootOutputDir: rootDir,
        resolvedFrom: 'remote-entry-fallback' as const,
        remoteEntryUrl: entryUrl,
      },
    });
  }
};
