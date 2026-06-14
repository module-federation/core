import type {
  BridgeConnectOptions,
  OpenRuntimeCore,
  OpenRuntimeWindowHost,
  RuntimeError,
  RuntimeStatus,
} from '@openruntime/core';
import {
  createOpenRuntime,
  getOpenRuntimeFromWindow,
  installOpenRuntimeOnWindow,
} from '@openruntime/core';

import type {
  ObservabilityEvent,
  ObservabilityEventContext,
  ObservabilityPhaseSummary,
  ObservabilityRemoteInfo,
  ObservabilityReport,
  ObservabilitySharedInfo,
} from './core';
import {
  registerOpenRuntimeActions,
  type OpenRuntimeReportReader,
} from './openruntime-actions';

export interface OpenRuntimeObservabilityOptions {
  enabled?: boolean;
  runtime?: OpenRuntimeCore;
  host?: OpenRuntimeWindowHost;
  bridge?: false | BridgeConnectOptions;
  source?: string;
}

interface OpenRuntimeObservabilityAdapter {
  syncReport(
    report: ObservabilityReport,
    context?: ObservabilityEventContext,
  ): void;
}

type LoadingTargetStatus =
  | 'registered'
  | 'loading'
  | 'ready'
  | 'error'
  | 'recovered';
type SharedTargetStatus =
  | 'unloaded'
  | 'loading'
  | 'loaded'
  | 'recovered'
  | 'error';

const openRuntimeSource = 'module-federation';
const loadingStatuses: LoadingTargetStatus[] = [
  'registered',
  'loading',
  'ready',
  'error',
  'recovered',
];
const sharedStatuses: SharedTargetStatus[] = [
  'unloaded',
  'loading',
  'loaded',
  'recovered',
  'error',
];
const remoteLifecyclePhases = new Set([
  'matchRemote',
  'manifest',
  'remoteEntry',
  'remoteEntryInit',
  'loadRemote',
  'preload',
]);
const remoteFailurePhases = new Set([
  'matchRemote',
  'manifest',
  'remoteEntry',
  'remoteEntryInit',
  'loadRemote',
]);

export function createOpenRuntimeObservabilityAdapter(
  input: boolean | OpenRuntimeObservabilityOptions | undefined,
  reportReader?: OpenRuntimeReportReader,
): OpenRuntimeObservabilityAdapter | undefined {
  if (!input) {
    return undefined;
  }

  const options: OpenRuntimeObservabilityOptions = input === true ? {} : input;
  if (options.enabled === false) {
    return undefined;
  }

  const connectedRuntimes = new WeakSet<OpenRuntimeCore>();
  const registeredActionRuntimes = new WeakSet<OpenRuntimeCore>();
  let createdRuntime: OpenRuntimeCore | undefined;

  const getRuntime = () => {
    if (options.runtime) {
      return options.runtime;
    }

    const host = options.host || getDefaultHost();
    const runtime = getOpenRuntimeFromWindow(host);
    if (runtime) {
      return runtime;
    }

    if (!createdRuntime) {
      const nextRuntime = createOpenRuntime();
      createdRuntime = host
        ? installOpenRuntimeOnWindow(nextRuntime, host)
        : nextRuntime;
    }

    return createdRuntime;
  };

  return {
    syncReport(report) {
      try {
        const runtime = getRuntime();
        const source = options.source || openRuntimeSource;
        registerOpenRuntimeActions(
          runtime,
          source,
          reportReader,
          registeredActionRuntimes,
        );
        connectRuntimeBridge(runtime, options.bridge, connectedRuntimes);
        syncReportToOpenRuntime(runtime, source, report, reportReader);
      } catch {
        // OpenRuntime output is diagnostic-only and must not affect MF loading.
      }
    },
  };
}

function connectRuntimeBridge(
  runtime: OpenRuntimeCore,
  bridge: false | BridgeConnectOptions | undefined,
  connectedRuntimes: WeakSet<OpenRuntimeCore>,
): void {
  if (
    bridge === undefined ||
    bridge === false ||
    connectedRuntimes.has(runtime)
  ) {
    return;
  }

  runtime.connectBridge(bridge);
  connectedRuntimes.add(runtime);
}

