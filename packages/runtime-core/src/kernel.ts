export { FederationKernel } from './core';
export type { ModuleFederation } from './index';
export {
  CurrentGlobal,
  getGlobalSnapshotInfoByModuleInfo,
  setGlobalFederationInstance,
} from './global';
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
