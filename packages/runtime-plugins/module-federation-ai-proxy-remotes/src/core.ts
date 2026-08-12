import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime-tools/runtime-core';

export const AI_DEBUG_URL_PARAM = '__mf_devtools';
export const AI_DEBUG_STORAGE_KEY = '__MF_DEVTOOLS__';
export const AI_DEBUG_SNAPSHOT_KEY = '__MF_DEVTOOLS_MODULE_INFO__';
export const AI_DEBUG_ENV_KEY = 'MF_ENV';
export const AI_DEBUG_CONSOLE_KEY = '__MF_AI_DEBUG_CONSOLE__';

const PLUGIN_NAME = 'ai-proxy-remotes-runtime-plugin';
const LOOPBACK_HOSTS = ['localhost', '127.0.0.1'];

export type AIDebugUrlConfig = {
  overrides: Record<string, string | null>;
  replace?: boolean;
};

export type AIDebugStoredConfig = {
  overrides?: Record<string, string>;
  [key: string]: unknown;
};

export type AIDebugRuntimePluginOptions = {
  /** Additional production hosts allowed as override targets. */
  allowedHosts?: string[];
  /** Defaults to `__mf_devtools`. */
  parameterName?: string;
  /** Defaults to `__MF_DEVTOOLS__`. */
  storageKey?: string;
  /** Set to false to disable a console enabled through the URL parameter. */
  console?: boolean | AIDebugConsoleOptions;
};

export type AIDebugConsoleOptions = {
  /** Open the proxy panel immediately after mounting. */
  defaultOpen?: boolean;
  /** Reload the host page after saving or clearing rules. Defaults to true. */
  reloadOnSave?: boolean;
  /** Override the floating console stacking order. */
  zIndex?: number;
};