function syncReportToOpenRuntime(
  runtime: OpenRuntimeCore,
  source: string,
  report: ObservabilityReport,
  reportReader: OpenRuntimeReportReader | undefined,
): void {
  if (report.remote) {
    syncRemote(runtime, source, report, reportReader);
    syncRemoteModule(runtime, source, report, reportReader);
  }

  if (report.shared) {
    syncShared(runtime, source, report);
  }
}

function syncRemote(
  runtime: OpenRuntimeCore,
  source: string,
  report: ObservabilityReport,
  reportReader: OpenRuntimeReportReader | undefined,
): void {
  const remote = report.remote;
  if (!remote?.name) {
    return;
  }

  const targetId = targetIds.remote(remote.name);
  const remoteReports = getRemoteReports(report, remote, reportReader);
  const remoteStatus = getRemoteStatus(remoteReports);
  const remoteData = getRemoteTargetData(remote, remoteReports);
  runtime.registerTarget({
    id: targetId,
    type: targetTypes.remote,
    source,
    label: `MF remote ${remote.name}`,
    description: 'Module Federation remote loading state.',
    statuses: loadingStatuses,
    data: remoteData,
  });
  runtime.updateSnapshot({
    id: targetId,
    status: remoteStatus,
    source,
    data: remoteData,
    error: getRemoteError(remoteReports, remoteStatus),
  });
}

function syncRemoteModule(
  runtime: OpenRuntimeCore,
  source: string,
  report: ObservabilityReport,
  reportReader: OpenRuntimeReportReader | undefined,
): void {
  const remote = report.remote;
  if (!remote?.name || !report.expose) {
    return;
  }

  const targetId = targetIds.remoteModule(remote.name, report.expose);
  const remoteModuleReports = getRemoteModuleReports(
    report,
    remote,
    report.expose,
    reportReader,
  );
  const latestReport = remoteModuleReports[0] || report;
  const remoteModuleData = getRemoteModuleTargetData(
    latestReport,
    remoteModuleReports,
  );
  runtime.registerTarget({
    id: targetId,
    type: targetTypes.remoteModule,
    source,
    label: `MF remote module ${remote.name}/${normalizeExpose(report.expose)}`,
    description: 'Module Federation exposed module loading state.',
    statuses: loadingStatuses,
    data: remoteModuleData,
  });
  runtime.updateSnapshot({
    id: targetId,
    status: getRemoteModuleStatus(latestReport),
    source,
    data: remoteModuleData,
    error: getReportError(latestReport),
    dependsOn: getRemoteModuleDependsOn(remote.name),
  });
}

function syncShared(
  runtime: OpenRuntimeCore,
  source: string,
  report: ObservabilityReport,
): void {
  const shared = report.shared;
  if (!shared?.name) {
    return;
  }

  const targetId = targetIds.shared(shared);
  runtime.registerTarget({
    id: targetId,
    type: targetTypes.shared,
    source,
    label: `MF shared ${shared.name}`,
    description: 'Module Federation shared dependency loading state.',
    statuses: sharedStatuses,
    data: getSharedTargetData(report, shared),
  });
  runtime.updateSnapshot({
    id: targetId,
    status: getSharedStatus(report),
    source,
    data: getSharedTargetData(report, shared),
    error: getReportError(report),
  });
}

function getRemoteTargetData(
  remote: ObservabilityRemoteInfo,
  reports: ObservabilityReport[],
): Record<string, unknown> {
  const latestReport = reports[0];
  const exposes = getRemoteExposeData(remote.name, reports);
  return compactObject({
    hostName: getReportHostNames(reports),
    runtimeVersion: latestReport?.runtimeVersion,
    remote: getLatestRemoteInfo(remote, reports),
    exposes: exposes.length > 0 ? exposes : undefined,
    reportCount: reports.length,
  });
}

function getRemoteModuleTargetData(
  report: ObservabilityReport,
  reports: ObservabilityReport[],
): Record<string, unknown> {
  const hostNames = getReportHostNames(reports, report.expose);
  return compactObject({
    traceId: report.traceId,
    requestId: report.requestId,
    requestAlias: report.requestAlias,
    hostName: hostNames,
    runtimeVersion: report.runtimeVersion,
    consumers: hostNames,
    lastPhase: report.summary.lastPhase,
    phases: report.summary.phases,
    loadedBefore: report.loadedBefore,
  });
}

