import { getInstance } from '@module-federation/runtime';
import helper from '@module-federation/runtime/helpers';

const registerPlugin = helper.global.registerPlugins;
const pluginHelper = helper.global.pluginHelper;
const host = getInstance()!;
const pluginSystem = new pluginHelper.PluginSystem({
  beforeBridgeRender: new pluginHelper.SyncHook<[Record<string, any>], void>(),
  beforeBridgeDestroy: new pluginHelper.SyncHook<[Record<string, any>], void>(),
});

registerPlugin<typeof pluginSystem.lifecycle, typeof pluginSystem>(
  host?.options?.plugins,
  [pluginSystem],
);

export default pluginSystem;
export type BridgeRuntimePlugin = typeof pluginSystem;
