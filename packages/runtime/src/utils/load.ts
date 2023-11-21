import { composeKeyWithSeparator } from '@module-federation/sdk';
import { assert } from '../utils/logger';
import { getRemoteEntryExports, globalLoading } from '../global';
import { loadScript } from '../utils/dom';
import { Remote, RemoteEntryExports, RemoteInfo } from '../type';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';

export async function loadEsmEntry({
  entry,
  remoteEntryExports,
}: {
  entry: string;
  remoteEntryExports: RemoteEntryExports | undefined;
}): Promise<RemoteEntryExports> {
  return new Promise<RemoteEntryExports>((resolve, reject) => {
    try {
      if (!remoteEntryExports) {
        // eslint-disable-next-line no-eval
        new Function(
          'resolve',
          `import("${entry}").then((res)=>{resolve(res);}, (error)=> reject(error))`,
        )(resolve);
      } else {
        resolve(remoteEntryExports);
      }
    } catch (e) {
      reject(e);
    }
  });
}

export async function loadEntryScript({
  name,
  globalName,
  entry,
  createScriptHook,
}: {
  name: string;
  globalName: string;
  entry: string;
  createScriptHook?: (url: string) => HTMLScriptElement | void;
}): Promise<RemoteEntryExports> {
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  return loadScript(entry, { attrs: {}, createScriptHook }).then(() => {
    const { remoteEntryKey, entryExports } = getRemoteEntryExports(
      name,
      globalName,
    );

    assert(
      entryExports,
      `
      Cannot use the ${name}'s '${entry}' URL with ${remoteEntryKey}'s globalName to get remoteEntry exports.
      The following reasons may be causing the problem:\n
      1. '${entry}' is not the correct URL, or the remoteEntry resource or name is incorrect.\n
      2. Unable to use ${remoteEntryKey} to get remoteEntry exports in the window object.
    `,
    );

    return entryExports;
  });
}

export async function getRemoteEntry({
  remoteEntryExports,
  remoteInfo,
  createScriptHook,
}: {
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports | undefined;
  createScriptHook?: (url: string) => HTMLScriptElement | void;
}): Promise<RemoteEntryExports | void> {
  const { entry, name, type, entryGlobalName } = remoteInfo;
  const uniqueKey = composeKeyWithSeparator(name, entry);
  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  if (!globalLoading[uniqueKey]) {
    if (type === 'esm') {
      globalLoading[uniqueKey] = loadEsmEntry({
        entry,
        remoteEntryExports,
      });
    } else {
      globalLoading[uniqueKey] = loadEntryScript({
        name,
        globalName: entryGlobalName,
        entry,
        createScriptHook,
      });
    }
  }
  return globalLoading[uniqueKey];
}

export function getRemoteInfo(remote: Remote): RemoteInfo {
  return {
    ...remote,
    entry: 'entry' in remote ? remote.entry : '',
    type: remote.type || DEFAULT_REMOTE_TYPE,
    entryGlobalName: remote.entryGlobalName || remote.name,
    shareScope: remote.shareScope || DEFAULT_SCOPE,
  };
}
