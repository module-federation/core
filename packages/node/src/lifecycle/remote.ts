import type { ModuleFederation } from '@module-federation/runtime';
import type { Remote, RemoteInfo } from '@module-federation/runtime/types';
import helpers from '@module-federation/runtime/helpers';
import { clearContainerCache } from '@module-federation/webpack-bundler-runtime/clear-cache';
import {
  forEachSharedRecord,
  getRemoteSharedOwnership,
  pruneRetiredShareScopes,
  retireShareScope,
} from './share';
import type { NodeFederation } from './symbols';

export function prepareNodeRemotes(
  host: ModuleFederation,
  remotes: Remote[],
): Remote[] {
  if (!Array.isArray(remotes)) throw new Error('Remotes must be an array');
  const names = new Set<string>();
  const prepared = remotes.map((remote) => {
    if (!remote || typeof remote.name !== 'string' || !remote.name.length)
      throw new Error('Remote name is required');
    if (names.has(remote.name))
      throw new Error(`Duplicate remote: ${remote.name}`);
    names.add(remote.name);
    const result = { ...remote };
    if (Array.isArray(remote.shareScope))
      result.shareScope = [...remote.shareScope];
    if ('entry' in result) {
      if (typeof result.entry !== 'string' || !result.entry.length)
        throw new Error('Remote entry is required');
    } else if (
      !('version' in result) ||
      typeof result.version !== 'string' ||
      !result.version.length
    ) {
      throw new Error('Remote entry or version is required');
    }
    result.shareScope ||= 'default';
    result.type ||= 'global';
    return result;
  });
  const final = [
    ...host.options.remotes.filter((remote) => !names.has(remote.name)),
    ...prepared,
  ];
  for (const remote of final) {
    if (!remote.alias) continue;
    if (typeof remote.alias !== 'string')
      throw new Error('Remote alias must be a string');
    if (
      final.some(
        (other) =>
          other !== remote &&
          (other.name.startsWith(remote.alias!) ||
            other.alias?.startsWith(remote.alias!)),
      )
    )
      throw new Error(
        `Remote alias conflicts with another registration: ${remote.alias}`,
      );
  }
  return prepared;
}

export function clearNodeRemoteSnapshotCache(
  host: ModuleFederation,
  remote: Remote,
  remoteInfo?: RemoteInfo,
): void {
  const { Global, getInfoWithoutType } = helpers.global;
  const remoteNames = new Set(
    [remote.name, remoteInfo?.name].filter(Boolean) as string[],
  );
  const remoteEntries = new Set(
    ['entry' in remote ? remote.entry : undefined, remoteInfo?.entry].filter(
      Boolean,
    ) as string[],
  );
  const globalModuleInfo = Global.__FEDERATION__.moduleInfo;
  const hostSnapshot = helpers.global.getGlobalSnapshotInfoByModuleInfo({
    name: host.options.name,
    version: host.options.version,
  });
  if (hostSnapshot && 'remotesInfo' in hostSnapshot && hostSnapshot.remotesInfo)
    for (const remoteName of remoteNames) {
      const record = getInfoWithoutType(hostSnapshot.remotesInfo, remoteName);
      if (record.value) delete hostSnapshot.remotesInfo[record.key];
    }

  for (const moduleKey of Object.keys(globalModuleInfo)) {
    const snapshot = globalModuleInfo[moduleKey];
    const snapshotBuildVersion =
      snapshot && 'buildVersion' in snapshot
        ? snapshot.buildVersion
        : undefined;
    if (
      remoteInfo?.buildVersion &&
      snapshotBuildVersion &&
      snapshotBuildVersion !== remoteInfo.buildVersion
    )
      continue;
    for (const remoteName of remoteNames) {
      if (
        moduleKey === remoteName ||
        [...remoteEntries].some(
          (entry) => moduleKey === `${remoteName}:${entry}`,
        ) ||
        (remoteInfo?.version &&
          moduleKey === `${remoteName}:${remoteInfo.version}`)
      )
        delete globalModuleInfo[moduleKey];
    }
  }
  for (const entry of remoteEntries) {
    host.snapshotHandler.manifestCache.delete(entry);
    delete Global.__FEDERATION__.__MANIFEST_LOADING__[entry];
  }
}

