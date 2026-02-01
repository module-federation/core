import {
  RemoteWithEntry,
  ModuleInfo,
  RemoteEntryType,
  isBrowserEnv,
  isReactNativeEnv,
} from '@module-federation/sdk';
import { Remote, RemoteInfoOptionalVersion } from '../type';
import { warn } from './logger';

export function addUniqueItem(arr: Array<string>, item: string): Array<string> {
  if (!arr.includes(item)) arr.push(item);
  return arr;
}

export function getFMId(
  remoteInfo: RemoteInfoOptionalVersion | RemoteWithEntry,
): string {
  const suffix =
    ('version' in remoteInfo && remoteInfo.version) ||
    ('entry' in remoteInfo && remoteInfo.entry);
  return suffix ? `${remoteInfo.name}:${suffix}` : remoteInfo.name;
}

export function isRemoteInfoWithEntry(
  remote: Remote,
): remote is RemoteWithEntry {
  return typeof (remote as RemoteWithEntry).entry !== 'undefined';
}

export function isPureRemoteEntry(remote: RemoteWithEntry): boolean {
  return !remote.entry.includes('.json');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeWrapper<T extends (...args: Array<any>) => any>(
  callback: T,
  disableWarn?: boolean,
): Promise<ReturnType<T> | undefined> {
  try {
    return await callback();
  } catch (e) {
    if (!disableWarn) warn(e);
    return undefined;
  }
}

export function isObject(val: any): boolean {
  return val && typeof val === 'object';
}

export const objectToString = Object.prototype.toString;

// eslint-disable-next-line @typescript-eslint/ban-types
export function isPlainObject(val: any): val is object {
  return Object.prototype.toString.call(val) === '[object Object]';
}

export function isStaticResourcesEqual(url1: string, url2: string): boolean {
  const REG_EXP = /^(https?:)?\/\//i;
  const relativeUrl1 = url1.replace(REG_EXP, '').replace(/\/$/, '');
  const relativeUrl2 = url2.replace(REG_EXP, '').replace(/\/$/, '');
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
  const defaults = {
    url: '',
    type: 'global' as RemoteEntryType,
    globalName: '',
  };
  if (isBrowserEnv() || isReactNativeEnv() || !('ssrRemoteEntry' in snapshot)) {
    return 'remoteEntry' in snapshot
      ? {
          url: snapshot.remoteEntry,
          type: snapshot.remoteEntryType,
          globalName: snapshot.globalName,
        }
      : defaults;
  }
  return {
    url: snapshot.ssrRemoteEntry || defaults.url,
    type: snapshot.ssrRemoteEntryType || defaults.type,
    globalName: snapshot.globalName,
  };
}

export function singleFlight<T>(
  cache: Record<string, Promise<T> | undefined>,
  key: string,
  fn: () => Promise<T>,
  options?: { clearOnReject?: boolean },
): Promise<T> {
  if (!cache[key]) {
    cache[key] = fn();
    if (options?.clearOnReject) {
      cache[key]!.catch(() => {
        delete cache[key];
      });
    }
  }
  return cache[key]!;
}

export const processModuleAlias = (name: string, subPath: string): string =>
  name.replace(/\/$/, '') + subPath.replace(/^\./, '');
