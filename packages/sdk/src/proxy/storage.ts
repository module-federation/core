import type { GlobalModuleInfo } from '../types';
import {
  FEDERATION_PROXY_BROWSER_ENV_KEY,
  FEDERATION_PROXY_EAGER_SHARE_FIELD,
  FEDERATION_PROXY_ENABLE_FAST_REFRESH_FIELD,
  FEDERATION_PROXY_MODULE_INFO_KEY,
  FEDERATION_PROXY_OVERRIDES_FIELD,
  FEDERATION_PROXY_STORAGE_KEY,
} from './constants';
import type {
  FederationProxyData,
  FederationProxyManagerOptions,
  FederationProxyOverrides,
  FederationProxyRuntimeConfig,
  FederationProxyStorageLike,
} from './types';

const DEFAULT_BROWSER_ENV_VALUE = 'true';
const RESERVED_RUNTIME_FIELDS = new Set<string>([
  FEDERATION_PROXY_OVERRIDES_FIELD,
  FEDERATION_PROXY_ENABLE_FAST_REFRESH_FIELD,
  FEDERATION_PROXY_EAGER_SHARE_FIELD,
]);

export const setLocalStorage = (key: string, value?: unknown) => {
  localStorage.setItem(key, String(value));
};

export const getLocalStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('[MF Proxy SDK] getLocalStorage failed', error);
    return null;
  }
};

export const removeLocalStorage = (key: string) => {
  const data = localStorage.getItem(key);
  if (data) {
    localStorage.removeItem(key);
  }
};

export const mergeLocalStorage = (
  target: string,
  key: string,
  value: unknown,
) => {
  const str = localStorage.getItem(target);
  const obj = JSON.parse(str || '{}');
  obj[key] = value;
  localStorage.setItem(target, JSON.stringify(obj));
};

export const removeLocalStorageKey = (target: string, key: string) => {
  const str = localStorage.getItem(target);
  if (str) {
    const obj = JSON.parse(str || '{}');
    delete obj[key];
    localStorage.setItem(target, JSON.stringify(obj));
  }
};

export const definePropertyGlobalVal = (
  target: Record<string, any>,
  key: string,
  val: unknown,
) => {
  if (Object.prototype.hasOwnProperty.call(target, key)) {
    target[key] = val;
    return;
  }

  Object.defineProperty(target, key, {
    value: val,
    configurable: false,
    writable: true,
  });
};

const isObject = (target: unknown): target is Record<string, unknown> =>
  Object.prototype.toString.call(target) === '[object Object]';

const getDefaultStorage = (): FederationProxyStorageLike => {
  if (typeof localStorage === 'undefined') {
    throw new Error(
      '[Module Federation Proxy SDK]: localStorage is not available in the current environment.',
    );
  }

  return localStorage;
};

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    const parsedValue = JSON.parse(value) as unknown;
    return parsedValue as T;
  } catch (error) {
    console.warn('[Module Federation Proxy SDK] parse storage failed', error);
    return fallback;
  }
};

const sanitizeOverrides = (
  overrides: Record<string, unknown>,
): FederationProxyOverrides => {
  return Object.entries(overrides).reduce<FederationProxyOverrides>(
    (memo, [remoteName, value]) => {
      if (typeof value === 'string' && value) {
        memo[remoteName] = value;
      }
      return memo;
    },
    {},
  );
};

const stripLegacyOverrides = (
  config: FederationProxyRuntimeConfig,
): FederationProxyRuntimeConfig => {
  return Object.entries(config).reduce<FederationProxyRuntimeConfig>(
    (memo, [key, value]) => {
      if (RESERVED_RUNTIME_FIELDS.has(key)) {
        memo[key] = value;
        return memo;
      }

      if (typeof value !== 'string') {
        memo[key] = value;
      }

      return memo;
    },
    {},
  );
};

const resolveOverrides = (
  config: FederationProxyRuntimeConfig,
): FederationProxyOverrides => {
  const nestedOverrides = config[FEDERATION_PROXY_OVERRIDES_FIELD];
  if (isObject(nestedOverrides)) {
    return sanitizeOverrides(nestedOverrides);
  }

  return sanitizeOverrides(config);
};

const isEmptyObject = (value: Record<string, unknown>) =>
  !Object.keys(value).length;

export class FederationProxyDataManager {
  private readonly storage: FederationProxyStorageLike;

  private readonly storageKey: string;

  private readonly moduleInfoKey: string;

  private readonly browserEnvKey: string;

