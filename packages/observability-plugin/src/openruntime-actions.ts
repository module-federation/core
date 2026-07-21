import type { OpenRuntimeCore, RuntimeInputOption } from '@openruntime/core';

import type {
  ObservabilityReport,
  ObservabilityReportListOptions,
  ObservabilityReportOutcome,
  ObservabilityReportQuery,
  ObservabilityReportStatus,
  ObservabilityRuntimeState,
  ObservabilityRuntimeStateInstance,
} from './core';

export interface OpenRuntimeReportReader {
  getReports(options?: ObservabilityReportListOptions): ObservabilityReport[];
  findReports(query?: ObservabilityReportQuery): ObservabilityReport[];
  getLatestReport(): ObservabilityReport | undefined;
  getReport(traceId: string): ObservabilityReport | undefined;
  exportReport(traceId?: string): ObservabilityReport | undefined;
  getRuntimeState(): ObservabilityRuntimeState;
}

const reportStatuses: ObservabilityReportStatus[] = [
  'pending',
  'success',
  'error',
];
const reportOutcomes: ObservabilityReportOutcome[] = [
  'pending',
  'runtime-loaded',
  'shared-resolved',
  'preloaded',
  'component-loaded',
  'failed',
  'recovered',
];

export function registerOpenRuntimeActions(
  runtime: OpenRuntimeCore,
  source: string,
  reportReader: OpenRuntimeReportReader | undefined,
  registeredActionRuntimes: WeakSet<OpenRuntimeCore>,
): void {
  if (registeredActionRuntimes.has(runtime)) {
    return;
  }

  if (reportReader) {
    runtime.registerAction({
      name: 'mf:get-runtime-state',
      source,
      risk: 'safe',
      description: 'Get the current safe Module Federation runtime state.',
      handler: () => reportReader.getRuntimeState(),
    });
    runtime.registerAction({
      name: 'mf:list-reports',
      source,
      risk: 'safe',
      description: 'List Module Federation loading report summaries.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum report count to return.',
          },
          traceId: {
            type: 'string',
            description: 'Exact report trace id.',
          },
          instanceRef: {
            type: 'string',
            description: 'Stable observability instance reference.',
          },
          remote: {
            type: 'string',
            description: 'Remote name or alias to match.',
          },
          expose: {
            type: 'string',
            description: 'Exposed module to match.',
          },
          shared: {
            type: 'string',
            description: 'Shared dependency name to match.',
          },
          status: {
            type: 'string',
            enum: reportStatuses,
            description: 'Report status to match.',
          },
          outcome: {
            type: 'string',
            enum: reportOutcomes,
            description: 'Report outcome to match.',
          },
        },
      },
      getInputOptions: (inputName) =>
        getReportInputOptions(inputName, reportReader),
      handler: (payload) => listReports(reportReader, payload),
    });
    runtime.registerAction({
      name: 'mf:get-latest-report',
      source,
      risk: 'safe',
      description: 'Get the latest Module Federation loading report.',
      handler: () => {
        const report = reportReader.getLatestReport();
        return {
          found: report !== undefined,
          report,
        };
      },
    });
    runtime.registerAction({
      name: 'mf:get-report',
      source,
      risk: 'safe',
      description: 'Get a Module Federation loading report by trace id.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['traceId'],
        properties: {
          traceId: {
            type: 'string',
            description: 'Report trace id.',
          },
        },
      },
      getInputOptions: (inputName) =>
        getReportInputOptions(inputName, reportReader),
      handler: (payload) => {
        const traceId = getPayloadString(payload, 'traceId');
        const report = traceId ? reportReader.getReport(traceId) : undefined;
        return {
          found: report !== undefined,
          traceId,
          report,
        };
      },
    });
    runtime.registerAction({
      name: 'mf:export-report',
      source,
      risk: 'safe',
      description: 'Export a Module Federation loading report.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          traceId: {
            type: 'string',
            description:
              'Report trace id. When omitted, exports latest report.',
          },
        },
      },
      getInputOptions: (inputName) =>
        getReportInputOptions(inputName, reportReader),
      handler: (payload) => {
        const traceId = getPayloadString(payload, 'traceId');
        const report = reportReader.exportReport(traceId);
        return {
          found: report !== undefined,
          traceId: report?.traceId || traceId,
          report,
        };
      },
    });
  }

  if (!reportReader) {
    registeredActionRuntimes.add(runtime);
    return;
  }

  runtime.registerAction({
    name: 'mf:get-federation-global',
    source,
    risk: 'safe',
    description: 'Get a summary of the current global MF runtime state.',
    handler: () => getFederationGlobalSummary(reportReader.getRuntimeState()),
  });
  runtime.registerAction({
    name: 'mf:get-federation-module-info',
    source,
    risk: 'safe',
    description: 'Get __FEDERATION__.moduleInfo or one moduleInfo entry.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        key: {
          type: 'string',
          description: 'moduleInfo key.',
        },
        name: {
          type: 'string',
          description: 'moduleInfo name. Used when key is omitted.',
        },
        instanceRef: {
          type: 'string',
          description: 'Consumer observability instance reference.',
        },
      },
    },
    getInputOptions: (inputName) =>
      getFederationModuleInfoInputOptions(
        inputName,
        reportReader.getRuntimeState(),
      ),
    handler: (payload) =>
      getFederationModuleInfoActionResult(
        payload,
        reportReader.getRuntimeState(),
      ),
  });
  runtime.registerAction({
    name: 'mf:list-federation-instances',
    source,
    risk: 'safe',
    description: 'List current __FEDERATION__.__INSTANCES__ entries.',
    handler: () => {
      const instances = reportReader.getRuntimeState().instances;
      return {
        count: instances.length,
        instances,
      };
    },
  });
  runtime.registerAction({
    name: 'mf:get-federation-instance-config',
    source,
    risk: 'safe',
    description: 'Get one __FEDERATION__.__INSTANCES__ config.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: {
          type: 'string',
          description: 'Instance name.',
        },
        instanceRef: {
          type: 'string',
          description: 'Stable observability instance reference.',
        },
        index: {
          type: 'number',
          description: 'Unstable compatibility index in __INSTANCES__.',
        },
      },
    },
    getInputOptions: (inputName) =>
      getFederationInstanceInputOptions(
        inputName,
        reportReader.getRuntimeState(),
      ),
    handler: (payload) =>
      getFederationInstanceConfigActionResult(
        payload,
        reportReader.getRuntimeState(),
      ),
  });

  registeredActionRuntimes.add(runtime);
}