function getSharedTargetData(
  report: ObservabilityReport,
  shared: ObservabilitySharedInfo,
): Record<string, unknown> {
  return compactObject({
    traceId: report.traceId,
    requestId: report.requestId,
    hostName: report.hostName,
    runtimeVersion: report.runtimeVersion,
    shared: getSharedSnapshotData(shared),
    lastPhase: report.summary.lastPhase,
    phases: report.summary.phases,
  });
}

function getSharedSnapshotData(
  shared: ObservabilitySharedInfo,
): Record<string, unknown> {
  return compactObject({
    name: shared.name,
    shareScope: shared.shareScope,
    version: getSharedTargetVersion(shared),
    requiredVersion: shared.requiredVersion,
    provider: shared.provider,
    singleton: shared.singleton,
    strictVersion: shared.strictVersion,
    eager: shared.eager,
    strategy: shared.strategy,
    loaded: shared.loaded,
    loading: shared.loaded ? undefined : shared.loading,
    reason: shared.reason,
    definedBy: shared.definedBy,
  });
}

function getRemoteStatus(reports: ObservabilityReport[]): LoadingTargetStatus {
  const phaseRecord = getLatestRemotePhaseRecord(reports);
  if (!phaseRecord) {
    return 'loading';
  }

  const failedPhase = getFailedPhase(phaseRecord.report);
  if (
    failedPhase &&
    remoteFailurePhases.has(failedPhase) &&
    failedPhase === phaseRecord.phaseName
  ) {
    return phaseRecord.report.summary.recovered ? 'recovered' : 'error';
  }

  const phase = phaseRecord.report.summary.phases[phaseRecord.phaseName];
  if (phase) {
    return mapPhaseStatus(phase);
  }

  return mapEventStatus(phaseRecord.event.status);
}

function getRemoteExposeData(
  remoteName: string,
  reports: ObservabilityReport[],
): Array<Record<string, unknown>> {
  const reportsByExpose = new Map<string, ObservabilityReport>();

  reports.forEach((report) => {
    const expose = getReportExpose(report);
    const exposeKey = expose ? normalizeExpose(expose) : '';
    if (!expose || reportsByExpose.has(exposeKey)) {
      return;
    }

    reportsByExpose.set(exposeKey, report);
  });

  return Array.from(reportsByExpose.values())
    .map((report) =>
      compactObject({
        targetId: targetIds.remoteModule(
          remoteName,
          getReportExpose(report) || '',
        ),
      }),
    )
    .filter((item) => item['targetId'] !== undefined)
    .sort((left, right) =>
      String(left['targetId'] || '').localeCompare(
        String(right['targetId'] || ''),
      ),
    );
}

function getRemoteModuleStatus(
  report: ObservabilityReport,
): LoadingTargetStatus {
  if (report.status === 'error') {
    return 'error';
  }
  if (report.summary.recovered) {
    return 'recovered';
  }
  if (report.summary.componentLoaded || report.summary.runtimeLoaded) {
    return 'ready';
  }

  const exposePhaseStatus =
    getPhaseTargetStatus(report, 'moduleFactory') ||
    getPhaseTargetStatus(report, 'expose');
  return exposePhaseStatus || 'loading';
}

function getSharedStatus(report: ObservabilityReport): SharedTargetStatus {
  const sharedPhaseStatus = report.summary.phases['shared']?.status;
  if (report.status === 'error' || sharedPhaseStatus === 'error') {
    return 'error';
  }
  if (report.summary.recovered) {
    return 'recovered';
  }
  if (report.shared?.loaded || report.summary.sharedResolved) {
    return 'loaded';
  }
  if (report.shared?.loading) {
    return 'loading';
  }
  if (sharedPhaseStatus === 'start') {
    return 'loading';
  }

  return 'unloaded';
}

function getPhaseTargetStatus(
  report: ObservabilityReport,
  phase: string,
): LoadingTargetStatus | undefined {
  const summary = report.summary.phases[phase];
  if (!summary) {
    return undefined;
  }
  if (summary.recovered) {
    return 'recovered';
  }

  return mapPhaseStatus(summary);
}

