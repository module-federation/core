import { ModuleFederation } from '../core';
import { UserOptions } from '../type';
import { getGlobalHostPlugins } from '../global';

export function registerPlugins(
  plugins: UserOptions['plugins'],
  instance: ModuleFederation,
) {
  const globalPlugins = getGlobalHostPlugins();
  const hookInstances = [
    instance.hooks,
    instance.remoteHandler.hooks,
    instance.sharedHandler.hooks,
    instance.snapshotHandler.hooks,
    instance.loaderHook,
    instance.bridgeHook,
  ];
  // Incorporate global plugins
  if (globalPlugins.length > 0) {
    globalPlugins.forEach((plugin) => {
      if (plugins?.find((item) => item.name !== plugin.name)) {
        plugins.push(plugin);
      }
    });
  }

  if (plugins && plugins.length > 0) {
    plugins.forEach((plugin) => {
      hookInstances.forEach((hookInstance) => {
        hookInstance.applyPlugin(plugin, instance);
      });
    });
  }
  return plugins;
}
