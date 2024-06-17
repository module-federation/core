import {
  composeKeyWithSeparator,
  loadScript,
  loadScriptNode,
  CreateScriptHookReturn,
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
          'callbacks',
          `import("${entry}").then(callbacks[0]).catch(callbacks[1])`,
        )([resolve, reject]);
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
  createScriptHook?: (url: string) => CreateScriptHookReturn;
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
      attrs: { name, globalName },
      createScriptHook,
    })
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
      .catch((e) => {
        throw e;
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
    .catch((e) => {
      throw e;
    });
}

export function getRemoteEntryUniqueKey(remoteInfo: RemoteInfo): string {
  const { entry, name } = remoteInfo;
  return composeKeyWithSeparator(name, entry);
}

export async function getRemoteEntry({
  remoteEntryExports,
  remoteInfo,
  createScriptHook,
}: {
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports | undefined;
  createScriptHook?: (url: string) => CreateScriptHookReturn;
}): Promise<RemoteEntryExports | void> {
  const { entry, name, type, entryGlobalName } = remoteInfo;
  const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  if (!globalLoading[uniqueKey]) {
    if (['esm', 'module'].includes(type)) {
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
