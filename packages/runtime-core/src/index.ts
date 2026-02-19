import helpers, { type IGlobalUtils, type IShareUtils } from './helpers';
import { loadScript } from '@module-federation/sdk';
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

declare const require: undefined | ((specifier: string) => unknown);

type LoadScriptNode =
  typeof import('@module-federation/sdk/node').loadScriptNode;
type SdkNodeModule = {
  loadScriptNode?: LoadScriptNode;
  default?: LoadScriptNode | { loadScriptNode?: LoadScriptNode };
};

function loadSdkNodeModule(): SdkNodeModule | undefined {
  if (typeof require !== 'function') {
    return undefined;
  }

  // Use an indirect require to prevent browser bundles from inlining sdk/node.
  const runtimeRequire = new Function(
    'req',
    'specifier',
    'return req(specifier);',
  ) as (req: (specifier: string) => unknown, specifier: string) => unknown;

  return runtimeRequire(
    require,
    '@module-federation/sdk/node',
  ) as SdkNodeModule;
}

function resolveLoadScriptNode(): LoadScriptNode {
  const sdkNode = loadSdkNodeModule();
  if (sdkNode) {
    const candidate =
      sdkNode.loadScriptNode ||
      (typeof sdkNode.default === 'function'
        ? sdkNode.default
        : sdkNode.default?.loadScriptNode);
    if (typeof candidate === 'function') {
      return candidate;
    }
  }

  throw new Error(
    'loadScriptNode is unavailable in @module-federation/sdk/node',
  );
}

const loadScriptNode: LoadScriptNode = ((...args: Parameters<LoadScriptNode>) =>
  resolveLoadScriptNode()(...args)) as LoadScriptNode;

export { loadScript, loadScriptNode };
export { Module } from './module';
export * as types from './type';
export { helpers };
export { satisfy } from './utils/semver';
export type { IGlobalUtils, IShareUtils };
