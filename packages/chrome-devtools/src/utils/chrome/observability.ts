import { injectScript } from './index';
import { OBSERVABILITY_DEVTOOLS_STORAGE_KEY } from './messages';
import {
  CHROME_OBSERVABILITY_SCOPE,
  DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG,
  normalizeObservabilityDevtoolsConfig,
  type ObservabilityDevtoolsConfig,
} from './observability-shared';

export interface ObservabilityDevtoolsEvent {
  traceId: string;
  timestamp: number;
  phase: string;
  status: string;
  requestId?: string;
  lifecycle?: string;
  message?: string;
  runtimeVersion?: string;
  remote?: {
    name?: string;
    entry?: string;
    alias?: string;
  };
  shared?: {
    name?: string;
    shareScope?: string[];
    requiredVersion?: string | false;
    selectedVersion?: string;
    availableVersions?: string[];
    provider?: string;
    reason?: string;
  };
  expose?: string;
  duration?: number;
  errorCode?: string;
  errorName?: string;
  errorMessage?: string;
  ownerHint?: string;
  recovered?: boolean;
  cached?: boolean;
  loadedBefore?: ObservabilityDevtoolsLoadedBefore;
}

export interface ObservabilityDevtoolsLoadedBefore {
  producer: boolean;
  expose: boolean;
  consumers: Array<{
    name?: string;
    remoteEntryExports?: boolean;
    containerInitialized?: boolean;
    exposes?: string[];
  }>;
}

export interface ObservabilityDevtoolsReport {
  traceId: string;
  status: string;
  requestId?: string;
  hostName?: string;
  runtimeVersion?: string;
  remote?: {
    name?: string;
    entry?: string;
    alias?: string;
  };
  shared?: {
    name?: string;
    shareScope?: string[];
    requiredVersion?: string | false;
    selectedVersion?: string;
    availableVersions?: string[];
    provider?: string;
    reason?: string;
  };
  expose?: string;
  startedAt: number;
  updatedAt: number;
  duration: number;
  failedPhase?: string;
  errorCode?: string;
  errorName?: string;
  errorMessage?: string;
  ownerHint?: string;
  loadedBefore?: ObservabilityDevtoolsLoadedBefore;
  events: ObservabilityDevtoolsEvent[];
  summary?: {
    outcome?: string;
    runtimeLoaded?: boolean;
    sharedResolved?: boolean;
    componentLoaded?: boolean;
    loadCompleted?: boolean;
    recovered?: boolean;
    lastPhase?: string;
  };
  diagnosis?: {
    title?: string;
    ownerHint?: string;
    errorCode?: string;
    actions?: Array<{ title?: string; detail?: string }>;
    warnings?: string[];
  };
  __scope?: string;
}

export interface ObservabilityDevtoolsSnapshot {
  config: ObservabilityDevtoolsConfig;
  stored: boolean;
  scopes: string[];
  reports: ObservabilityDevtoolsReport[];
  hasUserObservabilityPlugin: boolean;
}

const USER_OBSERVABILITY_PLUGIN_NAME = 'observability-plugin';
const CHROME_OBSERVABILITY_PLUGIN_NAME =
  'observability-plugin:chrome-extension';
const LEGACY_CHROME_OBSERVABILITY_PLUGIN_NAME = 'observability-plugin-devtools';
const OBSERVABILITY_SNAPSHOT_CONTEXT = {
  chromeScope: CHROME_OBSERVABILITY_SCOPE,
  userPluginName: USER_OBSERVABILITY_PLUGIN_NAME,
  chromePluginNames: [
    CHROME_OBSERVABILITY_PLUGIN_NAME,
    LEGACY_CHROME_OBSERVABILITY_PLUGIN_NAME,
  ],
};

