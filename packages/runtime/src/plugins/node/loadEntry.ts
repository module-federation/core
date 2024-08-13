import { CreateScriptHookNode, loadScriptNode } from '@module-federation/sdk';
import { getRemoteEntryExports } from '../../global';
import { RemoteEntryExports } from '../../type';
import { assert } from '../../utils';

async function loadEntryScript({
  name,
  globalName,
  entry,
  createScriptHook,
}: {
  name: string;
  globalName: string;
  entry: string;
  createScriptHook: CreateScriptHookNode;
}): Promise<RemoteEntryExports> {
  const { entryExports: remoteEntryExports } = getRemoteEntryExports(
    name,
    globalName,
  );

  if (remoteEntryExports) {
    return remoteEntryExports;
  }

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

export async function loadEntryNode({
  entry,
  entryGlobalName,
  name,
  createScriptHook,
}: {
  entry: string;
  entryGlobalName: string;
  name: string;
  createScriptHook: CreateScriptHookNode;
}) {
  return loadEntryScript({
    entry,
    globalName: entryGlobalName,
    name,
    createScriptHook,
  });
}
