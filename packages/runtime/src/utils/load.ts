import {
  loadScript,
  loadScriptNode,
  composeKeyWithSeparator,
  isBrowserEnv,
} from '@module-federation/sdk';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';
import { FederationHost } from '../core';
import { globalLoading, getRemoteEntryExports } from '../global';
import { Remote, RemoteEntryExports, RemoteInfo } from '../type';
import { assert } from './logger';

async function loadEsmEntry({
  entry,
  remoteEntryExports,
}: {
  entry: string;
  remoteEntryExports: RemoteEntryExports | undefined;
}): Promise<RemoteEntryExports> {
  return new Promise<RemoteEntryExports>((resolve, reject) => {
    try {
      if (!remoteEntryExports) {
        import(/* webpackIgnore: true */ entry).then(resolve).catch(reject);
      } else {
        resolve(remoteEntryExports);
      }
    } catch (e) {
      reject(e);
    }
  });
}

async function loadSystemJsEntry({
  entry,
  remoteEntryExports,
}: {
  entry: string;
  remoteEntryExports: RemoteEntryExports | undefined;
}): Promise<RemoteEntryExports> {
  return new Promise<RemoteEntryExports>((resolve, reject) => {
    try {
      if (!remoteEntryExports) {
        //@ts-ignore
        if (typeof __system_context__ === 'undefined') {
          //@ts-ignore
          System.import(entry).then(resolve).catch(reject);
        } else {
          new Function(
            'callbacks',
            `System.import("${entry}").then(callbacks[0]).catch(callbacks[1])`,
          )([resolve, reject]);
        }
      } else {
        resolve(remoteEntryExports);
      }
    } catch (e) {
      reject(e);
    }
  });
}

async function loadEntryScript({
  name,
  globalName,
  entry,
  createScriptHook,
}: {
  name: string;
  globalName: string;
  entry: string;
  createScriptHook: FederationHost['loaderHook']['lifecycle']['createScript'];
}): Promise<RemoteEntryExports> {
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  return loadScript(entry, {
    attrs: {},
    createScriptHook: (url, attrs) => {
      const res = createScriptHook.emit({ url, attrs });

      if (!res) return;

      if (res instanceof HTMLScriptElement) {
        return res;
      }

      if ('script' in res || 'timeout' in res) {
        return res;
      }

      return;
    },
  })
    .then(() => {
      const { remoteEntryKey, entryExports } = getRemoteEntryExports(
        name,
        globalName,
      );

      //TODO: RUNTIME-001
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

async function loadEntryDom({
  remoteInfo,
  remoteEntryExports,
  createScriptHook,
}: {
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports;
  createScriptHook: FederationHost['loaderHook']['lifecycle']['createScript'];
}) {
  const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
  switch (type) {
    case 'esm':
    case 'module':
      return loadEsmEntry({ entry, remoteEntryExports });
    case 'system':
      return loadSystemJsEntry({ entry, remoteEntryExports });
    default:
      return loadEntryScript({ entry, globalName, name, createScriptHook });
  }
}

async function loadEntryNode({
  remoteInfo,
  createScriptHook,
}: {
  remoteInfo: RemoteInfo;
  createScriptHook: FederationHost['loaderHook']['lifecycle']['createScript'];
}) {
  const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  return loadScriptNode(entry, {
    attrs: { name, globalName, type },
    createScriptHook: (url, attrs) => {
      const res = createScriptHook.emit({ url, attrs });

      if (!res) return;

      if ('url' in res) {
        return res;
      }

      return;
    },
  })
    .then(() => {
      const { remoteEntryKey, entryExports } = getRemoteEntryExports(
        name,
        globalName,
      );
      //TODO: RUNTIME-001
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
  origin,
  remoteEntryExports,
  remoteInfo,
}: {
  origin: FederationHost;
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports | undefined;
}): Promise<RemoteEntryExports | false | void> {
  const uniqueKey = getRemoteEntryUniqueKey(remoteInfo);
  if (remoteEntryExports) {
    return remoteEntryExports;
  }

  if (!globalLoading[uniqueKey]) {
    const loadEntryHook = origin.remoteHandler.hooks.lifecycle.loadEntry;
    const createScriptHook = origin.loaderHook.lifecycle.createScript;
    globalLoading[uniqueKey] = loadEntryHook
      .emit({
        createScriptHook,
        remoteInfo,
        remoteEntryExports,
      })
      .then((res) => {
        if (res) {
          return res;
        }
        return isBrowserEnv()
          ? loadEntryDom({ remoteInfo, remoteEntryExports, createScriptHook })
          : loadEntryNode({ remoteInfo, createScriptHook });
      });
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
