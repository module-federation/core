import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

export type DiagnosticsLevel = 'error' | 'summary' | 'verbose';
export type DiagnosticsEventStatus = 'start' | 'success' | 'error' | 'complete';
export type DiagnosticsReportStatus = 'pending' | 'success' | 'error';
export type DiagnosticsEventSource = 'runtime' | 'business';
export type DiagnosticsReportOutcome =
  | 'pending'
  | 'runtime-loaded'
  | 'component-loaded'
  | 'failed'
  | 'recovered';

export interface DiagnosticsRemoteInfo {
  name: string;
  alias?: string;
  entry?: string;
  entryGlobalName?: string;
  type?: string;
}

export interface DiagnosticsSharedInfo {
  name: string;
  shareScope?: string[];
  requiredVersion?: string | false;
  selectedVersion?: string;
  availableVersions?: string[];
  provider?: string;
  from?: string;
  singleton?: boolean;
  strictVersion?: boolean;
  eager?: boolean;
  strategy?: string;
  loaded?: boolean;
  loading?: boolean;
  reason?: string;
}

export interface DiagnosticsEvent {
  traceId: string;
  timestamp: number;
  phase: string;
  status: DiagnosticsEventStatus;
  requestId?: string;
  hostName?: string;
  remote?: DiagnosticsRemoteInfo;
  shared?: DiagnosticsSharedInfo;
  expose?: string;
  sanitizedUrl?: string;
  message?: string;
  errorName?: string;
  errorMessage?: string;
  lifecycle?: string;
  eventName?: string;
  source?: DiagnosticsEventSource;
  recovered?: boolean;
  componentName?: string;
}

export interface DiagnosticsReport {
  traceId: string;
  status: DiagnosticsReportStatus;
  requestId?: string;
  hostName?: string;
  remote?: DiagnosticsRemoteInfo;
  shared?: DiagnosticsSharedInfo;
  expose?: string;
  startedAt: number;
  updatedAt: number;
  duration: number;
  failedPhase?: string;
  events: DiagnosticsEvent[];
  summary: {
    eventCount: number;
    recovered: boolean;
    loadCompleted: boolean;
    runtimeLoaded: boolean;
    componentLoaded: boolean;
    outcome: DiagnosticsReportOutcome;
    lastPhase?: string;
  };
}

export interface DiagnosticsPluginOptions {
  enabled?: boolean;
  level?: DiagnosticsLevel;
  maxEvents?: number;
  console?: boolean;
  browser?: {
    enabled?: boolean;
    scope?: string;
  };
  onEvent?: (
    event: DiagnosticsEvent,
    report: DiagnosticsReport,
    context?: DiagnosticsEventContext,
  ) => void;
  onReport?: (
    report: DiagnosticsReport,
    context?: DiagnosticsEventContext,
  ) => void;
}

export interface MarkComponentLoadedOptions {
  traceId?: string;
  requestId?: string;
  componentName?: string;
}

export interface DiagnosticsController {
  plugin: DiagnosticsRuntimePlugin;
  getEvents(): DiagnosticsEvent[];
  getTraceIds(): string[];
  getLatestReport(): DiagnosticsReport | undefined;
  getReport(traceId: string): DiagnosticsReport | undefined;
  clear(): void;
  markComponentLoaded(
    options?: MarkComponentLoadedOptions,
  ): DiagnosticsEvent | undefined;
}

export interface DiagnosticsRuntimeEventInput {
  phase: string;
  status: DiagnosticsEventStatus;
  requestId?: string;
  hostName?: string;
  remote?: DiagnosticsRemoteInfo;
  shared?: DiagnosticsSharedInfo;
  expose?: string;
  url?: string;
  message?: string;
  error?: unknown;
  lifecycle?: string;
  eventName?: string;
  source?: DiagnosticsEventSource;
  recovered?: boolean;
  timestamp?: number;
  traceId?: string;
  componentName?: string;
}

export interface DiagnosticsRuntimeOrigin {
  options?: {
    name?: string;
    security?: {
      diagnostics?: {
        enabled?: boolean;
        maxEvents?: number;
        console?: boolean;
        browserGlobal?: boolean;
        fileOutput?: boolean;
      };
    };
  };
}

export interface DiagnosticsEventContext {
  origin?: DiagnosticsRuntimeOrigin;
}

interface DiagnosticsRuntimeSharedConfig {
  requiredVersion?: string | false;
  singleton?: boolean;
  strictVersion?: boolean;
  eager?: boolean;
}

interface DiagnosticsRuntimeSharedSource {
  version?: string;
  scope?: string | string[];
  from?: string;
  loaded?: boolean;
  loading?: unknown;
  strategy?: string;
  shareConfig?: DiagnosticsRuntimeSharedConfig;
  get?: unknown;
}

interface DiagnosticsRuntimeRemoteSource {
  name?: string;
  alias?: string;
  entry?: string;
  entryGlobalName?: string;
  type?: string;
}

