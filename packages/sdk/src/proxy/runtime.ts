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

const lockProxySecurityConfig = (runtimeOptions: unknown): void => {
  if (!runtimeOptions || typeof runtimeOptions !== 'object') {
    return;
  }

  const security = (runtimeOptions as any).security;
  if (!security || typeof security !== 'object') {
    return;
  }

  const allowedProxyOrigins = (security as any).allowedProxyOrigins;
  if (
    Array.isArray(allowedProxyOrigins) &&
    !Object.isFrozen(allowedProxyOrigins)
  ) {
    Object.freeze(allowedProxyOrigins);
  }

  if (!Object.isFrozen(security)) {
    Object.freeze(security);
  }

  // Prevent runtime tampering by re-assigning `options.security = { ... }`
  try {
    Object.defineProperty(runtimeOptions as any, 'security', {
      value: security,
      enumerable: true,
      configurable: false,
      writable: false,
    });
  } catch {
    // ignore errors for readonly / non-configurable options objects
  }
};

const getAllowedProxyOrigins = (
  runtimeOptions: unknown,
): string[] | undefined => {
  lockProxySecurityConfig(runtimeOptions);

  if (!runtimeOptions || typeof runtimeOptions !== 'object') {
    return;
  }

  const security = (runtimeOptions as any).security;
  if (!security || typeof security !== 'object') {
    return;
  }

  const allowedProxyOrigins = (security as any).allowedProxyOrigins;
  if (!Array.isArray(allowedProxyOrigins)) {
    return;
  }

  return allowedProxyOrigins
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const getCurrentLocation = (): { origin: string; hostname: string } => {
  const locationLike = (globalThis as any)?.location;

  return {
    origin: typeof locationLike?.origin === 'string' ? locationLike.origin : '',
    hostname:
      typeof locationLike?.hostname === 'string' ? locationLike.hostname : '',
  };
};

const parseProxyTargetUrl = (target: string): URL | null => {
  try {
    const { origin } = getCurrentLocation();
    // If current runtime doesn't have `location`, we still want a stable base
    // so protocol-relative URLs (`//example.com/xx`) can be parsed.
    const base = origin || 'http://localhost';
    return new URL(target, base);
  } catch {
    return null;
  }
};

const isAllowedProxyTarget = (
  target: string,
  allowedProxyOrigins?: string[],
): boolean => {
  // If the target isn't a full URL (e.g. relative path, version tag), we allow it.
  if (!isRemoteEntryOverride(target)) {
    return true;
  }

  const targetUrl = parseProxyTargetUrl(target);
  if (!targetUrl) {
    // If we cannot parse the URL, we don't block to avoid breaking existing flows.
    return true;
  }

  const { hostname: currentHostname } = getCurrentLocation();

  // Always allow localhost / loopback
  if (
    targetUrl.hostname === 'localhost' ||
    targetUrl.hostname === '127.0.0.1'
  ) {
    return true;
  }

  // Always allow same hostname as current page
  if (currentHostname && targetUrl.hostname === currentHostname) {
    return true;
  }

  const whitelist = (allowedProxyOrigins || []).filter(Boolean);

  // Explicit wildcard allow
  if (whitelist.includes('*')) {
    return true;
  }

  // No whitelist configured -> block third-party origins
  if (!whitelist.length) {
    return false;
  }

  // Check exact match: allow either by full origin or by hostname
  return whitelist.some((item) => {
    if (item === targetUrl.origin || item === targetUrl.hostname) {
      return true;
    }

    // If user provides something like `https://example.com`, compare by origin
    if (item.includes('://')) {
      try {
        return new URL(item).origin === targetUrl.origin;
      } catch {
        return false;
      }
    }

    // Otherwise treat it as hostname
    return item === targetUrl.hostname;
  });
};

const warnBlockedProxyTarget = (params: {
  target: string;
  from: 'override' | 'snapshot';
  remoteName?: string;
}) => {
  const remoteDesc = params.remoteName
    ? ` for remote "${params.remoteName}"`
    : '';
  console.warn(
    `[Module Federation Devtools][Proxy Security] Blocked proxy ${params.from} target "${params.target}"${remoteDesc}. ` +
      `To allow it, set security: { allowedProxyOrigins: [...] } when initializing ModuleFederation runtime (use ['*'] to allow all).`,
  );
};

const collectRemoteEntryTargetsFromModuleInfo = (
  moduleInfo: GlobalModuleInfo,
): string[] => {
  return Object.values(moduleInfo)
    .map((item) =>
      item && typeof item === 'object' ? (item as any).remoteEntry : undefined,
    )
    .filter(
      (remoteEntry): remoteEntry is string =>
        typeof remoteEntry === 'string' && isRemoteEntryOverride(remoteEntry),
    );
};

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

        const allowedProxyOrigins = getAllowedProxyOrigins(
          (args.origin as any)?.options || args.origin,
        );
        if (
          isRemoteEntryOverride(overrideTarget) &&
          !isAllowedProxyTarget(overrideTarget, allowedProxyOrigins)
        ) {
          warnBlockedProxyTarget({
            target: overrideTarget,
            from: 'override',
            remoteName: remote.name,
          });
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

        const allowedProxyOrigins = getAllowedProxyOrigins(runtimeOptions);
        const remoteEntryTargets =
          collectRemoteEntryTargetsFromModuleInfo(moduleInfo);
        const blockedTargets = remoteEntryTargets.filter(
          (target) => !isAllowedProxyTarget(target, allowedProxyOrigins),
        );

        if (blockedTargets.length) {
          blockedTargets.forEach((target) => {
            warnBlockedProxyTarget({
              target,
              from: 'snapshot',
            });
          });
          (globalObject as Record<string, unknown>)[
            FEDERATION_PROXY_SNAPSHOT_GUARD
          ] = true;
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
          '[Module Federation Devtools] You are using the proxy debug sdk to proxy online module',
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
