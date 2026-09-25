import { FederationCore } from './core';
import { disabledRemote } from './remote/disabled';
import { disabledShared } from './shared/disabled';
import { unavailablePlatform } from './platform/unavailable';
import type {
  Capabilities,
  RemoteHandlerContract,
  SharedHandlerContract,
  SnapshotHandlerContract,
  UserOptions,
} from './type';

class Kernel extends FederationCore {
  constructor(userOptions: UserOptions, capabilities: Capabilities = {}) {
    super(userOptions, {
      shared: capabilities.shared || disabledShared,
      remote: capabilities.remote || disabledRemote,
      snapshot: capabilities.remote && capabilities.snapshot,
      platform: capabilities.platform || unavailablePlatform,
    });
  }
}

// Handlers of capabilities the caller left out are disabled, so a kernel
// promises only the handler contracts.
export type FederationKernel = Omit<
  Kernel,
  'remoteHandler' | 'sharedHandler' | 'snapshotHandler'
> & {
  remoteHandler: RemoteHandlerContract;
  sharedHandler: SharedHandlerContract;
  snapshotHandler: SnapshotHandlerContract;
};
export const FederationKernel = Kernel as new (
  userOptions: UserOptions,
  capabilities?: Capabilities,
) => FederationKernel;

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
