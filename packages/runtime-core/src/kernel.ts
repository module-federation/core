export { ModuleFederation, type Capabilities } from './core';
export {
  CurrentGlobal,
  getGlobalFederationConstructor,
  setGlobalFederationInstance,
  setGlobalFederationConstructor,
  getGlobalSnapshotInfoByModuleInfo,
} from './global';
export { assert, error } from './utils/logger';
export { getRemoteEntry } from './utils/load';