const readConfigFromPage = (storageKey: string) => {
  try {
    const raw = window.localStorage?.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeConfigToPage = (storageKey: string, config: unknown) => {
  window.localStorage?.setItem(storageKey, JSON.stringify(config));
  return config;
};

const removeConfigFromPage = (storageKey: string) => {
  window.localStorage?.removeItem(storageKey);
  return true;
};

const reloadPage = () => {
  globalThis.location?.reload();
};

const readSnapshotFromPage = (
  storageKey: string,
  context?: {
    chromeScope?: string;
    userPluginName?: string;
    chromePluginNames?: string[];
  },
) => {
  const chromeScope =
    typeof context?.chromeScope === 'string'
      ? context.chromeScope
      : 'chrome_extension';
  const userPluginName =
    typeof context?.userPluginName === 'string'
      ? context.userPluginName
      : 'observability-plugin';
  const chromePluginNames = Array.isArray(context?.chromePluginNames)
    ? context.chromePluginNames
    : [
        'observability-plugin:chrome-extension',
        'observability-plugin-devtools',
      ];
  const safeCopy = (value: unknown) => {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return undefined;
    }
  };

  const rawConfig = (() => {
    try {
      const raw = window.localStorage?.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const federation = (window as any).__FEDERATION__ || (window as any).__VMOK__;
  const readers = federation?.__OBSERVABILITY__ || {};
  const reports: Array<ObservabilityDevtoolsReport> = [];
  const scopes = Object.keys(readers);
  const isChromeObservabilityPluginName = (name: unknown) =>
    chromePluginNames.includes(String(name));
  const hasUserObservabilityPluginFromInstances = Array.isArray(
    federation?.__INSTANCES__,
  )
    ? federation.__INSTANCES__.some((instance: any) => {
        const plugins = instance?.options?.plugins;
        if (!Array.isArray(plugins)) {
          return false;
        }

        return plugins.some(
          (plugin) =>
            plugin?.name === userPluginName &&
            !isChromeObservabilityPluginName(plugin?.name),
        );
      })
    : false;
  const hasUserObservabilityPluginFromReaders = scopes.some(
    (scope) => scope !== chromeScope,
  );

  scopes.forEach((scope) => {
    const reader = readers[scope];
    if (!reader || typeof reader.getReports !== 'function') {
      return;
    }

    try {
      const scopeReports = reader.getReports({ limit: 100 });
      if (!Array.isArray(scopeReports)) {
        return;
      }
      scopeReports.forEach((report) => {
        const copied = safeCopy(report) as ObservabilityDevtoolsReport;
        if (copied?.traceId) {
          copied.__scope = scope;
          reports.push(copied);
        }
      });
    } catch {
      // One broken reader should not block other scopes.
    }
  });

  return {
    config: rawConfig,
    stored: Boolean(rawConfig),
    scopes,
    reports,
    hasUserObservabilityPlugin:
      hasUserObservabilityPluginFromInstances ||
      hasUserObservabilityPluginFromReaders,
  };
};

export const readObservabilityConfig = async () => {
  const config = await injectScript(
    readConfigFromPage,
    false,
    OBSERVABILITY_DEVTOOLS_STORAGE_KEY,
  );

  return normalizeObservabilityDevtoolsConfig(
    config || DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG,
  );
};

export const applyObservabilityConfig = async (
  config: ObservabilityDevtoolsConfig,
) =>
  injectScript(
    writeConfigToPage,
    false,
    OBSERVABILITY_DEVTOOLS_STORAGE_KEY,
    normalizeObservabilityDevtoolsConfig(config),
  );

export const disableObservabilityConfig = async () =>
  injectScript(removeConfigFromPage, false, OBSERVABILITY_DEVTOOLS_STORAGE_KEY);

export const reloadInspectedPage = async () => injectScript(reloadPage, false);

export const readObservabilitySnapshot =
  async (): Promise<ObservabilityDevtoolsSnapshot> => {
    const snapshot = await injectScript(
      readSnapshotFromPage,
      true,
      OBSERVABILITY_DEVTOOLS_STORAGE_KEY,
      OBSERVABILITY_SNAPSHOT_CONTEXT,
    );

    return {
      config: normalizeObservabilityDevtoolsConfig(
        snapshot?.config || DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG,
      ),
      stored: Boolean(snapshot?.stored),
      scopes: Array.isArray(snapshot?.scopes) ? snapshot.scopes : [],
      reports: Array.isArray(snapshot?.reports) ? snapshot.reports : [],
      hasUserObservabilityPlugin: Boolean(snapshot?.hasUserObservabilityPlugin),
    };
  };

export const mergeObservabilityReports = (
  currentReports: ObservabilityDevtoolsReport[],
  incomingReports: ObservabilityDevtoolsReport[],
) => {
  const merged = new Map<string, ObservabilityDevtoolsReport>();

  currentReports.forEach((report) => {
    if (report.traceId) {
      merged.set(report.traceId, report);
    }
  });
  incomingReports.forEach((report) => {
    if (report.traceId) {
      merged.set(report.traceId, report);
    }
  });

  return Array.from(merged.values()).sort((left, right) => {
    if ((right.updatedAt || 0) !== (left.updatedAt || 0)) {
      return (right.updatedAt || 0) - (left.updatedAt || 0);
    }
    return (right.startedAt || 0) - (left.startedAt || 0);
  });
};

export const getObservabilityReportScopeLabel = (
  report: Pick<ObservabilityDevtoolsReport, '__scope'>,
) => {
  const scope = report.__scope;
  if (!scope || scope === CHROME_OBSERVABILITY_SCOPE) {
    return undefined;
  }

  return `custom: ${scope}`;
};