function mapPhaseStatus(
  summary: ObservabilityPhaseSummary,
): LoadingTargetStatus {
  if (summary.status === 'start') {
    return 'loading';
  }
  if (summary.status === 'error') {
    return 'error';
  }
  if (summary.status === 'success' || summary.status === 'complete') {
    return 'ready';
  }

  return 'registered';
}

function mapEventStatus(
  status: ObservabilityEvent['status'] | undefined,
): LoadingTargetStatus {
  if (status === 'start') {
    return 'loading';
  }
  if (status === 'error') {
    return 'error';
  }
  if (status === 'success' || status === 'complete') {
    return 'ready';
  }

  return 'registered';
}

function getReportError(report: ObservabilityReport): RuntimeError | undefined {
  const error = report.summary.error;
  if (!error && report.status !== 'error') {
    return undefined;
  }

  const runtimeError: RuntimeError = {
    message: error?.errorMessage || report.errorMessage || 'MF loading failed.',
  };
  const code = error?.errorCode || report.errorCode;
  const data = compactObject({
    traceId: report.traceId,
    failedPhase: error?.failedPhase || report.failedPhase,
    lifecycle: error?.lifecycle,
    ownerHint: error?.ownerHint,
    retryable: error?.retryable,
    context: error?.context || report.errorContext,
  });

  if (code) {
    runtimeError.code = code;
  }
  if (report.errorStack) {
    runtimeError.stack = report.errorStack;
  }
  if (Object.keys(data).length > 0) {
    runtimeError.data = data;
  }

  return runtimeError;
}

function getRemoteError(
  reports: ObservabilityReport[],
  status: LoadingTargetStatus,
): RuntimeError | undefined {
  if (status !== 'error') {
    return undefined;
  }

  const failedReport = reports.find((report) => isRemoteFailureReport(report));
  return failedReport ? getReportError(failedReport) : undefined;
}

function getRemoteModuleDependsOn(remoteName: string): string[] {
  return [targetIds.remote(remoteName)];
}

function getRemoteReports(
  currentReport: ObservabilityReport,
  remote: ObservabilityRemoteInfo,
  reportReader: OpenRuntimeReportReader | undefined,
): ObservabilityReport[] {
  const reports = reportReader
    ? reportReader
        .getReports()
        .filter((report) => isSameRemoteReport(report, remote))
    : [];

  if (!reports.some((report) => report.traceId === currentReport.traceId)) {
    reports.unshift(currentReport);
  }

  return Array.from(
    new Map(reports.map((report) => [report.traceId, report])).values(),
  ).sort(compareReportsByTime);
}

function getRemoteModuleReports(
  currentReport: ObservabilityReport,
  remote: ObservabilityRemoteInfo,
  expose: string,
  reportReader: OpenRuntimeReportReader | undefined,
): ObservabilityReport[] {
  const reports = getRemoteReports(currentReport, remote, reportReader).filter(
    (report) => isSameExposeReport(report, expose),
  );

  if (!reports.some((report) => report.traceId === currentReport.traceId)) {
    reports.unshift(currentReport);
  }

  return Array.from(
    new Map(reports.map((report) => [report.traceId, report])).values(),
  ).sort(compareReportsByTime);
}

function getLatestRemoteInfo(
  fallback: ObservabilityRemoteInfo,
  reports: ObservabilityReport[],
): ObservabilityRemoteInfo {
  return reports.find((report) => report.remote)?.remote || fallback;
}

function isSameRemoteReport(
  report: ObservabilityReport,
  remote: ObservabilityRemoteInfo,
): boolean {
  if (!report.remote) {
    return false;
  }

  const expected = new Set(
    [remote.name, remote.alias, remote.entry].filter(
      (value): value is string => value !== undefined,
    ),
  );
  const actual = [report.remote.name, report.remote.alias, report.remote.entry];
  return actual.some((value) => value !== undefined && expected.has(value));
}

function isSameExposeReport(
  report: ObservabilityReport,
  expose: string,
): boolean {
  const reportExpose = getReportExpose(report);
  if (!reportExpose) {
    return false;
  }

  return normalizeExpose(reportExpose) === normalizeExpose(expose);
}

