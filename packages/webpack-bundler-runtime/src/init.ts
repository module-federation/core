import type { WebpackRequire } from './types';
import { createTreeShakingSharePlugin } from '#mf/tree-shaking-share-plugin';

export function init({ webpackRequire }: { webpackRequire: WebpackRequire }) {
  const { initOptions, runtime } = webpackRequire.federation;

  if (!initOptions) {
    throw new Error('initOptions is required!');
  }

  const treeShakingSharePlugin = createTreeShakingSharePlugin({
    webpackRequire,
  });
  if (treeShakingSharePlugin) {
    initOptions.plugins ||= [];
    initOptions.plugins.push(treeShakingSharePlugin);
  }
  return runtime!.init(initOptions);
}
