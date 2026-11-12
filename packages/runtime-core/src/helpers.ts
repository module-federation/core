import {
  nativeGlobal,
  resetFederationGlobalInfo,
  setGlobalFederationInstance,
  getRemoteFederationInstance,
  hasRemoteModuleConsumers,
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
import {
  getRegisteredShare,
  getGlobalShareScope,
  getRemoteSharedOwnership,
} from './utils/share';
import {
  getRemoteInfo,
  getRemoteEntryUniqueKey,
  matchRemoteWithNameAndExpose,
} from './utils';
import { preloadAssets } from './utils/preload';
interface IShareUtils {
  getRegisteredShare: typeof getRegisteredShare;
  getGlobalShareScope: typeof getGlobalShareScope;
  getRemoteSharedOwnership: typeof getRemoteSharedOwnership;
}
const ShareUtils: IShareUtils = {
  getRegisteredShare,
  getGlobalShareScope,
  getRemoteSharedOwnership,
};

interface IGlobalUtils {
  Global: typeof Global;
  nativeGlobal: typeof global;
  resetFederationGlobalInfo: typeof resetFederationGlobalInfo;
  setGlobalFederationInstance: typeof setGlobalFederationInstance;
  getRemoteFederationInstance: typeof getRemoteFederationInstance;
  hasRemoteModuleConsumers: typeof hasRemoteModuleConsumers;
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
  getRemoteFederationInstance,
  hasRemoteModuleConsumers,
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
  utils: {
    matchRemoteWithNameAndExpose,
    preloadAssets,
    getRemoteInfo,
    getRemoteEntryUniqueKey,
  },
};

export type { IGlobalUtils, IShareUtils };
