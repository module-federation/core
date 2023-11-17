import {
  nativeGlobal,
  resetFederationGlobalInfo,
  getGlobalFederationInstance,
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
} from './global';
import { getGlobalShare, getGlobalShareScope } from './utils/share';

interface IShareUtils {
  getGlobalShare: typeof getGlobalShare;
  getGlobalShareScope: typeof getGlobalShareScope;
}
const ShareUtils: IShareUtils = {
  getGlobalShare,
  getGlobalShareScope,
};

interface IGlobalUtils {
  nativeGlobal: typeof global;
  resetFederationGlobalInfo: typeof resetFederationGlobalInfo;
  getGlobalFederationInstance: typeof getGlobalFederationInstance;
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
  nativeGlobal,
  resetFederationGlobalInfo,
  getGlobalFederationInstance,
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

export { IGlobalUtils, IShareUtils };
