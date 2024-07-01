import {
  encodeName,
  ModuleInfo,
  MFPrefetchCommon,
} from '@module-federation/sdk';

export const getScope = (id: string): string => {
  const idArray = id.split('/');
  if (idArray.length >= 2) {
    idArray.pop();
  }
  const name = idArray.join('/');
  return name;
};

export const getPrefetchId = (id: string): string =>
  encodeName(`${id}/${MFPrefetchCommon.identifier}`);

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
