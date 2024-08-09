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

export function domPlugin(): FederationRuntimePlugin {
  return {
    name: 'dom-plugin',
    async loadEntry(args) {
      const { origin, remoteInfo, remoteEntryExports } = args;
      const { entry, entryGlobalName, name, type } = remoteInfo;

      if (['esm', 'module'].includes(type)) {
        return loadEsmEntry({
          entry,
          remoteEntryExports,
        });
      } else if (type === 'system') {
        return loadSystemJsEntry({
          entry,
          remoteEntryExports,
        });
      }
      return loadEntryScript({
        entry,
        globalName: entryGlobalName,
        name,
        createScriptHook: (url, attrs) => {
          const hook = origin.loaderHook.lifecycle.createScript;
          const res = hook.emit({ url, attrs });

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
