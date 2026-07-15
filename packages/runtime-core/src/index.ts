import helpersDefault, { type IGlobalUtils, type IShareUtils } from './helpers';
import { Module as RemoteModule } from './module';
import { UnavailableRemoteModule } from './remote/disabled';

declare const FEDERATION_OPTIMIZE_NO_REMOTE: boolean;

const helpers = helpersDefault;
const Module = (
  typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean' &&
  FEDERATION_OPTIMIZE_NO_REMOTE
    ? UnavailableRemoteModule
    : RemoteModule
) as typeof RemoteModule;

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
