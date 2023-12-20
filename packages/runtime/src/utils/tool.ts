import type { RemoteWithEntry } from '@module-federation/sdk';
import { Remote, RemoteInfoOptionalVersion, UserOptions } from '../type';
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
  return remote.entry.endsWith('.js');
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function safeToString(info: any): string {
  try {
    return JSON.stringify(info, null, 2);
  } catch (e) {
    return '';
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
