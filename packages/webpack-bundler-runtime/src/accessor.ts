import type { WebpackRequire } from './types';
export { importWithBundlerIgnore } from '@module-federation/sdk';

type GlobalWithWebpackRequire = typeof globalThis & {
  __webpack_require__?: unknown;
};

export function getWebpackRequire(): WebpackRequire | undefined {
  const globalScope = globalThis as GlobalWithWebpackRequire;
  const webpackRequire = globalScope.__webpack_require__;

  if (typeof webpackRequire !== 'function') {
    return undefined;
  }

  return webpackRequire as WebpackRequire;
}

export function getWebpackRequireOrThrow(): WebpackRequire {
  const webpackRequire = getWebpackRequire();

  if (!webpackRequire) {
    throw new Error(
      'Unable to access __webpack_require__. Ensure this code runs inside a webpack-compatible runtime.',
    );
  }

  return webpackRequire;
}
