import type {
  ModuleFederation,
  RuntimePluginHooks,
} from '@module-federation/runtime';

import { createOpenRuntimeObservabilityAdapter } from './openruntime';
import { createReportManager } from './report/manager';
import type {
  LegacyObservabilityBridgeHookArgs,
  MarkComponentLoadedOptions,
  ObservabilityAfterPreloadRemoteArgs,
  ObservabilityBridgeHookArgs,
  ObservabilityBridgeOperationContext,
  ObservabilityBrowserReader,
  ObservabilityController,
  ObservabilityEvent,
  ObservabilityEventStatus,
  ObservabilityFetch,
  ObservabilityInstanceAPI,
  ObservabilityManifestLoadArgs,
  ObservabilityManifestLoadResultArgs,
  ObservabilityPluginOptions,
  ObservabilityPreloadAssetsArgs,
  ObservabilityReactLike,
  ObservabilityRemoteAfterLoadArgs,
  ObservabilityRemoteBeforeRequestArgs,
  ObservabilityRemoteEntryAfterLoadArgs,
  ObservabilityRemoteEntryLoadArgs,
  ObservabilityRemoteErrorArgs,
  ObservabilityRemoteExposeArgs,
  ObservabilityRemoteFactoryArgs,
  ObservabilityRemoteInitArgs,
  ObservabilityRemoteLoadArgs,
  ObservabilityRemoteMatchArgs,
  ObservabilityRemoteResolveArgs,
  ObservabilityRemoteSnapshotArgs,
  ObservabilityRemoteSnapshotLoadArgs,
  ObservabilityReport,
  ObservabilityReportListOptions,
  ObservabilityReportQuery,
  ObservabilityResourceInfo,
  ObservabilityResourceLoadArgs,
  ObservabilityResourceLoadResultArgs,
  ObservabilityRuntimeAdapterOptions,
  ObservabilityRuntimeEventInput,
  ObservabilityRuntimeOrigin,
  ObservabilityRuntimePlugin,
  ObservabilityRuntimeSharedSelectionResult,
  ObservabilitySharedLifecycleArgs,
  ObservabilitySharedRegistrationArgs,
  ObservabilitySharedResolveArgs,
  ObservabilitySharedScopeInitArgs,
  ObservabilitySnapshotLoadArgs,
  ObservableModuleFederation,
  OnMFRemoteLoaded,
} from './type';
import {
  COMPONENT_BUSINESS_LOADED_EVENT,
  DEFAULT_MAX_EVENTS,
  ON_MF_REMOTE_LOADED_PROP,
  SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON,
  logger,
} from './constant';
import { copyEvent, copyReport } from './report/copy';
import {
  createTraceId,
  getHostRemotesSummary,
  getRemoteEntryKey,
  normalizeScope,
  resolveRemoteFromRequestId,
  shouldRecordEvent,
} from './report/diagnosis';
import { classifyResourceLoadError } from './report/error';
import { normalizeBridgeInfo } from './runtime/bridge';
import { collectLoadedBeforeInfo, getFederationGlobal } from './runtime/global';
import { continuePreloadAssetsGeneration } from './runtime/preload';
import {
  copyComponentStatics,
  getReactComponentName,
  resolveReactComponentTarget,
  resolveReactLike,
} from './runtime/react';
import {
  createRemoteInfo,
  isManifestUrl,
  sanitizeRemote,
} from './runtime/remote';
import { createRuntimeStateManager } from './runtime/state';
import {
  createRuntimeSharedCandidate,
  createRuntimeSharedSelection,
  createSharedConflictInfo,
  createSharedInfo,
  createSharedRegistrationInfo,
  createSharedSingletonConflict,
  getOriginShareScopeMap,
  getRuntimeSharedCandidates,
  getRuntimeSharedVersionEntries,
  getSharedConflictKey,
  getSharedErrorReason,
  getSharedScopes,
  supportsRuntimeObservability,
} from './runtime/shared';
import {
  clipObservabilityMetadata,
  getCollectorUrl,
  getObjectValue,
  getRawStack,
  isRecord,
  normalizeCollectorOptions,
  normalizeDevtoolsOptions,
  normalizeMaxEvents,
  sanitizeRequestId,
  sanitizeText,
  sanitizeUrl,
} from './utils';

export type {
  MFRemoteLoadedOptions,
  MarkComponentLoadedOptions,
  ObservabilityAction,
  ObservabilityActionId,
  ObservabilityBridgeInfo,
  ObservabilityBridgeRouteSummary,
  ObservabilityBridgeState,
  ObservabilityBridgeStatus,
  ObservabilityBrowserMode,
  ObservabilityBrowserReader,
  ObservabilityCapability,
  ObservabilityCapabilityName,
  ObservabilityController,
  ObservabilityErrorSummary,
  ObservabilityEvent,
  ObservabilityEventContext,
  ObservabilityEventSource,
  ObservabilityEventStatus,
  ObservabilityFactReport,
  ObservabilityInstanceAPI,
  ObservabilityInstanceRole,
  ObservabilityLevel,
  ObservabilityLoadedBeforeConsumer,
  ObservabilityLoadedBeforeInfo,
  ObservabilityMetadata,
  ObservabilityMetadataValue,
  ObservabilityModuleInfoEntry,
  ObservabilityModuleInfoSummary,
  ObservabilityOwnerHint,
  ObservabilityPhaseCollection,
  ObservabilityPhaseSummary,
  ObservabilityPluginOptions,
  ObservabilityRawErrorContext,
  ObservabilityRelationshipStatus,
  ObservabilityRemoteInfo,
  ObservabilityReport,
  ObservabilityReportFlags,
  ObservabilityReportListOptions,
  ObservabilityReportOutcome,
  ObservabilityReportQuery,
  ObservabilityReportStatus,
  ObservabilityResourceInfo,
  ObservabilityRuntimeAdapterOptions,
  ObservabilityRuntimeEventInput,
  ObservabilityRuntimeModuleInfo,
  ObservabilityRuntimeOrigin,
  ObservabilityRuntimePlugin,
  ObservabilityRuntimeRelationship,
  ObservabilityRuntimeState,
  ObservabilityRuntimeStateInstance,
  ObservabilityRuntimeStateRemote,
  ObservabilitySharedCandidate,
  ObservabilitySharedConflictInfo,
  ObservabilitySharedConflictVersion,
  ObservabilitySharedInfo,
  ObservabilitySharedRegistration,
  ObservabilitySharedSummary,
  OnMFRemoteLoaded,
} from './type';