interface DiagnosticsRemoteLoadArgs {
  id: string;
  expose?: string;
  remote?: DiagnosticsRuntimeRemoteSource;
  origin: DiagnosticsRuntimeOrigin;
}

interface DiagnosticsRemoteBeforeRequestArgs {
  id: string;
  origin: DiagnosticsRuntimeOrigin;
}

interface DiagnosticsRemoteAfterLoadArgs {
  id: string;
  expose?: string;
  remote?: DiagnosticsRuntimeRemoteSource;
  error?: unknown;
  recovered?: boolean;
  origin: DiagnosticsRuntimeOrigin;
}

interface DiagnosticsRemoteSnapshotArgs {
  moduleInfo?: DiagnosticsRuntimeRemoteSource;
  origin: DiagnosticsRuntimeOrigin;
}

interface DiagnosticsRemoteResolveArgs {
  id: string;
  expose?: string;
  remote?: DiagnosticsRuntimeRemoteSource;
  remoteInfo?: DiagnosticsRuntimeRemoteSource;
  origin: DiagnosticsRuntimeOrigin;
}

interface DiagnosticsRemoteErrorArgs {
  id: string;
  error: unknown;
  lifecycle?: string;
  remote?: DiagnosticsRuntimeRemoteSource;
  expose?: string;
  origin: DiagnosticsRuntimeOrigin;
}

interface DiagnosticsRemoteEntryLoadArgs {
  origin: DiagnosticsRuntimeOrigin;
  remoteInfo: DiagnosticsRuntimeRemoteSource;
}

interface DiagnosticsRemoteEntryAfterLoadArgs {
  origin: DiagnosticsRuntimeOrigin;
  remoteInfo: DiagnosticsRuntimeRemoteSource;
  error?: unknown;
  recovered?: boolean;
}

type DiagnosticsRuntimeShareScopeMap = Record<
  string,
  Record<string, Record<string, DiagnosticsRuntimeSharedSource | undefined>>
>;

interface DiagnosticsSharedLifecycleArgs {
  pkgName: string;
  shareInfo?: DiagnosticsRuntimeSharedSource;
  selectedShared?: DiagnosticsRuntimeSharedSource;
  shared?: Record<string, DiagnosticsRuntimeSharedSource[]>;
  shareScopeMap?: DiagnosticsRuntimeShareScopeMap;
  lifecycle?: 'loadShare' | 'loadShareSync';
  origin: DiagnosticsRuntimeOrigin;
  error?: unknown;
  recovered?: boolean;
}

export type DiagnosticsRuntimePlugin = ModuleFederationRuntimePlugin;

export interface DiagnosticsBrowserReader {
  getEvents(): DiagnosticsEvent[];
  getTraceIds(): string[];
  getLatestReport(): DiagnosticsReport | undefined;
  getReport(traceId: string): DiagnosticsReport | undefined;
}

interface FederationDiagnosticsGlobal {
  __DIAGNOSTICS__?: Record<string, DiagnosticsBrowserReader>;
}

const DEFAULT_MAX_EVENTS = 100;
const HARD_MAX_EVENTS = 1000;
const COMPONENT_BUSINESS_LOADED_EVENT = 'component:business-loaded';
const SENSITIVE_PAIR_PATTERN =
  /\b(token|authorization|cookie|secret|password|session|access_token|refresh_token|api_key|apikey|key)\s*[:=]\s*([^&\s'",;<>]+)/gi;
const URL_PATTERN = /https?:\/\/[^\s'"<>]+/g;

let traceCounter = 0;

function normalizeMaxEvents(value: number | undefined, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.min(HARD_MAX_EVENTS, Math.floor(value)));
}

function sanitizeText(value: unknown, maxLength = 800): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const sanitized = String(value)
    .replace(URL_PATTERN, (url) => sanitizeUrl(url) || '[redacted-url]')
    .replace(SENSITIVE_PAIR_PATTERN, '[redacted]');

  return sanitized.length > maxLength
    ? `${sanitized.slice(0, maxLength)}...`
    : sanitized;
}

function sanitizeRequestId(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value)) {
    return sanitizeUrl(value);
  }

  return sanitizeText(value, 240);
}

function sanitizeUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const base =
      typeof window !== 'undefined' && window.location
        ? window.location.origin
        : 'http://localhost';
    const parsedUrl = new URL(value, base);
    const sanitized = `${parsedUrl.origin}${parsedUrl.pathname}`;

    return /^https?:\/\//i.test(value) ? sanitized : parsedUrl.pathname;
  } catch {
    const [withoutHash] = value.split('#');
    const [withoutQuery] = withoutHash.split('?');
    return sanitizeText(withoutQuery, 240);
  }
}

function sanitizeRemote(
  remote: DiagnosticsRemoteInfo | undefined,
): DiagnosticsRemoteInfo | undefined {
  if (!remote || !remote.name) {
    return undefined;
  }

  return {
    name: remote.name,
    alias: sanitizeText(remote.alias, 120),
    entry: sanitizeUrl(remote.entry),
    entryGlobalName: sanitizeText(remote.entryGlobalName, 120),
    type: sanitizeText(remote.type, 80),
  };
}