function listReports(
  reportReader: OpenRuntimeReportReader,
  payload: unknown,
): Record<string, unknown> {
  const query = getReportQuery(payload);
  const reports = hasReportQueryFilter(query)
    ? reportReader.findReports(query)
    : reportReader.getReports({ limit: query.limit });

  return {
    count: reports.length,
    reports: reports.map(createReportSummary),
  };
}

function getReportQuery(payload: unknown): ObservabilityReportQuery {
  const query: ObservabilityReportQuery = {};
  const limit = getPayloadNumber(payload, 'limit');
  const traceId = getPayloadString(payload, 'traceId');
  const instanceRef = getPayloadString(payload, 'instanceRef');
  const remote = getPayloadString(payload, 'remote');
  const expose = getPayloadString(payload, 'expose');
  const shared = getPayloadString(payload, 'shared');
  const status = getPayloadReportStatus(payload, 'status');
  const outcome = getPayloadReportOutcome(payload, 'outcome');

  if (limit !== undefined) {
    query.limit = limit;
  }
  if (traceId !== undefined) {
    query.traceId = traceId;
  }
  if (instanceRef !== undefined) {
    query.instanceRef = instanceRef;
  }
  if (remote !== undefined) {
    query.remote = remote;
  }
  if (expose !== undefined) {
    query.expose = expose;
  }
  if (shared !== undefined) {
    query.shared = shared;
  }
  if (status !== undefined) {
    query.status = status;
  }
  if (outcome !== undefined) {
    query.outcome = outcome;
  }

  return query;
}

