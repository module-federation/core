declare const __webpack_require__: unknown;
declare const __webpack_share_scopes__: unknown;
declare const __webpack_init_sharing__: unknown;

export function getWebpackRequire<T = unknown>(): T | undefined {
  if (typeof __webpack_require__ !== 'function') {
    return undefined;
  }

  return __webpack_require__ as T;
}

export function getWebpackRequireOrThrow<T = unknown>(): T {
  const webpackRequire = getWebpackRequire<T>();

  if (!webpackRequire) {
    throw new Error(
      'Unable to access __webpack_require__. Ensure this code runs inside a webpack-compatible runtime.',
    );
  }

  return webpackRequire;
}

export function getWebpackShareScopes<T = unknown>(): T | undefined {
  if (
    typeof __webpack_share_scopes__ !== 'object' ||
    !__webpack_share_scopes__
  ) {
    return undefined;
  }

  return __webpack_share_scopes__ as T;
}

export function getWebpackShareScopesOrThrow<T = unknown>(): T {
  const webpackShareScopes = getWebpackShareScopes<T>();

  if (!webpackShareScopes) {
    throw new Error(
      'Unable to access __webpack_share_scopes__. Ensure this code runs inside a webpack-compatible runtime.',
    );
  }

  return webpackShareScopes;
}

export function initWebpackSharing(shareScope = 'default'): Promise<void> {
  if (typeof __webpack_init_sharing__ !== 'function') {
    throw new Error(
      'Unable to access __webpack_init_sharing__. Ensure this code runs inside a webpack-compatible runtime.',
    );
  }

  return Promise.resolve(__webpack_init_sharing__(shareScope)) as Promise<void>;
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
