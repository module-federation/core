import type {
  ObservabilityAction,
  ObservabilityActionId,
  ObservabilityErrorSummary,
  ObservabilityEvent,
  ObservabilityFactReport,
  ObservabilityMetadata,
  ObservabilityOwnerHint,
  ObservabilityPhaseCollection,
  ObservabilityPhaseSummary,
  ObservabilityPluginOptions,
  ObservabilityReport,
  ObservabilityReportListOptions,
  ObservabilityReportOutcome,
  ObservabilityReportQuery,
  ObservabilityRuntimeEventInput,
  ObservabilityRuntimeOrigin,
} from '../type';
import {
  COMPONENT_BUSINESS_LOADED_EVENT,
  DIAGNOSTIC_DOC_LINK_PATTERN,
  MAX_FACT_KEYS,
  RUNTIME_DOC_LINK,
  SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON,
} from '../constant';
import {
  clipMetadata,
  clipObservabilityMetadata,
  clipText,
  getRawText,
  normalizeQueryLimit,
  sanitizeRequestId,
  sanitizeText,
} from '../utils';
import { sanitizeRemote, sanitizeResource } from '../runtime/remote';
import { sanitizeShared } from '../runtime/shared';
import {
  copyBridgeInfo,
  copyEvent,
  copyLoadedBeforeInfo,
  copyReport,
} from './copy';
import {
  createErrorContext,
  createModuleInfoSummary,
  createTraceId,
  getOwnerHint,
  getPhaseDurationKey,
  getResourceErrorType,
  getRetryable,
  resolveAliasRequestId,
} from './diagnosis';
import { getErrorInfo, normalizeEventSource } from './error';

export interface CreateReportManagerOptions {
  options: ObservabilityPluginOptions;
  configuredMaxEvents: number;
  getInstanceRef(origin?: ObservabilityRuntimeOrigin): string | undefined;
  getAppliedRuntimeVersion(): string | undefined;
}

