import {
  nativeGlobal,
  resetFederationGlobalInfo,
  setGlobalFederationInstance,
  getGlobalFederationConstructor,
  setGlobalFederationConstructor,
  getInfoWithoutType,
  getGlobalSnapshot,
  getTargetSnapshotInfoByModuleInfo,
  getGlobalSnapshotInfoByModuleInfo,
  setGlobalSnapshotInfoByModuleInfo,
  addGlobalSnapshot,
  getRemoteEntryExports,
  registerGlobalPlugins,
  getGlobalHostPlugins,
  getPreloaded,
  setPreloaded,
  Global,
} from './global';
import { getRegisteredShare, getGlobalShareScope } from './utils/share';

interface IShareUtils {
  getRegisteredShare: typeof getRegisteredShare;
  getGlobalShareScope: typeof getGlobalShareScope;
}
const ShareUtils: IShareUtils = {
  getRegisteredShare,
  getGlobalShareScope,
};

interface IGlobalUtils {
  Global: typeof Global;
  nativeGlobal: typeof global;
  resetFederationGlobalInfo: typeof resetFederationGlobalInfo;
  setGlobalFederationInstance: typeof setGlobalFederationInstance;
  getGlobalFederationConstructor: typeof getGlobalFederationConstructor;
  setGlobalFederationConstructor: typeof setGlobalFederationConstructor;
  getInfoWithoutType: typeof getInfoWithoutType;
  getGlobalSnapshot: typeof getGlobalSnapshot;
  getTargetSnapshotInfoByModuleInfo: typeof getTargetSnapshotInfoByModuleInfo;
  getGlobalSnapshotInfoByModuleInfo: typeof getGlobalSnapshotInfoByModuleInfo;
  setGlobalSnapshotInfoByModuleInfo: typeof setGlobalSnapshotInfoByModuleInfo;
  addGlobalSnapshot: typeof addGlobalSnapshot;
  getRemoteEntryExports: typeof getRemoteEntryExports;
  registerGlobalPlugins: typeof registerGlobalPlugins;
  getGlobalHostPlugins: typeof getGlobalHostPlugins;
  getPreloaded: typeof getPreloaded;
  setPreloaded: typeof setPreloaded;
}

const GlobalUtils: IGlobalUtils = {
  Global,
  nativeGlobal,
  resetFederationGlobalInfo,
  setGlobalFederationInstance,
  getGlobalFederationConstructor,
  setGlobalFederationConstructor,
  getInfoWithoutType,
  getGlobalSnapshot,
  getTargetSnapshotInfoByModuleInfo,
  getGlobalSnapshotInfoByModuleInfo,
  setGlobalSnapshotInfoByModuleInfo,
  addGlobalSnapshot,
  getRemoteEntryExports,
  registerGlobalPlugins,
  getGlobalHostPlugins,
  getPreloaded,
  setPreloaded,
};

export default {
  global: GlobalUtils,
  share: ShareUtils,
};

export type { IGlobalUtils, IShareUtils };
