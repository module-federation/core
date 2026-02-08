import {
  getShortErrorMsg,
  RUNTIME_009,
  runtimeDescMap,
} from '@module-federation/error-codes';
import { decodeName, ENCODE_NAME_PREFIX } from '@module-federation/sdk';
import {
  assert,
  getInfoWithoutType,
  getRemoteInfo,
  Global,
  type ModuleFederation,
} from '@module-federation/runtime-core';
import helpers from './helpers';
import { getInstance } from './index';

type RuntimeRemote = ModuleFederation['options']['remotes'][number];

function clearBundlerRemoteModuleCache(
  instance: ModuleFederation,
  remote: RuntimeRemote,
): void {
  const hostWithInternal = instance as ModuleFederation & {
    [key: symbol]: unknown;
  };
  const webpackRequire = hostWithInternal[Symbol.for('mf_webpack_require')] as
    | {
        c: Record<string, unknown>;
        m: Record<string, unknown>;
        federation?: {
          bundlerRuntimeOptions?: {
            remotes?: {
              idToRemoteMap?: Record<string, Array<{ name?: string }>>;
              idToExternalAndNameMapping?: Record<string, any>;
            };
          };
        };
      }
    | undefined;
  if (!webpackRequire) {
    return;
  }
  const remotesOptions =
    webpackRequire?.federation?.bundlerRuntimeOptions?.remotes;
  if (!remotesOptions) {
    return;
  }

  const { idToRemoteMap = {}, idToExternalAndNameMapping = {} } =
    remotesOptions;
  const candidates = new Set<string>(
    [remote.name, remote.alias].filter(Boolean) as string[],
  );
  if (!candidates.size) {
    return;
  }

  const normalized = (value: string): string => {
    try {
      return decodeName(value, ENCODE_NAME_PREFIX);
    } catch {
      return value;
    }
  };

  Object.entries(idToRemoteMap).forEach(([moduleId, remoteInfos]) => {
    if (!Array.isArray(remoteInfos)) {
      return;
    }
    const matched = remoteInfos.some((remoteInfo) => {
      if (!remoteInfo?.name) {
        return false;
      }
      const remoteName = remoteInfo.name;
      return (
        candidates.has(remoteName) || candidates.has(normalized(remoteName))
      );
    });
    if (!matched) {
      return;
    }

    delete webpackRequire.c[moduleId];
    delete webpackRequire.m[moduleId];
    const mappingItem = idToExternalAndNameMapping[moduleId];
    if (mappingItem && typeof mappingItem === 'object' && 'p' in mappingItem) {
      delete mappingItem.p;
    }
  });
}

function clearHostSnapshotAndManifestLoading(
  instance: ModuleFederation,
  remote: RuntimeRemote,
): void {
  const hostGlobalSnapshot = helpers.global.getGlobalSnapshotInfoByModuleInfo({
    name: instance.name,
    version: instance.options.version,
  });
  if (
    !hostGlobalSnapshot ||
    !('remotesInfo' in hostGlobalSnapshot) ||
    !hostGlobalSnapshot.remotesInfo
  ) {
    return;
  }

  const remoteKey = getInfoWithoutType(
    hostGlobalSnapshot.remotesInfo,
    remote.name,
  ).key;
  if (!remoteKey) {
    return;
  }
  delete hostGlobalSnapshot.remotesInfo[remoteKey];

  if (
    // eslint-disable-next-line no-extra-boolean-cast
    Boolean(Global.__FEDERATION__.__MANIFEST_LOADING__[remoteKey])
  ) {
    delete Global.__FEDERATION__.__MANIFEST_LOADING__[remoteKey];
  }
}

function clearRemoteBookkeeping(
  instance: ModuleFederation,
  remote: RuntimeRemote,
): void {
  const remoteIndex = instance.options.remotes.findIndex(
    (item) => item.name === remote.name,
  );
  if (remoteIndex !== -1) {
    instance.options.remotes.splice(remoteIndex, 1);
  }

  const remoteInfo = getRemoteInfo(remote);
  if (remoteInfo.entry) {
    instance.snapshotHandler.manifestCache.delete(remoteInfo.entry);
  }
  clearHostSnapshotAndManifestLoading(instance, remote);

  instance.moduleCache.delete(remote.name);

  const remoteHandler = (instance as any).remoteHandler as
    | {
        idToRemoteMap?: Record<string, { name?: string; expose?: string }>;
      }
    | undefined;
  if (remoteHandler?.idToRemoteMap) {
    Object.keys(remoteHandler.idToRemoteMap).forEach((id) => {
      if (remoteHandler.idToRemoteMap?.[id]?.name === remote.name) {
        delete remoteHandler.idToRemoteMap[id];
      }
    });
  }

  const remotePrefixes = [remote.name, remote.alias].filter(
    Boolean,
  ) as string[];
  const preloadedMap = Global.__FEDERATION__.__PRELOADED_MAP__;
  Array.from(preloadedMap.keys()).forEach((key) => {
    if (
      remotePrefixes.some(
        (prefix) => key === prefix || key.startsWith(`${prefix}/`),
      )
    ) {
      preloadedMap.delete(key);
    }
  });
}

export function unloadRemoteFromInstance(
  instance: ModuleFederation,
  nameOrAlias: string,
): boolean {
  const remote = instance.options.remotes.find(
    (item) => item.name === nameOrAlias || item.alias === nameOrAlias,
  );
  if (!remote) {
    return false;
  }

  clearBundlerRemoteModuleCache(instance, remote);

  const remoteHandler = (instance as any).remoteHandler as
    | {
        removeRemote?: (remote: RuntimeRemote) => void;
      }
    | undefined;
  const loadedByCurrentHost = instance.moduleCache.has(remote.name);
  if (loadedByCurrentHost && remoteHandler?.removeRemote) {
    remoteHandler.removeRemote(remote);
    return true;
  }

  clearRemoteBookkeeping(instance, remote);
  return true;
}

export function unloadRemote(nameOrAlias: string): boolean {
  const instance = getInstance();
  assert(instance, getShortErrorMsg(RUNTIME_009, runtimeDescMap));
  return unloadRemoteFromInstance(instance, nameOrAlias);
}
