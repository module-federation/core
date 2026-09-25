import helpersDefault, { type IGlobalUtils, type IShareUtils } from './helpers';
import { Module as RemoteModule } from './module';
import { UnavailableRemoteModule } from './remote/disabled';
import {
  ModuleFederation as KernelModuleFederation,
  type Capabilities,
} from './core';
import { shared } from './shared/capability';
import { remote } from './remote/capability';
import { snapshot } from './plugins/snapshot/capability';
import { universal } from './platform/universal';
import type { UserOptions } from './type';

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

// The one define-reading composition: the root entry keeps today's behavior.
// Inline typeof checks so the bundler parser folds them and drops the unused capability import.
export function legacyCapabilities(): Capabilities {
  return {
    shared:
      typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean' &&
      FEDERATION_OPTIMIZE_NO_SHARED
        ? undefined
        : shared,
    remote:
      typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean' &&
      FEDERATION_OPTIMIZE_NO_REMOTE
        ? undefined
        : remote,
    snapshot:
      (typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean' &&
        FEDERATION_OPTIMIZE_NO_REMOTE) ||
      (typeof FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN === 'boolean' &&
        FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN)
        ? undefined
        : snapshot,
    platform: universal,
  };
}

export class ModuleFederation extends KernelModuleFederation {
  constructor(
    userOptions: UserOptions,
    capabilities: Capabilities = legacyCapabilities(),
  ) {
    super(userOptions, capabilities);
  }
}
export type { Capabilities };
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
export { loadScript, loadScriptNode } from '@module-federation/sdk';
export { Module };
export * as types from './type';
export { helpers };
export { satisfy } from '../src/utils/semver';
export type { IGlobalUtils, IShareUtils };
