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
  Global,
} from './global';
import { getRegisteredShare, getGlobalShareScope } from './utils/share';
import * as pluginHelper from './utils/hooks';
import { registerPlugins } from './utils';

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
  registerPlugins: typeof registerPlugins;
  pluginHelper: typeof pluginHelper;
}

const GlobalUtils: IGlobalUtils = {
  Global,
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
  registerPlugins,
  pluginHelper,
};

export default {
  global: GlobalUtils,
  share: ShareUtils,
};

export type { IGlobalUtils, IShareUtils };