  constructor(options: FederationProxyManagerOptions = {}) {
    this.storage = options.storage || getDefaultStorage();
    this.storageKey = options.storageKey || FEDERATION_PROXY_STORAGE_KEY;
    this.moduleInfoKey =
      options.moduleInfoKey || FEDERATION_PROXY_MODULE_INFO_KEY;
    this.browserEnvKey =
      options.browserEnvKey || FEDERATION_PROXY_BROWSER_ENV_KEY;
  }

  getRuntimeConfig(): FederationProxyRuntimeConfig {
    const config = parseJson<FederationProxyRuntimeConfig>(
      this.storage.getItem(this.storageKey),
      {},
    );

    return isObject(config) ? config : {};
  }

  setRuntimeConfig(
    config: FederationProxyRuntimeConfig,
  ): FederationProxyRuntimeConfig {
    const normalizedConfig = isObject(config)
      ? JSON.parse(JSON.stringify(config))
      : {};

    this.storage.setItem(this.storageKey, JSON.stringify(normalizedConfig));
    return normalizedConfig;
  }

  patchRuntimeConfig(
    patch: Partial<FederationProxyRuntimeConfig>,
  ): FederationProxyRuntimeConfig {
    const nextConfig = {
      ...this.getRuntimeConfig(),
      ...patch,
    };

    return this.setRuntimeConfig(nextConfig);
  }

  getOverrides(): FederationProxyOverrides {
    return resolveOverrides(this.getRuntimeConfig());
  }

  setOverrides(overrides: FederationProxyOverrides): FederationProxyOverrides {
    const nextOverrides = sanitizeOverrides(overrides);
    const currentConfig = stripLegacyOverrides(this.getRuntimeConfig());

    this.setRuntimeConfig({
      ...currentConfig,
      [FEDERATION_PROXY_OVERRIDES_FIELD]: nextOverrides,
    });

    return nextOverrides;
  }

  mergeOverrides(
    overrides: FederationProxyOverrides,
  ): FederationProxyOverrides {
    const nextOverrides = {
      ...this.getOverrides(),
      ...sanitizeOverrides(overrides),
    };

    this.setOverrides(nextOverrides);
    return nextOverrides;
  }

  clearOverrides(): void {
    const currentConfig = stripLegacyOverrides(this.getRuntimeConfig());
    delete currentConfig[FEDERATION_PROXY_OVERRIDES_FIELD];

    if (isEmptyObject(currentConfig)) {
      this.storage.removeItem(this.storageKey);
      return;
    }

    this.setRuntimeConfig(currentConfig);
  }

  getModuleInfo(): GlobalModuleInfo | null {
    return parseJson<GlobalModuleInfo | null>(
      this.storage.getItem(this.moduleInfoKey),
      null,
    );
  }

  setModuleInfo(moduleInfo: GlobalModuleInfo): GlobalModuleInfo {
    this.storage.setItem(this.moduleInfoKey, JSON.stringify(moduleInfo || {}));
    return moduleInfo;
  }

  clearModuleInfo(): void {
    this.storage.removeItem(this.moduleInfoKey);
  }

  setBrowserEnv(enabled = true): boolean {
    if (enabled) {
      this.storage.setItem(this.browserEnvKey, DEFAULT_BROWSER_ENV_VALUE);
      return true;
    }

    this.storage.removeItem(this.browserEnvKey);
    return false;
  }

  getBrowserEnv(): boolean {
    return this.storage.getItem(this.browserEnvKey) !== null;
  }

  getState(): FederationProxyData {
    const runtimeConfig = this.getRuntimeConfig();
    const moduleInfo = this.getModuleInfo() || undefined;
    const overrides = this.getOverrides();

    return {
      runtimeConfig: isEmptyObject(runtimeConfig) ? undefined : runtimeConfig,
      moduleInfo,
      overrides: isEmptyObject(overrides) ? undefined : overrides,
      browserEnv: this.getBrowserEnv(),
    };
  }

  applyState(data: FederationProxyData): FederationProxyData {
    const { runtimeConfig, overrides, moduleInfo, browserEnv } = data;

    if (runtimeConfig) {
      this.setRuntimeConfig(runtimeConfig);
    }

    if (overrides) {
      this.setOverrides(overrides);
    }

    if (moduleInfo) {
      this.setModuleInfo(moduleInfo);
    }

    if (typeof browserEnv === 'boolean') {
      this.setBrowserEnv(browserEnv);
    }

    return this.getState();
  }

  reset(): void {
    this.storage.removeItem(this.storageKey);
    this.storage.removeItem(this.moduleInfoKey);
    this.storage.removeItem(this.browserEnvKey);
  }
}

export const createFederationProxyDataManager = (
  options?: FederationProxyManagerOptions,
) => new FederationProxyDataManager(options);
