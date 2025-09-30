import type { WebpackRequire } from './types';

export function getUsedExports(
  webpackRequire: WebpackRequire,
  sharedName: string,
): string[] {
  const usedExports = webpackRequire.federation.usedExports;
  if (!usedExports) {
    return [];
  }

  const runtimeId = webpackRequire.j;
  if (!runtimeId) {
    return [];
  }

  return usedExports[sharedName]?.[runtimeId] || [];
}
