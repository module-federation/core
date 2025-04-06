import {
  RemoteWithEntry,
  ModuleInfo,
  RemoteEntryType,
  isBrowserEnv,
  isReactNativeEnv,
  GlobalModuleInfo,
  isManifestProvider,
} from '@module-federation/sdk';
import { Remote, RemoteInfoOptionalVersion, RemoteInfo } from '../type';
import { warn, error } from './logger';
import { getResourceUrl } from '@module-federation/sdk';

export function addUniqueItem(arr: Array<string>, item: string): Array<string> {
  if (arr.findIndex((name) => name === item) === -1) {
    arr.push(item);
  }
  return arr;
}

export function getFMId(
  remoteInfo: RemoteInfoOptionalVersion | RemoteWithEntry,
): string {
  if ('version' in remoteInfo && remoteInfo.version) {
    return `${remoteInfo.name}:${remoteInfo.version}`;
  } else if ('entry' in remoteInfo && remoteInfo.entry) {
    return `${remoteInfo.name}:${remoteInfo.entry}`;
  } else {
    return `${remoteInfo.name}`;
  }
}

export function isRemoteInfoWithEntry(
  remote: Remote,
): remote is RemoteWithEntry {
  return typeof (remote as RemoteWithEntry).entry !== 'undefined';
}

export function isPureRemoteEntry(remote: RemoteWithEntry): boolean {
  return !remote.entry.includes('.json') && remote.entry.includes('.js');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeWrapper<T extends (...args: Array<any>) => any>(
  callback: T,
  disableWarn?: boolean,
): Promise<ReturnType<T> | undefined> {
  try {
    const res = await callback();
    return res;
  } catch (e) {
    !disableWarn && warn(e);
    return;
  }
}

export function isObject(val: any): boolean {
  return val && typeof val === 'object';
}

export const objectToString = Object.prototype.toString;

// eslint-disable-next-line @typescript-eslint/ban-types
export function isPlainObject(val: any): val is object {
  return objectToString.call(val) === '[object Object]';
}

export function isStaticResourcesEqual(url1: string, url2: string): boolean {
  const REG_EXP = /^(https?:)?\/\//i;
  // Transform url1 and url2 into relative paths
  const relativeUrl1 = url1.replace(REG_EXP, '').replace(/\/$/, '');
  const relativeUrl2 = url2.replace(REG_EXP, '').replace(/\/$/, '');
  // Check if the relative paths are identical
  return relativeUrl1 === relativeUrl2;
}

export function arrayOptions<T>(options: T | Array<T>): Array<T> {
  return Array.isArray(options) ? options : [options];
}

export function getRemoteEntryInfoFromSnapshot(snapshot: ModuleInfo): {
  url: string;
  type: RemoteEntryType;
  globalName: string;
} {
  const defaultRemoteEntryInfo: {
    url: string;
    type: RemoteEntryType;
    globalName: string;
  } = {
    url: '',
    type: 'global',
    globalName: '',
  };
  if (isBrowserEnv() || isReactNativeEnv()) {
    return 'remoteEntry' in snapshot
      ? {
          url: snapshot.remoteEntry,
          type: snapshot.remoteEntryType,
          globalName: snapshot.globalName,
        }
      : defaultRemoteEntryInfo;
  }
  if ('ssrRemoteEntry' in snapshot) {
    return {
      url: snapshot.ssrRemoteEntry || defaultRemoteEntryInfo.url,
      type: snapshot.ssrRemoteEntryType || defaultRemoteEntryInfo.type,
      globalName: snapshot.globalName,
    };
  }
  return defaultRemoteEntryInfo;
}

export const processModuleAlias = (name: string, subPath: string) => {
  // @host/ ./button -> @host/button
  let moduleName;
  if (name.endsWith('/')) {
    moduleName = name.slice(0, -1);
  } else {
    moduleName = name;
  }

  if (subPath.startsWith('.')) {
    subPath = subPath.slice(1);
  }
  moduleName = moduleName + subPath;
  return moduleName;
};

export function ensureObjectData(data: any, hookType: string): void {
  if (!isObject(data)) {
    error(`The data for the "${hookType}" hook should be an object.`);
  }
}

// ADDED splitId function
// name
// name:version
export function splitId(id: string): {
  name: string;
  version: string | undefined;
} {
  const splitInfo = id.split(':');
  if (splitInfo.length === 1) {
    return {
      name: splitInfo[0],
      version: undefined,
    };
  } else if (splitInfo.length === 2) {
    return {
      name: splitInfo[0],
      version: splitInfo[1],
    };
  } else {
    return {
      name: splitInfo[1],
      version: splitInfo[2],
    };
  }
}

// ADDED normalizePreloadExposes function
export function normalizePreloadExposes(exposes?: string[]): string[] {
  if (!exposes) {
    return [];
  }

  return exposes.map((expose) => {
    if (expose === '.') {
      return expose;
    }
    if (expose.startsWith('./')) {
      return expose.replace('./', '');
    }
    return expose;
  });
}

// ADDED formatPreloadArgs function
import {
  PreloadRemoteArgs,
  PreloadConfig,
  PreloadOptions,
  depsPreloadArg,
} from '../type';
import { matchRemote } from './manifest';
import { assert } from './logger';
import { safeToString } from '@module-federation/sdk';

export function defaultPreloadArgs(
  preloadConfig: PreloadRemoteArgs | depsPreloadArg,
): PreloadConfig {
  return {
    resourceCategory: 'sync',
    share: true,
    depsRemote: true,
    prefetchInterface: false,
    ...preloadConfig,
  } as PreloadConfig;
}

export function formatPreloadArgs(
  remotes: Array<Remote>,
  preloadArgs: Array<PreloadRemoteArgs>,
): PreloadOptions {
  return preloadArgs.map((args) => {
    const remoteInfo = matchRemote(remotes, args.nameOrAlias);
    assert(
      remoteInfo,
      `Unable to preload ${args.nameOrAlias} as it is not included in ${
        !remoteInfo &&
        safeToString({
          remoteInfo,
          remotes,
        })
      }`,
    );
    return {
      remote: remoteInfo,
      preloadConfig: defaultPreloadArgs(args),
    };
  });
}

// ADDED assignRemoteInfo function
export function assignRemoteInfo(
  remoteInfo: RemoteInfo,
  remoteSnapshot: ModuleInfo,
): void {
  const remoteEntryInfo = getRemoteEntryInfoFromSnapshot(remoteSnapshot);
  if (!remoteEntryInfo.url) {
    error(
      `The attribute remoteEntry of ${remoteInfo.name} must not be undefined.`,
    );
  }

  let entryUrl = getResourceUrl(remoteSnapshot, remoteEntryInfo.url);

  if (!isBrowserEnv() && !entryUrl.startsWith('http')) {
    entryUrl = `https:${entryUrl}`;
  }

  remoteInfo.type = remoteEntryInfo.type;
  remoteInfo.entryGlobalName = remoteEntryInfo.globalName;
  remoteInfo.entry = entryUrl;
  remoteInfo.version = remoteSnapshot.version;
  remoteInfo.buildVersion = remoteSnapshot.buildVersion;
}

// Move getInfoWithoutType back to global.ts for now
// export function getInfoWithoutType(globalSnapshot: GlobalModuleInfo, id: string): {
//   key: string;
//   value: ModuleInfo | null;
// } {
//  ...
// }
