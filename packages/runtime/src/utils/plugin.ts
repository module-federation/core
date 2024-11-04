import { FederationHost } from '../core';
import { UserOptions } from '../type';
import { Module } from '../module';
import { getGlobalHostPlugins } from '../global';
import { PluginSystem } from './hooks';

export function registerPlugins<
  Y extends Record<string, any>,
  T extends PluginSystem<Y>,
>(
  plugins: UserOptions['plugins'],
  hookInstances: Array<
    | T
    | FederationHost['hooks']
    | FederationHost['snapshotHandler']['hooks']
    | FederationHost['sharedHandler']['hooks']
    | FederationHost['remoteHandler']['hooks']
    | Module['host']['loaderHook']
    | Module['host']['bridgeHook']
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
  return plugins;
}