export function createReportManager({
  options,
  configuredMaxEvents,
  getInstanceRef,
  getAppliedRuntimeVersion,
}: CreateReportManagerOptions) {
  const events: ObservabilityEvent[] = [];
  const reports = new Map<string, ObservabilityReport>();
  const latestTraceByInstance = new Map<string, string>();
  const traceByRequest = new Map<string, string>();
  const traceByRemote = new Map<string, string>();
  const traceByBridgeOperation = new Map<string, string>();
  const traceByBridgeId = new Map<string, string>();
  const phaseStartTimes = new Map<string, number>();
  let latestTraceId: string | undefined;
  let effectiveMaxEvents = configuredMaxEvents;

  const getTraceMapKey = (instanceRef: string | undefined, value: string) =>
    `${instanceRef || 'legacy'}\u0000${value}`;

  const resolveTraceId = (event: ObservabilityRuntimeEventInput) => {
    const sanitizedRequestId = sanitizeRequestId(event.requestId);
    const instanceRef = sanitizeText(event.instanceRef, 80);

    if (event.traceId && reports.has(event.traceId)) {
      return event.traceId;
    }

    if (event.status === 'start' && event.phase === 'loadRemote') {
      const traceId = event.traceId || createTraceId(event);
      if (sanitizedRequestId) {
        traceByRequest.set(
          getTraceMapKey(instanceRef, sanitizedRequestId),
          traceId,
        );
      }
      if (event.remote?.name) {
        traceByRemote.set(
          getTraceMapKey(instanceRef, event.remote.name),
          traceId,
        );
      }
      return traceId;
    }

    if (sanitizedRequestId) {
      const traceId = traceByRequest.get(
        getTraceMapKey(instanceRef, sanitizedRequestId),
      );
      if (traceId) {
        return traceId;
      }
    }

    if (event.bridge?.operationId) {
      const traceId = traceByBridgeOperation.get(
        getTraceMapKey(instanceRef, event.bridge.operationId),
      );
      if (traceId) {
        return traceId;
      }
    }
    if (event.bridge?.bridgeId) {
      const traceId = traceByBridgeId.get(
        getTraceMapKey(instanceRef, event.bridge.bridgeId),
      );
      if (traceId) {
        return traceId;
      }
    }
    if (
      event.bridge?.operationId &&
      (event.status === 'start' || event.phase === 'bridge-provider')
    ) {
      return event.traceId || createTraceId(event);
    }

    if (event.remote?.name) {
      const traceId = traceByRemote.get(
        getTraceMapKey(instanceRef, event.remote.name),
      );
      if (traceId) {
        return traceId;
      }
    }
    return event.traceId || createTraceId(event);
  };

  const normalizeEvent = (
    event: ObservabilityRuntimeEventInput,
    traceId: string,
    origin?: ObservabilityRuntimeOrigin,
  ): ObservabilityEvent => {
    const errorInfo = getErrorInfo(event.error, options.stackTrace);
    const sanitizedRemote = sanitizeRemote(event.remote);
    const sanitizedResource = sanitizeResource(event.resource);
    const sanitizedShared = sanitizeShared(event.shared);
    const requestAlias =
      sanitizeRequestId(event.requestAlias) ||
      resolveAliasRequestId(event.requestId, sanitizedRemote);
    const hostName =
      sanitizeText(event.hostName, 120) ||
      sanitizeText(origin?.options?.name, 120);
    const runtimeVersion =
      sanitizeText(origin?.version, 80) || getAppliedRuntimeVersion();
    const message = sanitizedResource
      ? sanitizeText(event.message) || sanitizeText(errorInfo.errorMessage)
      : getRawText(event.message) || errorInfo.errorMessage;
    const normalizedErrorMessage = sanitizedResource
      ? sanitizeText(errorInfo.errorMessage)
      : errorInfo.errorMessage;
    const normalizedErrorStack = sanitizedResource
      ? sanitizeText(errorInfo.errorStack, 4000)
      : errorInfo.errorStack;

    const normalizedEvent: ObservabilityEvent = {
      traceId,
      instanceRef: event.instanceRef || getInstanceRef(origin),
      timestamp: event.timestamp || Date.now(),
      phase: sanitizeText(event.phase, 120) || 'runtime',
      status: event.status,
      requestId: sanitizeRequestId(event.requestId),
      requestAlias,
      hostName,
      runtimeVersion,
      remote: sanitizedRemote,
      resource: sanitizedResource,
      shared: sanitizedShared,
      expose: sanitizeText(event.expose, 240),
      sanitizedUrl:
        sanitizedResource?.url ||
        clipText(event.url || event.remote?.entry, 320),
      message,
      errorCode: errorInfo.errorCode,
      errorName: errorInfo.errorName,
      errorMessage: normalizedErrorMessage,
      errorStack: normalizedErrorStack,
      duration:
        typeof event.duration === 'number' && Number.isFinite(event.duration)
          ? Math.max(0, event.duration)
          : undefined,
      lifecycle: sanitizeText(event.lifecycle, 120),
      eventName: sanitizeText(event.eventName, 160),
      source: normalizeEventSource(event.source),
      recovered: event.recovered === true || undefined,
      cached: event.cached === true || undefined,
      componentName: sanitizeText(event.componentName, 160),
      metadata: clipObservabilityMetadata(event.metadata),
      loadedBefore: copyLoadedBeforeInfo(event.loadedBefore),
      bridge: copyBridgeInfo(event.bridge),
    };

    if (normalizedEvent.status === 'error' || event.error) {
      normalizedEvent.ownerHint = getOwnerHint(normalizedEvent);
      normalizedEvent.retryable = getRetryable(normalizedEvent);
      normalizedEvent.errorContext = createErrorContext(
        normalizedEvent,
        event.errorContext,
      );
    }

    return normalizedEvent;
  };

  const applyPhaseDuration = (event: ObservabilityEvent) => {
    const key = getPhaseDurationKey(event);

    if (event.status === 'start') {
      phaseStartTimes.set(key, event.timestamp);
      return;
    }

    if (event.duration !== undefined) {
      return;
    }

    const startedAt = phaseStartTimes.get(key);
    if (startedAt === undefined) {
      return;
    }

    event.duration = Math.max(0, event.timestamp - startedAt);
    phaseStartTimes.delete(key);
  };

  const updateTraceMaps = (event: ObservabilityEvent) => {
    if (event.requestId) {
      traceByRequest.set(
        getTraceMapKey(event.instanceRef, event.requestId),
        event.traceId,
      );
    }

    if (event.remote?.name) {
      traceByRemote.set(
        getTraceMapKey(event.instanceRef, event.remote.name),
        event.traceId,
      );
    }
    if (event.bridge?.operationId) {
      traceByBridgeOperation.set(
        getTraceMapKey(event.instanceRef, event.bridge.operationId),
        event.traceId,
      );
    }
    if (event.bridge?.bridgeId) {
      traceByBridgeId.set(
        getTraceMapKey(event.instanceRef, event.bridge.bridgeId),
        event.traceId,
      );
    }
  };

  const trimEvents = (report: ObservabilityReport) => {
    while (events.length > effectiveMaxEvents) {
      events.shift();
    }

    while (report.events.length > effectiveMaxEvents) {
      report.events.shift();
    }
  };

  const getEventOutcome = (event: ObservabilityEvent) => {
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

  const isLoadRemoteCompleteEvent = (event: ObservabilityEvent) =>
    event.phase === 'loadRemote' && event.status === 'complete';

  const isRuntimeLoadedEvent = (event: ObservabilityEvent) =>
    event.phase === 'loadRemote' &&
    (event.status === 'success' ||
      (event.status === 'complete' && event.recovered));

  const isSharedResolvedEvent = (event: ObservabilityEvent) =>
    event.phase === 'shared' &&
    (event.status === 'success' ||
      (event.status === 'complete' && event.recovered));

  const isSharedRegisteredEvent = (event: ObservabilityEvent) =>
    event.phase === 'shared-registration' && event.status === 'success';

  const isPreloadedEvent = (event: ObservabilityEvent) =>
    event.phase === 'preload' && event.status === 'success';

  const isComponentLoadedEvent = (event: ObservabilityEvent) =>
    event.status === 'success' &&
    (event.eventName === COMPONENT_BUSINESS_LOADED_EVENT ||
      (event.phase === 'component' &&
        event.message === COMPONENT_BUSINESS_LOADED_EVENT));

  const shouldReplaceFailedPhase = (
    report: ObservabilityReport,
    event: ObservabilityEvent,
  ) => {
    if (isLoadRemoteCompleteEvent(event) && report.failedPhase) {
      return false;
    }

    if (!report.failedPhase) {
      return true;
    }

    return report.failedPhase === 'loadRemote' && event.phase !== 'loadRemote';
  };

  const createEmptyPhaseCollection = (): ObservabilityPhaseCollection => ({
    phases: {},
    flags: {
      cached: false,
      fallback: false,
      recovered: false,
    },
  });

  const createPhaseCollection = (
    eventsForReport: ObservabilityEvent[],
  ): ObservabilityPhaseCollection => {
    const collection = createEmptyPhaseCollection();

    eventsForReport.forEach((event) => {
      const phase = event.phase;
      const phaseSummary =
        collection.phases[phase] ||
        ({
          status: event.status,
        } satisfies ObservabilityPhaseSummary);

      if (event.status !== 'start') {
        phaseSummary.status = event.status;
      }
      if (event.duration !== undefined) {
        phaseSummary.duration = event.duration;
      }
      if (event.cached) {
        phaseSummary.cached = true;
        collection.flags.cached = true;
      }
      if (event.recovered) {
        phaseSummary.recovered = true;
        collection.flags.recovered = true;
      }
      if (event.lifecycle) {
        phaseSummary.lifecycle = event.lifecycle;
      }

      collection.phases[phase] = phaseSummary;

      if (
        event.phase === 'loadRemote' &&
        event.status === 'complete' &&
        event.recovered
      ) {
        collection.flags.fallback = true;
      }
      if (event.shared?.fallback) {
        collection.flags.fallback = true;
      }
      if (event.shared?.selectedVersion || event.shared?.provider) {
        collection.shared = {
          name: event.shared.name,
          provider: event.shared.provider,
          selectedVersion: event.shared.selectedVersion,
          shareScope: event.shared.shareScope
            ? [...event.shared.shareScope]
            : undefined,
        };
      }
    });

    return collection;
  };

  const createErrorSummary = (
    eventsForReport: ObservabilityEvent[],
    failedPhase?: string,
  ): ObservabilityErrorSummary | undefined => {
    const errorEvent =
      eventsForReport.find(
        (event) => event.status === 'error' && event.phase === failedPhase,
      ) ||
      eventsForReport.find((event) => event.status === 'error') ||
      eventsForReport.find(
        (event) => event.status === 'complete' && event.errorMessage,
      );

    if (!errorEvent) {
      return undefined;
    }

    return {
      errorCode: errorEvent.errorCode,
      errorName: errorEvent.errorName,
      errorMessage: errorEvent.errorMessage,
      failedPhase: failedPhase || errorEvent.phase,
      lifecycle: errorEvent.lifecycle,
      ownerHint: errorEvent.ownerHint,
      retryable: errorEvent.retryable,
      context: errorEvent.errorContext
        ? { ...errorEvent.errorContext }
        : undefined,
    };
  };

  const createReportSummary = (
    report: ObservabilityReport,
  ): ObservabilityReport['summary'] => {
    const loadCompleted = report.events.some(isLoadRemoteCompleteEvent);
    const runtimeLoaded = report.events.some(isRuntimeLoadedEvent);
    const sharedResolved = report.events.some(isSharedResolvedEvent);
    const sharedRegistered = report.events.some(isSharedRegisteredEvent);
    const preloaded = report.events.some(isPreloadedEvent);
    const recovered = report.events.some((item) => item.recovered);
    const componentLoaded = report.events.some(isComponentLoadedEvent);
    const lastEvent = report.events[report.events.length - 1];
    let outcome: ObservabilityReportOutcome = 'pending';

    if (recovered) {
      outcome = 'recovered';
    } else if (componentLoaded) {
      outcome = 'component-loaded';
    } else if (report.status === 'error') {
      outcome = 'failed';
    } else if (runtimeLoaded) {
      outcome = 'runtime-loaded';
    } else if (sharedResolved) {
      outcome = 'shared-resolved';
    } else if (sharedRegistered) {
      outcome = 'shared-registered';
    } else if (preloaded) {
      outcome = 'preloaded';
    }

    const phaseCollection = createPhaseCollection(report.events);

    return {
      eventCount: report.events.length,
      recovered,
      loadCompleted,
      runtimeLoaded,
      sharedResolved,
      sharedRegistered,
      preloaded,
      componentLoaded,
      outcome,
      lastPhase: lastEvent?.phase,
      phases: phaseCollection.phases,
      shared: phaseCollection.shared,
      flags: phaseCollection.flags,
      error: createErrorSummary(report.events, report.failedPhase),
    };
  };

  const refreshModuleInfoSummary = (report: ObservabilityReport) => {
    const moduleInfo = createModuleInfoSummary(report);
    if (moduleInfo) {
      report.moduleInfo = moduleInfo;
    }
  };

  const getReportContext = (
    report: ObservabilityReport,
  ): ObservabilityMetadata | undefined =>
    report.summary.error?.context || report.errorContext;

  const getContextText = (
    context: ObservabilityMetadata | undefined,
    key: string,
  ): string | undefined => {
    const value = context?.[key];
    return typeof value === 'string' && value ? value : undefined;
  };

  const getDiagnosisOwnerHint = (
    report: ObservabilityReport,
  ): ObservabilityOwnerHint =>
    report.summary.error?.ownerHint ||
    report.ownerHint ||
    (report.shared ? 'shared' : report.remote ? 'remote' : 'unknown');

  const getDiagnosisResourceErrorType = (
    report: ObservabilityReport,
  ): string | undefined =>
    getContextText(getReportContext(report), 'resourceErrorType') ||
    getResourceErrorType({
      errorCode: report.errorCode,
      errorMessage: report.errorMessage,
      message: report.events.at(-1)?.message,
      lifecycle: report.summary.error?.lifecycle,
    });

  const getDiagnosisDocLink = (
    report: ObservabilityReport,
  ): string | undefined => {
    const text = [
      report.errorMessage,
      report.errorStack,
      ...report.events.flatMap((event) => [
        event.errorMessage,
        event.errorStack,
        event.message,
      ]),
    ]
      .filter((item): item is string => Boolean(item))
      .join('\n');
    const matched = text.match(DIAGNOSTIC_DOC_LINK_PATTERN)?.[0];
    const docLink = sanitizeText(matched, 240);

    if (docLink) {
      return docLink;
    }

    return report.errorCode?.startsWith('RUNTIME-')
      ? RUNTIME_DOC_LINK
      : undefined;
  };

  const getDiagnosisTitle = (report: ObservabilityReport) => {
    if (report.status !== 'error') {
      if (report.shared) {
        if (
          report.shared.reason === SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON
        ) {
          return 'Singleton shared dependency version conflict detected';
        }
        if (report.summary.sharedResolved) {
          return 'Shared dependency resolved successfully';
        }
        return 'Shared dependency loading is pending';
      }
      if (report.summary.componentLoaded) {
        return 'Business component loaded';
      }
      if (report.summary.runtimeLoaded) {
        return 'Remote loaded successfully';
      }
      if (report.summary.preloaded) {
        return 'Remote preloaded successfully';
      }
      return 'Remote loading is pending';
    }

    switch (report.errorCode) {
      case 'RUNTIME-001':
        return 'Remote entry global was not registered';
      case 'RUNTIME-003':
        return 'Manifest could not be loaded';
      case 'RUNTIME-004':
        return 'Remote was not found in host remotes';
      case 'RUNTIME-007':
        return 'Deployment moduleInfo did not match the requested remote';
      case 'RUNTIME-013':
        return 'Manifest is not a valid Module Federation manifest';
      case 'RUNTIME-014':
        return 'Requested expose was not found in the remote';
      case 'RUNTIME-015':
        return 'Remote container initialization failed';
      case 'RUNTIME-005':
      case 'RUNTIME-006':
        return 'Shared dependency could not be resolved';
      case 'RUNTIME-008': {
        const resourceErrorType = getDiagnosisResourceErrorType(report);
        if (resourceErrorType === 'network') {
          return 'Remote entry failed because of a network error';
        }
        if (resourceErrorType === 'timeout') {
          return 'Remote entry request timed out';
        }
        if (resourceErrorType === 'script-execution') {
          return 'Remote entry loaded but failed during execution';
        }
        return 'Remote entry resource could not be loaded';
      }
      default:
        if (report.failedPhase === 'shared' || report.shared) {
          return 'Shared dependency could not be resolved';
        }
        return report.failedPhase
          ? `Module Federation failed at ${report.failedPhase}`
          : 'Module Federation loading failed';
    }
  };

  const getCompletedPhases = (report: ObservabilityReport) =>
    Array.from(
      new Set(
        report.events
          .filter(
            (event) =>
              event.status === 'success' || event.status === 'complete',
          )
          .map((event) => event.phase),
      ),
    );

  const getPendingPhases = (report: ObservabilityReport) => {
    const started = new Set<string>();
    const ended = new Set<string>();

    report.events.forEach((event) => {
      if (event.status === 'start') {
        started.add(event.phase);
        return;
      }

      ended.add(event.phase);
    });

    return Array.from(started).filter((phase) => !ended.has(phase));
  };

  const createDiagnosisFacts = (
    report: ObservabilityReport,
    ownerHint: ObservabilityOwnerHint,
  ): ObservabilityMetadata => {
    const context = getReportContext(report);
    const facts: Record<string, unknown> = {};
    const addFact = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      facts[key] = Array.isArray(value) ? value.join(',') : value;
    };

    addFact('traceId', report.traceId);
    addFact('status', report.status);
    addFact('outcome', report.summary.outcome);
    addFact('errorCode', report.errorCode || report.summary.error?.errorCode);
    addFact(
      'failedPhase',
      report.failedPhase || report.summary.error?.failedPhase,
    );
    addFact('lifecycle', report.summary.error?.lifecycle);
    addFact('ownerHint', ownerHint);
    addFact('retryable', report.retryable ?? report.summary.error?.retryable);
    addFact('requestId', report.requestId);
    addFact(
      'requestAlias',
      report.requestAlias || report.summary.error?.context?.['requestAlias'],
    );
    addFact('hostName', report.hostName);
    addFact('remoteName', report.remote?.name);
    addFact('remoteAlias', report.remote?.alias);
    addFact('remoteEntry', report.remote?.entry);
    addFact('entryGlobalName', report.remote?.entryGlobalName);
    addFact('remoteType', report.remote?.type);
    addFact('url', report.sanitizedUrl || getContextText(context, 'url'));
    addFact('expose', report.expose);
    addFact('hostRemotes', getContextText(context, 'hostRemotes'));
    addFact('resourceErrorType', getDiagnosisResourceErrorType(report));
    addFact('shareName', report.shared?.name);
    addFact('shareScope', report.shared?.shareScope);
    addFact('shareVersion', report.shared?.version);
    addFact('requiredVersion', report.shared?.requiredVersion);
    addFact('selectedVersion', report.shared?.selectedVersion);
    addFact('availableVersions', report.shared?.availableVersions);
    addFact('provider', report.shared?.provider);
    addFact('useIn', report.shared?.useIn);
    addFact('sharedDefinedBy', report.shared?.definedBy);
    addFact('singleton', report.shared?.singleton);
    addFact('strictVersion', report.shared?.strictVersion);
    addFact('eager', report.shared?.eager);
    addFact('sharedReason', report.shared?.reason);
    addFact(
      'componentName',
      report.events.find(isComponentLoadedEvent)?.componentName,
    );
    addFact('moduleInfoReason', report.moduleInfo?.reason);
    addFact('moduleInfoTotalCount', report.moduleInfo?.totalCount);
    addFact('moduleInfoMatchedCount', report.moduleInfo?.matchedCount);
    addFact(
      'moduleInfoNames',
      report.moduleInfo?.entries.length
        ? report.moduleInfo.entries.map((entry) => entry.name)
        : report.moduleInfo?.availableNames,
    );
    addFact('cached', report.summary.flags.cached);
    addFact('fallback', report.summary.flags.fallback);
    addFact('recovered', report.summary.recovered);
    addFact('loadCompleted', report.summary.loadCompleted);
    addFact('runtimeLoaded', report.summary.runtimeLoaded);
    addFact('componentLoaded', report.summary.componentLoaded);

    return clipMetadata(facts, MAX_FACT_KEYS) || {};
  };

  const createDiagnosisWarnings = (report: ObservabilityReport) => {
    const warnings: string[] = [];

    if (report.status === 'error' && !report.errorCode) {
      warnings.push('No known Module Federation error code was captured');
    }
    if (report.summary.flags.fallback) {
      warnings.push('Remote loading completed through fallback recovery');
    }
    if (report.summary.runtimeLoaded && !report.summary.componentLoaded) {
      warnings.push('Business component readiness signal was not recorded');
    }
    if (report.moduleInfo && report.moduleInfo.matchedCount === 0) {
      warnings.push(
        'No matching clipped moduleInfo entry was found for the failed remote',
      );
    }
    if (report.shared?.reason === SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON) {
      warnings.push(
        'Singleton shared dependency has multiple versions in the same share scope',
      );
    }

    return warnings;
  };

  const createDiagnosisActions = (
    report: ObservabilityReport,
    ownerHint: ObservabilityOwnerHint,
  ): ObservabilityAction[] => {
    const actions: ObservabilityAction[] = [];
    const pushAction = (
      id: ObservabilityActionId,
      title: string,
      hint: ObservabilityOwnerHint = ownerHint,
      detail?: string,
    ) => {
      actions.push({
        id,
        ownerHint: hint,
        title,
        detail,
      });
    };

    if (report.shared?.reason === SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON) {
      pushAction(
        'check-shared-version',
        'Align singleton shared dependency versions in the same share scope',
        'shared',
      );
      pushAction(
        'check-shared-provider',
        'Check which host or remote registered each shared version',
        'shared',
      );
      return actions;
    }

    if (report.status !== 'error' && !report.summary.error) {
      return actions;
    }

    switch (report.errorCode) {
      case 'RUNTIME-001':
        pushAction(
          'check-remote-global',
          'Check the remote global name against the remoteEntry build output',
          'remote',
        );
        pushAction(
          'check-remote-entry',
          'Check that remoteEntry registers the expected container',
          'remote',
        );
        break;
      case 'RUNTIME-003':
        pushAction(
          'check-manifest-url',
          'Check the manifest URL and manifest JSON response',
          'host',
        );
        pushAction(
          'check-network',
          'Check network availability, CORS, and timeout for the manifest',
          'network',
        );
        break;
      case 'RUNTIME-013':
        pushAction(
          'check-manifest-url',
          'Check that the manifest response is valid Module Federation JSON',
          'remote',
        );
        break;
      case 'RUNTIME-004':
        pushAction(
          'check-host-remotes',
          'Check that the requested remote exists in host remotes',
          'host',
        );
        break;
      case 'RUNTIME-007':
        pushAction(
          'check-module-info',
          'Check deployment-provided __FEDERATION__.moduleInfo for the requested remote',
          'host',
        );
        pushAction(
          'check-host-remotes',
          'Check that the runtime remote name or alias matches moduleInfo',
          'host',
        );
        break;
      case 'RUNTIME-014':
        pushAction(
          'check-expose',
          'Check that the requested expose exists in the remote build output',
          'remote',
        );
        break;
      case 'RUNTIME-015':
        pushAction(
          'check-remote-entry',
          'Check the error thrown during remoteEntry init',
          'remote',
        );
        pushAction(
          'check-shared-provider',
          'Check share scope initialization data passed to the remote',
          'shared',
        );
        break;
      case 'RUNTIME-005':
      case 'RUNTIME-006':
        pushAction(
          'check-shared-provider',
          'Check that a compatible shared provider is available',
          'shared',
        );
        pushAction(
          'check-shared-version',
          'Compare requested shared version with available versions',
          'shared',
        );
        if (
          report.summary.error?.lifecycle === 'loadShareSync' ||
          report.shared?.reason === 'sync-async-boundary' ||
          report.shared?.eager === false
        ) {
          pushAction(
            'check-eager-config',
            'Check eager configuration or add an async boundary before sync shared consumption',
            'shared',
          );
        }
        break;
      case 'RUNTIME-008': {
        const resourceErrorType = getDiagnosisResourceErrorType(report);
        if (
          resourceErrorType === 'network' ||
          resourceErrorType === 'timeout'
        ) {
          pushAction(
            'check-network',
            'Check remoteEntry URL, CORS, status code, and timeout',
            'network',
          );
        }
        pushAction(
          'check-remote-entry',
          resourceErrorType === 'script-execution'
            ? 'Check remoteEntry execution errors in the remote build output'
            : 'Check that remoteEntry is reachable and serves JavaScript',
          resourceErrorType === 'network' || resourceErrorType === 'timeout'
            ? 'network'
            : 'remote',
        );
        break;
      }
      default:
        if (report.failedPhase === 'manifest') {
          pushAction(
            'check-manifest-url',
            'Check manifest loading and parsing',
            'host',
          );
        }
        if (report.failedPhase === 'remoteEntry') {
          pushAction(
            'check-remote-entry',
            'Check remoteEntry loading and initialization',
            'remote',
          );
        }
        if (report.failedPhase === 'expose') {
          pushAction(
            'check-expose',
            'Check that the requested expose exists in the remote',
            'remote',
          );
        }
        if (report.failedPhase === 'shared') {
          pushAction(
            'check-shared-provider',
            'Check shared dependency resolution',
            'shared',
          );
          if (
            report.shared?.requiredVersion !== undefined ||
            report.shared?.availableVersions?.length ||
            report.shared?.reason === 'version-mismatch'
          ) {
            pushAction(
              'check-shared-version',
              'Compare requested shared version with available versions',
              'shared',
            );
          }
          if (
            report.summary.error?.lifecycle === 'loadShareSync' ||
            report.shared?.reason === 'sync-async-boundary' ||
            report.shared?.eager === false
          ) {
            pushAction(
              'check-eager-config',
              'Check eager configuration or add an async boundary before sync shared consumption',
              'shared',
            );
          }
        }
    }

    if (
      report.moduleInfo &&
      !actions.some((action) => action.id === 'check-module-info')
    ) {
      pushAction(
        'check-module-info',
        'Check deployment-provided __FEDERATION__.moduleInfo for the requested remote',
        'host',
      );
    }

    if (!actions.length) {
      pushAction(
        'inspect-runtime-events',
        'Inspect the ordered observability events for the failed phase',
        ownerHint,
      );
    }

    return actions;
  };

  const createFactReport = (
    report: ObservabilityReport,
  ): ObservabilityFactReport => {
    const ownerHint = getDiagnosisOwnerHint(report);
    const warnings = createDiagnosisWarnings(report);

    return {
      title: getDiagnosisTitle(report),
      outcome: report.summary.outcome,
      status: report.status,
      ownerHint,
      failedPhase: report.failedPhase || report.summary.error?.failedPhase,
      errorCode: report.errorCode || report.summary.error?.errorCode,
      errorName: report.errorName || report.summary.error?.errorName,
      errorMessage: report.errorMessage || report.summary.error?.errorMessage,
      docLink: getDiagnosisDocLink(report),
      facts: createDiagnosisFacts(report, ownerHint),
      completedPhases: getCompletedPhases(report),
      pendingPhases: getPendingPhases(report),
      warnings: warnings.length ? warnings : undefined,
      actions: createDiagnosisActions(report, ownerHint),
    };
  };

  const refreshReportDerivedFields = (report: ObservabilityReport) => {
    report.summary = createReportSummary(report);
    refreshModuleInfoSummary(report);
    report.diagnosis = createFactReport(report);
  };

  const updateReport = (event: ObservabilityEvent) => {
    let report = reports.get(event.traceId);

    if (!report) {
      report = {
        traceId: event.traceId,
        instanceRef: event.instanceRef,
        status: event.status === 'error' ? 'error' : 'pending',
        requestId: event.requestId,
        requestAlias: event.requestAlias,
        hostName: event.hostName,
        runtimeVersion: event.runtimeVersion,
        remote: event.remote ? { ...event.remote } : undefined,
        shared: event.shared ? copyEvent(event).shared : undefined,
        expose: event.expose,
        sanitizedUrl: event.sanitizedUrl,
        startedAt: event.timestamp,
        updatedAt: event.timestamp,
        duration: 0,
        failedPhase: event.status === 'error' ? event.phase : undefined,
        errorCode: event.errorCode,
        errorName: event.errorName,
        errorMessage: event.errorMessage,
        errorStack: event.errorStack,
        ownerHint: event.ownerHint,
        retryable: event.retryable,
        errorContext: event.errorContext
          ? { ...event.errorContext }
          : undefined,
        loadedBefore: copyLoadedBeforeInfo(event.loadedBefore),
        bridge: copyBridgeInfo(event.bridge),
        events: [],
        summary: {
          eventCount: 0,
          recovered: false,
          loadCompleted: false,
          runtimeLoaded: false,
          sharedResolved: false,
          sharedRegistered: false,
          preloaded: false,
          componentLoaded: false,
          outcome: 'pending',
          lastPhase: undefined,
          phases: {},
          shared: undefined,
          flags: createEmptyPhaseCollection().flags,
          error: undefined,
        },
      };
      reports.set(event.traceId, report);
    }

    if (event.instanceRef) {
      report.instanceRef = event.instanceRef;
    }

    if (event.requestId) {
      report.requestId = event.requestId;
    }
    if (event.requestAlias) {
      report.requestAlias = event.requestAlias;
    }
    if (event.hostName) {
      report.hostName = event.hostName;
    }
    if (event.runtimeVersion) {
      report.runtimeVersion = event.runtimeVersion;
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
    if (event.sanitizedUrl) {
      report.sanitizedUrl = event.sanitizedUrl;
    }
    if (event.errorStack) {
      report.errorStack = event.errorStack;
    }
    if (event.errorCode) {
      report.errorCode = event.errorCode;
    }
    if (event.errorName) {
      report.errorName = event.errorName;
    }
    if (event.errorMessage) {
      report.errorMessage = event.errorMessage;
    }
    if (event.ownerHint) {
      report.ownerHint = event.ownerHint;
    }
    if (event.retryable !== undefined) {
      report.retryable = event.retryable;
    }
    if (event.errorContext) {
      report.errorContext = { ...event.errorContext };
    }
    if (event.loadedBefore) {
      report.loadedBefore = copyLoadedBeforeInfo(event.loadedBefore);
    }
    if (event.bridge) {
      report.bridge = copyBridgeInfo(event.bridge);
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
    } else if (eventOutcome === 'recovered') {
      report.status = 'success';
    } else if (eventOutcome === 'success' && report.status !== 'error') {
      report.status = 'success';
    }

    refreshReportDerivedFields(report);

    latestTraceId = event.traceId;
    if (event.instanceRef) {
      latestTraceByInstance.set(event.instanceRef, event.traceId);
    }
    trimEvents(report);
    return report;
  };

  const getEventsSnapshot = () => events.map(copyEvent);

  const getTraceIdsSnapshot = () => Array.from(reports.keys());

  const getReportTimeline = () =>
    Array.from(reports.values()).sort((left, right) => {
      if (right.updatedAt !== left.updatedAt) {
        return right.updatedAt - left.updatedAt;
      }

      return right.startedAt - left.startedAt;
    });

  const matchesReportValue = (
    value: string | undefined,
    expected: string | undefined,
  ) => {
    if (!value || !expected) {
      return false;
    }

    const normalizedValue = value.toLowerCase();
    const normalizedExpected = expected.toLowerCase();

    return (
      normalizedValue === normalizedExpected ||
      normalizedValue.includes(normalizedExpected)
    );
  };

  const matchesReportQuery = (
    report: ObservabilityReport,
    query: ObservabilityReportQuery,
  ) => {
    if (query.traceId && report.traceId !== query.traceId) {
      return false;
    }
    if (query.instanceRef && report.instanceRef !== query.instanceRef) {
      return false;
    }
    if (query.status && report.status !== query.status) {
      return false;
    }
    if (query.outcome && report.summary.outcome !== query.outcome) {
      return false;
    }
    if (
      query.remote &&
      ![
        report.remote?.name,
        report.remote?.alias,
        report.remote?.entry,
        report.requestId,
        report.requestAlias,
        report.sanitizedUrl,
      ].some((value) => matchesReportValue(value, query.remote))
    ) {
      return false;
    }
    if (
      query.expose &&
      ![report.expose, report.requestId].some((value) =>
        matchesReportValue(value, query.expose),
      )
    ) {
      return false;
    }
    if (
      query.shared &&
      ![report.shared?.name].some((value) =>
        matchesReportValue(value, query.shared),
      )
    ) {
      return false;
    }

    return true;
  };

  const getReportsSnapshot = (options: ObservabilityReportListOptions = {}) => {
    const limit = normalizeQueryLimit(options.limit);
    const timeline = getReportTimeline();

    return (limit ? timeline.slice(0, limit) : timeline).map(copyReport);
  };

  const findReportsSnapshot = (query: ObservabilityReportQuery = {}) => {
    const limit = normalizeQueryLimit(query.limit);
    const matchedReports = getReportTimeline().filter((report) =>
      matchesReportQuery(report, query),
    );

    return (limit ? matchedReports.slice(0, limit) : matchedReports).map(
      copyReport,
    );
  };

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

  const exportReportSnapshot = (traceId?: string) =>
    traceId ? getReportSnapshot(traceId) : getLatestReportSnapshot();

  const getTraceIdForRequest = (
    instanceRef: string | undefined,
    requestId: string | undefined,
  ) =>
    requestId
      ? traceByRequest.get(getTraceMapKey(instanceRef, requestId))
      : undefined;

  const getLatestTraceId = (instanceRef?: string) =>
    instanceRef ? latestTraceByInstance.get(instanceRef) : latestTraceId;

  const clear = () => {
    events.length = 0;
    reports.clear();
    traceByRequest.clear();
    traceByRemote.clear();
    traceByBridgeOperation.clear();
    traceByBridgeId.clear();
    latestTraceByInstance.clear();
    phaseStartTimes.clear();
    latestTraceId = undefined;
    effectiveMaxEvents = configuredMaxEvents;
  };

  return {
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
    getTraceIdForRequest,
    getLatestTraceId,
    clear,
  };
}