function createRemoteInfo(
  remote: DiagnosticsRuntimeRemoteSource | undefined,
): DiagnosticsRemoteInfo | undefined {
  if (!remote?.name) {
    return undefined;
  }

  return {
    name: remote.name,
    alias: remote.alias,
    entry: remote.entry,
    entryGlobalName: remote.entryGlobalName,
    type: remote.type,
  };
}

function isManifestUrl(value: string | undefined): boolean {
  const sanitized = sanitizeUrl(value);

  return Boolean(sanitized && /manifest.*\.json$/i.test(sanitized));
}

function normalizeSharedScope(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return (Array.isArray(value) ? value : [value])
    .map((scope) => sanitizeText(scope, 120))
    .filter((scope): scope is string => Boolean(scope));
}

function getSharedScopes(
  shareInfo: DiagnosticsRuntimeSharedSource | undefined,
): string[] {
  return normalizeSharedScope(shareInfo?.scope).length
    ? normalizeSharedScope(shareInfo?.scope)
    : ['default'];
}

function getAvailableSharedVersions(args: DiagnosticsSharedLifecycleArgs) {
  const versions = new Set<string>();
  const shareScopeMap = args.shareScopeMap || {};

  getSharedScopes(args.shareInfo).forEach((scope) => {
    Object.keys(shareScopeMap[scope]?.[args.pkgName] || {}).forEach(
      (version) => {
        versions.add(version);
      },
    );
  });

  return Array.from(versions);
}

function getSharedMissReason(args: DiagnosticsSharedLifecycleArgs) {
  if (!args.shareInfo) {
    return 'missing-config';
  }

  return getAvailableSharedVersions(args).length
    ? 'version-mismatch'
    : 'missing-provider';
}

function getSharedErrorReason(args: DiagnosticsSharedLifecycleArgs) {
  if (args.recovered) {
    return getSharedMissReason(args);
  }

  const errorInfo = getErrorInfo(args.error);
  const errorMessage = errorInfo.errorMessage || '';

  if (!args.shareInfo || /Cannot find shared/i.test(errorMessage)) {
    return 'missing-config';
  }

  if (
    args.lifecycle === 'loadShareSync' &&
    typeof args.shareInfo.get === 'function' &&
    /RUNTIME-00[56]/.test(errorMessage)
  ) {
    return 'sync-async-boundary';
  }

  if (
    args.lifecycle === 'loadShareSync' &&
    !args.shareInfo.get &&
    /RUNTIME-006/.test(errorMessage)
  ) {
    return getSharedMissReason(args);
  }

  if (args.error) {
    return 'load-error';
  }

  return undefined;
}

function createSharedInfo(
  args: DiagnosticsSharedLifecycleArgs,
  reason?: string,
): DiagnosticsSharedInfo {
  const shareConfig = args.shareInfo?.shareConfig;

  return {
    name: args.pkgName,
    shareScope: getSharedScopes(args.shareInfo),
    requiredVersion: shareConfig?.requiredVersion,
    selectedVersion: args.selectedShared?.version,
    availableVersions: getAvailableSharedVersions(args),
    provider: args.selectedShared?.from,
    from: args.shareInfo?.from,
    singleton: shareConfig?.singleton,
    strictVersion: shareConfig?.strictVersion,
    eager: shareConfig?.eager,
    strategy: args.shareInfo?.strategy,
    loaded: args.selectedShared?.loaded,
    loading: Boolean(args.selectedShared?.loading) || undefined,
    reason,
  };
}

function sanitizeShared(
  shared: DiagnosticsSharedInfo | undefined,
): DiagnosticsSharedInfo | undefined {
  if (!shared || !shared.name) {
    return undefined;
  }

  return {
    name: sanitizeText(shared.name, 160) || 'unknown',
    shareScope: normalizeSharedScope(shared.shareScope),
    requiredVersion:
      shared.requiredVersion === false
        ? false
        : sanitizeText(shared.requiredVersion, 120),
    selectedVersion: sanitizeText(shared.selectedVersion, 120),
    availableVersions: (shared.availableVersions || [])
      .map((version) => sanitizeText(version, 120))
      .filter((version): version is string => Boolean(version))
      .slice(0, 20),
    provider: sanitizeText(shared.provider, 160),
    from: sanitizeText(shared.from, 160),
    singleton: shared.singleton,
    strictVersion: shared.strictVersion,
    eager: shared.eager,
    strategy: sanitizeText(shared.strategy, 80),
    loaded: shared.loaded,
    loading: shared.loading,
    reason: sanitizeText(shared.reason, 120),
  };
}

function normalizeEventSource(
  value: DiagnosticsEventSource | undefined,
): DiagnosticsEventSource | undefined {
  return value === 'runtime' || value === 'business' ? value : undefined;
}

