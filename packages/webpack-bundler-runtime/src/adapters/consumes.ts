import { consumes as consumesFn } from '../consumes';
import { getSharedFallbackGetter } from '../getSharedFallbackGetter';
import { createTreeShakingSharePlugin } from '../treeShakingSharePlugin';
import type { WebpackRequire } from '../types';

export const consumes = {
  bundlerRuntime: { consumes: consumesFn, getSharedFallbackGetter },
  beforeInit(webpackRequire: WebpackRequire, initOptions: any) {
    initOptions.plugins ||= [];
    initOptions.plugins.push(createTreeShakingSharePlugin(webpackRequire));
  },
};
