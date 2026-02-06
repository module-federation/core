import helpers, { type IGlobalUtils, type IShareUtils } from './helpers';
import { loadScript } from '@module-federation/sdk';
import * as sdkExports from '@module-federation/sdk';
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
export { getRegisteredShare } from './utils/share';
const loadScriptNodeExportName = 'loadScriptNode';
const loadScriptNode = (sdkExports as unknown as Record<string, unknown>)[
  loadScriptNodeExportName
] as typeof loadScript | undefined;
export { loadScript, loadScriptNode };
export { Module } from './module';
export * as types from './type';
export { helpers };
export { satisfy } from './utils/semver';
export type { IGlobalUtils, IShareUtils };
