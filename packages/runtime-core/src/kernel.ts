import { FederationCore } from './core';
import { disabledRemote } from './remote/disabled';
import { disabledShared } from './shared/disabled';
import { unavailablePlatform } from './platform/unavailable';
import type { Capabilities, UserOptions } from './type';

export class FederationKernel extends FederationCore {
  constructor(userOptions: UserOptions, capabilities: Capabilities = {}) {
    super(userOptions, {
      shared: capabilities.shared || disabledShared,
      remote: capabilities.remote || disabledRemote,
      snapshot: capabilities.remote && capabilities.snapshot,
      platform: capabilities.platform || unavailablePlatform,
    });
  }
}

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