function getReportHostNames(
  reports: ObservabilityReport[],
  expose?: string,
): string[] | undefined {
  const hostNames: string[] = [];
  const seen = new Set<string>();
  const addHostName = (hostName: string | undefined) => {
    if (!isNonEmptyString(hostName) || seen.has(hostName)) {
      return;
    }

    seen.add(hostName);
    hostNames.push(hostName);
  };

  reports.forEach((report) => {
    addHostName(report.hostName);
    report.loadedBefore?.consumers.forEach((consumer) => {
      if (expose && !hasLoadedExpose(consumer.exposes, expose)) {
        return;
      }

      addHostName(consumer.name);
    });
  });

  return hostNames.length > 0 ? hostNames : undefined;
}

function hasLoadedExpose(
  loadedExposes: string[] | undefined,
  expose: string,
): boolean {
  return Boolean(
    loadedExposes?.some(
      (loadedExpose) =>
        normalizeExpose(loadedExpose) === normalizeExpose(expose),
    ),
  );
}

function compareReportsByTime(
  left: ObservabilityReport,
  right: ObservabilityReport,
): number {
  if (right.updatedAt !== left.updatedAt) {
    return right.updatedAt - left.updatedAt;
  }

  return right.startedAt - left.startedAt;
}

function getLatestRemotePhaseRecord(reports: ObservabilityReport[]):
  | {
      report: ObservabilityReport;
      event: ObservabilityEvent;
      phaseName: string;
    }
  | undefined {
  return reports
    .flatMap((report) =>
      report.events
        .filter((event) => remoteLifecyclePhases.has(event.phase))
        .map((event) => ({
          report,
          event,
          phaseName: event.phase,
        })),
    )
    .sort((left, right) => right.event.timestamp - left.event.timestamp)[0];
}

function isRemoteFailureReport(report: ObservabilityReport): boolean {
  const failedPhase = getFailedPhase(report);
  return failedPhase !== undefined && remoteFailurePhases.has(failedPhase);
}

function getFailedPhase(report: ObservabilityReport): string | undefined {
  return report.summary.error?.failedPhase || report.failedPhase;
}

function getExposeFromRequestId(
  requestId: string | undefined,
): string | undefined {
  if (!requestId) {
    return undefined;
  }

  const separatorIndex = requestId.indexOf('/');
  if (separatorIndex < 0 || separatorIndex === requestId.length - 1) {
    return undefined;
  }

  return requestId.slice(separatorIndex + 1);
}

function getReportExpose(report: ObservabilityReport): string | undefined {
  return report.expose || getExposeFromRequestId(report.requestId);
}

function compactObject(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) {
      output[key] = value;
    }
  });
  return output;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getDefaultHost(): OpenRuntimeWindowHost | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window;
}

function normalizeSegment(value: string): string {
  const normalized = value.trim().replace(/\s+/g, '_');
  return normalized || 'unknown';
}

function normalizeExpose(value: string): string {
  return normalizeSegment(value.replace(/^\.\//, ''));
}

const targetTypes = {
  remote: 'mf.remote',
  remoteModule: 'mf.remote.expose',
  shared: 'mf.shared',
} as const;

const targetIds = {
  remote(remoteName: string): string {
    return `mf:remote:${normalizeSegment(remoteName)}`;
  },
  remoteModule(remoteName: string, expose: string): string {
    return `mf:remote:${normalizeSegment(remoteName)}:expose:${normalizeExpose(
      expose,
    )}`;
  },
  shared(shared: ObservabilitySharedInfo): string {
    return `mf:shared:${normalizeSegment(shared.name)}:${normalizeSegment(
      getSharedTargetVersion(shared),
    )}:${normalizeSegment(getSharedTargetScope(shared))}`;
  },
};

function getSharedTargetVersion(shared: ObservabilitySharedInfo): string {
  const requiredVersion =
    typeof shared.requiredVersion === 'string' ? shared.requiredVersion : '';
  return (
    shared.selectedVersion || shared.version || requiredVersion || 'unknown'
  );
}

function getSharedTargetScope(shared: ObservabilitySharedInfo): string {
  return shared.shareScope?.length ? shared.shareScope.join('_') : 'default';
}
