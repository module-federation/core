import { CreateScriptHookDom, loadScript } from '@module-federation/sdk';
import { FederationRuntimePlugin } from '../../type/plugin';
import { assert } from '../../utils';
import { RemoteEntryExports } from '../../type';
import { getRemoteEntryExports } from '../../global';

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
        // eslint-disable-next-line no-eval
        new Function(
          'callbacks',
          `System.import("${entry}").then(callbacks[0]).catch(callbacks[1])`,
        )([resolve, reject]);
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
  createScriptHook: CreateScriptHookDom;
}): Promise<RemoteEntryExports> {
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (remoteEntryExports) {
    return remoteEntryExports;
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

export async function loadEntryDom({
  entry,
  entryGlobalName,
  remoteEntryExports,
  name,
  type,
  createScriptHook,
}: {
  entry: string;
  entryGlobalName: string;
  remoteEntryExports: RemoteEntryExports | undefined;
  name: string;
  type: string;
  createScriptHook: CreateScriptHookDom;
}) {
  switch (type) {
    case 'esm':
    case 'module':
      return loadEsmEntry({ entry, remoteEntryExports });
    case 'system':
      return loadSystemJsEntry({ entry, remoteEntryExports });
    default:
      return loadEntryScript({
        entry,
        globalName: entryGlobalName,
        name,
        createScriptHook,
      });
  }
}

export function domPlugin(): FederationRuntimePlugin {
  return {
    name: 'dom-plugin',
    async loadEntry(args) {
      const { createScriptHook, remoteInfo, remoteEntryExports } = args;
      const { entry, entryGlobalName, name, type } = remoteInfo;

      return loadEntryDom({
        entry,
        entryGlobalName,
        name,
        type,
        remoteEntryExports,
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
      });
    },
  };
}
