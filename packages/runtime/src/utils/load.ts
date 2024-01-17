import {
  RemoteEntryType,
  composeKeyWithSeparator,
  loadScript,
  loadScriptNode,
} from '@module-federation/sdk';
import { assert } from '../utils/logger';
import { getRemoteEntryExports, globalLoading } from '../global';
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
  type,
  createScriptHook,
}: {
  name: string;
  globalName: string;
  entry: string;
  type: RemoteEntryType;
  createScriptHook?: (url: string) => HTMLScriptElement | void;
}): Promise<RemoteEntryExports> {
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  if (typeof document === 'undefined') {
    return loadScriptNode(entry, {
      attrs: { name, globalName, type },
      createScriptHook,
    })
      .then(() => {
        // if(type==='cjs' && exportedInterface){
        //   return exportedInterface
        // }
        const { remoteEntryKey, entryExports } = getRemoteEntryExports(
          name,
          globalName,
        );

        assert(
          entryExports,
          `
        Unable to use the ${name}'s '${entry}' URL with ${remoteEntryKey}'s globalName to get remoteEntry exports.
        Possible reasons could be:\n
        1. '${entry}' is not the correct URL, or the remoteEntry resource or name is incorrect.\n
        2. ${remoteEntryKey} cannot be used to get remoteEntry exports in the window object.
      `,
        );

        return entryExports;
      })
      .catch((e: any) => {
        return e;
      });
  }

  return loadScript(entry, { attrs: {}, createScriptHook })
    .then(() => {
      const { remoteEntryKey, entryExports } = getRemoteEntryExports(
        name,
        globalName,
      );

      assert(
        entryExports,
        `
      Unable to use the ${name}'s '${entry}' URL with ${remoteEntryKey}'s globalName to get remoteEntry exports.
      Possible reasons could be:\n
      1. '${entry}' is not the correct URL, or the remoteEntry resource or name is incorrect.\n
      2. ${remoteEntryKey} cannot be used to get remoteEntry exports in the window object.
    `,
      );

      return entryExports;
    })
    .catch((e: any) => {
      return e;
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
        type,
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
