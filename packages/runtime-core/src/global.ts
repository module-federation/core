import { ModuleFederation } from './core';
import {
  RemoteEntryExports,
  GlobalShareScopeMap,
  Remote,
  Optional,
} from './type';
import { getFMId } from './utils/tool';
import {
  GlobalModuleInfo,
  ModuleInfo,
  isDebugMode,
} from '@module-federation/sdk';
import { warn } from './utils/logger';
import { ModuleFederationRuntimePlugin } from './type/plugin';

export interface Federation {
  __GLOBAL_PLUGIN__: Array<ModuleFederationRuntimePlugin>;
  __DEBUG_CONSTRUCTOR_VERSION__?: string;
  moduleInfo: GlobalModuleInfo;
  __DEBUG_CONSTRUCTOR__?: typeof ModuleFederation;
  __INSTANCES__: Array<ModuleFederation>;
  __SHARE__: GlobalShareScopeMap;
  __MANIFEST_LOADING__: Record<string, Promise<ModuleInfo>>;
  __PRELOADED_MAP__: Map<string, boolean>;
}
export const CurrentGlobal =
  typeof globalThis === 'object' ? globalThis : window;
export const nativeGlobal: typeof global = (() => {
  try {
    // get real window (incase of sandbox)
    return document.defaultView;
  } catch {
    // node env
    return CurrentGlobal;
  }
})() as typeof global;

export const Global = nativeGlobal;

declare global {
  // eslint-disable-next-line no-var
  var __FEDERATION__: Federation,
    __VMOK__: Federation,
    // eslint-disable-next-line no-var
    __GLOBAL_LOADING_REMOTE_ENTRY__: Record<
      string,
      undefined | Promise<RemoteEntryExports | void>
    >;
}

// This section is to prevent encapsulation by certain microfrontend frameworks. Due to reuse policies, sandbox escapes.
// The sandbox in the microfrontend does not replicate the value of 'configurable'.
function initGlobalFederation(target: typeof CurrentGlobal) {
  const has = (k: string) => Object.hasOwnProperty.call(target, k);
  const def = (k: string, v: any) =>
    Object.defineProperty(target, k, {
      value: v,
      configurable: false,
      writable: true,
    });
  if (!has('__GLOBAL_LOADING_REMOTE_ENTRY__'))
    def('__GLOBAL_LOADING_REMOTE_ENTRY__', {});
  if (has('__VMOK__') && !has('__FEDERATION__'))
    def('__FEDERATION__', target.__VMOK__);
  if (!has('__FEDERATION__')) {
    def('__FEDERATION__', {
      __GLOBAL_PLUGIN__: [],
      __INSTANCES__: [],
      moduleInfo: {},
      __SHARE__: {},
      __MANIFEST_LOADING__: {},
      __PRELOADED_MAP__: new Map(),
    });
    def('__VMOK__', target.__FEDERATION__);
  }
  const f = target.__FEDERATION__;
  f.__GLOBAL_PLUGIN__ ??= [];
  f.__INSTANCES__ ??= [];
  f.moduleInfo ??= {};
  f.__SHARE__ ??= {};
  f.__MANIFEST_LOADING__ ??= {};
  f.__PRELOADED_MAP__ ??= new Map();
}

[CurrentGlobal, nativeGlobal].forEach(initGlobalFederation);

export const globalLoading = CurrentGlobal.__GLOBAL_LOADING_REMOTE_ENTRY__;

export function resetFederationGlobalInfo(): void {
  CurrentGlobal.__FEDERATION__.__GLOBAL_PLUGIN__ = [];
  CurrentGlobal.__FEDERATION__.__INSTANCES__ = [];
  CurrentGlobal.__FEDERATION__.moduleInfo = {};
  CurrentGlobal.__FEDERATION__.__SHARE__ = {};
  CurrentGlobal.__FEDERATION__.__MANIFEST_LOADING__ = {};

  Object.keys(globalLoading).forEach((key) => {
    delete globalLoading[key];
  });
}

export function setGlobalFederationInstance(
  FederationInstance: ModuleFederation,
): void {
  CurrentGlobal.__FEDERATION__.__INSTANCES__.push(FederationInstance);
}

export function getGlobalFederationConstructor():
  | typeof ModuleFederation
  | undefined {
  return CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__;
}