function getErrorInfo(error: unknown): {
  errorName?: string;
  errorMessage?: string;
} {
  if (!error) {
    return {};
  }

  if (error instanceof Error) {
    return {
      errorName: sanitizeText(error.name, 120),
      errorMessage: sanitizeText(error.message),
    };
  }

  return {
    errorMessage: sanitizeText(error),
  };
}

function copyEvent(event: DiagnosticsEvent): DiagnosticsEvent {
  return {
    ...event,
    remote: event.remote ? { ...event.remote } : undefined,
    shared: event.shared
      ? {
          ...event.shared,
          shareScope: event.shared.shareScope
            ? [...event.shared.shareScope]
            : undefined,
          availableVersions: event.shared.availableVersions
            ? [...event.shared.availableVersions]
            : undefined,
        }
      : undefined,
  };
}

function copyReport(report: DiagnosticsReport): DiagnosticsReport {
  return {
    ...report,
    remote: report.remote ? { ...report.remote } : undefined,
    shared: report.shared
      ? {
          ...report.shared,
          shareScope: report.shared.shareScope
            ? [...report.shared.shareScope]
            : undefined,
          availableVersions: report.shared.availableVersions
            ? [...report.shared.availableVersions]
            : undefined,
        }
      : undefined,
    events: report.events.map(copyEvent),
    summary: { ...report.summary },
  };
}

function getFederationGlobal(): FederationDiagnosticsGlobal | undefined {
  return (
    globalThis as {
      __FEDERATION__?: FederationDiagnosticsGlobal;
    }
  ).__FEDERATION__;
}

function normalizeScope(value: unknown) {
  const sanitized = sanitizeText(value, 120);
  const normalized = sanitized?.replace(/[^\w:@.-]+/g, '-');

  return normalized || 'default';
}

function shouldRecordEvent(
  level: DiagnosticsLevel,
  event: DiagnosticsRuntimeEventInput,
) {
  if (level === 'verbose') {
    return true;
  }

  if (level === 'summary') {
    return event.status !== 'start';
  }

  return event.status === 'error' || Boolean(event.error);
}

function createTraceId(event: DiagnosticsRuntimeEventInput) {
  traceCounter += 1;
  const owner = event.remote?.name || event.phase || 'runtime';
  const normalizedOwner = owner.replace(/[^a-z0-9]+/gi, '-').slice(0, 80);

  return `mf-${normalizedOwner}-${Date.now().toString(36)}-${traceCounter.toString(
    36,
  )}`;
}

