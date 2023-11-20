import { WebpackRequire } from './types';

export function initializeSharing(
  shareScopeName: string,
  webpackRequire: WebpackRequire,
): Promise<boolean> | boolean {
  return webpackRequire.federation.instance!.initializeSharing(shareScopeName);
}
