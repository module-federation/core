import type { ModuleFederation } from '../core';
import { CurrentGlobal, Global } from '../global';

/** Release instance-owned roots. Shared values used by another host stay alive. */
export async function disposeInstance(host: ModuleFederation): Promise<void> {
  const globals = new Set([
    CurrentGlobal.__FEDERATION__,
    Global.__FEDERATION__,
  ]);
  const others = [...globals]
    .flatMap((g) => g.__INSTANCES__)
    .filter((i) => i !== host);
  if (others.some((i) => i.name === host.name && !i.disposed))
    throw new Error(
      'Cannot dispose an MF instance with an ambiguous shared owner name',
    );
  for (const global of globals) {
    for (const scopes of Object.values(global.__SHARE__))
      for (const packages of Object.values(scopes))
        for (const versions of Object.values(packages))
          for (const [version, shared] of Object.entries(versions)) {
            shared.useIn = shared.useIn.filter((name) => name !== host.name);
            if (
              shared.from === host.name &&
              !shared.useIn.length &&
              (!shared.loading || shared.loaded)
            )
              delete versions[version];
          }
  }
  for (const remote of [...host.options.remotes]) {
    const module = host.moduleCache.get(remote.name);
    const usedElsewhere =
      module &&
      others
        .filter((other) => !other.disposed)
        .some((other) =>
          [...other.moduleCache.values()].some(
            (value) =>
              value === module ||
              (module.remoteEntryExports &&
                value.remoteEntryExports === module.remoteEntryExports),
          ),
        );
    // Another consumer owns this container too; only drop our local reference.
    if (!usedElsewhere) await host.remoteHandler.removeRemote(remote);
  }
  // Every listener must run; a false result must not skip another owner's cleanup.
  const results = await Promise.allSettled(
    [...host.hooks.lifecycle.dispose.listeners].map((listener) =>
      Promise.resolve().then(() => listener({ origin: host })),
    ),
  );
  const failed = results.filter((result) => result.status === 'rejected');
  if (failed.length)
    throw new AggregateError(
      failed.map((result) => result.reason),
      'MF disposal failed',
    );
  for (const global of globals) {
    for (const scopes of Object.values(global.__SHARE__))
      for (const packages of Object.values(scopes))
        for (const versions of Object.values(packages))
          for (const [version, shared] of Object.entries(versions))
            if (
              shared.from === host.name &&
              !shared.useIn.length &&
              (!shared.loading || shared.loaded)
            )
              delete versions[version];
    for (let index = global.__INSTANCES__.length - 1; index >= 0; index--)
      if (global.__INSTANCES__[index] === host)
        global.__INSTANCES__.splice(index, 1);
    for (const [id, scopes] of Object.entries(global.__SHARE__))
      if (
        scopes === host.shareScopeMap &&
        !Object.values(scopes).some((packages) =>
          Object.values(packages).some((versions) =>
            Object.values(versions).some(
              (shared) =>
                shared.from === host.name &&
                (shared.useIn.length || (shared.loading && !shared.loaded)),
            ),
          ),
        )
      )
        delete global.__SHARE__[id];
  }
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
  host.moduleInfo = undefined;
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
