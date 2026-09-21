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
export type {
  UserOptions,
  ModuleFederationRuntimePlugin,
  RuntimePluginHooks,
} from './type';
export { assert, error } from './utils/logger';
export { registerGlobalPlugins } from './global';
export {
  assertRuntimeImageCompatible,
  attachRuntimeImage,
  readRuntimeImage,
  type RuntimeImageDescriptorV1,
} from './runtimeImage';
export {
  getRemoteInfo,
  isStaticResourcesEqual,
  matchRemoteWithNameAndExpose,
  safeWrapper,
} from './utils';
export { getRemoteEntry } from '#mf/remote-entry';
export { getRegisteredShare } from '#mf/share-utils';
export { loadScript, loadScriptNode } from '@module-federation/sdk';
export { Module } from '#mf/remote-module';
export * as types from './type';
export { helpers };
export { satisfy } from '../src/utils/semver';
export type { IGlobalUtils, IShareUtils };
