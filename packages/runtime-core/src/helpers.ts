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
import { getRegisteredShare, getGlobalShareScope } from './shared';
import { getRemoteInfo, matchRemoteWithNameAndExpose } from './utils';
import { preloadAssets } from './utils/preload';

const GlobalUtils = {
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

const ShareUtils = {
  getRegisteredShare,
  getGlobalShareScope,
};

export type IGlobalUtils = typeof GlobalUtils;
export type IShareUtils = typeof ShareUtils;

export default {
  global: GlobalUtils,
  share: ShareUtils,
  utils: {
    matchRemoteWithNameAndExpose,
    preloadAssets,
    getRemoteInfo,
  },
};
