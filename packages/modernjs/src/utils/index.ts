import type { ModuleFederation } from '@module-federation/enhanced/runtime';

export function getLoadedRemoteInfos(
  id: string,
  instance: ModuleFederation | null,
) {
  if (!instance) {
    return;
  }
  const { name, expose } = instance.remoteHandler.idToRemoteMap[id] || {};
  if (!name) {
    return;
  }
  const module = instance.moduleCache.get(name);
  if (!module) {
    return;
  }
  const { remoteSnapshot } = instance.snapshotHandler.getGlobalRemoteInfo(
    module.remoteInfo,
  );
  return {
    ...module.remoteInfo,
    snapshot: remoteSnapshot,
    expose,
  };
}

export function isCSROnly() {
  return window._SSR_DATA === undefined;
}

export * from './dataFetch';
