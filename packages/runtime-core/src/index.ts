import helpers, { type IGlobalUtils, type IShareUtils } from './helpers';
export { FederationHost } from './core';
export {
  type Federation,
  type Global,
  getGlobalFederationInstance,
  getGlobalFederationConstructor,
  setGlobalFederationInstance,
  setGlobalFederationConstructor,
  resetFederationGlobalInfo,
  addGlobalSnapshot,
  getGlobalSnapshot,
} from './global';

export type { UserOptions, FederationRuntimePlugin } from './type';
export { assert } from './utils/logger';
export { registerGlobalPlugins } from './global';
export { getRemoteEntry, getRemoteInfo } from './utils';
export { loadScript, loadScriptNode } from '@module-federation/sdk';
export { Module } from './module';
export * as types from './type';
export { safeWrapper, matchRemoteWithNameAndExpose } from './utils';
export { helpers };
export type { IGlobalUtils, IShareUtils };
