import * as mfRuntime from '@module-federation/enhanced/runtime';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  ERROR_TYPE,
  createLazyComponent as rawCreateLazyComponent,
  collectSSRAssets as rawCollectSsrAssets,
} from '@module-federation/bridge-react';

import type {
  CollectSSRAssetsOptions,
  CreateLazyComponentOptions,
} from '@module-federation/bridge-react';

export { ERROR_TYPE };

type NewCreateLazyComponentOptions<T, E extends keyof T> = Omit<
  CreateLazyComponentOptions<T, E>,
  'runtime'
>;
type NewCreateLazyComponent = <T, E extends keyof T>(
  options: NewCreateLazyComponentOptions<T, E>,
) => ReturnType<typeof rawCreateLazyComponent<T, E>>;

export const createLazyComponent: NewCreateLazyComponent = (options) => {
  return rawCreateLazyComponent({ ...options, runtime: mfRuntime });
};

export const collectSSRAssets: (
  options: Omit<CollectSSRAssetsOptions, 'runtime'>,
) => ReturnType<typeof rawCollectSsrAssets> = (
  options: Omit<CollectSSRAssetsOptions, 'runtime'>,
) => {
  return rawCollectSsrAssets({ ...options, runtime: mfRuntime });
};

export function wrapNoSSR<T, E extends keyof T>(
  createLazyComponentFn: typeof createLazyComponent<T, E>,
): (
  options: Omit<NewCreateLazyComponentOptions<T, E>, 'noSSR'>,
) => ReturnType<typeof createLazyComponent<T, E>> {
  return (options: Omit<NewCreateLazyComponentOptions<T, E>, 'noSSR'>) => {
    return createLazyComponentFn({ ...options, noSSR: true });
  };
}

export type { DataFetchParams } from '@module-federation/bridge-react';
