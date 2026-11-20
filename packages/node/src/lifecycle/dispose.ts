import type { Remote } from '@module-federation/runtime/types';
import helpers from '@module-federation/runtime/helpers';
import {
  forEachSharedRecord,
  pruneRetiredShareScopes,
  retireShareScope,
  sharedRecords,
} from './share';
import type { NodeFederation } from './symbols';

const CurrentGlobal = globalThis;
const { Global } = helpers.global;

/** Release instance-owned roots. Shared values used by another host stay alive. */
export async function disposeInstance(
  host: NodeFederation,
  removeRemoteInternal: (remote: Remote) => Promise<void>,
): Promise<void> {
  const globals = new Set([
    CurrentGlobal.__FEDERATION__,
    Global.__FEDERATION__,
  ]);
  const others = [...globals]
    .flatMap((g) => g.__INSTANCES__)
    .filter((i) => i !== host);
  let retainSharedOwner = others.some((i) => i.name === host.name);
  const releaseSharedOwner = () => {
    for (const global of globals)
      forEachSharedRecord(global.__SHARE__, (shared, versions, version) => {
        shared.useIn = shared.useIn.filter((name) => name !== host.name);
        if (
          shared.from === host.name &&
          !shared.useIn.length &&
          (!shared.loading || shared.loaded)
        )
          delete versions[version];
      });
  };
  if (!retainSharedOwner) releaseSharedOwner();

  for (const remote of [...host.options.remotes]) {
    const module = host.moduleCache.get(remote.name);
    const usedElsewhere =
      module &&
      others.some((other) =>
        [...other.moduleCache.values()].some(
          (value) =>
            value === module ||
            (module.remoteEntryExports &&
              value.remoteEntryExports === module.remoteEntryExports),
        ),
      );
    if (!usedElsewhere) await removeRemoteInternal(remote);
  }
  await helpers.dispose.notifyDispose(host);

  if (
    retainSharedOwner &&
    ![...globals].some((global) =>
      global.__INSTANCES__.some((i) => i !== host && i.name === host.name),
    )
  ) {
    retainSharedOwner = false;
    releaseSharedOwner();
  }
  retireShareScope(host.shareScopeMap);
  for (const global of globals) {
    if (!retainSharedOwner) {
      forEachSharedRecord(global.__SHARE__, (shared, versions, version) => {
        if (
          shared.from === host.name &&
          !shared.useIn.length &&
          (!shared.loading || shared.loaded)
        )
          delete versions[version];
      });
    }
    for (let index = global.__INSTANCES__.length - 1; index >= 0; index--)
      if (global.__INSTANCES__[index] === host)
        global.__INSTANCES__.splice(index, 1);
    if (!retainSharedOwner) {
      for (const [id, scopes] of Object.entries(global.__SHARE__))
        if (
          scopes === host.shareScopeMap &&
          !sharedRecords(scopes).some(
            (shared) =>
              shared.from === host.name &&
              (shared.useIn.length || (shared.loading && !shared.loaded)),
          )
        )
          delete global.__SHARE__[id];
    }
  }
  pruneRetiredShareScopes();
  host.moduleCache.clear();
  host.retainedProviders.clear();
  host.remoteHandler.idToRemoteMap = {};
  host.snapshotHandler.manifestCache?.clear();
  host.snapshotHandler.loadingHostSnapshot = null;
  host.sharedHandler.initTokens = {};
  host.shareScopeMap = host.sharedHandler.shareScopeMap = {};
  host.options.remotes = [];
  host.options.shared = {};
  host.options.plugins = [];
  for (const system of [
    host.hooks,
    host.remoteHandler.hooks,
    host.sharedHandler.hooks,
    host.snapshotHandler.hooks,
    host.loaderHook,
    host.bridgeHook,
  ]) {
    for (const hook of Object.values(system.lifecycle)) hook.removeAll();
    system.registerPlugins = {};
  }
}
