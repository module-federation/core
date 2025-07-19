import type {
  ModuleFederation,
  ModuleFederationRuntimePlugin,
} from '@module-federation/runtime';
import {
  createLazyComponent,
  prefetch,
  collectSSRAssets,
  autoFetchDataPlugin,
} from '../lazy';
import type { CreateLazyComponentOptions, PrefetchOptions } from '../lazy';

declare module '@module-federation/runtime-core' {
  interface ModuleFederation {
    createLazyComponent<T, E extends keyof T>(
      options: Omit<CreateLazyComponentOptions<T, E>, 'instance'>,
    ): ReturnType<typeof createLazyComponent<T, E>>;
    prefetch(
      options: Omit<PrefetchOptions, 'instance'>,
    ): ReturnType<typeof prefetch>;
    collectSSRAssets(
      options: Omit<Parameters<typeof collectSSRAssets>[0], 'instance'>,
    ): ReturnType<typeof collectSSRAssets>;
  }
}

export function lazyLoadComponentPlugin(): ModuleFederationRuntimePlugin {
  return {
    name: 'lazy-load-component-plugin',
    apply(instance: ModuleFederation) {
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