export function DiagnosticsPlugin(
  options: DiagnosticsPluginOptions = {},
): DiagnosticsController {
  const level = options.level || 'summary';
  const configuredMaxEvents = normalizeMaxEvents(
    options.maxEvents,
    DEFAULT_MAX_EVENTS,
  );
  const events: DiagnosticsEvent[] = [];
  const reports = new Map<string, DiagnosticsReport>();
  const traceByRequest = new Map<string, string>();
  const traceByRemote = new Map<string, string>();
  const consoleReportedTraceIds = new Set<string>();
  let latestTraceId: string | undefined;
  let runtimeDiagnosticsEnabled = false;
  let effectiveMaxEvents = configuredMaxEvents;
  let browserGlobalScope: string | undefined;
  let lastRuntimeOrigin: DiagnosticsRuntimeOrigin | undefined;

  const isEnabledForOrigin = (origin: DiagnosticsRuntimeOrigin) => {
    if (options.enabled === false) {
      return false;
    }

    const securityDiagnostics = origin.options?.security?.diagnostics;
    if (securityDiagnostics?.enabled !== true) {
      return false;
    }

    const securityMaxEvents = normalizeMaxEvents(
      securityDiagnostics.maxEvents,
      configuredMaxEvents,
    );
    effectiveMaxEvents = Math.min(configuredMaxEvents, securityMaxEvents);
    runtimeDiagnosticsEnabled = true;
    return true;
  };

  const resolveTraceId = (event: DiagnosticsRuntimeEventInput) => {
    const sanitizedRequestId = sanitizeRequestId(event.requestId);

    if (event.traceId && reports.has(event.traceId)) {
      return event.traceId;
    }

    if (event.status === 'start' && event.phase === 'loadRemote') {
      const traceId = event.traceId || createTraceId(event);
      if (sanitizedRequestId) {
        traceByRequest.set(sanitizedRequestId, traceId);
      }
      if (event.remote?.name) {
        traceByRemote.set(event.remote.name, traceId);
      }
      return traceId;
    }

    if (sanitizedRequestId) {
      const traceId = traceByRequest.get(sanitizedRequestId);
      if (traceId) {
        return traceId;
      }
    }

    if (event.remote?.name) {
      const traceId = traceByRemote.get(event.remote.name);
      if (traceId) {
        return traceId;
      }
    }

    return event.traceId || createTraceId(event);
  };

  const normalizeEvent = (
    event: DiagnosticsRuntimeEventInput,
    traceId: string,
    origin?: DiagnosticsRuntimeOrigin,
  ): DiagnosticsEvent => {
    const errorInfo = getErrorInfo(event.error);
    const sanitizedRemote = sanitizeRemote(event.remote);
    const sanitizedShared = sanitizeShared(event.shared);
    const hostName =
      sanitizeText(event.hostName, 120) ||
      sanitizeText(origin?.options?.name, 120);
    const message = sanitizeText(event.message) || errorInfo.errorMessage;

    return {
      traceId,
      timestamp: event.timestamp || Date.now(),
      phase: sanitizeText(event.phase, 120) || 'runtime',
      status: event.status,
      requestId: sanitizeRequestId(event.requestId),
      hostName,
      remote: sanitizedRemote,
      shared: sanitizedShared,
      expose: sanitizeText(event.expose, 240),
      sanitizedUrl: sanitizeUrl(event.url || event.remote?.entry),
      message,
      errorName: errorInfo.errorName,
      errorMessage: errorInfo.errorMessage,
      lifecycle: sanitizeText(event.lifecycle, 120),
      eventName: sanitizeText(event.eventName, 160),
      source: normalizeEventSource(event.source),
      recovered: event.recovered === true || undefined,
      componentName: sanitizeText(event.componentName, 160),
    };
  };

  const updateTraceMaps = (event: DiagnosticsEvent) => {
    if (event.requestId) {
      traceByRequest.set(event.requestId, event.traceId);
    }

    if (event.remote?.name) {
      traceByRemote.set(event.remote.name, event.traceId);
    }
  };

  const trimEvents = (report: DiagnosticsReport) => {
    while (events.length > effectiveMaxEvents) {
      events.shift();
    }

    while (report.events.length > effectiveMaxEvents) {
      report.events.shift();
    }
  };

  const getEventOutcome = (event: DiagnosticsEvent) => {
    if (event.status === 'success') {
      return 'success';
    }

    if (event.status === 'error') {
      return 'error';
    }

    if (event.status === 'complete') {
      if (event.recovered) {
        return 'recovered';
      }

      if (event.errorName || event.errorMessage) {
        return 'error';
      }
    }

    return undefined;
  };

  const isLoadRemoteCompleteEvent = (event: DiagnosticsEvent) =>
    event.phase === 'loadRemote' && event.status === 'complete';

  const isRuntimeLoadedEvent = (event: DiagnosticsEvent) =>
    event.phase === 'loadRemote' &&
    (event.status === 'success' ||
      (event.status === 'complete' && event.recovered));

  const isComponentLoadedEvent = (event: DiagnosticsEvent) =>
    event.status === 'success' &&
    (event.eventName === COMPONENT_BUSINESS_LOADED_EVENT ||
      (event.phase === 'component' &&
        event.message === COMPONENT_BUSINESS_LOADED_EVENT));

  const shouldReplaceFailedPhase = (
    report: DiagnosticsReport,
    event: DiagnosticsEvent,
  ) => {
    if (isLoadRemoteCompleteEvent(event) && report.failedPhase) {
      return false;
    }

    if (!report.failedPhase) {
      return true;
    }

    return report.failedPhase === 'loadRemote' && event.phase !== 'loadRemote';
  };

  const createReportSummary = (
    report: DiagnosticsReport,
  ): DiagnosticsReport['summary'] => {
    const loadCompleted = report.events.some(isLoadRemoteCompleteEvent);
    const runtimeLoaded = report.events.some(isRuntimeLoadedEvent);
    const recovered = report.events.some((item) => item.recovered);
    const componentLoaded = report.events.some(isComponentLoadedEvent);
    const lastEvent = report.events[report.events.length - 1];
    let outcome: DiagnosticsReportOutcome = 'pending';

    if (componentLoaded) {
      outcome = 'component-loaded';
    } else if (recovered && runtimeLoaded) {
      outcome = 'recovered';
    } else if (report.status === 'error') {
      outcome = 'failed';
    } else if (runtimeLoaded) {
      outcome = 'runtime-loaded';
    }

    return {
      eventCount: report.events.length,
      recovered,
      loadCompleted,
      runtimeLoaded,
      componentLoaded,
      outcome,
      lastPhase: lastEvent?.phase,
    };
  };

  const updateReport = (event: DiagnosticsEvent) => {
    let report = reports.get(event.traceId);

    if (!report) {
      report = {
        traceId: event.traceId,
        status: event.status === 'error' ? 'error' : 'pending',
        requestId: event.requestId,
        hostName: event.hostName,
        remote: event.remote ? { ...event.remote } : undefined,
        shared: event.shared ? copyEvent(event).shared : undefined,
        expose: event.expose,
        startedAt: event.timestamp,
        updatedAt: event.timestamp,
        duration: 0,
        failedPhase: event.status === 'error' ? event.phase : undefined,
        events: [],
        summary: {
          eventCount: 0,
          recovered: false,
          loadCompleted: false,
          runtimeLoaded: false,
          componentLoaded: false,
          outcome: 'pending',
          lastPhase: undefined,
        },
      };
      reports.set(event.traceId, report);
    }

    if (event.requestId) {
      report.requestId = event.requestId;
    }
    if (event.hostName) {
      report.hostName = event.hostName;
    }
    if (event.remote) {
      report.remote = { ...event.remote };
    }
    if (event.shared) {
      report.shared = copyEvent(event).shared;
    }
    if (event.expose) {
      report.expose = event.expose;
    }

    report.events.push(event);
    report.updatedAt = event.timestamp;
    report.duration = Math.max(0, report.updatedAt - report.startedAt);

    const eventOutcome = getEventOutcome(event);

    if (eventOutcome === 'error') {
      report.status = 'error';
      if (shouldReplaceFailedPhase(report, event)) {
        report.failedPhase = event.phase;
      }
    } else if (
      (eventOutcome === 'success' || eventOutcome === 'recovered') &&
      report.status !== 'error'
    ) {
      report.status = 'success';
    }

    report.summary = createReportSummary(report);

    latestTraceId = event.traceId;
    trimEvents(report);
    return report;
  };

  const notifyEvent = (
    event: DiagnosticsEvent,
    report: DiagnosticsReport,
    origin?: DiagnosticsRuntimeOrigin,
  ) => {
    try {
      options.onEvent?.(copyEvent(event), copyReport(report), { origin });
    } catch {
      // Diagnostics callbacks must not affect Module Federation loading.
    }
  };

  const notifyReport = (
    report: DiagnosticsReport,
    origin?: DiagnosticsRuntimeOrigin,
  ) => {
    if (report.events[report.events.length - 1]?.status === 'start') {
      return;
    }

    try {
      options.onReport?.(copyReport(report), { origin });
    } catch {
      // Diagnostics callbacks must not affect Module Federation loading.
    }
  };

  const getEventsSnapshot = () => events.map(copyEvent);

  const getTraceIdsSnapshot = () => Array.from(reports.keys());

  const getLatestReportSnapshot = () => {
    if (!latestTraceId) {
      return undefined;
    }

    const report = reports.get(latestTraceId);
    return report ? copyReport(report) : undefined;
  };

  const getReportSnapshot = (traceId: string) => {
    const report = reports.get(traceId);
    return report ? copyReport(report) : undefined;
  };

  const createBrowserReader = (): DiagnosticsBrowserReader => ({
    getEvents: getEventsSnapshot,
    getTraceIds: getTraceIdsSnapshot,
    getLatestReport: getLatestReportSnapshot,
    getReport: getReportSnapshot,
  });

  const shouldExposeBrowserGlobal = (origin?: DiagnosticsRuntimeOrigin) =>
    options.browser?.enabled === true &&
    origin?.options?.security?.diagnostics?.browserGlobal === true;

  const ensureBrowserGlobal = (origin?: DiagnosticsRuntimeOrigin) => {
    if (!shouldExposeBrowserGlobal(origin)) {
      return;
    }

    const federationGlobal = getFederationGlobal();
    if (!federationGlobal) {
      return;
    }

    const scope = normalizeScope(
      options.browser?.scope || origin?.options?.name || 'default',
    );
    const reader = createBrowserReader();

    federationGlobal.__DIAGNOSTICS__ = federationGlobal.__DIAGNOSTICS__ || {};
    browserGlobalScope = scope;

    try {
      Object.defineProperty(federationGlobal.__DIAGNOSTICS__, scope, {
        value: reader,
        configurable: true,
        enumerable: true,
      });
    } catch {
      federationGlobal.__DIAGNOSTICS__[scope] = reader;
    }
  };

  const shouldUseConsole = (origin?: DiagnosticsRuntimeOrigin) =>
    options.console !== false &&
    origin?.options?.security?.diagnostics?.console !== false;

  const getBrowserReadCommand = (traceId: string) => {
    if (!browserGlobalScope) {
      return undefined;
    }

    return `window.__FEDERATION__.__DIAGNOSTICS__[${JSON.stringify(
      browserGlobalScope,
    )}].getReport(${JSON.stringify(traceId)})`;
  };

  const emitConsoleHint = (
    event: DiagnosticsEvent,
    report: DiagnosticsReport,
    origin?: DiagnosticsRuntimeOrigin,
  ) => {
    if (
      getEventOutcome(event) !== 'error' ||
      !shouldUseConsole(origin) ||
      consoleReportedTraceIds.has(report.traceId)
    ) {
      return;
    }

    consoleReportedTraceIds.add(report.traceId);

    const lines = [
      '[Module Federation] Diagnostic report generated',
      `traceId: ${report.traceId}`,
      `phase: ${report.failedPhase || event.phase}`,
    ];

    if (report.requestId) {
      lines.push(`requestId: ${report.requestId}`);
    }
    if (report.shared?.name) {
      lines.push(`shared: ${report.shared.name}`);
    }

    const browserReadCommand = getBrowserReadCommand(report.traceId);
    if (browserReadCommand) {
      lines.push(`read: ${browserReadCommand}`);
    } else {
      lines.push(
        `read: diagnostics.getReport(${JSON.stringify(report.traceId)})`,
      );
    }

    try {
      console.warn(lines.join('\n'));
    } catch {
      // Console output is best-effort diagnostics only.
    }
  };

  const prepareOutputChannels = (origin: DiagnosticsRuntimeOrigin) => {
    browserGlobalScope = undefined;
    ensureBrowserGlobal(origin);
  };

  const prepareRuntimeOrigin = (origin: DiagnosticsRuntimeOrigin) => {
    if (!isEnabledForOrigin(origin)) {
      return false;
    }

    lastRuntimeOrigin = origin;
    prepareOutputChannels(origin);
    return true;
  };

  const recordEvent = (
    input: DiagnosticsRuntimeEventInput,
    origin?: DiagnosticsRuntimeOrigin,
  ) => {
    const traceId = resolveTraceId(input);

    if (!shouldRecordEvent(level, input)) {
      return undefined;
    }

    const event = normalizeEvent(input, traceId, origin);
    updateTraceMaps(event);
    events.push(event);
    const report = updateReport(event);
    emitConsoleHint(event, report, origin);
    notifyEvent(event, report, origin);
    notifyReport(report, origin);
    return event;
  };

  const plugin: DiagnosticsRuntimePlugin = {
    name: 'diagnostics-plugin',
    beforeRequest(args) {
      const requestArgs = args as DiagnosticsRemoteBeforeRequestArgs;
      if (!prepareRuntimeOrigin(requestArgs.origin)) {
        return;
      }

      recordEvent(
        {
          phase: 'loadRemote',
          status: 'start',
          requestId: requestArgs.id,
          lifecycle: 'beforeRequest',
          message: 'remote:load-start',
        },
        requestArgs.origin,
      );
    },
    beforeLoadRemoteSnapshot(args) {
      const snapshotArgs = args as DiagnosticsRemoteSnapshotArgs;
      if (!prepareRuntimeOrigin(snapshotArgs.origin)) {
        return;
      }

      const remote = createRemoteInfo(snapshotArgs.moduleInfo);
      if (!isManifestUrl(remote?.entry)) {
        return;
      }

      recordEvent(
        {
          phase: 'manifest',
          status: 'start',
          requestId: remote?.entry,
          remote,
          url: remote?.entry,
          lifecycle: 'beforeLoadRemoteSnapshot',
          message: 'manifest:load-start',
        },
        snapshotArgs.origin,
      );
    },
    afterResolve(args) {
      const resolveArgs = args as DiagnosticsRemoteResolveArgs;
      if (!prepareRuntimeOrigin(resolveArgs.origin)) {
        return;
      }

      const remote = createRemoteInfo(
        resolveArgs.remoteInfo || resolveArgs.remote,
      );
      if (!isManifestUrl(remote?.entry)) {
        return;
      }

      recordEvent(
        {
          phase: 'manifest',
          status: 'success',
          requestId: remote?.entry,
          expose: resolveArgs.expose,
          remote,
          url: remote?.entry,
          lifecycle: 'afterResolve',
          message: 'manifest:resolved',
        },
        resolveArgs.origin,
      );
    },
    onLoad(args) {
      const loadArgs = args as DiagnosticsRemoteLoadArgs;
      if (!prepareRuntimeOrigin(loadArgs.origin)) {
        return;
      }

      recordEvent(
        {
          phase: 'loadRemote',
          status: 'success',
          requestId: loadArgs.id,
          lifecycle: 'onLoad',
          expose: loadArgs.expose,
          remote: createRemoteInfo(loadArgs.remote),
          message: 'remote:loaded',
        },
        loadArgs.origin,
      );
    },
    errorLoadRemote(args) {
      const errorArgs = args as DiagnosticsRemoteErrorArgs;
      if (
        !prepareRuntimeOrigin(errorArgs.origin) ||
        (errorArgs.lifecycle !== 'onLoad' &&
          errorArgs.lifecycle !== 'beforeRequest' &&
          errorArgs.lifecycle !== 'afterResolve')
      ) {
        return undefined;
      }

      const isManifestError = errorArgs.lifecycle === 'afterResolve';
      recordEvent(
        {
          phase: isManifestError ? 'manifest' : 'loadRemote',
          status: 'error',
          requestId: errorArgs.id,
          lifecycle: errorArgs.lifecycle,
          expose: errorArgs.expose,
          remote: createRemoteInfo(errorArgs.remote),
          url: isManifestError ? errorArgs.id : undefined,
          message: isManifestError
            ? 'manifest:failed'
            : errorArgs.lifecycle
              ? `remote:${errorArgs.lifecycle}:failed`
              : 'remote:failed',
          error: errorArgs.error,
        },
        errorArgs.origin,
      );

      return undefined;
    },
    afterLoadRemote(args) {
      const loadArgs = args as DiagnosticsRemoteAfterLoadArgs;
      if (!prepareRuntimeOrigin(loadArgs.origin)) {
        return;
      }

      recordEvent(
        {
          phase: 'loadRemote',
          status: 'complete',
          requestId: loadArgs.id,
          lifecycle: 'afterLoadRemote',
          expose: loadArgs.expose,
          remote: createRemoteInfo(loadArgs.remote),
          message: loadArgs.recovered
            ? 'remote:load-recovered'
            : loadArgs.error
              ? 'remote:load-failed'
              : 'remote:load-complete',
          error: loadArgs.error,
          recovered: loadArgs.recovered,
        },
        loadArgs.origin,
      );
    },
    loadEntry(args) {
      const entryArgs = args as DiagnosticsRemoteEntryLoadArgs;
      if (!prepareRuntimeOrigin(entryArgs.origin)) {
        return;
      }

      const remote = createRemoteInfo(entryArgs.remoteInfo);
      recordEvent(
        {
          phase: 'remoteEntry',
          status: 'start',
          requestId: remote?.name,
          remote,
          url: remote?.entry,
          lifecycle: 'loadEntry',
          message: 'remoteEntry:load-start',
        },
        entryArgs.origin,
      );
    },
    afterLoadEntry(args) {
      const entryArgs = args as DiagnosticsRemoteEntryAfterLoadArgs;
      if (!prepareRuntimeOrigin(entryArgs.origin)) {
        return;
      }

      const remote = createRemoteInfo(entryArgs.remoteInfo);
      recordEvent(
        {
          phase: 'remoteEntry',
          status: entryArgs.error ? 'error' : 'success',
          requestId: remote?.name,
          remote,
          url: remote?.entry,
          lifecycle: 'afterLoadEntry',
          message: entryArgs.error
            ? 'remoteEntry:load-failed'
            : entryArgs.recovered
              ? 'remoteEntry:load-recovered'
              : 'remoteEntry:loaded',
          error: entryArgs.error,
          recovered: entryArgs.recovered,
        },
        entryArgs.origin,
      );
    },
    beforeLoadShare(args) {
      if (!prepareRuntimeOrigin(args.origin)) {
        return args;
      }

      recordEvent(
        {
          phase: 'shared',
          status: 'start',
          requestId: `shared:${args.pkgName}`,
          lifecycle: 'loadShare',
          shared: createSharedInfo(args),
          message: 'shared:load-start',
        },
        args.origin,
      );

      return args;
    },
    afterLoadShare(args) {
      if (!prepareRuntimeOrigin(args.origin)) {
        return;
      }

      recordEvent(
        {
          phase: 'shared',
          status: 'success',
          requestId: `shared:${args.pkgName}`,
          lifecycle: args.lifecycle,
          shared: createSharedInfo(args),
          message:
            args.lifecycle === 'loadShareSync'
              ? 'shared:resolved-sync'
              : 'shared:resolved',
        },
        args.origin,
      );
    },
    errorLoadShare(args) {
      if (!prepareRuntimeOrigin(args.origin)) {
        return;
      }

      const reason = getSharedErrorReason(args);

      recordEvent(
        {
          phase: 'shared',
          status: 'error',
          requestId: `shared:${args.pkgName}`,
          lifecycle: args.lifecycle,
          shared: createSharedInfo(args, reason),
          message: reason ? `shared:${reason}` : undefined,
          error: args.error,
          recovered: args.recovered,
        },
        args.origin,
      );
    },
  } as DiagnosticsRuntimePlugin;

  return {
    plugin,
    getEvents() {
      return getEventsSnapshot();
    },
    getTraceIds() {
      return getTraceIdsSnapshot();
    },
    getLatestReport() {
      return getLatestReportSnapshot();
    },
    getReport(traceId: string) {
      return getReportSnapshot(traceId);
    },
    clear() {
      events.length = 0;
      reports.clear();
      traceByRequest.clear();
      traceByRemote.clear();
      consoleReportedTraceIds.clear();
      latestTraceId = undefined;
      runtimeDiagnosticsEnabled = false;
      effectiveMaxEvents = configuredMaxEvents;
      browserGlobalScope = undefined;
      lastRuntimeOrigin = undefined;
    },
    markComponentLoaded(markOptions: MarkComponentLoadedOptions = {}) {
      if (options.enabled === false || !runtimeDiagnosticsEnabled) {
        return undefined;
      }

      const traceId =
        markOptions.traceId ||
        (markOptions.requestId
          ? traceByRequest.get(sanitizeRequestId(markOptions.requestId) || '')
          : undefined) ||
        latestTraceId ||
        createTraceId({
          phase: 'component',
          status: 'success',
          requestId: markOptions.requestId,
        });

      return recordEvent(
        {
          traceId,
          phase: 'component',
          status: 'success',
          requestId: markOptions.requestId,
          componentName: markOptions.componentName,
          eventName: COMPONENT_BUSINESS_LOADED_EVENT,
          message: COMPONENT_BUSINESS_LOADED_EVENT,
          source: 'business',
        },
        lastRuntimeOrigin,
      );
    },
  };
}