function hasReportQueryFilter(query: ObservabilityReportQuery): boolean {
  return (
    query.traceId !== undefined ||
    query.instanceRef !== undefined ||
    query.remote !== undefined ||
    query.expose !== undefined ||
    query.shared !== undefined ||
    query.status !== undefined ||
    query.outcome !== undefined
  );
}

function createReportSummary(
  report: ObservabilityReport,
): Record<string, unknown> {
  return compactObject({
    traceId: report.traceId,
    instanceRef: report.instanceRef,
    status: report.status,
    requestId: report.requestId,
    requestAlias: report.requestAlias,
    hostName: report.hostName,
    runtimeVersion: report.runtimeVersion,
    remote: report.remote,
    expose: report.expose,
    shared: report.shared,
    startedAt: report.startedAt,
    updatedAt: report.updatedAt,
    duration: report.duration,
    outcome: report.summary.outcome,
    lastPhase: report.summary.lastPhase,
    eventCount: report.summary.eventCount,
    failedPhase: report.failedPhase,
    errorCode: report.errorCode,
    errorMessage: report.errorMessage,
  });
}

function getReportInputOptions(
  inputName: string,
  reportReader: OpenRuntimeReportReader,
): RuntimeInputOption[] {
  if (inputName !== 'traceId') {
    return [];
  }

  return reportReader.getReports({ limit: 20 }).map((report) => ({
    value: report.traceId,
    description:
      report.remote?.name ||
      report.shared?.name ||
      report.requestAlias ||
      report.requestId ||
      report.summary.outcome,
  }));
}

function getFederationGlobalSummary(
  runtimeState: ObservabilityRuntimeState,
): Record<string, unknown> {
  return {
    available: true,
    schemaVersion: runtimeState.schemaVersion,
    observedAt: runtimeState.observedAt,
    scope: runtimeState.scope,
    completeness: runtimeState.completeness,
    capabilities: runtimeState.capabilities,
    moduleInfoCount: runtimeState.moduleInfo.length,
    moduleInfoKeys: runtimeState.moduleInfo.map((entry) => entry.key),
    instanceCount: runtimeState.instances.length,
    instances: runtimeState.instances,
    relationshipCount: runtimeState.relationships.length,
  };
}

function getFederationModuleInfoActionResult(
  payload: unknown,
  runtimeState: ObservabilityRuntimeState,
): Record<string, unknown> {
  const key =
    getPayloadString(payload, 'key') || getPayloadString(payload, 'name');
  const instanceRef = getPayloadString(payload, 'instanceRef');
  const instance = instanceRef
    ? runtimeState.instances.find(
        (candidate) => candidate.instanceRef === instanceRef,
      )
    : undefined;
  if (instanceRef && !instance) {
    return {
      available: true,
      found: false,
      instanceRef,
      instances: runtimeState.instances.map(createInstanceCandidate),
    };
  }
  const matched = key
    ? runtimeState.moduleInfo.find(
        (entry) => entry.key === key || entry.name === key,
      )
    : undefined;
  return key
    ? compactObject({
        available: true,
        found: matched !== undefined,
        key,
        instance: instance ? createInstanceCandidate(instance) : undefined,
        relationships: instance
          ? runtimeState.relationships.filter(
              (relationship) =>
                relationship.consumerInstanceRef === instance.instanceRef,
            )
          : undefined,
        moduleInfo: matched,
      })
    : compactObject({
        available: true,
        keys: runtimeState.moduleInfo.map((entry) => entry.key),
        instance: instance ? createInstanceCandidate(instance) : undefined,
        relationships: instance
          ? runtimeState.relationships.filter(
              (relationship) =>
                relationship.consumerInstanceRef === instance.instanceRef,
            )
          : undefined,
        moduleInfo: runtimeState.moduleInfo,
      });
}

