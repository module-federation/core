import { rs } from '@rstest/core';

import { LYNX_BUNDLE_REGISTRY, type LynxWebpackRequire } from './runtimePlugin';

export const remoteRegistry = () =>
  new Map([
    ['remote', 'lynx-cache://catalog'],
    ['remote:remote-origin', 'https://cdn.example/remotes/catalog.lynx.bundle'],
  ]);

export const createWebpackRequire = (
  filename = 'chunks/feature.js?cache=1#fragment',
): LynxWebpackRequire => ({
  f: {},
  m: {},
  u: rs.fn(() => filename),
});

export const createGlobalObject = (
  loadLazyBundle: (request: string) => PromiseLike<unknown>,
) => ({
  lynx: { loadLazyBundle, loadScript: rs.fn() },
  [LYNX_BUNDLE_REGISTRY]: remoteRegistry(),
});

export const makeSynchronousThenable = <T>(value: T): PromiseLike<T> => {
  const thenable = {
    then(onFulfilled?: ((resolved: T) => unknown) | null) {
      if (!onFulfilled) {
        return makeSynchronousThenable(value);
      }
      try {
        return makeSynchronousThenable(onFulfilled(value));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
  return thenable as PromiseLike<T>;
};
