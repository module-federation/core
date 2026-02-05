import type { WebpackRequire } from './types';

export function getUsedExports(
  webpackRequire: WebpackRequire,
  sharedName: string,
) {
  const usedExports = webpackRequire.federation.usedExports;
  if (!usedExports) {
    return;
  }

  return usedExports[sharedName];
}
