import { getInstance } from '@module-federation/runtime';
import {
  encodeName,
  ModuleInfo,
  MFPrefetchCommon,
} from '@module-federation/sdk';

export const getScope = (): string => {
  return getInstance()!.options.name;
};

export const getPrefetchId = (id: string): string =>
  encodeName(`${id}/${MFPrefetchCommon.identifier}`);

export const compatGetPrefetchId = (id: string): string =>
  encodeName(`${id}/VmokPrefetch`);

export const getSignalFromManifest = (remoteSnapshot: ModuleInfo): boolean => {
  if (!remoteSnapshot) {
    return false;
  }

  if (
    !('prefetchEntry' in remoteSnapshot) &&
    !('prefetchInterface' in remoteSnapshot)
  ) {
    return false;
  }

  if (!remoteSnapshot.prefetchEntry && !remoteSnapshot.prefetchInterface) {
    return false;
  }
  return true;
};
