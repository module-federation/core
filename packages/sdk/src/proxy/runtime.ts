import type { GlobalModuleInfo } from '../types';
import {
  FEDERATION_PROXY_OVERRIDE_PLUGIN_NAME,
  FEDERATION_PROXY_SNAPSHOT_GUARD,
  FEDERATION_PROXY_SNAPSHOT_PLUGIN_NAME,
} from './constants';
import { FederationProxyDataManager, definePropertyGlobalVal } from './storage';
import type {
  BootstrapFederationProxyOptions,
  FederationProxyGlobalState,
  FederationProxyRemoteInfo,
  FederationProxyRuntimeOptions,
  FederationRuntimePluginLike,
  RegisterFederationProxyRuntimeOptions,
} from './types';

const inBrowserRuntime = (inBrowser?: boolean) =>
  typeof inBrowser === 'boolean' ? inBrowser : true;

const resolveGlobalObject = (
  globalObject?: FederationProxyGlobalState,
): FederationProxyGlobalState => {
  if (globalObject) {
    return globalObject;
  }

  return globalThis as FederationProxyGlobalState;
};

const resolveManager = (options: FederationProxyRuntimeOptions = {}) => {
  const globalObject = resolveGlobalObject(options.globalObject);
  return new FederationProxyDataManager({
    storage: options.storage || globalObject.localStorage,
    storageKey: options.storageKey,
    moduleInfoKey: options.moduleInfoKey,
    browserEnvKey: options.browserEnvKey,
  });
};

const ensureModuleInfo = (currentValue: unknown): GlobalModuleInfo => {
  if (
    currentValue &&
    Object.prototype.toString.call(currentValue) === '[object Object]'
  ) {
    return currentValue as GlobalModuleInfo;
  }

  return {};
};

const isRemoteEntryOverride = (target: string) =>
  /^(https?:)?\/\//.test(target);

export const ensureFederationProxyRuntimeContext = (
  globalObject?: FederationProxyGlobalState,
) => {
  const target = resolveGlobalObject(
    globalObject,
  ) as FederationProxyGlobalState & {
    __FEDERATION__?: Record<string, unknown>;
    __VMOK__?: unknown;
  };

  if (!target.__FEDERATION__ && target.__VMOK__) {
    definePropertyGlobalVal(
      target as Record<string, any>,
      '__FEDERATION__',
      target.__VMOK__,
    );
  }

  if (!target.__FEDERATION__) {
    definePropertyGlobalVal(
      target as Record<string, any>,
      '__FEDERATION__',
      {},
    );
  }

  if (!target.__VMOK__) {
    definePropertyGlobalVal(
      target as Record<string, any>,
      '__VMOK__',
      target.__FEDERATION__,
    );
  }

  target.__FEDERATION__.__GLOBAL_PLUGIN__ ??= [];
  target.__FEDERATION__.moduleInfo = ensureModuleInfo(
    target.__FEDERATION__.moduleInfo,
  );

  return target.__FEDERATION__;
};

export const createFederationProxyOverridePlugin = (
  options: FederationProxyRuntimeOptions = {},
): FederationRuntimePluginLike => {
  return {
    name: FEDERATION_PROXY_OVERRIDE_PLUGIN_NAME,
    beforeRegisterRemote(args: {
      remote: FederationProxyRemoteInfo;
      origin?: unknown;
    }) {
      try {
        const { remote } = args;
        const overrides = resolveManager(options).getOverrides();
        const overrideTarget =
          overrides[remote.name] || overrides[remote.alias || ''];

        if (!overrideTarget) {
          return args;
        }

        if (isRemoteEntryOverride(overrideTarget)) {
          delete remote.version;
          remote.entry = overrideTarget;
        } else {
          delete remote.entry;
          remote.version = overrideTarget;
        }
      } catch (error) {
        console.error(error);
      }

      return args;
    },
  };
};

export const createFederationProxySnapshotPlugin = (
  options: FederationProxyRuntimeOptions = {},
): FederationRuntimePluginLike => {
  return {
    name: FEDERATION_PROXY_SNAPSHOT_PLUGIN_NAME,
    beforeLoadRemoteSnapshot({
      options: runtimeOptions,
    }: {
      options?: { inBrowser?: boolean };
    }) {
      if (!inBrowserRuntime(runtimeOptions?.inBrowser)) {
        return;
      }

      try {
        const globalObject = resolveGlobalObject(options.globalObject);
        const moduleInfo = resolveManager({
          ...options,
          globalObject,
        }).getModuleInfo();

        if (
          !moduleInfo ||
          (globalObject as Record<string, unknown>)[
            FEDERATION_PROXY_SNAPSHOT_GUARD
          ]
        ) {
          return;
        }

        const federation = ensureFederationProxyRuntimeContext(globalObject);
        federation.moduleInfo = {
          ...ensureModuleInfo(federation.moduleInfo),
          ...moduleInfo,
        };
        (globalObject as Record<string, unknown>)[
          FEDERATION_PROXY_SNAPSHOT_GUARD
        ] = true;
        console.warn(
          '[Module Federation Devtools]: You are using the proxy debug sdk to proxy online module',
        );
      } catch (error) {
        console.error(error);
      }
    },
  };
};

export const getFederationProxyRuntimePlugins = (
  options: RegisterFederationProxyRuntimeOptions = {},
): Array<FederationRuntimePluginLike> => {
  const includeOverridePlugin = options.includeOverridePlugin !== false;
  const includeSnapshotPlugin = options.includeSnapshotPlugin !== false;
  const runtimeOptions: FederationProxyRuntimeOptions = {
    storage: options.storage,
    storageKey: options.storageKey,
    moduleInfoKey: options.moduleInfoKey,
    browserEnvKey: options.browserEnvKey,
    globalObject: options.globalObject,
  };
  const plugins: Array<FederationRuntimePluginLike> = [];

  if (includeOverridePlugin) {
    plugins.push(createFederationProxyOverridePlugin(runtimeOptions));
  }

  if (includeSnapshotPlugin) {
    plugins.push(createFederationProxySnapshotPlugin(runtimeOptions));
  }

  return plugins;
};

export const registerFederationProxyRuntimePlugins = (
  options: RegisterFederationProxyRuntimeOptions = {},
): Array<FederationRuntimePluginLike> => {
  const federation = ensureFederationProxyRuntimeContext(options.globalObject);
  const plugins = getFederationProxyRuntimePlugins(options);
  const globalPlugins = federation.__GLOBAL_PLUGIN__ || [];

  plugins.forEach((plugin) => {
    if (
      globalPlugins.findIndex(
        (currentPlugin) => currentPlugin.name === plugin.name,
      ) === -1
    ) {
      globalPlugins.push(plugin);
    }
  });

  federation.__GLOBAL_PLUGIN__ = globalPlugins;
  return globalPlugins;
};

export const bootstrapFederationProxy = (
  options: BootstrapFederationProxyOptions = {},
) => {
  const manager = resolveManager(options);

  if (options.data) {
    manager.applyState(options.data);
  }

  const plugins = registerFederationProxyRuntimePlugins(options);

  return {
    manager,
    plugins,
    federation: ensureFederationProxyRuntimeContext(options.globalObject),
  };
};
