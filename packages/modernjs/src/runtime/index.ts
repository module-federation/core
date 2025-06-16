import * as mfRuntime from '@module-federation/enhanced/runtime';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { kit as rawKit, ERROR_TYPE } from '@module-federation/react/pure';

import type {
  CollectSSRAssetsOptions,
  CreateRemoteComponentOptions,
} from '@module-federation/react/pure';

export * from '@module-federation/enhanced/runtime';

export { ERROR_TYPE };

type NewCreateRemoteComponentOptions<T, E extends keyof T> = Omit<
  CreateRemoteComponentOptions<T, E>,
  'runtime'
>;
type NewCreateRemoteComponent = <T, E extends keyof T>(
  options: NewCreateRemoteComponentOptions<T, E>,
) => ReturnType<
  typeof import('@module-federation/react/pure').kit.createRemoteSSRComponent<
    T,
    E
  >
>;

export const kit = {
  get createRemoteSSRComponent(): NewCreateRemoteComponent {
    const { createRemoteSSRComponent } = rawKit;
    return (options) =>
      createRemoteSSRComponent({ ...options, runtime: mfRuntime });
  },
  get createRemoteComponent(): NewCreateRemoteComponent {
    const { createRemoteComponent } = rawKit;
    return (options) =>
      createRemoteComponent({ ...options, runtime: mfRuntime });
  },
  get collectSSRAssets(): (
    options: Omit<CollectSSRAssetsOptions, 'runtime'>,
  ) => ReturnType<
    typeof import('@module-federation/react/pure').kit.collectSSRAssets
  > {
    const { collectSSRAssets } = rawKit;
    return (options) => collectSSRAssets({ ...options, runtime: mfRuntime });
  },
  get wrapNoSSR(): <T, E extends keyof T>(
    createComponentFn: NewCreateRemoteComponent,
  ) => (
    options: Omit<NewCreateRemoteComponentOptions<T, E>, 'noSSR'>,
  ) => ReturnType<NewCreateRemoteComponent> {
    return (createComponentFn) => {
      return (options) => createComponentFn({ ...options, noSSR: true });
    };
  },
  get injectDataFetch(): typeof import('@module-federation/react/pure').kit.injectDataFetch {
    return require('@module-federation/react/pure').kit.injectDataFetch;
  },
};

export type { DataFetchParams } from '@module-federation/react/pure';
