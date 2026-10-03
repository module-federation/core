import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';
import type { WebpackRequire } from '../../types';

export interface TreeShakingSharePluginOptions {
  webpackRequire: WebpackRequire;
}

export type TreeShakingSharePluginFactory = (
  options: TreeShakingSharePluginOptions,
) => ModuleFederationRuntimePlugin | undefined;
