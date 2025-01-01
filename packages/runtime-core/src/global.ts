import { FederationHost } from './core';
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
import { getBuilderId } from './utils/env';
import { warn } from './utils/logger';
import { FederationRuntimePlugin } from './type/plugin';

export interface Federation {
  __GLOBAL_PLUGIN__: Array<FederationRuntimePlugin>;
  __DEBUG_CONSTRUCTOR_VERSION__?: string;
  moduleInfo: GlobalModuleInfo;
  __DEBUG_CONSTRUCTOR__?: typeof FederationHost;
  __INSTANCES__: Array<FederationHost>;
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

function definePropertyGlobalVal(
  target: typeof CurrentGlobal,
  key: string,
  val: any,
) {
  Object.defineProperty(target, key, {
    value: val,
    configurable: false,
    writable: true,
  });
}

function includeOwnProperty(target: typeof CurrentGlobal, key: string) {
  return Object.hasOwnProperty.call(target, key);
}

// This section is to prevent encapsulation by certain microfrontend frameworks. Due to reuse policies, sandbox escapes.
// The sandbox in the microfrontend does not replicate the value of 'configurable'.
// If there is no loading content on the global object, this section defines the loading object.
if (!includeOwnProperty(CurrentGlobal, '__GLOBAL_LOADING_REMOTE_ENTRY__')) {
  definePropertyGlobalVal(CurrentGlobal, '__GLOBAL_LOADING_REMOTE_ENTRY__', {});
}

export const globalLoading = CurrentGlobal.__GLOBAL_LOADING_REMOTE_ENTRY__;

function setGlobalDefaultVal(target: typeof CurrentGlobal) {
  if (
    includeOwnProperty(target, '__VMOK__') &&
    !includeOwnProperty(target, '__FEDERATION__')
  ) {
    definePropertyGlobalVal(target, '__FEDERATION__', target.__VMOK__);
  }

  if (!includeOwnProperty(target, '__FEDERATION__')) {
    definePropertyGlobalVal(target, '__FEDERATION__', {
      __GLOBAL_PLUGIN__: [],
      __INSTANCES__: [],
      moduleInfo: {},
      __SHARE__: {},
      __MANIFEST_LOADING__: {},
      __PRELOADED_MAP__: new Map(),
    });

    definePropertyGlobalVal(target, '__VMOK__', target.__FEDERATION__);
  }

  target.__FEDERATION__.__GLOBAL_PLUGIN__ ??= [];
  target.__FEDERATION__.__INSTANCES__ ??= [];
  target.__FEDERATION__.moduleInfo ??= {};
  target.__FEDERATION__.__SHARE__ ??= {};
  target.__FEDERATION__.__MANIFEST_LOADING__ ??= {};
  target.__FEDERATION__.__PRELOADED_MAP__ ??= new Map();
}

setGlobalDefaultVal(CurrentGlobal);
setGlobalDefaultVal(nativeGlobal);

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
  FederationInstance: FederationHost,
): void {
  CurrentGlobal.__FEDERATION__.__INSTANCES__.push(FederationInstance);
}

export function getGlobalFederationConstructor():
  | typeof FederationHost
  | undefined {
  return CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__;
}

export function setGlobalFederationConstructor(
  FederationConstructor: typeof FederationHost | undefined,
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
  if (typeof key === 'string') {
    const keyRes = target[key];
    if (keyRes) {
      return {
        value: target[key],
        key: key as string,
      };
    } else {
      const targetKeys = Object.keys(target);
      for (const targetKey of targetKeys) {
        const [targetTypeOrName, _] = targetKey.split(':');
        const nKey = `${targetTypeOrName}:${key}` as unknown as keyof T;
        const typeWithKeyRes = target[nKey];
        if (typeWithKeyRes) {
          return {
            value: typeWithKeyRes,
            key: nKey as string,
          };
        }
      }
      return {
        value: undefined,
        key: key as string,
      };
    }
  } else {
    throw new Error('key must be string');
  }
}

export const getGlobalSnapshot = (): GlobalModuleInfo =>
  nativeGlobal.__FEDERATION__.moduleInfo;

export const getTargetSnapshotInfoByModuleInfo = (
  moduleInfo: Optional<Remote, 'alias'>,
  snapshot: GlobalModuleInfo,
): GlobalModuleInfo[string] | undefined => {
  // Check if the remote is included in the hostSnapshot
  const moduleKey = getFMId(moduleInfo);
  const getModuleInfo = getInfoWithoutType(snapshot, moduleKey).value;

  // The remoteSnapshot might not include a version
  if (
    getModuleInfo &&
    !getModuleInfo.version &&
    'version' in moduleInfo &&
    moduleInfo['version']
  ) {
    getModuleInfo.version = moduleInfo['version'];
  }

  if (getModuleInfo) {
    return getModuleInfo;
  }

  // If the remote is not included in the hostSnapshot, deploy a micro app snapshot
  if ('version' in moduleInfo && moduleInfo['version']) {
    const { version, ...resModuleInfo } = moduleInfo;
    const moduleKeyWithoutVersion = getFMId(resModuleInfo);
    const getModuleInfoWithoutVersion = getInfoWithoutType(
      nativeGlobal.__FEDERATION__.moduleInfo,
      moduleKeyWithoutVersion,
    ).value;

    if (getModuleInfoWithoutVersion?.version === version) {
      return getModuleInfoWithoutVersion;
    }
  }

  return;
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
  plugins: Array<FederationRuntimePlugin>,
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

export const getGlobalHostPlugins = (): Array<FederationRuntimePlugin> =>
  nativeGlobal.__FEDERATION__.__GLOBAL_PLUGIN__;

export const getPreloaded = (id: string) =>
  CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.get(id);

export const setPreloaded = (id: string) =>
  CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.set(id, true);
