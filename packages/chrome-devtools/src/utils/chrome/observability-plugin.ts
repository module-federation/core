import {
  ChromeObservabilityPlugin,
  type ObservabilityPluginOptions,
} from '@module-federation/observability-plugin/chrome-devtool';

import {
  OBSERVABILITY_DEVTOOLS_SOURCE,
  OBSERVABILITY_DEVTOOLS_STORAGE_KEY,
} from './messages';
import {
  createObservabilityPluginOptions,
  normalizeObservabilityDevtoolsConfig,
} from './observability-shared';

const DEVTOOLS_PLUGIN_NAME = 'observability-plugin:chrome-extension';
const LEGACY_DEVTOOLS_PLUGIN_NAME = 'observability-plugin-devtools';

type FederationGlobal = {
  __GLOBAL_PLUGIN__?: Array<{ name?: string }>;
} & Record<string, unknown>;

type FederationWindow = Window & {
  __FEDERATION__?: FederationGlobal;
  __VMOK__?: FederationGlobal;
};

const getFederationWindow = () => window as unknown as FederationWindow;

const safeReadStoredConfig = () => {
  try {
    const raw = window.localStorage?.getItem(
      OBSERVABILITY_DEVTOOLS_STORAGE_KEY,
    );
    if (!raw) {
      return undefined;
    }
    return normalizeObservabilityDevtoolsConfig(JSON.parse(raw));
  } catch {
    return undefined;
  }
};

const defineWritableGlobal = (
  key: '__FEDERATION__' | '__VMOK__',
  value: any,
) => {
  const targetWindow = getFederationWindow();
  try {
    Object.defineProperty(targetWindow, key, {
      value,
      configurable: true,
      writable: true,
    });
  } catch {
    targetWindow[key] = value;
  }
};

const ensureFederationGlobal = () => {
  const targetWindow = getFederationWindow();
  const federation = targetWindow.__FEDERATION__ || targetWindow.__VMOK__ || {};

  if (!targetWindow.__FEDERATION__) {
    defineWritableGlobal('__FEDERATION__', federation);
  }
  if (!targetWindow.__VMOK__) {
    defineWritableGlobal('__VMOK__', targetWindow.__FEDERATION__);
  }

  if (!targetWindow.__FEDERATION__?.__GLOBAL_PLUGIN__) {
    targetWindow.__FEDERATION__ = targetWindow.__FEDERATION__ || federation;
    targetWindow.__FEDERATION__.__GLOBAL_PLUGIN__ = [];
  }

  return targetWindow.__FEDERATION__;
};

const notifyInstalled = (
  status: 'installed' | 'skipped',
  reason?: string,
  config?: ReturnType<typeof normalizeObservabilityDevtoolsConfig>,
) => {
  try {
    window.postMessage(
      {
        schemaVersion: 1,
        source: OBSERVABILITY_DEVTOOLS_SOURCE,
        kind: status,
        reason,
        config,
        createdAt: Date.now(),
      },
      '*',
    );
  } catch {
    // Devtools status delivery is best effort only.
  }
};

const install = () => {
  const config = safeReadStoredConfig();
  if (!config?.enabled) {
    return;
  }

  const federation = ensureFederationGlobal();
  const globalPlugins = federation?.__GLOBAL_PLUGIN__ || [];
  if (
    globalPlugins.some(
      (plugin) =>
        plugin?.name === DEVTOOLS_PLUGIN_NAME ||
        plugin?.name === LEGACY_DEVTOOLS_PLUGIN_NAME,
    )
  ) {
    notifyInstalled('skipped', 'already-installed', config);
    return;
  }

  const plugin = ChromeObservabilityPlugin(
    createObservabilityPluginOptions(config) as ObservabilityPluginOptions,
  );
  globalPlugins.push(plugin);
  federation.__GLOBAL_PLUGIN__ = globalPlugins;
  notifyInstalled('installed', undefined, config);
};

install();
