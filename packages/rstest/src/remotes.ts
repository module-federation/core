import { parseEntry } from '@module-federation/sdk';
import { PLUGIN_NAME } from '@module-federation/enhanced/rspack';

import type { ModuleFederationOptions } from './types';

type ModuleFederationPluginLike = {
  name?: unknown;
  _options: ModuleFederationOptions;
};

const addRemoteNameFromString = (entry: string, target: Set<string>): void => {
  const normalized = entry.trim();
  if (!normalized) {
    return;
  }

  target.add(parseEntry(normalized, undefined, '@').name);
};

const addRemoteNames = (remotes: unknown, target: Set<string>): void => {
  if (!remotes) {
    return;
  }

  if (typeof remotes === 'string') {
    addRemoteNameFromString(remotes, target);
    return;
  }

  if (Array.isArray(remotes)) {
    for (const remote of remotes) {
      addRemoteNames(remote, target);
    }
    return;
  }

  if (typeof remotes === 'object') {
    for (const key of Object.keys(remotes as Record<string, unknown>)) {
      target.add(key);
    }
  }
};

/**
 * Reads MF options off an already-registered plugin instance so users of the
 * rstest adapters (whose rsbuild config registers ModuleFederationPlugin via
 * `@module-federation/rsbuild-plugin`) do not have to redeclare remotes.
 *
 * `_options` is a private field of Rspack's ModuleFederationPlugin (no public
 * accessor exists). Access is restricted by the plugin's stable public name.
 * Both packages live in this monorepo, so a private-field rename must update
 * this adapter in the same change.
 */
const getModuleFederationPlugin = (
  plugin: unknown,
): ModuleFederationPluginLike | undefined => {
  if (!plugin || typeof plugin !== 'object') {
    return undefined;
  }

  const federationPlugin = plugin as ModuleFederationPluginLike;
  if (
    federationPlugin.name !== PLUGIN_NAME ||
    !federationPlugin._options ||
    typeof federationPlugin._options !== 'object'
  ) {
    return undefined;
  }

  return federationPlugin;
};

export const applyDefaultsToFederationPlugins = (
  plugins: unknown[] | undefined,
  getDefaults: (options: ModuleFederationOptions) => ModuleFederationOptions,
): void => {
  if (!plugins) {
    return;
  }

  for (const plugin of plugins) {
    const federationPlugin = getModuleFederationPlugin(plugin);
    if (!federationPlugin) {
      continue;
    }

    federationPlugin._options = getDefaults(federationPlugin._options);
  }
};

const addFallbackRemoteNamesFromPlugins = (
  plugins: unknown[] | undefined,
  target: Set<string>,
): void => {
  if (!plugins) {
    return;
  }

  for (const plugin of plugins) {
    const federationPlugin = getModuleFederationPlugin(plugin);
    if (federationPlugin) {
      addRemoteNames(federationPlugin._options.remotes, target);
    }
  }
};

export const collectRemoteNames = (
  remotes: ModuleFederationOptions['remotes'] | undefined,
  fallbackPlugins?: unknown[],
): Set<string> => {
  const remoteNames = new Set<string>();
  addRemoteNames(remotes, remoteNames);

  if (!remoteNames.size) {
    addFallbackRemoteNamesFromPlugins(fallbackPlugins, remoteNames);
  }

  return remoteNames;
};
