import type { GlobalModuleInfo } from '../types';

export interface FederationProxyStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type FederationProxyOverrides = Record<string, string>;

export interface FederationProxyRuntimeConfig {
  overrides?: FederationProxyOverrides;
  enableFastRefresh?: boolean;
  eagerShare?: Array<string> | [string, string];
  [key: string]: unknown;
}

export interface FederationProxyData {
  moduleInfo?: GlobalModuleInfo;
  overrides?: FederationProxyOverrides;
  runtimeConfig?: FederationProxyRuntimeConfig;
  browserEnv?: boolean;
}

export interface FederationProxyManagerOptions {
  storage?: FederationProxyStorageLike;
  storageKey?: string;
  moduleInfoKey?: string;
  browserEnvKey?: string;
}

export interface FederationProxyRemoteInfo {
  name: string;
  alias?: string;
  entry?: string;
  version?: string;
}

export interface FederationRuntimePluginLike {
  name: string;
  version?: string;
  beforeRegisterRemote?: (args: {
    remote: FederationProxyRemoteInfo;
    origin?: unknown;
  }) => { remote: FederationProxyRemoteInfo; origin?: unknown } | void;
  beforeLoadRemoteSnapshot?: (args: {
    options?: {
      inBrowser?: boolean;
    };
  }) => void | Promise<void>;
}

export interface FederationProxyGlobalState {
  __FEDERATION__?: {
    __GLOBAL_PLUGIN__?: Array<FederationRuntimePluginLike>;
    moduleInfo?: GlobalModuleInfo;
    [key: string]: unknown;
  };
  __VMOK__?: unknown;
  localStorage?: FederationProxyStorageLike;
  [key: string]: unknown;
}

export interface FederationProxyRuntimeOptions extends FederationProxyManagerOptions {
  globalObject?: FederationProxyGlobalState;
}

export interface RegisterFederationProxyRuntimeOptions extends FederationProxyRuntimeOptions {
  includeOverridePlugin?: boolean;
  includeSnapshotPlugin?: boolean;
}

export interface BootstrapFederationProxyOptions extends RegisterFederationProxyRuntimeOptions {
  data?: FederationProxyData;
}
