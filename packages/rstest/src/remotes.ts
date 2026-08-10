import { parseEntry } from '@module-federation/sdk';

import type { ModuleFederationOptions } from './types';

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

export const collectRemoteNames = (
  remotes: ModuleFederationOptions['remotes'],
): Set<string> => {
  const remoteNames = new Set<string>();
  addRemoteNames(remotes, remoteNames);
  return remoteNames;
};
