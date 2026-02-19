import type {
  ModuleFederation,
  ModuleFederationRuntimePlugin,
} from '@module-federation/runtime';
import type { Remote } from '@module-federation/runtime/types';
import { decodeName, ENCODE_NAME_PREFIX } from '@module-federation/sdk';

type WebpackRequire = {
  c?: Record<string, unknown>;
  m?: Record<string, unknown>;
  federation?: {
    bundlerRuntimeOptions?: {
      remotes?: {
        idToRemoteMap?: Record<string, Array<{ name?: string }>>;
        idToExternalAndNameMapping?: Record<string, any>;
      };
    };
  };
};

const WEBPACK_REQUIRE_SYMBOL = Symbol.for('mf_webpack_require');

const clearBundlerRemoteModuleCache = (
  origin: ModuleFederation,
  remote: Remote,
) => {
  const webpackRequire = (
    origin as ModuleFederation & {
      [key: symbol]: unknown;
    }
  )[WEBPACK_REQUIRE_SYMBOL] as WebpackRequire | undefined;
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

  const normalizeName = (value: string): string => {
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
        candidates.has(remoteName) || candidates.has(normalizeName(remoteName))
      );
    });
    if (!matched) {
      return;
    }

    if (webpackRequire?.c) {
      delete webpackRequire.c[moduleId];
    }
    if (webpackRequire?.m) {
      delete webpackRequire.m[moduleId];
    }
    const mappingItem = idToExternalAndNameMapping[moduleId];
    if (mappingItem && typeof mappingItem === 'object' && 'p' in mappingItem) {
      delete mappingItem.p;
    }
  });
};

export function unloadRemotePlugin(): ModuleFederationRuntimePlugin {
  return {
    name: 'unload-remote-plugin',
    afterRemoveRemote({ remote, origin }) {
      clearBundlerRemoteModuleCache(origin, remote);
    },
  };
}
