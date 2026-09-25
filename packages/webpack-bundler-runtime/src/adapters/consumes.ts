import { consumes as loadConsumes } from '../consumes';
import { getSharedFallbackGetter } from '../getSharedFallbackGetter';
import { createTreeShakingSharePlugin } from '../treeShakingSharePlugin';
import type { Adapter } from '../types';

export const consumes: Adapter = {
  bundlerRuntime: { consumes: loadConsumes, getSharedFallbackGetter },
  beforeInit(webpackRequire, initOptions) {
    initOptions.plugins ||= [];
    initOptions.plugins.push(createTreeShakingSharePlugin(webpackRequire));
  },
};
