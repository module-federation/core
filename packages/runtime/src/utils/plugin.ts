import { FederationHost } from '../core';
import { UserOptions } from '../type';
import { Module } from '../module';
import { getGlobalHostPlugins } from '../global';

export function registerPlugins(
  plugins: UserOptions['plugins'],
  hookInstances: Array<
    | FederationHost['hooks']
    | FederationHost['snapshotHandler']['hooks']
    | Module['host']['loaderHook']
  >,
) {
  const globalPlugins = getGlobalHostPlugins();
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
        hookInstance.applyPlugin(plugin);
      });
    });
  }
}
