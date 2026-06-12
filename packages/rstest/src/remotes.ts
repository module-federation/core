import { parseEntry } from '@module-federation/sdk';

import type { ModuleFederationOptions } from './types';

type ModuleFederationPluginLike = {
  constructor?: {
    name?: unknown;
  };
  _options?: {
    remotes?: unknown;
  };
  options?: {
    remotes?: unknown;
  };
};

const addRemoteNameFromString = (entry: string, target: Set<string>): void => {
  const normalized = entry.trim();
  if (!normalized) {
    return;
  }

  try {
    target.add(parseEntry(normalized, undefined, '@').name);
  } catch {
    const atIndex = normalized.indexOf('@');
    target.add(atIndex > 0 ? normalized.slice(0, atIndex) : normalized);
  }
};

const addRemoteNameFromObject = (
  remote: Record<string, unknown>,
  target: Set<string>,
): void => {
  const maybeName = remote.name;
  const maybeAlias = remote.alias;

  if (typeof maybeName === 'string') {
    target.add(maybeName);
    return;
  }

  if (typeof maybeAlias === 'string') {
    target.add(maybeAlias);
    return;
  }

  for (const key of Object.keys(remote)) {
    target.add(key);
  }
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
      if (!remote) {
        continue;
      }

      if (typeof remote === 'string') {
        addRemoteNameFromString(remote, target);
        continue;
      }

      if (Array.isArray(remote)) {
        const [name] = remote;
        if (typeof name === 'string') {
          target.add(name);
        }
        continue;
      }

      if (typeof remote === 'object') {
        addRemoteNameFromObject(remote as Record<string, unknown>, target);
      }
    }
    return;
  }

  if (typeof remotes === 'object') {
    for (const key of Object.keys(remotes as Record<string, unknown>)) {
      target.add(key);
    }
  }
};

const isModuleFederationPluginLike = (
  plugin: unknown,
): plugin is ModuleFederationPluginLike => {
  return (
    !!plugin &&
    typeof plugin === 'object' &&
    (plugin as ModuleFederationPluginLike).constructor?.name ===
      'ModuleFederationPlugin'
  );
};

const addFallbackRemoteNamesFromPlugins = (
  plugins: unknown[] | undefined,
  target: Set<string>,
): void => {
  if (!plugins) {
    return;
  }

  for (const plugin of plugins) {
    if (!isModuleFederationPluginLike(plugin)) {
      continue;
    }

    const options = plugin._options ?? plugin.options;
    addRemoteNames(options?.remotes, target);
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
