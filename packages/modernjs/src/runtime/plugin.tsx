import type { RuntimePluginFuture } from '@modern-js/runtime';
import { getInstance } from '@module-federation/enhanced/runtime';
import { lazyLoadComponentPlugin } from '@module-federation/bridge-react';

export const mfPlugin = (): RuntimePluginFuture => {
  return {
    name: '@modern-js/plugin-mf',
    setup: (api) => {
      api.wrapRoot((App) => {
        getInstance()?.registerPlugins([lazyLoadComponentPlugin()]);
        return App;
      });
    },
  };
};
