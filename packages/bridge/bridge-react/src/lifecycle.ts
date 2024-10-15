import { getInstance } from '@module-federation/runtime';
import helper from '@module-federation/runtime/helpers';

function registerBridgeLifeCycle() {
  const { registerPlugins, pluginHelper } = helper.global;
  const host = getInstance();
  const pluginSystem = new pluginHelper.PluginSystem({
    beforeBridgeRender: new pluginHelper.SyncHook<[Record<string, any>], any>(),
    afterBridgeRender: new pluginHelper.SyncHook<[Record<string, any>], any>(),
    beforeBridgeDestroy: new pluginHelper.SyncHook<
      [Record<string, any>],
      any
    >(),
    afterBridgeDestroy: new pluginHelper.SyncHook<[Record<string, any>], any>(),
  });

  if (host) {
    registerPlugins<typeof pluginSystem.lifecycle, typeof pluginSystem>(
      host?.options?.plugins,
      [pluginSystem],
    );
    return pluginSystem;
  }

  return null;
}

export { registerBridgeLifeCycle };
