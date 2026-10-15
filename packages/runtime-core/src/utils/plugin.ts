import { ModuleFederation } from '../core';
import {
  ModuleFederationRuntimePlugin,
  RuntimePluginHooks,
  UserOptions,
} from '../type';
import { getGlobalHostPlugins } from '../global';
import { assert } from './logger';
import { isPlainObject } from './tool';

function getPluginsToRegister(
  plugins: UserOptions['plugins'],
): Array<ModuleFederationRuntimePlugin> {
  const pluginsByName = new Map<string, ModuleFederationRuntimePlugin>();

  [...(plugins || []), ...getGlobalHostPlugins()].forEach((plugin) => {
    if (!plugin) {
      return;
    }

    assert(isPlainObject(plugin), 'Plugin configuration is invalid.');
    assert(plugin.name, 'A name must be provided by the plugin.');

    if (!pluginsByName.has(plugin.name)) {
      pluginsByName.set(plugin.name, plugin);
    }
  });

  return Array.from(pluginsByName.values());
}

function getInstancePlugin(
  plugin: ModuleFederationRuntimePlugin,
  instanceHooks: void | RuntimePluginHooks,
): ModuleFederationRuntimePlugin {
  if (instanceHooks === undefined) {
    return plugin;
  }

  return {
    ...instanceHooks,
    name: plugin.name,
    version: plugin.version,
  };
}

export function registerPlugins(
  plugins: UserOptions['plugins'],
  instance: ModuleFederation,
) {
  const registeredPlugins = new Map<string, ModuleFederationRuntimePlugin>();
  instance.options.plugins.forEach((plugin) => {
    if (plugin) {
      registeredPlugins.set(plugin.name, plugin);
    }
  });
  const hookInstances = [
    instance.hooks,
    instance.remoteHandler.hooks,
    instance.sharedHandler.hooks,
    instance.snapshotHandler.hooks,
    instance.loaderHook,
    instance.bridgeHook,
  ];

  getPluginsToRegister(plugins).forEach((plugin) => {
    registeredPlugins.set(plugin.name, plugin);

    if (instance.hooks.registerPlugins[plugin.name]) {
      return;
    }

    const instancePlugin = getInstancePlugin(plugin, plugin.apply?.(instance));
    hookInstances.forEach((hookInstance) => {
      hookInstance.applyPlugin(instancePlugin);
    });
  });

  return Array.from(registeredPlugins.values());
}
