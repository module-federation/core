export { FederationKernel } from './core';
export { unavailablePlatform } from './platform/unavailable';
export {
  CurrentGlobal,
  getGlobalFederationConstructor,
  getGlobalSnapshotInfoByModuleInfo,
  setGlobalFederationConstructor,
  setGlobalFederationInstance,
} from './global';
export { assert, error } from './utils/logger';
export { getRemoteEntry } from './utils/load';
export type {
  Capabilities,
  LoadEntryOptions,
  NodePlatform,
  Platform,
  RemoteCapability,
  RemoteHandlerContract,
  ScriptInfo,
  SharedCapability,
  SharedHandlerContract,
  SnapshotCapability,
  SnapshotHandlerContract,
  UserOptions,
} from './type';
