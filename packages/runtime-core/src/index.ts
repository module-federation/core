import helpersDefault, { type IGlobalUtils, type IShareUtils } from './helpers';
import { Module as RemoteModule } from './module';
import { UnavailableRemoteModule, disabledRemote } from './remote/disabled';
import { disabledShared } from './shared/disabled';
import { unavailablePlatform } from './platform/unavailable';
import { FederationCore } from './core';
import { shared } from './shared/capability';
import { remote } from './remote/capability';
import { snapshot } from './plugins/snapshot/capability';
import { universal } from './platform/universal';
import type { ResolvedCapabilities, UserOptions } from './type';

declare const FEDERATION_OPTIMIZE_NO_REMOTE: boolean;
declare const FEDERATION_OPTIMIZE_NO_SHARED: boolean;
declare const FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN: boolean;

const helpers = helpersDefault;
const Module = (
  typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean' &&
  FEDERATION_OPTIMIZE_NO_REMOTE
    ? UnavailableRemoteModule
    : RemoteModule
) as typeof RemoteModule;

// Each check stays inline so the bundler folds it at parse time and drops the
// unused capability import.
const legacyCapabilities = (): ResolvedCapabilities => ({
  shared:
    typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean' &&
    FEDERATION_OPTIMIZE_NO_SHARED
      ? disabledShared
      : shared,
  remote:
    typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean' &&
    FEDERATION_OPTIMIZE_NO_REMOTE
      ? disabledRemote
      : remote,
  snapshot:
    (typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean' &&
      FEDERATION_OPTIMIZE_NO_REMOTE) ||
    (typeof FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN === 'boolean' &&
      FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN)
      ? undefined
      : snapshot,
  platform:
    typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean' &&
    FEDERATION_OPTIMIZE_NO_REMOTE &&
    typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean' &&
    FEDERATION_OPTIMIZE_NO_SHARED
      ? unavailablePlatform
      : universal,
});

export class ModuleFederation extends FederationCore {
  constructor(userOptions: UserOptions) {
    super(userOptions, legacyCapabilities());
  }
}
export {
  type Federation,
  CurrentGlobal,
  Global,
  getGlobalFederationConstructor,
  setGlobalFederationInstance,
  setGlobalFederationConstructor,
  resetFederationGlobalInfo,
  addGlobalSnapshot,
  getGlobalSnapshot,
  getInfoWithoutType,
} from './global';
export type {
  UserOptions,
  ModuleFederationRuntimePlugin,
  RuntimePluginHooks,
} from './type';
export { assert, error } from './utils/logger';
export { registerGlobalPlugins } from './global';
export {
  getRemoteEntry,
  getRemoteInfo,
  isStaticResourcesEqual,
  matchRemoteWithNameAndExpose,
  safeWrapper,
} from './utils';
export { getRegisteredShare } from '../src/utils/share';
export { loadScript } from '@module-federation/sdk/core';
export { loadScriptNode } from '@module-federation/sdk/node';
export { Module };
export * as types from './type';
export { helpers };
export { satisfy } from '../src/utils/semver';
export type { IGlobalUtils, IShareUtils };
