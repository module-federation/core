import { getInstance } from '@module-federation/runtime';
import helper from '@module-federation/runtime/helpers';

const registerPlugin = helper.global.registerPlugins;
const pluginHelper = helper.global.pluginHelper;
const host = getInstance()!;
const pluginSystem = new pluginHelper.PluginSystem({
  beforeBridgeRender: new pluginHelper.AsyncWaterfallHook('beforeBridgeRender'),
  afterBridgeRender: new pluginHelper.AsyncWaterfallHook('afterBridgeRender'),
  beforeBridgeDestroy: new pluginHelper.AsyncWaterfallHook(
    'beforeBridgeDestroy',
  ),
  afterBridgeDestroy: new pluginHelper.AsyncWaterfallHook('afterBridgeDestroy'),
});

registerPlugin<typeof pluginSystem.lifecycle, typeof pluginSystem>(
  host.options.plugins,
  [pluginSystem],
);

export default pluginSystem;