function getFederationModuleInfoInputOptions(
  inputName: string,
  runtimeState: ObservabilityRuntimeState,
): RuntimeInputOption[] {
  if (
    inputName !== 'key' &&
    inputName !== 'name' &&
    inputName !== 'instanceRef'
  ) {
    return [];
  }

  if (inputName === 'instanceRef') {
    return runtimeState.instances.map((instance) => ({
      value: instance.instanceRef,
      description:
        instance.optionsName || instance.name || instance.instanceRef,
    }));
  }

  return runtimeState.moduleInfo.map((entry) => ({
    value: entry.key,
  }));
}

function getFederationInstanceConfigActionResult(
  payload: unknown,
  runtimeState: ObservabilityRuntimeState,
): Record<string, unknown> {
  const instanceRef = getPayloadString(payload, 'instanceRef');
  const name = getPayloadString(payload, 'name');
  const index = getPayloadNumber(payload, 'index');
  const nameMatches = name
    ? runtimeState.instances.filter(
        (instance) => instance.name === name || instance.optionsName === name,
      )
    : [];
  const instance = instanceRef
    ? runtimeState.instances.find(
        (candidate) => candidate.instanceRef === instanceRef,
      )
    : nameMatches.length === 1
      ? nameMatches[0]
      : index !== undefined
        ? runtimeState.instances[index]
        : undefined;

  if (!instance) {
    return {
      found: false,
      instanceRef,
      name,
      index,
      unstableIndex: index !== undefined || undefined,
      candidates:
        nameMatches.length > 1
          ? nameMatches.map(createInstanceCandidate)
          : undefined,
      instances: runtimeState.instances.map(createInstanceCandidate),
    };
  }

  return {
    found: true,
    unstableIndex: index !== undefined || undefined,
    instance,
  };
}

function getFederationInstanceInputOptions(
  inputName: string,
  runtimeState: ObservabilityRuntimeState,
): RuntimeInputOption[] {
  if (
    inputName !== 'name' &&
    inputName !== 'index' &&
    inputName !== 'instanceRef'
  ) {
    return [];
  }

  return runtimeState.instances.map((instance, index) => ({
    value:
      inputName === 'instanceRef'
        ? instance.instanceRef
        : inputName === 'index'
          ? index
          : instance.optionsName || instance.name || instance.instanceRef,
    description: `${instance.optionsName || instance.name || 'unnamed'} (${instance.instanceRef})`,
  }));
}

function createInstanceCandidate(
  instance: ObservabilityRuntimeStateInstance,
): Record<string, unknown> {
  return compactObject({
    instanceRef: instance.instanceRef,
    name: instance.name,
    optionsName: instance.optionsName,
    optionsVersion: instance.optionsVersion,
    runtimeVersion: instance.runtimeVersion,
    role: instance.role,
    active: instance.active,
  });
}

function getPayloadString(payload: unknown, key: string): string | undefined {
  const value = getRecordProperty(asRecord(payload), key);
  return typeof value === 'string' && value ? value : undefined;
}

function getPayloadNumber(payload: unknown, key: string): number | undefined {
  const value = getRecordProperty(asRecord(payload), key);
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function getPayloadReportStatus(
  payload: unknown,
  key: string,
): ObservabilityReportStatus | undefined {
  const value = getPayloadString(payload, key);
  return value && isReportStatus(value) ? value : undefined;
}

function getPayloadReportOutcome(
  payload: unknown,
  key: string,
): ObservabilityReportOutcome | undefined {
  const value = getPayloadString(payload, key);
  return value && isReportOutcome(value) ? value : undefined;
}

function isReportStatus(value: string): value is ObservabilityReportStatus {
  return reportStatuses.includes(value as ObservabilityReportStatus);
}

function isReportOutcome(value: string): value is ObservabilityReportOutcome {
  return reportOutcomes.includes(value as ObservabilityReportOutcome);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function getRecordProperty(
  record: Record<string, unknown> | undefined,
  key: string,
): unknown {
  return record ? record[key] : undefined;
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
