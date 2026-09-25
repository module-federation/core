import type { WebpackRequire } from './types';
import { createTreeShakingSharePlugin } from './treeShakingSharePlugin';

declare const FEDERATION_OPTIMIZE_NO_SHARED: boolean;

const USE_SHARED =
  typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_SHARED
    : true;

export function init({ webpackRequire }: { webpackRequire: WebpackRequire }) {
  const { initOptions, runtime } = webpackRequire.federation;

  if (!initOptions) {
    throw new Error('initOptions is required!');
  }

  if (USE_SHARED) {
    initOptions.plugins ||= [];
    initOptions.plugins.push(createTreeShakingSharePlugin(webpackRequire));
  }
  return runtime!.init(initOptions);
}
