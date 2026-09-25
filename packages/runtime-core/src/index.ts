import helpersDefault, { type IGlobalUtils, type IShareUtils } from './helpers';
import { Module } from './module';
import { FederationKernel } from './core';
import { shared } from './shared/capability';
import { remote } from './remote/capability';
import { snapshot } from './plugins/snapshot/capability';
import { universal } from './platform/universal';
import type { Capabilities, UserOptions } from './type';

const helpers = helpersDefault;
const fullCapabilities: Capabilities = {
  shared,
  remote,
  snapshot,
  platform: universal,
};

export class ModuleFederation extends FederationKernel {
  constructor(
    userOptions: UserOptions,
    capabilities: Capabilities = fullCapabilities,
  ) {
    super(userOptions, capabilities);
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