export function createObservability(
  rawOptions: ObservabilityPluginOptions = {},
  adapterOptions: ObservabilityRuntimeAdapterOptions = {},
): ObservabilityController {
  const options: ObservabilityPluginOptions = {
    ...rawOptions,
    browser: adapterOptions.fixedBrowserScope
      ? {
          ...rawOptions.browser,
          scope: adapterOptions.fixedBrowserScope,
        }
      : rawOptions.browser,
    react: adapterOptions.disableReact
      ? {
          ...rawOptions.react,
          enabled: false,
          injectLoadedCallback: false,
        }
      : rawOptions.react,
  };
  const pluginName = adapterOptions.pluginName || 'observability-plugin';
  const shouldAttachInstanceApi = adapterOptions.attachInstanceApi !== false;
  const shouldGuardSharedHooksByRuntimeVersion =
    adapterOptions.guardSharedHooksByRuntimeVersion === true;
  const shouldGuardRuntimeHooksByRuntimeVersion =
    adapterOptions.guardRuntimeHooksByRuntimeVersion === true;
  const shouldDisablePreloadHooks = adapterOptions.disablePreloadHooks === true;
  const shouldReturnHookArgs = adapterOptions.returnHookArgs === true;
  const shouldForceDevelopmentChannels =
    adapterOptions.forceDevelopmentChannels === true;
  const returnHookArgs = <T>(args: T): T | undefined =>
    shouldReturnHookArgs ? args : undefined;
  const level = options.level || 'summary';
  const configuredMaxEvents = normalizeMaxEvents(
    options.maxEvents,
    DEFAULT_MAX_EVENTS,
  );
  const bridgeStartTimes = new Map<string, number>();
  const bridgeOperations = new WeakMap<
    object,
    { operationId: string; bridgeId: string }
  >();
  const bridgeContexts = new WeakMap<
    object,
    ObservabilityBridgeOperationContext
  >();
  const bridgeIdsByTarget = new WeakMap<object, string>();
  const bridgeIdsByFallback = new Map<string, string>();
  const latestBridgeOperations = new Map<
    string,
    { operationId: string; bridgeId: string }
  >();
  const resourceStartTimes = new Map<string, number[]>();
  const sharedSelections = new Map<
    string,
    ObservabilityRuntimeSharedSelectionResult
  >();
  let sharedOperationIdsByContext = new WeakMap<object, string>();
  const instanceRefs = new WeakMap<object, string>();
  const instancesByRef = new Map<string, ObservabilityRuntimeOrigin>();
  const lateBoundInstanceRefs = new Set<string>();
  const boundInstanceRefs = new Set<string>();
  const attachedInstanceApis = new WeakMap<object, ObservabilityInstanceAPI>();
  const reportedSharedConflictKeys = new Set<string>();
  const reportedBridgeProviderKeys = new Set<string>();
  const collectorOptions = normalizeCollectorOptions(options.collector);
  const devtoolsOptions = normalizeDevtoolsOptions(options.devtools);
  const seenManifestUrls = new Set<string>();
  const loadingManifestUrls = new Set<string>();
  const seenRemoteEntryKeys = new Set<string>();
  const consoleReportedTraceIds = new Set<string>();
  const consoleReportedStartKeys = new Set<string>();
  let runtimeObservabilityEnabled = false;
  let suppressRuntimeEvents = false;
  let browserGlobalScope: string | undefined;
  let lastRuntimeOrigin: ObservabilityRuntimeOrigin | undefined;
  let appliedRuntimeVersion: string | undefined;
  let instanceRefCounter = 0;
  let sharedOperationCounter = 0;
  let sharedRegistrationCounter = 0;
  let bridgeOperationCounter = 0;
  let bridgeCounter = 0;
  let bridgeObservedAt = 0;
  let historyCleared = false;

  const getActiveRuntimeInstances = () => {
    const federation = getFederationGlobal();
    return Array.isArray(federation?.__INSTANCES__)
      ? federation.__INSTANCES__
      : [];
  };

  const registerRuntimeInstance = (
    origin: ObservabilityRuntimeOrigin,
    lateBound?: boolean,
  ) => {
    const existingRef = instanceRefs.get(origin);
    if (existingRef) {
      return existingRef;
    }

    instanceRefCounter += 1;
    const instanceRef = `mf-${instanceRefCounter}`;
    instanceRefs.set(origin, instanceRef);
    instancesByRef.set(instanceRef, origin);
    if (
      lateBound ??
      getActiveRuntimeInstances().some((instance) => instance === origin)
    ) {
      lateBoundInstanceRefs.add(instanceRef);
    }
    return instanceRef;
  };

  const getInstanceRef = (origin?: ObservabilityRuntimeOrigin) =>
    origin ? registerRuntimeInstance(origin) : undefined;

  const reportManager = createReportManager({
    options,
    configuredMaxEvents,
    getInstanceRef,
    getAppliedRuntimeVersion: () => appliedRuntimeVersion,
  });
  const {
    events,
    resolveTraceId,
    normalizeEvent,
    applyPhaseDuration,
    updateTraceMaps,
    getEventOutcome,
    updateReport,
    getEventsSnapshot,
    getTraceIdsSnapshot,
    getReportsSnapshot,
    findReportsSnapshot,
    getLatestReportSnapshot,
    getReportSnapshot,
    exportReportSnapshot,
  } = reportManager;

  const isEnabled = () => {
    if (options.enabled === false) {
      return false;
    }

    runtimeObservabilityEnabled = true;
    return true;
  };

  const supportsRuntimeHookObservability = (
    origin?: ObservabilityRuntimeOrigin,
  ) =>
    supportsRuntimeObservability({
      ...origin,
      version:
        sanitizeText(origin?.version, 80) ||
        appliedRuntimeVersion ||
        origin?.version,
    } as ObservabilityRuntimeOrigin);

  const shouldSkipRuntimeHook = (origin?: ObservabilityRuntimeOrigin) =>
    shouldGuardRuntimeHooksByRuntimeVersion &&
    !supportsRuntimeHookObservability(origin);

  const supportsManifestResultLifecycle = (
    origin?: ObservabilityRuntimeOrigin,
  ): boolean =>
    Boolean(origin?.snapshotHandler?.hooks?.lifecycle?.afterLoadManifest);

  const supportsSemanticResourceLifecycle = (
    origin?: ObservabilityRuntimeOrigin,
  ): boolean =>
    Boolean(
      supportsManifestResultLifecycle(origin) &&
      origin?.loaderHook?.lifecycle?.afterLoadEntry,
    );

  const runtimeStateManager = createRuntimeStateManager({
    options,
    events,
    instancesByRef,
    lateBoundInstanceRefs,
    boundInstanceRefs,
    getActiveRuntimeInstances,
    registerRuntimeInstance,
    getInstanceRef,
    getBrowserGlobalScope: () => browserGlobalScope,
    getHistoryCleared: () => historyCleared,
    supportsSemanticResourceLifecycle,
  });
  const { getRuntimeStateSnapshot, updateBridgeState } = runtimeStateManager;

  const notifyEvent = (
    event: ObservabilityEvent,
    report: ObservabilityReport,
    origin?: ObservabilityRuntimeOrigin,
  ) => {
    try {
      options.onEvent?.(copyEvent(event), copyReport(report), {
        origin,
        instanceRef: event.instanceRef,
      });
    } catch {
      // Observability callbacks must not affect Module Federation loading.
    }
  };

  const notifyReport = (
    report: ObservabilityReport,
    origin?: ObservabilityRuntimeOrigin,
  ) => {
    if (report.events[report.events.length - 1]?.status === 'start') {
      return;
    }

    try {
      options.onReport?.(copyReport(report), {
        origin,
        instanceRef: report.instanceRef,
      });
    } catch {
      // Observability callbacks must not affect Module Federation loading.
    }
  };

  const notifyRawError = (
    errorValue: unknown,
    event: ObservabilityEvent,
    report: ObservabilityReport,
    origin?: ObservabilityRuntimeOrigin,
  ) => {
    if (!errorValue || !options.onRawError) {
      return;
    }

    try {
      options.onRawError(errorValue, {
        origin,
        instanceRef: event.instanceRef,
        event: copyEvent(event),
        report: copyReport(report),
      });
    } catch {
      // Raw error callbacks must not affect Module Federation loading.
    }
  };

  const notifyCollector = (
    event: ObservabilityEvent,
    report: ObservabilityReport,
  ) => {
    if (!collectorOptions) {
      return;
    }

    const fetcher = (globalThis as { fetch?: ObservabilityFetch }).fetch;
    if (typeof fetcher !== 'function') {
      return;
    }

    try {
      const body = JSON.stringify({
        schemaVersion: 1,
        source: 'browser',
        kind: 'event',
        createdAt: Date.now(),
        event: copyEvent(event),
        report: copyReport(report),
      });

      void fetcher(getCollectorUrl(collectorOptions.port), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body,
        keepalive: body.length <= 64 * 1024,
        credentials: 'omit',
        mode: 'cors',
      }).catch((error) => {
        // The local collector is optional and must not affect MF loading.
        logger.debug('Failed to notify local observability collector.', error);
      });
    } catch (error) {
      // The local collector is optional and must not affect MF loading.
      logger.debug('Failed to notify local observability collector.', error);
    }
  };

  const notifyDevtools = (
    event: ObservabilityEvent,
    report: ObservabilityReport,
  ) => {
    if (!devtoolsOptions) {
      return;
    }

    const poster = (globalThis as { postMessage?: unknown }).postMessage;
    if (typeof poster !== 'function') {
      return;
    }

    try {
      poster.call(
        globalThis,
        {
          schemaVersion: 1,
          source: devtoolsOptions.source,
          kind: 'event',
          createdAt: Date.now(),
          scope: browserGlobalScope || report.hostName,
          event: copyEvent(event),
          report: copyReport(report),
        },
        '*',
      );
    } catch {
      // Browser extension delivery is optional and must not affect MF loading.
    }
  };

  const openRuntimeAdapter = createOpenRuntimeObservabilityAdapter(
    options.openRuntime,
    {
      getReports: getReportsSnapshot,
      findReports: findReportsSnapshot,
      getLatestReport: getLatestReportSnapshot,
      getReport: getReportSnapshot,
      exportReport: exportReportSnapshot,
      getRuntimeState: getRuntimeStateSnapshot,
    },
  );

  const createBrowserReader = (): ObservabilityBrowserReader => ({
    getEvents: getEventsSnapshot,
    getTraceIds: getTraceIdsSnapshot,
    getReports: getReportsSnapshot,
    findReports: findReportsSnapshot,
    getLatestReport: getLatestReportSnapshot,
    getReport: getReportSnapshot,
    exportReport: exportReportSnapshot,
    getRuntimeState: getRuntimeStateSnapshot,
  });

  const shouldExposeBrowserGlobal = () => options.browser?.enabled === true;

  const ensureBrowserGlobal = (origin?: ObservabilityRuntimeOrigin) => {
    if (!shouldExposeBrowserGlobal()) {
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

    const readers = federationGlobal.__OBSERVABILITY__ || {};
    federationGlobal.__OBSERVABILITY__ = readers;
    browserGlobalScope = scope;

    try {
      Object.defineProperty(readers, scope, {
        value: reader,
        configurable: true,
        enumerable: true,
      });
    } catch {
      readers[scope] = reader;
    }
  };

  const shouldUseConsole = () => options.console !== false;

  const shouldUseDevelopmentChannels = () => {
    if (shouldUseMinimalBrowserConsole()) {
      return false;
    }

    if (shouldForceDevelopmentChannels) {
      return true;
    }

    if (typeof process === 'undefined' || !process.env) {
      return true;
    }

    return process.env['NODE_ENV'] !== 'production';
  };

  const shouldNotifyCollector = () => Boolean(collectorOptions);

  const shouldNotifyDevtools = () => shouldUseDevelopmentChannels();

  const shouldUseMinimalBrowserConsole = () =>
    options.browser?.mode === 'production';

  const shouldUseStartTrace = () =>
    options.trace?.printStart ??
    (options.browser?.enabled === true && !shouldUseMinimalBrowserConsole());

  const shouldPrintStartConsole = (event: ObservabilityEvent) =>
    shouldUseStartTrace() &&
    event.status === 'start' &&
    (event.phase === 'loadRemote' || event.phase === 'shared') &&
    shouldUseConsole();

  const shouldRecordStartTrace = (input: ObservabilityRuntimeEventInput) =>
    shouldUseStartTrace() &&
    input.status === 'start' &&
    (input.phase === 'loadRemote' || input.phase === 'shared');

  const shouldCollectLoadedBefore = (error?: unknown) =>
    Boolean(error) ||
    (level === 'verbose' && !shouldUseMinimalBrowserConsole());

  const getBrowserReadCommand = (traceId: string) => {
    if (!browserGlobalScope) {
      return undefined;
    }

    return `window.__FEDERATION__.__OBSERVABILITY__[${JSON.stringify(
      browserGlobalScope,
    )}].getReport(${JSON.stringify(traceId)})`;
  };

  const emitConsoleHint = (
    event: ObservabilityEvent,
    report: ObservabilityReport,
    rawError?: unknown,
  ) => {
    if (
      getEventOutcome(event) !== 'error' ||
      !shouldUseConsole() ||
      consoleReportedTraceIds.has(report.traceId)
    ) {
      return;
    }

    consoleReportedTraceIds.add(report.traceId);

    if (shouldUseMinimalBrowserConsole()) {
      const lines = [
        '[Module Federation] Observability report generated',
        `traceId: ${report.traceId}`,
      ];

      if (report.errorCode) {
        lines.push(`errorCode: ${report.errorCode}`);
      }

      try {
        console.error(lines.join('\n'));
      } catch {
        // Console output is best-effort observability only.
      }
      return;
    }

    const lines = [
      '[Module Federation] Observability report generated',
      `traceId: ${report.traceId}`,
      `phase: ${report.failedPhase || event.phase}`,
    ];

    if (report.requestId) {
      lines.push(`requestId: ${report.requestId}`);
    }
    if (report.requestAlias) {
      lines.push(`requestAlias: ${report.requestAlias}`);
    }
    if (report.errorCode) {
      lines.push(`errorCode: ${report.errorCode}`);
    }
    if (report.shared?.name) {
      lines.push(`shared: ${report.shared.name}`);
    }

    const browserReadCommand = getBrowserReadCommand(report.traceId);
    if (browserReadCommand) {
      lines.push(`read: ${browserReadCommand}`);
    } else {
      lines.push('read: enable browser output or use onReport(report)');
    }

    const rawStack = getRawStack(rawError);
    if (options.printRawStack === true && rawStack) {
      lines.push('rawStack:', rawStack);
    }

    try {
      console.error(lines.join('\n'));
    } catch {
      // Console output is best-effort observability only.
    }
  };

  const emitStartConsoleHint = (
    event: ObservabilityEvent,
    report: ObservabilityReport,
  ) => {
    if (!shouldPrintStartConsole(event)) {
      return;
    }

    const startKey = [
      event.traceId,
      event.phase,
      event.requestId || event.shared?.name || event.remote?.name || '',
      event.lifecycle || '',
    ].join('|');
    if (consoleReportedStartKeys.has(startKey)) {
      return;
    }
    consoleReportedStartKeys.add(startKey);

    const lines = [
      '[Module Federation] Observability trace started',
      `traceId: ${report.traceId}`,
      `phase: ${event.phase}`,
    ];

    if (event.requestId) {
      lines.push(`requestId: ${event.requestId}`);
    }
    if (event.requestAlias) {
      lines.push(`requestAlias: ${event.requestAlias}`);
    }
    if (event.remote?.name) {
      lines.push(`remote: ${event.remote.name}`);
    }
    if (event.shared?.name) {
      lines.push(`shared: ${event.shared.name}`);
    }
    if (event.lifecycle) {
      lines.push(`lifecycle: ${event.lifecycle}`);
    }

    const browserReadCommand = getBrowserReadCommand(report.traceId);
    if (browserReadCommand) {
      lines.push(`read: ${browserReadCommand}`);
    } else {
      lines.push(
        'read: enable browser output or use getReports({ limit: 10 })',
      );
    }

    try {
      console.info(lines.join('\n'));
    } catch {
      // Console output is best-effort observability only.
    }
  };

  const prepareOutputChannels = (origin: ObservabilityRuntimeOrigin) => {
    browserGlobalScope = undefined;
    ensureBrowserGlobal(origin);
  };

  const prepareRuntimeOrigin = (origin: ObservabilityRuntimeOrigin) => {
    if (!isEnabled()) {
      return false;
    }

    lastRuntimeOrigin = origin;
    registerRuntimeInstance(origin);
    prepareOutputChannels(origin);
    return true;
  };

  const recordEvent = (
    input: ObservabilityRuntimeEventInput,
    origin?: ObservabilityRuntimeOrigin,
  ) => {
    if (suppressRuntimeEvents) {
      return undefined;
    }

    const effectiveInput = {
      ...input,
      instanceRef: input.instanceRef || getInstanceRef(origin),
    };
    const traceId = resolveTraceId(effectiveInput);
    const event = normalizeEvent(effectiveInput, traceId, origin);
    applyPhaseDuration(event);
    updateTraceMaps(event);

    if (
      !shouldRecordEvent(level, effectiveInput) &&
      !shouldRecordStartTrace(effectiveInput)
    ) {
      return undefined;
    }

    events.push(event);
    const report = updateReport(event);
    openRuntimeAdapter?.syncReport(report, {
      origin,
      instanceRef: event.instanceRef,
    });
    emitStartConsoleHint(event, report);
    emitConsoleHint(event, report, input.error);
    if (shouldNotifyCollector()) {
      notifyCollector(event, report);
    }
    if (shouldNotifyDevtools()) {
      notifyDevtools(event, report);
    }
    notifyRawError(effectiveInput.error, event, report, origin);
    notifyEvent(event, report, origin);
    notifyReport(report, origin);
    return event;
  };

  const markComponentLoadedFor = (
    markOptions: MarkComponentLoadedOptions = {},
    origin?: ObservabilityRuntimeOrigin,
  ) => {
    if (options.enabled === false || !runtimeObservabilityEnabled) {
      return undefined;
    }

    const instanceRef = getInstanceRef(origin);
    const traceId =
      markOptions.traceId ||
      reportManager.getTraceIdForRequest(
        instanceRef,
        sanitizeRequestId(markOptions.requestId),
      ) ||
      reportManager.getLatestTraceId(instanceRef) ||
      createTraceId({
        phase: 'component',
        status: 'success',
        requestId: markOptions.requestId,
      });

    return recordEvent(
      {
        traceId,
        instanceRef,
        phase: 'component',
        status: 'success',
        requestId: markOptions.requestId,
        componentName: markOptions.componentName,
        metadata: markOptions.metadata,
        eventName: COMPONENT_BUSINESS_LOADED_EVENT,
        message: COMPONENT_BUSINESS_LOADED_EVENT,
        source: 'business',
      },
      origin,
    );
  };

  const markComponentLoaded = (markOptions: MarkComponentLoadedOptions = {}) =>
    markComponentLoadedFor(markOptions, lastRuntimeOrigin);

  const getReactForOrigin = async (
    origin: ObservabilityRuntimeOrigin,
  ): Promise<ObservabilityReactLike | undefined> => {
    const previousSuppressRuntimeEvents = suppressRuntimeEvents;
    suppressRuntimeEvents = true;
    try {
      let reactFactory: false | (() => unknown) | undefined;
      try {
        reactFactory = origin.loadShareSync?.('react');
      } catch {
        reactFactory = undefined;
      }

      if (typeof reactFactory !== 'function') {
        reactFactory = await origin.loadShare?.('react');
      }

      if (typeof reactFactory !== 'function') {
        return undefined;
      }

      return resolveReactLike(reactFactory());
    } catch {
      return undefined;
    } finally {
      suppressRuntimeEvents = previousSuppressRuntimeEvents;
    }
  };

  const getReactWrapPolicy = (loadArgs: ObservabilityRemoteLoadArgs) => {
    if (
      options.react?.enabled === false ||
      options.react?.injectLoadedCallback !== true
    ) {
      return undefined;
    }

    const remoteIds = options.react.remoteIds || [];
    if (!remoteIds.length) {
      return {
        allowAnonymousComponent: false,
      };
    }

    const normalizeRemoteId = (value: string) =>
      value.replace(/\/\.\//g, '/').replace(/^\.\//, '');
    const expectedRemoteIds = new Set(remoteIds.map(normalizeRemoteId));
    const candidates = new Set<string>();
    const addCandidate = (value: string | undefined) => {
      if (!value) {
        return;
      }
      candidates.add(value);
      candidates.add(normalizeRemoteId(value));
    };
    const exposeValues = [loadArgs.expose];
    if (loadArgs.expose?.startsWith('./')) {
      exposeValues.push(loadArgs.expose.slice(2));
    }
    const remoteNames = [
      loadArgs.pkgNameOrAlias,
      loadArgs.remote?.alias,
      loadArgs.remote?.name,
    ];

    addCandidate(loadArgs.id);
    addCandidate(loadArgs.expose);
    remoteNames.forEach((remoteName) => {
      exposeValues.forEach((expose) => {
        addCandidate(remoteName && expose ? `${remoteName}/${expose}` : '');
      });
    });

    const matched = Array.from(candidates).some((candidate) =>
      expectedRemoteIds.has(candidate),
    );

    return matched
      ? {
          allowAnonymousComponent: true,
        }
      : undefined;
  };

  const createReactComponentWrapper = (
    component: unknown,
    loadArgs: ObservabilityRemoteLoadArgs,
    wrapPolicy: { allowAnonymousComponent: boolean },
    react: ObservabilityReactLike | undefined,
  ) => {
    const target = resolveReactComponentTarget(
      component,
      options.react?.defaultExportMode ||
        (wrapPolicy.allowAnonymousComponent ? 'component' : 'preserve'),
      wrapPolicy.allowAnonymousComponent,
    );
    if (!target) {
      return undefined;
    }

    const componentName = getReactComponentName(
      target.component,
      loadArgs.expose || loadArgs.id,
    );
    const originalComponent = target.component;

    const ObservedRemoteComponent = (props: Record<string, unknown>) => {
      const incomingProps = isRecord(props) ? props : {};
      const originalLoadedCallback = getObjectValue(
        incomingProps,
        ON_MF_REMOTE_LOADED_PROP,
      );
      const onMFRemoteLoaded: OnMFRemoteLoaded = (loadedOptions = {}) => {
        markComponentLoadedFor(
          {
            requestId: loadArgs.id,
            componentName: loadedOptions.componentName || componentName,
            metadata: loadedOptions.metadata,
          },
          loadArgs.origin,
        );

        if (typeof originalLoadedCallback === 'function') {
          (originalLoadedCallback as OnMFRemoteLoaded)(loadedOptions);
        }
      };

      const nextProps = {
        ...incomingProps,
        [ON_MF_REMOTE_LOADED_PROP]: onMFRemoteLoaded,
      };

      if (react) {
        return react.createElement(originalComponent, nextProps);
      }

      return (
        originalComponent as (nextProps: Record<string, unknown>) => unknown
      )(nextProps);
    };

    ObservedRemoteComponent.displayName = `ObservedRemote(${componentName})`;
    copyComponentStatics(
      ObservedRemoteComponent as unknown as Record<string, unknown>,
      originalComponent as unknown as Record<string, unknown>,
    );

    return target.createResult(ObservedRemoteComponent);
  };

  const wrapReactComponent = async (
    component: unknown,
    loadArgs: ObservabilityRemoteLoadArgs,
  ) => {
    const wrapPolicy = getReactWrapPolicy(loadArgs);
    if (!wrapPolicy) {
      return undefined;
    }

    return createReactComponentWrapper(
      component,
      loadArgs,
      wrapPolicy,
      await getReactForOrigin(loadArgs.origin),
    );
  };

  const wrapReactComponentFactory = async (
    factory: unknown,
    loadArgs: ObservabilityRemoteLoadArgs,
  ) => {
    const wrapPolicy = getReactWrapPolicy(loadArgs);
    if (!wrapPolicy || typeof factory !== 'function') {
      return undefined;
    }

    const react = await getReactForOrigin(loadArgs.origin);
    const originalFactory = factory as (...args: unknown[]) => unknown;

    return (...factoryArgs: unknown[]) => {
      const moduleOrPromise = originalFactory(...factoryArgs);
      if (
        moduleOrPromise &&
        typeof (moduleOrPromise as Promise<unknown>).then === 'function'
      ) {
        return (moduleOrPromise as Promise<unknown>).then((module) => {
          return (
            createReactComponentWrapper(module, loadArgs, wrapPolicy, react) ||
            module
          );
        });
      }

      return (
        createReactComponentWrapper(
          moduleOrPromise,
          loadArgs,
          wrapPolicy,
          react,
        ) || moduleOrPromise
      );
    };
  };

  const resolveBridgeHookArgs = (
    args: ObservabilityBridgeHookArgs,
    signal: 'start' | 'result',
    origin: ObservabilityRuntimeOrigin,
  ): LegacyObservabilityBridgeHookArgs | undefined => {
    const hookArgs = args as unknown as Record<string, unknown>;
    if (
      typeof hookArgs.operationId === 'string' &&
      typeof hookArgs.bridgeId === 'string'
    ) {
      return args as LegacyObservabilityBridgeHookArgs;
    }

    const context = (isRecord(hookArgs.context)
      ? hookArgs.context
      : hookArgs) as unknown as ObservabilityBridgeOperationContext;
    if (!context || !context.side || !context.framework || !context.operation) {
      return undefined;
    }

    const operationKey = context;
    const target =
      typeof context.target === 'object' && context.target !== null
        ? context.target
        : undefined;
    const fallbackKey = [
      getInstanceRef(origin) || '',
      context.side,
      context.framework,
      context.moduleName || '',
    ].join('\u0000');
    let bridgeId = target
      ? bridgeIdsByTarget.get(target)
      : bridgeIdsByFallback.get(fallbackKey);
    if (!bridgeId) {
      bridgeCounter += 1;
      bridgeId = `bridge-${bridgeCounter}`;
    }
    if (target) {
      bridgeIdsByTarget.set(target, bridgeId);
    }
    bridgeIdsByFallback.set(fallbackKey, bridgeId);

    const operationLookupKey = [
      getInstanceRef(origin) || '',
      bridgeId,
      context.side,
      context.operation,
    ].join('\u0000');
    let operation =
      bridgeOperations.get(operationKey) ||
      (signal === 'start'
        ? undefined
        : latestBridgeOperations.get(operationLookupKey));
    if (!operation || signal === 'start') {
      bridgeOperationCounter += 1;
      operation = {
        operationId: `bridge-op-${bridgeOperationCounter}`,
        bridgeId,
      };
      bridgeOperations.set(operationKey, operation);
      latestBridgeOperations.set(operationLookupKey, operation);
    }

    const error = signal === 'result' ? hookArgs.error : undefined;
    const result = signal === 'result' ? hookArgs.result : undefined;
    const isSkippedNavigation =
      context.operation === 'route-sync' &&
      isRecord(result) &&
      typeof result.type === 'number' &&
      isRecord(result.to) &&
      isRecord(result.from);
    const outcome =
      signal !== 'result'
        ? undefined
        : error !== undefined
          ? 'error'
          : (context.operation === 'destroy' && result === false) ||
              isSkippedNavigation
            ? 'skipped'
            : 'success';

    return {
      operationId: operation.operationId,
      bridgeId: operation.bridgeId,
      side: context.side,
      framework: context.framework,
      operation: context.operation,
      moduleName: context.moduleName,
      route: context.route,
      reason: context.reason,
      outcome,
      error,
    };
  };

  const completeBridgeContext = (
    rawContext: object,
    args: Record<string, unknown>,
  ): ObservabilityBridgeOperationContext => {
    const context =
      bridgeContexts.get(rawContext) ||
      ({
        ...(rawContext as ObservabilityBridgeOperationContext),
      } as ObservabilityBridgeOperationContext);
    const target = args.dom;
    const moduleName = args.moduleName || args.name;

    if (!context.target && typeof target === 'object' && target !== null) {
      context.target = target;
    }
    if (!context.moduleName && typeof moduleName === 'string') {
      context.moduleName = moduleName;
    }
    bridgeContexts.set(rawContext, context);
    return context;
  };

  const recordBridgeSignal = (
    args: ObservabilityBridgeHookArgs,
    signal: 'start' | 'result',
  ) => {
    const origin = args.origin || lastRuntimeOrigin;
    if (!origin || !prepareRuntimeOrigin(origin)) {
      return;
    }
    const bridgeArgs = resolveBridgeHookArgs(args, signal, origin);
    if (!bridgeArgs) {
      return;
    }
    const timingKey = [
      getInstanceRef(origin) || '',
      bridgeArgs.operationId,
      bridgeArgs.side,
      bridgeArgs.operation,
    ].join('\u0000');
    const observedAt = Math.max(Date.now(), bridgeObservedAt + 1);
    bridgeObservedAt = observedAt;
    const legacyStartedAt = bridgeArgs.startedAt;
    const legacyEndedAt = bridgeArgs.endedAt;
    const startedAt =
      signal === 'start'
        ? typeof legacyStartedAt === 'number' &&
          Number.isFinite(legacyStartedAt)
          ? legacyStartedAt
          : observedAt
        : bridgeStartTimes.get(timingKey) ||
          (typeof legacyStartedAt === 'number' &&
          Number.isFinite(legacyStartedAt)
            ? legacyStartedAt
            : observedAt);
    if (signal === 'start') {
      bridgeStartTimes.set(timingKey, startedAt);
    }
    const endedAt =
      signal === 'result'
        ? typeof legacyEndedAt === 'number' && Number.isFinite(legacyEndedAt)
          ? legacyEndedAt
          : observedAt
        : undefined;
    const bridge = normalizeBridgeInfo(bridgeArgs, {
      startedAt,
      endedAt,
      duration:
        endedAt === undefined ? undefined : Math.max(0, endedAt - startedAt),
    });
    if (!bridge) {
      return;
    }
    if (signal === 'result') {
      bridgeStartTimes.delete(timingKey);
    }
    updateBridgeState(origin, bridge, signal);
    const remote = bridge.remote ? { name: bridge.remote } : undefined;
    const status: ObservabilityEventStatus =
      signal === 'start'
        ? 'start'
        : bridge.outcome === 'error'
          ? 'error'
          : bridge.outcome === 'skipped'
            ? 'complete'
            : 'success';
    const phase =
      bridge.operation === 'destroy'
        ? 'bridge-destroy'
        : bridge.operation === 'route-sync'
          ? 'bridge-route'
          : 'bridge-render';
    const operationLabel =
      bridge.operation === 'update' ? 'update' : bridge.operation;
    const message =
      signal === 'start'
        ? `bridge:${operationLabel}-start`
        : `bridge:${operationLabel}-${bridge.outcome || 'success'}`;
    const instanceRef = getInstanceRef(origin);

    if (
      signal === 'start' &&
      bridge.side === 'consumer' &&
      bridge.operation === 'render' &&
      instanceRef
    ) {
      const providerKey = `${instanceRef}\u0000${bridge.bridgeId}`;
      if (!reportedBridgeProviderKeys.has(providerKey)) {
        reportedBridgeProviderKeys.add(providerKey);
        recordEvent(
          {
            phase: 'bridge-provider',
            status: 'success',
            remote,
            expose: bridge.expose,
            bridge,
            lifecycle: 'beforeBridgeRender',
            message: 'bridge:provider-acquired',
            source: 'runtime',
          },
          origin,
        );
      }
    }

    recordEvent(
      {
        phase,
        status,
        remote,
        expose: bridge.expose,
        bridge,
        duration: bridge.duration,
        lifecycle:
          signal === 'start'
            ? bridge.operation === 'destroy'
              ? 'beforeBridgeDestroy'
              : 'beforeBridgeRender'
            : bridge.operation === 'destroy'
              ? 'afterBridgeDestroy'
              : bridge.operation === 'route-sync'
                ? 'afterBridgeRouteSync'
                : 'afterBridgeRender',
        message,
        error: bridge.outcome === 'error' ? bridge.error?.message : undefined,
        errorContext:
          bridge.outcome === 'error'
            ? {
                operationId: bridge.operationId,
                bridgeId: bridge.bridgeId,
                side: bridge.side,
                framework: bridge.framework,
                errorName: bridge.error?.name,
              }
            : undefined,
        source: 'runtime',
      },
      origin,
    );
  };

  const recordBridgeResult = (args: ObservabilityBridgeHookArgs) => {
    const hookArgs = args as unknown as Record<string, unknown>;
    const result = hookArgs.result;
    if (
      hookArgs.error === undefined &&
      result &&
      typeof (result as PromiseLike<unknown>).then === 'function'
    ) {
      void Promise.resolve(result).then(
        (value) =>
          recordBridgeSignal(
            {
              ...hookArgs,
              result: value,
            } as ObservabilityBridgeHookArgs,
            'result',
          ),
        (error) =>
          recordBridgeSignal(
            {
              ...hookArgs,
              error,
            } as ObservabilityBridgeHookArgs,
            'result',
          ),
      );
      return;
    }
    recordBridgeSignal(args, 'result');
  };

  const ensureSharedLoadContext = (
    args: ObservabilitySharedLifecycleArgs | ObservabilitySharedResolveArgs,
  ) => {
    const context = args.loadContext || {};
    args.loadContext = context;
    let operationId = sharedOperationIdsByContext.get(context);
    if (!operationId) {
      sharedOperationCounter += 1;
      operationId = `shared-op-${sharedOperationCounter}`;
      sharedOperationIdsByContext.set(context, operationId);
    }
    return {
      ...context,
      operationId,
    };
  };

  const getSharedOperationId = (
    args: ObservabilitySharedLifecycleArgs | ObservabilitySharedResolveArgs,
  ) => ensureSharedLoadContext(args).operationId!;

  const getCompletedSharedSelection = (
    args: ObservabilitySharedLifecycleArgs,
  ) => {
    const context = ensureSharedLoadContext(args);
    let selection = sharedSelections.get(context.operationId!);
    const scope =
      selection?.scope || getSharedScopes(args.shareInfo)[0] || 'default';
    const requiredVersion = args.shareInfo?.shareConfig?.requiredVersion;

    if (
      args.selectedShared &&
      (!selection?.selected || args.selectedShared === args.shareInfo)
    ) {
      const selectedVersion = args.selectedShared.version || '0';
      const selected = createRuntimeSharedCandidate(
        scope,
        selectedVersion,
        args.selectedShared,
        requiredVersion,
      );
      selection = {
        ...selection,
        scope,
        requestedVersion: args.shareInfo?.version,
        requiredVersion,
        singleton: args.shareInfo?.shareConfig?.singleton,
        strictVersion: args.shareInfo?.shareConfig?.strictVersion,
        eager: args.shareInfo?.shareConfig?.eager,
        strategy: args.shareInfo?.strategy,
        candidates: getRuntimeSharedCandidates({
          shareScopeMap: args.shareScopeMap,
          scope,
          pkgName: args.pkgName,
          requiredVersion,
        }),
        selected,
        reason: 'local-fallback',
        failureReason: undefined,
        fallback: true,
      };
    }

    if (!selection) {
      const candidates = getRuntimeSharedCandidates({
        shareScopeMap: args.shareScopeMap,
        scope,
        pkgName: args.pkgName,
        requiredVersion,
      });
      const failureReason = getSharedErrorReason(args);
      selection = {
        scope,
        requestedVersion: args.shareInfo?.version,
        requiredVersion,
        singleton: args.shareInfo?.shareConfig?.singleton,
        strictVersion: args.shareInfo?.shareConfig?.strictVersion,
        eager: args.shareInfo?.shareConfig?.eager,
        strategy: args.shareInfo?.strategy,
        candidates,
        reason:
          failureReason ||
          (args.selectedShared ? 'exact-match' : 'missing-provider'),
        failureReason,
      };
    }

    selection = {
      ...selection,
      loadType: args.lifecycle === 'loadShareSync' ? 'sync' : 'async',
      context,
      recovered: args.recovered || selection.recovered,
    };
    sharedSelections.delete(context.operationId!);
    return selection;
  };

  const recordResourceStart = (resourceArgs: ObservabilityResourceLoadArgs) => {
    if (!prepareRuntimeOrigin(resourceArgs.origin)) {
      return;
    }

    const timingKey = [
      getInstanceRef(resourceArgs.origin) || '',
      resourceArgs.id,
      resourceArgs.initiator,
      resourceArgs.resourceType,
      resourceArgs.url,
    ].join('\u0000');
    const startedAt = Date.now();
    const pendingStarts = resourceStartTimes.get(timingKey) || [];
    pendingStarts.push(startedAt);
    resourceStartTimes.set(timingKey, pendingStarts);
    const remote = createRemoteInfo(resourceArgs.remote);
    const phase =
      resourceArgs.resourceType === 'manifest' ||
      resourceArgs.resourceType === 'remoteEntry'
        ? resourceArgs.resourceType
        : 'preload';
    recordEvent(
      {
        phase,
        status: 'start',
        requestId: resourceArgs.id,
        remote,
        expose: resourceArgs.expose,
        url: resourceArgs.url,
        timestamp: startedAt,
        lifecycle: resourceArgs.lifecycle,
        message: `resource:${resourceArgs.resourceType}:load-start`,
        resource: {
          type: resourceArgs.resourceType,
          initiator: resourceArgs.initiator,
          url: resourceArgs.url,
          startedAt,
        },
      },
      resourceArgs.origin,
    );
  };

  const recordResourceResult = (
    resourceArgs: ObservabilityResourceLoadResultArgs,
  ) => {
    if (!prepareRuntimeOrigin(resourceArgs.origin)) {
      return;
    }

    const timingKey = [
      getInstanceRef(resourceArgs.origin) || '',
      resourceArgs.id,
      resourceArgs.initiator,
      resourceArgs.resourceType,
      resourceArgs.url,
    ].join('\u0000');
    const startedAt = resourceStartTimes.get(timingKey)?.shift() || Date.now();
    const endedAt = Date.now();
    if (resourceStartTimes.get(timingKey)?.length === 0) {
      resourceStartTimes.delete(timingKey);
    }
    const remote = createRemoteInfo(resourceArgs.remote);
    const phase =
      resourceArgs.resourceType === 'manifest' ||
      resourceArgs.resourceType === 'remoteEntry'
        ? resourceArgs.resourceType
        : 'preload';
    const response = resourceArgs.response;
    const httpStatus =
      resourceArgs.httpStatus ??
      (typeof response?.status === 'number' ? response.status : undefined);
    let mimeType = resourceArgs.mimeType;
    if (!mimeType && typeof response?.headers?.get === 'function') {
      try {
        mimeType = response.headers.get('content-type') || undefined;
      } catch {
        // Ignore custom response header access failures.
      }
    }
    const redirected =
      resourceArgs.redirected ??
      (typeof response?.redirected === 'boolean'
        ? response.redirected
        : undefined);
    const rawOutcome =
      resourceArgs.outcome === 'success' &&
      typeof httpStatus === 'number' &&
      httpStatus >= 400
        ? 'error'
        : resourceArgs.outcome;
    const resourceError =
      resourceArgs.error ||
      (rawOutcome === 'error' && typeof httpStatus === 'number'
        ? new Error(`Resource request failed with HTTP status ${httpStatus}.`)
        : undefined);
    const normalizedResourceArgs = {
      ...resourceArgs,
      outcome: rawOutcome,
      httpStatus,
      mimeType,
      redirected,
      error: resourceError,
    };
    const errorType = classifyResourceLoadError(normalizedResourceArgs);
    const outcome =
      rawOutcome === 'error' && errorType === 'timeout'
        ? 'timeout'
        : rawOutcome;
    const isError = outcome === 'error' || outcome === 'timeout';
    const status: ObservabilityEventStatus =
      outcome === 'recovered' ? 'complete' : isError ? 'error' : 'success';
    const duration = Math.max(0, endedAt - startedAt);
    const resource: ObservabilityResourceInfo = {
      type: resourceArgs.resourceType,
      initiator: resourceArgs.initiator,
      outcome,
      url: resourceArgs.url,
      startedAt,
      endedAt,
      duration,
      httpStatus,
      mimeType,
      redirected,
      cacheSource: resourceArgs.cacheSource,
      errorType,
    };

    recordEvent(
      {
        phase,
        status,
        requestId: resourceArgs.id,
        remote,
        expose: resourceArgs.expose,
        url: resourceArgs.url,
        timestamp: endedAt,
        duration,
        lifecycle: resourceArgs.lifecycle,
        message: `resource:${resourceArgs.resourceType}:${outcome}`,
        error: isError || outcome === 'recovered' ? resourceError : undefined,
        recovered: outcome === 'recovered',
        cached: outcome === 'cached',
        resource,
        errorContext:
          isError || outcome === 'recovered'
            ? {
                resourceType: resourceArgs.resourceType,
                initiator: resourceArgs.initiator,
                outcome,
                errorType,
                httpStatus,
              }
            : undefined,
        metadata: clipObservabilityMetadata({
          resourceType: resourceArgs.resourceType,
          initiator: resourceArgs.initiator,
          outcome,
          httpStatus,
          mimeType,
          redirected,
          cacheSource: resourceArgs.cacheSource,
          errorType,
        }),
      },
      resourceArgs.origin,
    );
  };

  const recordSharedRegistration = (
    registrationArgs: ObservabilitySharedRegistrationArgs,
    lifecycle: 'afterRegisterShare' | 'initContainerShareScopeMap',
  ): void => {
    sharedRegistrationCounter += 1;
    const sharedInfo = createSharedRegistrationInfo(
      registrationArgs,
      `shared-register-${sharedRegistrationCounter}`,
    );
    const registration = sharedInfo.registration;
    recordEvent(
      {
        phase: 'shared-registration',
        status: 'success',
        requestId: registration?.registrationId,
        lifecycle,
        shared: sharedInfo,
        message: `shared:registration-${registration?.action || 'unknown'}`,
        metadata: {
          scope: registration?.scope || registrationArgs.scope,
          action: registration?.action || 'unknown',
          reason: registration?.reason || 'unknown',
          trigger: registration?.trigger || registrationArgs.trigger,
        },
      },
      registrationArgs.origin,
    );
  };

  const legacyHooks: RuntimePluginHooks = {
    beforeBridgeRender(args, context) {
      if (context) {
        recordBridgeSignal(
          {
            context: completeBridgeContext(context, args),
            origin: (args as unknown as ObservabilityBridgeHookArgs).origin,
          } as ObservabilityBridgeHookArgs,
          'start',
        );
      }
      return returnHookArgs(args);
    },
    afterBridgeRender(args, result) {
      if (result) {
        recordBridgeResult({
          ...result,
          context: completeBridgeContext(result.context, args),
          origin: (args as unknown as ObservabilityBridgeHookArgs).origin,
        } as ObservabilityBridgeHookArgs);
      }
      return returnHookArgs(args);
    },
    beforeBridgeDestroy(args, context) {
      if (context) {
        recordBridgeSignal(
          {
            context: completeBridgeContext(context, args),
            origin: (args as unknown as ObservabilityBridgeHookArgs).origin,
          } as ObservabilityBridgeHookArgs,
          'start',
        );
      }
      return returnHookArgs(args);
    },
    afterBridgeDestroy(args, result) {
      if (result) {
        recordBridgeResult({
          ...result,
          context: completeBridgeContext(result.context, args),
          origin: (args as unknown as ObservabilityBridgeHookArgs).origin,
        } as ObservabilityBridgeHookArgs);
      }
      return returnHookArgs(args);
    },
    afterBridgeRouteSync(args) {
      recordBridgeResult(args as ObservabilityBridgeHookArgs);
    },
    beforeLoadManifest(args) {
      const manifestArgs = args as ObservabilityManifestLoadArgs;
      recordResourceStart({
        origin: manifestArgs.origin,
        id:
          manifestArgs.resourceOptions?.id ||
          manifestArgs.moduleInfo.name ||
          manifestArgs.manifestUrl,
        initiator:
          manifestArgs.resourceOptions?.initiator || ('loadRemote' as const),
        resourceType: 'manifest',
        url: manifestArgs.manifestUrl,
        remote: manifestArgs.moduleInfo,
        expose: manifestArgs.resourceOptions?.expose,
        lifecycle: 'beforeLoadManifest',
      });
    },
    afterLoadManifest(args) {
      const manifestArgs = args as ObservabilityManifestLoadResultArgs;
      const outcome = manifestArgs.cached
        ? 'cached'
        : manifestArgs.error
          ? manifestArgs.recovered
            ? 'recovered'
            : 'error'
          : 'success';
      loadingManifestUrls.delete(manifestArgs.manifestUrl);
      if (outcome !== 'error') {
        seenManifestUrls.add(manifestArgs.manifestUrl);
      }
      recordResourceResult({
        origin: manifestArgs.origin,
        id:
          manifestArgs.resourceOptions?.id ||
          manifestArgs.moduleInfo.name ||
          manifestArgs.manifestUrl,
        initiator:
          manifestArgs.resourceOptions?.initiator || ('loadRemote' as const),
        resourceType: 'manifest',
        url: manifestArgs.manifestUrl,
        remote: manifestArgs.moduleInfo,
        expose: manifestArgs.resourceOptions?.expose,
        outcome,
        response: manifestArgs.response,
        cacheSource: manifestArgs.cached ? 'mf-memory' : undefined,
        error: manifestArgs.error,
        lifecycle: 'afterLoadManifest',
      });
    },
    beforeRequest(args) {
      const requestArgs = args as ObservabilityRemoteBeforeRequestArgs;
      if (!prepareRuntimeOrigin(requestArgs.origin)) {
        return returnHookArgs(args);
      }

      const remote = resolveRemoteFromRequestId(
        requestArgs.id,
        requestArgs.options,
      );

      recordEvent(
        {
          phase: 'loadRemote',
          status: 'start',
          requestId: requestArgs.id,
          remote,
          lifecycle: 'beforeRequest',
          message: 'remote:load-start',
        },
        requestArgs.origin,
      );

      return returnHookArgs(args);
    },
    afterMatchRemote(args) {
      const matchArgs = args as ObservabilityRemoteMatchArgs;
      if (!prepareRuntimeOrigin(matchArgs.origin)) {
        return;
      }

      const remote = createRemoteInfo(matchArgs.remoteInfo || matchArgs.remote);
      const hostRemotes = getHostRemotesSummary(matchArgs.options);
      recordEvent(
        {
          phase: 'matchRemote',
          status: matchArgs.error ? 'error' : 'success',
          requestId: matchArgs.id,
          lifecycle: 'afterMatchRemote',
          expose: matchArgs.expose,
          remote,
          message: matchArgs.error ? 'remote:match-failed' : 'remote:matched',
          error: matchArgs.error,
          errorContext: hostRemotes
            ? {
                hostRemotes,
              }
            : undefined,
        },
        matchArgs.origin,
      );
    },
    beforeLoadRemoteSnapshot(args) {
      const snapshotArgs = args as ObservabilityRemoteSnapshotArgs;
      prepareRuntimeOrigin(snapshotArgs.origin);
    },
    loadSnapshot(args) {
      if (!isEnabled()) {
        return returnHookArgs(args);
      }

      const snapshotArgs = args as ObservabilitySnapshotLoadArgs;
      const supportsManifestResult = supportsManifestResultLifecycle(
        snapshotArgs.origin,
      );
      const moduleRemote = createRemoteInfo(snapshotArgs.moduleInfo);
      const snapshotRemoteEntry =
        snapshotArgs.remoteSnapshot?.remoteEntry ||
        snapshotArgs.remoteSnapshot?.entry;
      const manifestUrl = isManifestUrl(moduleRemote?.entry)
        ? moduleRemote?.entry
        : isManifestUrl(snapshotRemoteEntry)
          ? snapshotRemoteEntry
          : undefined;
      if (!manifestUrl) {
        return returnHookArgs(args);
      }

      const remote = createRemoteInfo({
        name:
          moduleRemote?.name ||
          sanitizeText(snapshotArgs.remoteSnapshot?.name, 120),
        alias: moduleRemote?.alias,
        entry: manifestUrl,
        entryGlobalName:
          moduleRemote?.entryGlobalName ||
          sanitizeText(snapshotArgs.remoteSnapshot?.entryGlobalName, 120),
        type:
          moduleRemote?.type ||
          sanitizeText(snapshotArgs.remoteSnapshot?.type, 80),
      });

      if (seenManifestUrls.has(manifestUrl)) {
        if (supportsManifestResult) {
          return returnHookArgs(args);
        }
        recordEvent(
          {
            phase: 'manifest',
            status: 'success',
            requestId: manifestUrl,
            remote,
            url: manifestUrl,
            lifecycle: 'loadSnapshot',
            message: 'manifest:cached',
            cached: true,
          },
          lastRuntimeOrigin,
        );

        return returnHookArgs(args);
      }

      if (loadingManifestUrls.has(manifestUrl)) {
        return returnHookArgs(args);
      }

      loadingManifestUrls.add(manifestUrl);

      if (supportsManifestResult) {
        return returnHookArgs(args);
      }

      recordEvent(
        {
          phase: 'manifest',
          status: 'start',
          requestId: manifestUrl,
          remote,
          url: manifestUrl,
          lifecycle: 'loadSnapshot',
          message: 'manifest:load-start',
        },
        lastRuntimeOrigin,
      );

      return returnHookArgs(args);
    },
    loadRemoteSnapshot(args) {
      if (options.enabled === false) {
        return returnHookArgs(args);
      }

      const snapshotArgs = args as ObservabilityRemoteSnapshotLoadArgs;
      if (supportsManifestResultLifecycle(lastRuntimeOrigin)) {
        return returnHookArgs(args);
      }
      if (snapshotArgs.from !== 'manifest') {
        return returnHookArgs(args);
      }

      const manifestUrl =
        sanitizeUrl(snapshotArgs.manifestUrl) ||
        sanitizeUrl(snapshotArgs.moduleInfo?.entry);
      const remote = createRemoteInfo({
        ...snapshotArgs.moduleInfo,
        entry: manifestUrl || snapshotArgs.moduleInfo?.entry,
      });
      const cached = Boolean(manifestUrl && seenManifestUrls.has(manifestUrl));

      recordEvent(
        {
          phase: 'manifest',
          status: 'success',
          requestId: manifestUrl,
          remote,
          url: manifestUrl,
          lifecycle: 'loadRemoteSnapshot',
          message: 'manifest:resolved',
          cached,
        },
        lastRuntimeOrigin,
      );
      if (manifestUrl) {
        loadingManifestUrls.delete(manifestUrl);
        seenManifestUrls.add(manifestUrl);
      }

      return returnHookArgs(args);
    },
    afterResolve(args) {
      const resolveArgs = args as ObservabilityRemoteResolveArgs;
      if (!prepareRuntimeOrigin(resolveArgs.origin)) {
        return returnHookArgs(args);
      }

      const remote = createRemoteInfo(
        resolveArgs.remoteInfo || resolveArgs.remote,
      );
      if (!isManifestUrl(remote?.entry)) {
        return returnHookArgs(args);
      }

      return returnHookArgs(args);
    },
    async onLoad(args) {
      const loadArgs = args as ObservabilityRemoteLoadArgs;
      if (!prepareRuntimeOrigin(loadArgs.origin)) {
        return;
      }

      const wrappedComponent =
        typeof loadArgs.exposeModuleFactory === 'function'
          ? await wrapReactComponentFactory(
              loadArgs.exposeModuleFactory,
              loadArgs,
            )
          : await wrapReactComponent(loadArgs.exposeModule, loadArgs);
      const remote = createRemoteInfo(loadArgs.remote);
      recordEvent(
        {
          phase: 'loadRemote',
          status: 'success',
          requestId: loadArgs.id,
          lifecycle: 'onLoad',
          expose: loadArgs.expose,
          remote,
          message: 'remote:loaded',
          loadedBefore: shouldCollectLoadedBefore()
            ? collectLoadedBeforeInfo(remote, loadArgs.expose, loadArgs.origin)
            : undefined,
        },
        loadArgs.origin,
      );
      if (wrappedComponent) {
        return wrappedComponent;
      }
      return undefined;
    },
    errorLoadRemote(args) {
      const errorArgs = args as ObservabilityRemoteErrorArgs;
      if (
        !prepareRuntimeOrigin(errorArgs.origin) ||
        (errorArgs.lifecycle !== 'onLoad' &&
          errorArgs.lifecycle !== 'beforeRequest' &&
          errorArgs.lifecycle !== 'afterResolve')
      ) {
        return undefined;
      }

      const isManifestError = errorArgs.lifecycle === 'afterResolve';
      if (isManifestError && errorArgs.id) {
        loadingManifestUrls.delete(errorArgs.id);
      }
      const remote = createRemoteInfo(errorArgs.remote);
      recordEvent(
        {
          phase: isManifestError ? 'manifest' : 'loadRemote',
          status: 'error',
          requestId: errorArgs.id,
          lifecycle: errorArgs.lifecycle,
          expose: errorArgs.expose,
          remote,
          url: isManifestError ? errorArgs.id : undefined,
          message: isManifestError
            ? 'manifest:failed'
            : errorArgs.lifecycle
              ? `remote:${errorArgs.lifecycle}:failed`
              : 'remote:failed',
          error: errorArgs.error,
          loadedBefore: collectLoadedBeforeInfo(
            remote,
            errorArgs.expose,
            errorArgs.origin,
          ),
        },
        errorArgs.origin,
      );

      return undefined;
    },
    afterLoadRemote(args) {
      const loadArgs = args as ObservabilityRemoteAfterLoadArgs;
      if (!prepareRuntimeOrigin(loadArgs.origin)) {
        return;
      }

      const remote = createRemoteInfo(loadArgs.remote);
      recordEvent(
        {
          phase: 'loadRemote',
          status: 'complete',
          requestId: loadArgs.id,
          lifecycle: 'afterLoadRemote',
          expose: loadArgs.expose,
          remote,
          message: loadArgs.recovered
            ? 'remote:load-recovered'
            : loadArgs.error
              ? 'remote:load-failed'
              : 'remote:load-complete',
          error: loadArgs.error,
          recovered: loadArgs.recovered,
          loadedBefore: shouldCollectLoadedBefore(loadArgs.error)
            ? collectLoadedBeforeInfo(remote, loadArgs.expose, loadArgs.origin)
            : undefined,
        },
        loadArgs.origin,
      );
    },
    loadEntry(args) {
      const entryArgs = args as ObservabilityRemoteEntryLoadArgs;
      if (
        shouldSkipRuntimeHook(entryArgs.origin) ||
        !prepareRuntimeOrigin(entryArgs.origin)
      ) {
        return;
      }

      const remote = createRemoteInfo(entryArgs.remoteInfo);
      const resourceContext = entryArgs.resourceContext;
      recordResourceStart({
        origin: entryArgs.origin,
        id: resourceContext?.id || remote?.name || 'remoteEntry',
        initiator: resourceContext?.initiator || 'loadRemote',
        resourceType: 'remoteEntry',
        url: resourceContext?.url || remote?.entry || '',
        remote,
        expose: resourceContext?.expose,
        lifecycle: 'loadEntry',
      });
    },
    afterLoadEntry(args) {
      const entryArgs = args as ObservabilityRemoteEntryAfterLoadArgs;
      if (
        shouldSkipRuntimeHook(entryArgs.origin) ||
        !prepareRuntimeOrigin(entryArgs.origin)
      ) {
        return;
      }

      const remote = createRemoteInfo(entryArgs.remoteInfo);
      const remoteEntryKey = getRemoteEntryKey(sanitizeRemote(remote));
      const cached =
        entryArgs.cached === true ||
        Boolean(remoteEntryKey && seenRemoteEntryKeys.has(remoteEntryKey));
      const resourceContext = entryArgs.resourceContext;
      const outcome = entryArgs.recovered
        ? 'recovered'
        : entryArgs.error
          ? 'error'
          : cached
            ? 'cached'
            : 'success';
      recordResourceResult({
        origin: entryArgs.origin,
        id: resourceContext?.id || remote?.name || 'remoteEntry',
        initiator: resourceContext?.initiator || 'loadRemote',
        resourceType: 'remoteEntry',
        url: resourceContext?.url || remote?.entry || '',
        remote,
        expose: resourceContext?.expose,
        outcome,
        cacheSource: outcome === 'cached' ? 'mf-memory' : undefined,
        error: entryArgs.error,
        lifecycle: 'afterLoadEntry',
      });
      if (!entryArgs.error && remoteEntryKey) {
        seenRemoteEntryKeys.add(remoteEntryKey);
      }
    },
    beforeInitRemote(args) {
      const initArgs = args as ObservabilityRemoteInitArgs;
      if (
        shouldSkipRuntimeHook(initArgs.origin) ||
        !prepareRuntimeOrigin(initArgs.origin)
      ) {
        return;
      }

      const remote = createRemoteInfo(initArgs.remoteInfo);
      recordEvent(
        {
          phase: 'remoteEntryInit',
          status: 'start',
          requestId: initArgs.id || remote?.name,
          remote,
          lifecycle: 'beforeInitRemote',
          message: 'remoteEntry:init-start',
        },
        initArgs.origin,
      );
    },
    afterInitRemote(args) {
      const initArgs = args as ObservabilityRemoteInitArgs;
      if (
        shouldSkipRuntimeHook(initArgs.origin) ||
        !prepareRuntimeOrigin(initArgs.origin)
      ) {
        return;
      }

      const remote = createRemoteInfo(initArgs.remoteInfo);
      recordEvent(
        {
          phase: 'remoteEntryInit',
          status: initArgs.error ? 'error' : 'success',
          requestId: initArgs.id || remote?.name,
          remote,
          lifecycle: 'afterInitRemote',
          message: initArgs.error
            ? 'remoteEntry:init-failed'
            : initArgs.cached
              ? 'remoteEntry:init-reused'
              : 'remoteEntry:initialized',
          error: initArgs.error,
          cached: initArgs.cached,
        },
        initArgs.origin,
      );
    },
    beforeGetExpose(args) {
      const exposeArgs = args as ObservabilityRemoteExposeArgs;
      if (
        shouldSkipRuntimeHook(exposeArgs.origin) ||
        !prepareRuntimeOrigin(exposeArgs.origin)
      ) {
        return;
      }

      recordEvent(
        {
          phase: 'expose',
          status: 'start',
          requestId: exposeArgs.id,
          expose: exposeArgs.expose,
          remote: createRemoteInfo(exposeArgs.moduleInfo),
          lifecycle: 'beforeGetExpose',
          message: 'expose:get-start',
        },
        exposeArgs.origin,
      );
    },
    afterGetExpose(args) {
      const exposeArgs = args as ObservabilityRemoteExposeArgs;
      if (
        shouldSkipRuntimeHook(exposeArgs.origin) ||
        !prepareRuntimeOrigin(exposeArgs.origin)
      ) {
        return;
      }

      const remote = createRemoteInfo(exposeArgs.moduleInfo);
      recordEvent(
        {
          phase: 'expose',
          status: exposeArgs.error ? 'error' : 'success',
          requestId: exposeArgs.id,
          expose: exposeArgs.expose,
          remote,
          lifecycle: 'afterGetExpose',
          message: exposeArgs.error ? 'expose:get-failed' : 'expose:resolved',
          error: exposeArgs.error,
          loadedBefore: shouldCollectLoadedBefore(exposeArgs.error)
            ? collectLoadedBeforeInfo(
                remote,
                exposeArgs.expose,
                exposeArgs.origin,
              )
            : undefined,
        },
        exposeArgs.origin,
      );
    },
    beforeExecuteFactory(args) {
      const factoryArgs = args as ObservabilityRemoteFactoryArgs;
      if (
        shouldSkipRuntimeHook(factoryArgs.origin) ||
        !prepareRuntimeOrigin(factoryArgs.origin)
      ) {
        return;
      }

      recordEvent(
        {
          phase: 'moduleFactory',
          status: 'start',
          requestId: factoryArgs.id,
          expose: factoryArgs.expose,
          remote: createRemoteInfo(factoryArgs.moduleInfo),
          lifecycle: 'beforeExecuteFactory',
          message: 'moduleFactory:execute-start',
        },
        factoryArgs.origin,
      );
    },
    afterExecuteFactory(args) {
      const factoryArgs = args as ObservabilityRemoteFactoryArgs;
      if (
        shouldSkipRuntimeHook(factoryArgs.origin) ||
        !prepareRuntimeOrigin(factoryArgs.origin)
      ) {
        return;
      }

      const remote = createRemoteInfo(factoryArgs.moduleInfo);
      recordEvent(
        {
          phase: 'moduleFactory',
          status: factoryArgs.error ? 'error' : 'success',
          requestId: factoryArgs.id,
          expose: factoryArgs.expose,
          remote,
          lifecycle: 'afterExecuteFactory',
          message: factoryArgs.error
            ? 'moduleFactory:execute-failed'
            : 'moduleFactory:executed',
          error: factoryArgs.error,
          loadedBefore: shouldCollectLoadedBefore(factoryArgs.error)
            ? collectLoadedBeforeInfo(
                remote,
                factoryArgs.expose,
                factoryArgs.origin,
              )
            : undefined,
        },
        factoryArgs.origin,
      );
    },
    resolveShare(args) {
      const resolveArgs = args as ObservabilitySharedResolveArgs;
      if (
        (shouldGuardSharedHooksByRuntimeVersion &&
          !supportsRuntimeHookObservability(resolveArgs.origin)) ||
        !resolveArgs.origin ||
        !prepareRuntimeOrigin(resolveArgs.origin)
      ) {
        return args;
      }

      const context = ensureSharedLoadContext(resolveArgs);
      const resolver = resolveArgs.resolver;
      resolveArgs.resolver = () => {
        try {
          const result = resolver();
          sharedSelections.set(
            context.operationId!,
            createRuntimeSharedSelection(resolveArgs, result?.shared),
          );
          return result;
        } catch (error) {
          sharedSelections.set(
            context.operationId!,
            createRuntimeSharedSelection(resolveArgs, undefined, error),
          );
          throw error;
        }
      };

      return resolveArgs as typeof args;
    },
    beforeRegisterShare(args) {
      if (
        shouldGuardSharedHooksByRuntimeVersion &&
        !supportsRuntimeHookObservability(args.origin)
      ) {
        return returnHookArgs(args);
      }

      if (!prepareRuntimeOrigin(args.origin)) {
        return returnHookArgs(args);
      }

      const shareScopeMap = getOriginShareScopeMap(args.origin);
      const hostName =
        sanitizeText(args.origin.options?.name, 120) ||
        sanitizeText(args.origin.name, 120);

      getSharedScopes(args.shared).forEach((scope) => {
        const conflict = createSharedSingletonConflict({
          pkgName: args.pkgName,
          shared: args.shared,
          scope,
          shareScopeMap,
        });

        if (!conflict) {
          return;
        }

        const conflictKey = getSharedConflictKey({
          hostName,
          pkgName: args.pkgName,
          conflict,
        });
        if (reportedSharedConflictKeys.has(conflictKey)) {
          return;
        }
        reportedSharedConflictKeys.add(conflictKey);

        recordEvent(
          {
            phase: 'shared-conflict',
            status: 'complete',
            requestId: `shared:${args.pkgName}`,
            lifecycle: 'beforeRegisterShare',
            shared: createSharedConflictInfo({
              pkgName: args.pkgName,
              shared: args.shared,
              conflict,
            }),
            message: `shared:${SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON}`,
            metadata: {
              scope,
              currentVersion: conflict.currentVersion || '',
              versions: conflict.versions.join(','),
              existingVersions: conflict.existingVersions
                .map((item) => item.version)
                .join(','),
            },
          },
          args.origin,
        );
      });

      return returnHookArgs(args);
    },
    initContainerShareScopeMap(args) {
      const scopeArgs = args as ObservabilitySharedScopeInitArgs;
      if (
        shouldGuardSharedHooksByRuntimeVersion &&
        !supportsRuntimeHookObservability(scopeArgs.origin)
      ) {
        return returnHookArgs(args);
      }

      if (!prepareRuntimeOrigin(scopeArgs.origin)) {
        return returnHookArgs(args);
      }

      const shareScopeMap = getOriginShareScopeMap(scopeArgs.origin);
      Object.entries(scopeArgs.shareScope).forEach(([pkgName, versions]) => {
        getRuntimeSharedVersionEntries(versions).forEach(([, shared]) => {
          recordSharedRegistration(
            {
              pkgName,
              scope: scopeArgs.scopeName,
              shared,
              registeredShared: shared,
              shareScopeMap,
              trigger: 'container-init',
              origin: scopeArgs.origin,
            },
            'initContainerShareScopeMap',
          );
        });
      });

      return returnHookArgs(args);
    },
    afterRegisterShare(args) {
      const registrationArgs = args as ObservabilitySharedRegistrationArgs;
      if (
        shouldGuardSharedHooksByRuntimeVersion &&
        !supportsRuntimeHookObservability(registrationArgs.origin)
      ) {
        return returnHookArgs(args);
      }

      if (!prepareRuntimeOrigin(registrationArgs.origin)) {
        return returnHookArgs(args);
      }

      recordSharedRegistration(registrationArgs, 'afterRegisterShare');

      return returnHookArgs(args);
    },
    beforeLoadShare(args) {
      if (
        shouldGuardSharedHooksByRuntimeVersion &&
        !supportsRuntimeHookObservability(args.origin)
      ) {
        return returnHookArgs(args);
      }

      if (!prepareRuntimeOrigin(args.origin)) {
        return returnHookArgs(args);
      }

      ensureSharedLoadContext(args);
      recordEvent(
        {
          phase: 'shared',
          status: 'start',
          requestId: getSharedOperationId(args),
          lifecycle: 'loadShare',
          shared: createSharedInfo(args),
          message: 'shared:load-start',
        },
        args.origin,
      );

      return returnHookArgs(args);
    },
    afterLoadShare(args) {
      if (
        shouldGuardSharedHooksByRuntimeVersion &&
        !supportsRuntimeHookObservability(args.origin)
      ) {
        return returnHookArgs(args);
      }

      if (!prepareRuntimeOrigin(args.origin)) {
        return returnHookArgs(args);
      }

      const selection = getCompletedSharedSelection(args);
      recordEvent(
        {
          phase: 'shared',
          status: 'success',
          requestId: getSharedOperationId(args),
          lifecycle: args.lifecycle,
          shared: createSharedInfo(args, undefined, selection),
          message:
            args.lifecycle === 'loadShareSync'
              ? 'shared:resolved-sync'
              : 'shared:resolved',
        },
        args.origin,
      );

      return returnHookArgs(args);
    },
    errorLoadShare(args) {
      if (
        shouldGuardSharedHooksByRuntimeVersion &&
        !supportsRuntimeHookObservability(args.origin)
      ) {
        return returnHookArgs(args);
      }

      if (!prepareRuntimeOrigin(args.origin)) {
        return returnHookArgs(args);
      }

      const handledCustomShareMiss = args.recovered === true && !args.error;
      const reason = handledCustomShareMiss
        ? 'custom-share-info-unmatched'
        : getSharedErrorReason(args);
      const selection = getCompletedSharedSelection(args);

      recordEvent(
        {
          phase: 'shared',
          status: handledCustomShareMiss ? 'complete' : 'error',
          requestId: getSharedOperationId(args),
          lifecycle: args.lifecycle,
          shared: createSharedInfo(args, reason, selection),
          message: reason ? `shared:${reason}` : undefined,
          error: handledCustomShareMiss ? undefined : args.error,
          recovered: args.recovered,
        },
        args.origin,
      );

      return returnHookArgs(args);
    },
  };

  if (!shouldDisablePreloadHooks) {
    legacyHooks.generatePreloadAssets = async (args) => {
      const preloadArgs = args as ObservabilityPreloadAssetsArgs;
      if (!prepareRuntimeOrigin(preloadArgs.origin)) {
        return continuePreloadAssetsGeneration();
      }

      const remote = createRemoteInfo(
        preloadArgs.remoteInfo || preloadArgs.remote,
      );
      const preloadConfig = preloadArgs.preloadOptions?.preloadConfig;
      recordEvent(
        {
          phase: 'preload',
          status: 'start',
          requestId:
            remote?.name || sanitizeText(preloadConfig?.nameOrAlias, 160),
          remote,
          lifecycle: 'generatePreloadAssets',
          message: 'preload:assets-ready',
          metadata: clipObservabilityMetadata({
            nameOrAlias: preloadConfig?.nameOrAlias,
            exposes: preloadConfig?.exposes?.join(','),
            resourceCategory: preloadConfig?.resourceCategory,
            share: preloadConfig?.share,
            depsRemote: Array.isArray(preloadConfig?.depsRemote)
              ? 'custom'
              : preloadConfig?.depsRemote,
          }),
        },
        preloadArgs.origin,
      );

      return continuePreloadAssetsGeneration();
    };

    legacyHooks.afterPreloadRemote = (args) => {
      const preloadArgs = args as ObservabilityAfterPreloadRemoteArgs;
      if (!prepareRuntimeOrigin(preloadArgs.origin)) {
        return undefined;
      }

      const results = preloadArgs.results || [];
      if (results.length === 0 && preloadArgs.error) {
        recordEvent(
          {
            phase: 'preload',
            status: 'error',
            requestId: 'preloadRemote',
            lifecycle: 'afterPreloadRemote',
            message: 'preload:failed',
            error: preloadArgs.error,
          },
          preloadArgs.origin,
        );
        return undefined;
      }

      results.forEach((preloadResult) => {
        const remote = createRemoteInfo(
          preloadResult.remoteInfo || preloadResult.remote,
        );
        const requestId =
          sanitizeRequestId(preloadResult.id) ||
          remote?.name ||
          sanitizeText(preloadResult.preloadConfig?.nameOrAlias, 160);

        preloadResult.results?.forEach((assetResult) => {
          const isError =
            assetResult.status === 'error' || assetResult.status === 'timeout';
          recordEvent(
            {
              phase: 'preload',
              status: isError ? 'error' : 'success',
              requestId,
              remote,
              url: assetResult.url,
              cached: assetResult.status === 'cached',
              lifecycle: 'afterPreloadRemote',
              message: `preload:${assetResult.resourceType || 'resource'}:${assetResult.status || 'complete'}`,
              error: isError ? assetResult.error : undefined,
              errorContext: isError
                ? {
                    resourceType: assetResult.resourceType,
                    initiator: assetResult.initiator,
                    status: assetResult.status,
                    id: assetResult.id,
                  }
                : undefined,
              metadata: clipObservabilityMetadata({
                resourceType: assetResult.resourceType,
                initiator: assetResult.initiator,
                status: assetResult.status,
                id: assetResult.id,
                preloadNameOrAlias: preloadResult.preloadConfig?.nameOrAlias,
              }),
            },
            preloadArgs.origin,
          );
        });
      });

      return undefined;
    };
  }

  const createRuntimeHooks = (
    boundInstance?: ModuleFederation,
  ): RuntimePluginHooks => {
    if (!boundInstance) {
      return legacyHooks;
    }

    const boundHooks: Record<string, unknown> = {};
    Object.entries(legacyHooks as Record<string, unknown>).forEach(
      ([lifecycle, handler]) => {
        if (typeof handler !== 'function') {
          return;
        }
        boundHooks[lifecycle] = (...handlerArgs: unknown[]) => {
          const origin = boundInstance as ObservabilityRuntimeOrigin;
          prepareRuntimeOrigin(origin);
          const [firstArg, ...remainingArgs] = handlerArgs;
          const boundFirstArg = isRecord(firstArg)
            ? {
                ...firstArg,
                origin,
              }
            : firstArg;
          return (handler as (...args: unknown[]) => unknown)(
            boundFirstArg,
            ...remainingArgs,
          );
        };
      },
    );
    return boundHooks as RuntimePluginHooks;
  };

  const plugin: ObservabilityRuntimePlugin = {
    name: pluginName,
    apply(instance: ModuleFederation) {
      const origin = instance as ObservabilityRuntimeOrigin;
      registerRuntimeInstance(
        origin,
        getActiveRuntimeInstances().some((item) => item === instance),
      );
      const instanceRef = getInstanceRef(origin);
      if (instanceRef) {
        boundInstanceRefs.add(instanceRef);
      }
      appliedRuntimeVersion =
        sanitizeText(instance.version, 80) || appliedRuntimeVersion;
      if (shouldAttachInstanceApi) {
        let instanceApi = attachedInstanceApis.get(instance);
        if (!instanceApi) {
          instanceApi = {
            markComponentLoaded: (markOptions) =>
              markComponentLoadedFor(markOptions, origin),
          };
          attachedInstanceApis.set(instance, instanceApi);
        }
        (instance as ObservableModuleFederation).markComponentLoaded =
          instanceApi.markComponentLoaded;
      }
      prepareOutputChannels(origin);
      openRuntimeAdapter?.register();
      return createRuntimeHooks(instance);
    },
    ...legacyHooks,
  };

  return {
    plugin,
    getEvents() {
      return getEventsSnapshot();
    },
    getTraceIds() {
      return getTraceIdsSnapshot();
    },
    getReports(options?: ObservabilityReportListOptions) {
      return getReportsSnapshot(options);
    },
    findReports(query?: ObservabilityReportQuery) {
      return findReportsSnapshot(query);
    },
    getLatestReport() {
      return getLatestReportSnapshot();
    },
    getReport(traceId: string) {
      return getReportSnapshot(traceId);
    },
    exportReport(traceId?: string) {
      return exportReportSnapshot(traceId);
    },
    getRuntimeState() {
      return getRuntimeStateSnapshot();
    },
    clear() {
      reportManager.clear();
      latestBridgeOperations.clear();
      bridgeStartTimes.clear();
      resourceStartTimes.clear();
      sharedOperationIdsByContext = new WeakMap<object, string>();
      seenManifestUrls.clear();
      seenRemoteEntryKeys.clear();
      reportedBridgeProviderKeys.clear();
      consoleReportedTraceIds.clear();
      consoleReportedStartKeys.clear();
      bridgeObservedAt = 0;
      runtimeObservabilityEnabled = false;
      browserGlobalScope = undefined;
      lastRuntimeOrigin = undefined;
      historyCleared = true;
    },
    markComponentLoaded,
  };
}
