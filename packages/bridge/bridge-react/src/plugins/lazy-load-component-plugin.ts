import type {
  FederationHost,
  FederationRuntimePlugin,
} from '@module-federation/runtime';
import {
  createLazyComponent,
  prefetch,
  collectSSRAssets,
  autoFetchDataPlugin,
} from '../lazy';
import type { CreateLazyComponentOptions, PrefetchOptions } from '../lazy';

declare module '@module-federation/runtime' {
  interface FederationHost {
    createLazyComponent<T, E extends keyof T>(
      options: Omit<CreateLazyComponentOptions<T, E>, 'instance'>,
    ): ReturnType<typeof createLazyComponent<T, E>>;
    prefetch(
      options: Omit<PrefetchOptions, 'instance'>,
    ): ReturnType<typeof prefetch>;
    // wrapNoSSR<T, E extends keyof T>(
    //   createLazyComponentFn: typeof createLazyComponent<T, E>,
    // ): (
    //   options: Omit<CreateLazyComponentOptions<T, E>, 'instance' | 'noSSR'>,
    // ) => ReturnType<typeof createLazyComponent<T, E>>;
    collectSSRAssets(
      options: Omit<Parameters<typeof collectSSRAssets>[0], 'instance'>,
    ): ReturnType<typeof collectSSRAssets>;
  }
}

export function lazyLoadComponentPlugin(): FederationRuntimePlugin {
  return {
    name: 'lazy-load-component-plugin',
    apply(instance: FederationHost) {
      instance.registerPlugins([autoFetchDataPlugin()]);

      instance.createLazyComponent = (options) => {
        return createLazyComponent({
          instance,
          ...options,
        });
      };

      instance.prefetch = (options) => {
        return prefetch({
          instance,
          ...options,
        });
      };

      instance.wrapNoSSR = (fn) => {
        return (options) => {
          return fn({
            instance,
            noSSR: true,
            ...options,
          });
        };
      };

      instance.collectSSRAssets = (options) => {
        return collectSSRAssets({
          instance,
          ...options,
        });
      };
    },
  };
}

export default lazyLoadComponentPlugin;
