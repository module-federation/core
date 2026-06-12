import { parseEntry } from '@module-federation/sdk';

import type { ModuleFederationOptions } from './types';

type ModuleFederationPluginLikeOptions = {
  name?: unknown;
  remotes?: unknown;
  exposes?: unknown;
  shared?: unknown;
};

type ModuleFederationPluginLike = {
  constructor?: {
    name?: unknown;
  };
  _options?: ModuleFederationPluginLikeOptions;
  options?: ModuleFederationPluginLikeOptions;
};

const addRemoteNameFromString = (entry: string, target: Set<string>): void => {
  const normalized = entry.trim();
  if (!normalized) {
    return;
  }

  target.add(parseEntry(normalized, undefined, '@').name);
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

const getModuleFederationPluginOptions = (
  plugin: unknown,
): ModuleFederationPluginLikeOptions | undefined => {
  if (!plugin || typeof plugin !== 'object') {
    return undefined;
  }

  const mf = plugin as ModuleFederationPluginLike;
  const options = mf._options ?? mf.options;
  if (!options || typeof options !== 'object') {
    return undefined;
  }

  if (mf.constructor?.name === 'ModuleFederationPlugin') {
    return options;
  }

  // Duck-type fallback for wrapped or re-exported federation plugins whose
  // constructor name differs: MF options carry a container name plus at
  // least one federation-specific field.
  if (
    typeof options.name === 'string' &&
    ('remotes' in options || 'exposes' in options || 'shared' in options)
  ) {
    return options;
  }

  return undefined;
};

const addFallbackRemoteNamesFromPlugins = (
  plugins: unknown[] | undefined,
  target: Set<string>,
): void => {
  if (!plugins) {
    return;
  }

  for (const plugin of plugins) {
    const options = getModuleFederationPluginOptions(plugin);
    if (options) {
      addRemoteNames(options.remotes, target);
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
