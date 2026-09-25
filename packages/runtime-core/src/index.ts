import helpersDefault, { type IGlobalUtils, type IShareUtils } from './helpers';
import { Module } from './module';
import { FederationCore } from './core';

export { FederationKernel } from './core';
import { shared } from './shared';
import { remote } from './remote';
import { snapshot } from './plugins/snapshot';
import { universal } from './platform/universal';
import type { ResolvedCapabilities, UserOptions } from './type';

const helpers = helpersDefault;
const fullCapabilities: ResolvedCapabilities = {
  shared,
  remote,
  snapshot,
  platform: universal,
};

export class ModuleFederation extends FederationCore {
  constructor(userOptions: UserOptions) {
    super(userOptions, fullCapabilities);
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
  getGlobalSnapshotInfoByModuleInfo,
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
