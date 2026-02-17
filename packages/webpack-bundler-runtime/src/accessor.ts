import type { WebpackRequire } from './types';

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

export function importWithBundlerIgnore<T = unknown>(
  modulePath: string,
): Promise<T> {
  return import(
    /* webpackIgnore: true */
    /* @vite-ignore */
    modulePath
  ) as Promise<T>;
}
