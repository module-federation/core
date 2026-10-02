import {
  AI_DEBUG_ENV_KEY,
  AI_DEBUG_SNAPSHOT_KEY,
  AI_DEBUG_STORAGE_KEY,
  isAllowedManifestUrl,
  type AIDebugRuntimePluginOptions,
  type AIDebugStoredConfig,
} from '../core';

import type { ProxyRule } from './types';

const createRuleId = (): string =>
  typeof crypto === 'object' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `mf-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

type FederationRemoteSource = {
  __FEDERATION__?: {
    moduleInfo?: Record<string, unknown>;
    __INSTANCES__?: Array<{
      options?: { remotes?: Array<{ name?: unknown; alias?: unknown }> };
    }>;
  };
  __VMOK__?: FederationRemoteSource['__FEDERATION__'];
};

export const readAvailableRemoteNames = (
  target: FederationRemoteSource = globalThis,
): string[] => {
  const federation = target.__FEDERATION__ ?? target.__VMOK__;
  const names = new Set<string>();

  for (const module of Object.values(federation?.moduleInfo ?? {})) {
    if (!isObject(module) || !isObject(module.remotesInfo)) {
      continue;
    }
    Object.keys(module.remotesInfo).forEach((name) => names.add(name));
  }

  for (const instance of federation?.__INSTANCES__ ?? []) {
    for (const remote of instance.options?.remotes ?? []) {
      if (typeof remote.name === 'string' && remote.name) {
        names.add(remote.name);
      }
      if (typeof remote.alias === 'string' && remote.alias) {
        names.add(remote.alias);
      }
    }
  }

  return [...names].sort((left, right) => left.localeCompare(right));
};

export const readProxyRules = (
  storage: Storage,
  storageKey = AI_DEBUG_STORAGE_KEY,
): ProxyRule[] => {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(storageKey) ?? '{}');
    if (!isObject(parsed)) {
      return [];
    }
    const source = isObject(parsed.overrides) ? parsed.overrides : parsed;
    return Object.entries(source)
      .filter((entry): entry is [string, string] =>
        Boolean(entry[0] && typeof entry[1] === 'string' && entry[1]),
      )
      .map(([name, manifestUrl]) => ({
        id: createRuleId(),
        name,
        manifestUrl,
        enabled: true,
      }));
  } catch {
    return [];
  }
};

export const validateProxyRules = (
  rules: ProxyRule[],
  allowedHosts: string[] = [],
): string | undefined => {
  const names = new Set<string>();
  for (const rule of rules) {
    if (!rule.enabled) {
      continue;
    }
    const name = rule.name.trim();
    if (!name) {
      return 'Remote name is required.';
    }
    if (names.has(name)) {
      return `Remote "${name}" is duplicated.`;
    }
    names.add(name);
    if (!isAllowedManifestUrl(rule.manifestUrl.trim(), allowedHosts)) {
      return `"${name}" must use an allowed HTTP(S) JSON manifest URL.`;
    }
  }
  return undefined;
};

export const writeProxyRules = (
  storage: Storage,
  rules: ProxyRule[],
  options: AIDebugRuntimePluginOptions = {},
): void => {
  const storageKey = options.storageKey ?? AI_DEBUG_STORAGE_KEY;
  let current: AIDebugStoredConfig = {};
  try {
    const parsed: unknown = JSON.parse(storage.getItem(storageKey) ?? '{}');
    if (isObject(parsed)) {
      current = parsed;
    }
  } catch {
    // Invalid previous values are replaced while unrelated valid settings stay.
  }

  const overrides = Object.fromEntries(
    rules
      .filter((rule) => rule.enabled)
      .map((rule) => [rule.name.trim(), rule.manifestUrl.trim()]),
  );
  const next = { ...current };
  if (Object.keys(overrides).length) {
    next.overrides = overrides;
  } else {
    delete next.overrides;
  }

  if (Object.keys(next).length) {
    storage.setItem(storageKey, JSON.stringify(next));
  } else {
    storage.removeItem(storageKey);
  }
  storage.removeItem(AI_DEBUG_SNAPSHOT_KEY);
  storage.setItem(AI_DEBUG_ENV_KEY, 'true');
};

export const createEmptyRule = (): ProxyRule => ({
  id: createRuleId(),
  name: '',
  manifestUrl: '',
  enabled: true,
});
