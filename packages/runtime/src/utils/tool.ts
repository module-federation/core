import {
  RemoteWithEntry,
  ModuleInfo,
  RemoteEntryType,
  isBrowserEnv,
} from '@module-federation/sdk';
import { Remote, RemoteInfoOptionalVersion } from '../type';
import { warn } from './logger';

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
  if (isBrowserEnv()) {
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
