import { FEDERATION_SUPPORTED_TYPES } from './constant';
import { IdToRemoteMapItem } from './types';

export function canUseMFRuntimeLoad(remoteInfos: IdToRemoteMapItem[]) {
  return (
    remoteInfos.length === 1 &&
    FEDERATION_SUPPORTED_TYPES.includes(remoteInfos[0].externalType) &&
    remoteInfos[0].name
  );
}
