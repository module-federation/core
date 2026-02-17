import type { WebpackRequire } from './types';

declare const __webpack_require__: unknown;

export function getWebpackRequire(): WebpackRequire | undefined {
  if (typeof __webpack_require__ !== 'function') {
    return undefined;
  }

  return __webpack_require__ as WebpackRequire;
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

export function importWithBundlerIgnore<T = unknown>(
  modulePath: string,
): Promise<T> {
  return import(
    /* webpackIgnore: true */
    /* @vite-ignore */
    modulePath
  ) as Promise<T>;
}