export function captureNodeRemoteRemoval(host: NodeFederation, target: Remote) {
  const module = host.moduleCache.get(target.name);
  const info = module?.remoteInfo;
  const instances = globalThis.__FEDERATION__.__INSTANCES__;
  const provider = info
    ? helpers.global.getRemoteFederationInstance(info, [
        ...instances,
        ...host.retainedProviders,
      ])
    : undefined;
  const ownership = info ? getRemoteSharedOwnership(info, provider) : undefined;
  const entries = new Set(
    [module?.remoteEntryExports, module?.lib].filter(Boolean),
  );
  return {
    info,
    commit() {
      const finalizeRemoval = () => {
        const remoteIndex = host.options.remotes.findIndex(
          (item) => item.name === target.name,
        );
        if (remoteIndex !== -1) host.options.remotes.splice(remoteIndex, 1);
        clearNodeRemoteSnapshotCache(host, target, info);
      };
      if (!module || !info || !ownership) {
        finalizeRemoval();
        return;
      }
      const releaseLocal = () => {
        finalizeRemoval();
        host.moduleCache.delete(target.name);
        for (const [id, match] of Object.entries(
          host.remoteHandler.idToRemoteMap,
        ))
          if (match.name === target.name)
            delete host.remoteHandler.idToRemoteMap[id];
      };
      const usedElsewhere = instances.some(
        (other) =>
          other !== host &&
          [...other.moduleCache.values()].some(
            (value) =>
              (value.remoteEntryExports &&
                entries.has(value.remoteEntryExports)) ||
              (value.lib && entries.has(value.lib)) ||
              (provider &&
                helpers.global.getRemoteFederationInstance(value.remoteInfo, [
                  provider,
                ])),
          ),
      );
      if (usedElsewhere) return releaseLocal();

      const scopes = helpers.share.getGlobalShareScope();
      let preserveShared = false;
      const releaseShared: Array<() => void> = [];
      forEachSharedRecord(scopes, (shared, versions, version) => {
        if (!ownership.owns(shared)) return;
        if (ownership.sharedWithPeer(shared)) {
          preserveShared = true;
          return;
        }
        const useIn = shared.useIn.filter((name) => name !== shared.from);
        if (useIn.length || (shared.loading && !shared.loaded)) {
          preserveShared = true;
          releaseShared.push(() => {
            shared.useIn = useIn;
            shared.providerState = 1;
          });
        } else releaseShared.push(() => delete versions[version]);
      });

      const key = info.entryGlobalName;
      const globalEntry = key ? (globalThis as any)[key] : undefined;
      const ownsGlobal = !info.buildVersion || entries.has(globalEntry);
      if (ownsGlobal && globalEntry) entries.add(globalEntry);
      for (const entry of entries) clearContainerCache(entry, preserveShared);
      releaseLocal();
      for (const release of releaseShared) release();
      if (ownsGlobal && key && (globalThis as any)[key] === globalEntry) {
        if (Object.getOwnPropertyDescriptor(globalThis, key)?.configurable)
          delete (globalThis as any)[key];
        else (globalThis as any)[key] = undefined;
      }
      delete globalThis.__GLOBAL_LOADING_REMOTE_ENTRY__[
        helpers.utils.getRemoteEntryUniqueKey(info)
      ];
      if (provider) {
        retireShareScope(provider.shareScopeMap);
        if (preserveShared) host.retainedProviders.add(provider);
        else {
          provider.shareScopeMap = {};
          delete scopes[ownership.id];
        }
        const index = instances.indexOf(provider);
        if (index !== -1) instances.splice(index, 1);
      }
      pruneRetiredShareScopes();
    },
  };
}
