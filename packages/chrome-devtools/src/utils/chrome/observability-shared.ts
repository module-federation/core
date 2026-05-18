import { OBSERVABILITY_DEVTOOLS_SOURCE } from './messages';

export type ObservabilityDevtoolsLevel = 'error' | 'summary' | 'verbose';
export type ObservabilityDevtoolsMode = 'development' | 'production';

export interface ObservabilityDevtoolsConfig {
  enabled: boolean;
  level: ObservabilityDevtoolsLevel;
  maxEvents: number;
  console: boolean;
  browser: {
    enabled: boolean;
    scope: string;
    mode: ObservabilityDevtoolsMode;
  };
  trace: {
    printStart: boolean;
  };
  react: {
    injectLoadedCallback: boolean;
    remoteIds: string[];
  };
}

export const CHROME_OBSERVABILITY_SCOPE = 'chrome_extension';
const MIN_EVENTS = 10;
const MAX_EVENTS = 1000;

export const DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG: ObservabilityDevtoolsConfig =
  {
    enabled: true,
    level: 'verbose',
    maxEvents: 300,
    console: true,
    browser: {
      enabled: true,
      scope: CHROME_OBSERVABILITY_SCOPE,
      mode: 'development',
    },
    trace: {
      printStart: true,
    },
    react: {
      injectLoadedCallback: false,
      remoteIds: [],
    },
  };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeBoolean = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback;

const normalizeLevel = (value: unknown): ObservabilityDevtoolsLevel =>
  value === 'error' || value === 'summary' || value === 'verbose'
    ? value
    : DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG.level;

const normalizeMode = (value: unknown): ObservabilityDevtoolsMode =>
  value === 'production' || value === 'development'
    ? value
    : DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG.browser.mode;

const normalizeMaxEvents = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG.maxEvents;
  }
  return Math.max(MIN_EVENTS, Math.min(MAX_EVENTS, Math.floor(parsed)));
};

const normalizeScope = (value: unknown) => {
  if (typeof value !== 'string') {
    return CHROME_OBSERVABILITY_SCOPE;
  }
  const trimmed = value.trim().replace(/[^\w:@.-]+/g, '-');
  return trimmed || CHROME_OBSERVABILITY_SCOPE;
};

export const normalizeObservabilityDevtoolsConfig = (
  value?: Partial<ObservabilityDevtoolsConfig> | Record<string, unknown> | null,
): ObservabilityDevtoolsConfig => {
  const source = isObject(value) ? value : {};
  const browser = isObject(source.browser) ? source.browser : {};
  const trace = isObject(source.trace) ? source.trace : {};

  return {
    enabled: normalizeBoolean(
      source.enabled,
      DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG.enabled,
    ),
    level: normalizeLevel(source.level),
    maxEvents: normalizeMaxEvents(source.maxEvents),
    console: normalizeBoolean(
      source.console,
      DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG.console,
    ),
    browser: {
      enabled: normalizeBoolean(
        browser.enabled,
        DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG.browser.enabled,
      ),
      scope: normalizeScope(browser.scope),
      mode: normalizeMode(browser.mode),
    },
    trace: {
      printStart: normalizeBoolean(
        trace.printStart,
        DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG.trace.printStart,
      ),
    },
    react: {
      injectLoadedCallback: false,
      remoteIds: [],
    },
  };
};

export const createObservabilityPluginOptions = (
  config: ObservabilityDevtoolsConfig,
) => ({
  enabled: config.enabled,
  level: config.level,
  maxEvents: config.maxEvents,
  console: config.console,
  browser: {
    enabled: config.browser.enabled,
    scope: config.browser.scope,
    mode: config.browser.mode,
  },
  trace: {
    printStart: config.trace.printStart,
  },
  devtools: {
    enabled: true,
    source: OBSERVABILITY_DEVTOOLS_SOURCE,
  },
});