export function setGlobalFederationConstructor(
  FederationConstructor: typeof ModuleFederation | undefined,
  isDebug = isDebugMode(),
): void {
  if (isDebug) {
    CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = FederationConstructor;
    CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR_VERSION__ = __VERSION__;
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function getInfoWithoutType<T extends object>(
  target: T,
  key: keyof T,
): { value: T[keyof T] | undefined; key: string } {
  if (typeof key !== 'string') throw new Error('key must be string');
  if (target[key]) return { value: target[key], key: key as string };
  for (const tk of Object.keys(target)) {
    const nKey = `${tk.split(':')[0]}:${key}` as unknown as keyof T;
    if (target[nKey]) return { value: target[nKey], key: nKey as string };
  }
  return { value: undefined, key: key as string };
}

export const getGlobalSnapshot = (): GlobalModuleInfo =>
  nativeGlobal.__FEDERATION__.moduleInfo;

export const getTargetSnapshotInfoByModuleInfo = (
  moduleInfo: Optional<Remote, 'alias'>,
  snapshot: GlobalModuleInfo,
): GlobalModuleInfo[string] | undefined => {
  const moduleKey = getFMId(moduleInfo);
  const found = getInfoWithoutType(snapshot, moduleKey).value;

  if (found) {
    if (!found.version && 'version' in moduleInfo && moduleInfo['version']) {
      found.version = moduleInfo['version'];
    }
    return found;
  }

  // Fallback: try without version in the key
  if ('version' in moduleInfo && moduleInfo['version']) {
    const { version, ...resModuleInfo } = moduleInfo;
    const fallback = getInfoWithoutType(
      nativeGlobal.__FEDERATION__.moduleInfo,
      getFMId(resModuleInfo),
    ).value;
    if (fallback?.version === version) {
      return fallback;
    }
  }
  return undefined;
};

export const getGlobalSnapshotInfoByModuleInfo = (
  moduleInfo: Optional<Remote, 'alias'>,
): GlobalModuleInfo[string] | undefined =>
  getTargetSnapshotInfoByModuleInfo(
    moduleInfo,
    nativeGlobal.__FEDERATION__.moduleInfo,
  );

export const setGlobalSnapshotInfoByModuleInfo = (
  remoteInfo: Remote,
  moduleDetailInfo: GlobalModuleInfo[string],
): GlobalModuleInfo => {
  const moduleKey = getFMId(remoteInfo);
  nativeGlobal.__FEDERATION__.moduleInfo[moduleKey] = moduleDetailInfo;
  return nativeGlobal.__FEDERATION__.moduleInfo;
};

export const addGlobalSnapshot = (
  moduleInfos: GlobalModuleInfo,
): (() => void) => {
  nativeGlobal.__FEDERATION__.moduleInfo = {
    ...nativeGlobal.__FEDERATION__.moduleInfo,
    ...moduleInfos,
  };
  return () => {
    const keys = Object.keys(moduleInfos);
    for (const key of keys) {
      delete nativeGlobal.__FEDERATION__.moduleInfo[key];
    }
  };
};

export const getRemoteEntryExports = (
  name: string,
  globalName: string | undefined,
): {
  remoteEntryKey: string;
  entryExports: RemoteEntryExports | undefined;
} => {
  const remoteEntryKey = globalName || `__FEDERATION_${name}:custom__`;
  const entryExports = (CurrentGlobal as any)[remoteEntryKey];
  return {
    remoteEntryKey,
    entryExports,
  };
};

// This function is used to register global plugins.
// It iterates over the provided plugins and checks if they are already registered.
// If a plugin is not registered, it is added to the global plugins.
// If a plugin is already registered, a warning message is logged.
export const registerGlobalPlugins = (
  plugins: Array<ModuleFederationRuntimePlugin>,
): void => {
  const { __GLOBAL_PLUGIN__ } = nativeGlobal.__FEDERATION__;

  plugins.forEach((plugin) => {
    if (__GLOBAL_PLUGIN__.findIndex((p) => p.name === plugin.name) === -1) {
      __GLOBAL_PLUGIN__.push(plugin);
    } else {
      warn(`The plugin ${plugin.name} has been registered.`);
    }
  });
};

export const getGlobalHostPlugins = (): Array<ModuleFederationRuntimePlugin> =>
  nativeGlobal.__FEDERATION__.__GLOBAL_PLUGIN__;

export const getPreloaded = (id: string) =>
  CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.get(id);

export const setPreloaded = (id: string) =>
  CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.set(id, true);