type AIDebugGlobal = typeof globalThis & {
  location?: { href: string; reload?(): void };
  history?: { replaceState(data: unknown, unused: string, url?: string): void };
  sessionStorage?: Storage;
  window?: { sessionStorage?: Storage };
  __FEDERATION__?: {
    __GLOBAL_PLUGIN__?: ModuleFederationRuntimePlugin[];
  };
  __VMOK__?: AIDebugGlobal['__FEDERATION__'];
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const getGlobal = (): AIDebugGlobal => globalThis as AIDebugGlobal;

const getStorage = (target = getGlobal()): Storage | undefined =>
  target.sessionStorage ?? target.window?.sessionStorage;

const getGlobalPlugins = (): ModuleFederationRuntimePlugin[] => {
  const target = getGlobal();
  target.__FEDERATION__ ??= target.__VMOK__ ?? {};
  target.__VMOK__ ??= target.__FEDERATION__;
  target.__FEDERATION__.__GLOBAL_PLUGIN__ ??= [];
  return target.__FEDERATION__.__GLOBAL_PLUGIN__;
};

export const isAllowedManifestUrl = (
  value: string,
  allowedHosts: string[] = [],
): boolean => {
  try {
    const url = new URL(value);
    const hosts = new Set([...LOOPBACK_HOSTS, ...allowedHosts]);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      hosts.has(url.hostname) &&
      url.pathname.endsWith('.json') &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
};

export const parseAIDebugUrlConfig = (
  value: string,
  options: Pick<AIDebugRuntimePluginOptions, 'allowedHosts'> = {},
): AIDebugUrlConfig => {
  const parsed: unknown = JSON.parse(value);
  if (!isObject(parsed) || !isObject(parsed.overrides)) {
    throw new Error('The overrides field must be an object.');
  }
  if (parsed.replace !== undefined && typeof parsed.replace !== 'boolean') {
    throw new Error('The replace field must be a boolean.');
  }

  const overrides: Record<string, string | null> = {};
  for (const [name, manifestUrl] of Object.entries(parsed.overrides)) {
    if (!name.trim()) {
      throw new Error('A remote name cannot be empty.');
    }
    if (manifestUrl === null) {
      overrides[name] = null;
      continue;
    }
    if (
      typeof manifestUrl !== 'string' ||
      !isAllowedManifestUrl(manifestUrl, options.allowedHosts)
    ) {
      throw new Error(
        `The override for "${name}" must be a localhost or 127.0.0.1 JSON URL, or target an explicitly allowed host.`,
      );
    }
    overrides[name] = manifestUrl;
  }

  return {
    overrides,
    ...(parsed.replace === true ? { replace: true } : {}),
  };
};

const readStoredConfig = (
  storage: Storage,
  storageKey = AI_DEBUG_STORAGE_KEY,
): AIDebugStoredConfig => {
  try {
    const value = storage.getItem(storageKey);
    const parsed: unknown = value ? JSON.parse(value) : {};
    return isObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const mergeAIDebugConfig = (
  current: AIDebugStoredConfig,
  config: AIDebugUrlConfig,
): AIDebugStoredConfig => {
  const overrides: Record<string, string> = config.replace
    ? {}
    : { ...(current.overrides ?? {}) };

  for (const [name, manifestUrl] of Object.entries(config.overrides)) {
    if (manifestUrl === null) {
      delete overrides[name];
    } else {
      overrides[name] = manifestUrl;
    }
  }

  const next = { ...current };
  if (Object.keys(overrides).length) {
    next.overrides = overrides;
  } else {
    delete next.overrides;
  }
  return next;
};

export const applyAIDebugUrlConfig = (
  options: AIDebugRuntimePluginOptions = {},
): boolean => {
  const target = getGlobal();
  const storage = getStorage(target);
  if (!target.location || !storage) {
    return false;
  }

  const parameterName = options.parameterName ?? AI_DEBUG_URL_PARAM;
  const storageKey = options.storageKey ?? AI_DEBUG_STORAGE_KEY;
  const url = new URL(target.location.href);
  if (!url.searchParams.has(parameterName)) {
    return false;
  }

  storage.setItem(AI_DEBUG_CONSOLE_KEY, 'true');
  const value = url.searchParams.get(parameterName);
  if (!value) {
    if (target.history) {
      url.searchParams.delete(parameterName);
      target.history.replaceState(null, '', url.href);
      target.location.reload?.();
    }
    return false;
  }

  try {
    const config = parseAIDebugUrlConfig(value, options);
    const next = mergeAIDebugConfig(
      readStoredConfig(storage, storageKey),
      config,
    );

    if (Object.keys(next).length) {
      storage.setItem(storageKey, JSON.stringify(next));
    } else {
      storage.removeItem(storageKey);
    }
    storage.removeItem(AI_DEBUG_SNAPSHOT_KEY);
    storage.setItem(AI_DEBUG_ENV_KEY, 'true');
    if (target.history) {
      url.searchParams.delete(parameterName);
      target.history.replaceState(null, '', url.href);
      target.location.reload?.();
    }
    return true;
  } catch (error) {
    target.console?.error(
      '[Module Federation AI Debug] Invalid URL proxy config.',
      error,
    );
    return false;
  }
};

export const isAIDebugConsoleEnabled = (
  options: AIDebugRuntimePluginOptions = {},
): boolean =>
  options.console !== false &&
  getStorage()?.getItem(AI_DEBUG_CONSOLE_KEY) === 'true';

const isAIDebugEnabled = (): boolean =>
  getStorage()?.getItem(AI_DEBUG_CONSOLE_KEY) === 'true';

const readOverrides = (storageKey: string): Record<string, string> => {
  const storage = getStorage();
  if (!storage) {
    return {};
  }
  const config = readStoredConfig(storage, storageKey);
  const source = isObject(config.overrides) ? config.overrides : config;
  return Object.fromEntries(
    Object.entries(source).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === 'string' && Boolean(entry[1]),
    ),
  );
};

type AIDebugRemote = {
  name: string;
  alias?: string;
  entry?: string;
  version?: string;
};

const applyRemoteOverride = (
  remote: AIDebugRemote,
  storageKey: string,
): void => {
  if (!isAIDebugEnabled()) {
    return;
  }
  const overrides = readOverrides(storageKey);
  const override = overrides[remote.name] ?? overrides[remote.alias ?? ''];
  if (!override) {
    return;
  }

  if (/^(https?:)?\/\//.test(override)) {
    Reflect.deleteProperty(remote, 'version');
    remote.entry = override;
  } else {
    Reflect.deleteProperty(remote, 'entry');
    remote.version = override;
  }
};

const createGlobalPlugin = (
  options: AIDebugRuntimePluginOptions = {},
): ModuleFederationRuntimePlugin => {
  const storageKey = options.storageKey ?? AI_DEBUG_STORAGE_KEY;

  return {
    name: PLUGIN_NAME,
    beforeRegisterRemote(args) {
      applyRemoteOverride(args.remote, storageKey);
      return args;
    },
    beforeLoadRemoteSnapshot(args) {
      if (args.options.inBrowser === false) {
        return;
      }
      applyRemoteOverride(args.moduleInfo, storageKey);
    },
  };
};

export function aiDebugRuntimePlugin(
  options: AIDebugRuntimePluginOptions = {},
): ModuleFederationRuntimePlugin {
  applyAIDebugUrlConfig(options);
  const plugins = getGlobalPlugins();
  const existing = plugins.find((plugin) => plugin.name === PLUGIN_NAME);
  if (existing) {
    return existing;
  }
  const plugin = createGlobalPlugin(options);
  plugins.push(plugin);
  return plugin;
}
