import { createTreeShakingSharePlugin as createEnabledPlugin } from './enabled';
import type { TreeShakingSharePluginFactory } from './types';

declare const FEDERATION_OPTIMIZE_NO_SHARED: boolean;

const useShared =
  typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_SHARED
    : true;

export const createTreeShakingSharePlugin: TreeShakingSharePluginFactory = (
  options,
) => (useShared ? createEnabledPlugin(options) : undefined);
