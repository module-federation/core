import helpersDefault, { type IGlobalUtils, type IShareUtils } from './helpers';

const helpers = helpersDefault;

export { ModuleFederation } from './core';
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
export type { UserOptions, ModuleFederationRuntimePlugin } from './type';
export { assert } from './utils/logger';
export { registerGlobalPlugins } from './global';
export {
  getRemoteEntry,
  getRemoteInfo,
  isStaticResourcesEqual,
  matchRemoteWithNameAndExpose,
  safeWrapper,
} from './utils';
export { getRegisteredShare } from './shared';
export { loadScript, loadScriptNode } from '@module-federation/sdk';
export { Module } from './module';
export * as types from './type';
export { helpers };
export { satisfy } from '@module-federation/sdk';
export type { IGlobalUtils, IShareUtils };
