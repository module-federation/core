import type { OpenRuntimeCore, RuntimeInputOption } from '@openruntime/core';

import type {
  ObservabilityReport,
  ObservabilityReportListOptions,
  ObservabilityReportOutcome,
  ObservabilityReportQuery,
  ObservabilityReportStatus,
} from './core';

export interface OpenRuntimeReportReader {
  getReports(options?: ObservabilityReportListOptions): ObservabilityReport[];
  findReports(query?: ObservabilityReportQuery): ObservabilityReport[];
  getLatestReport(): ObservabilityReport | undefined;
  getReport(traceId: string): ObservabilityReport | undefined;
  exportReport(traceId?: string): ObservabilityReport | undefined;
}

type FederationGlobalLike = {
  __GLOBAL_PLUGIN__?: unknown[];
  __DEBUG_CONSTRUCTOR_VERSION__?: string;
  moduleInfo?: Record<string, unknown>;
  __INSTANCES__?: unknown[];
  __SHARE__?: Record<string, unknown>;
  __MANIFEST_LOADING__?: Record<string, unknown>;
  __PRELOADED_MAP__?: Map<unknown, unknown>;
};

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

  runtime.registerAction({
    name: 'mf:get-federation-global',
    source,
    risk: 'safe',
    description: 'Get a summary of the current global MF runtime state.',
    handler: () => getFederationGlobalSummary(),
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
      },
    },
    getInputOptions: getFederationModuleInfoInputOptions,
    handler: getFederationModuleInfoActionResult,
  });
  runtime.registerAction({
    name: 'mf:list-federation-instances',
    source,
    risk: 'safe',
    description: 'List current __FEDERATION__.__INSTANCES__ entries.',
    handler: () => ({
      count: getFederationInstances().length,
      instances: getFederationInstanceSummaries(),
    }),
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
        index: {
          type: 'number',
          description: 'Instance index in __INSTANCES__.',
        },
      },
    },
    getInputOptions: getFederationInstanceInputOptions,
    handler: getFederationInstanceConfigActionResult,
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

function getFederationGlobalSummary(): Record<string, unknown> {
  const federation = getFederationGlobal();
  if (!federation) {
    return {
      available: false,
    };
  }

  const moduleInfoKeys = Object.keys(federation.moduleInfo || {});
  const shareScopeKeys = Object.keys(federation.__SHARE__ || {});
  const manifestLoadingKeys = Object.keys(
    federation.__MANIFEST_LOADING__ || {},
  );
  const preloadedMap = federation.__PRELOADED_MAP__;

  return compactObject({
    available: true,
    debugConstructorVersion: federation.__DEBUG_CONSTRUCTOR_VERSION__,
    globalPluginCount: federation.__GLOBAL_PLUGIN__?.length || 0,
    moduleInfoCount: moduleInfoKeys.length,
    moduleInfoKeys,
    instanceCount: federation.__INSTANCES__?.length || 0,
    instances: getFederationInstanceSummaries(),
    shareScopeKeys,
    manifestLoadingKeys,
    preloadedKeys: preloadedMap
      ? toJsonSafeValue(Array.from(preloadedMap.keys()))
      : undefined,
  });
}

function getFederationModuleInfoActionResult(
  payload: unknown,
): Record<string, unknown> {
  const moduleInfo = getFederationGlobal()?.moduleInfo;
  if (!moduleInfo) {
    return {
      available: false,
    };
  }

  const key =
    getPayloadString(payload, 'key') || getPayloadString(payload, 'name');
  if (key) {
    return {
      available: true,
      found: Object.hasOwnProperty.call(moduleInfo, key),
      key,
      moduleInfo: toJsonSafeValue(moduleInfo[key], {
        depth: 5,
        maxArrayLength: 50,
        maxObjectKeys: 80,
      }),
    };
  }

  return {
    available: true,
    keys: Object.keys(moduleInfo),
    moduleInfo: toJsonSafeValue(moduleInfo, {
      depth: 5,
      maxArrayLength: 50,
      maxObjectKeys: 80,
    }),
  };
}

function getFederationModuleInfoInputOptions(
  inputName: string,
): RuntimeInputOption[] {
  if (inputName !== 'key' && inputName !== 'name') {
    return [];
  }

  return Object.keys(getFederationGlobal()?.moduleInfo || {}).map((key) => ({
    value: key,
  }));
}

function getFederationInstanceConfigActionResult(
  payload: unknown,
): Record<string, unknown> {
  const instances = getFederationInstances();
  const index = getPayloadNumber(payload, 'index');
  const name = getPayloadString(payload, 'name');
  const matchedIndex =
    index !== undefined
      ? index
      : instances.findIndex(
          (instance, instanceIndex) =>
            getFederationInstanceName(instance, instanceIndex) === name,
        );
  const instance =
    matchedIndex >= 0 && matchedIndex < instances.length
      ? instances[matchedIndex]
      : undefined;

  if (!instance) {
    return {
      found: false,
      name,
      index,
      instances: getFederationInstanceSummaries(),
    };
  }

  return {
    found: true,
    instance: getFederationInstanceDetail(instance, matchedIndex),
  };
}

function getFederationInstanceInputOptions(
  inputName: string,
): RuntimeInputOption[] {
  if (inputName !== 'name' && inputName !== 'index') {
    return [];
  }

  return getFederationInstanceSummaries().map((summary) => {
    const value = inputName === 'index' ? summary.index : summary.name;
    return {
      value,
      description: String(summary.name),
    };
  });
}

function getFederationInstanceSummaries(): Array<{
  index: number;
  name: string;
  remoteCount?: number;
  sharedCount?: number;
  pluginCount?: number;
}> {
  return getFederationInstances().map((instance, index) => {
    const options = asRecord(getRecordProperty(asRecord(instance), 'options'));
    const remotes = getRecordProperty(options, 'remotes');
    const shared = getRecordProperty(options, 'shared');
    const plugins = getRecordProperty(options, 'plugins');

    return compactObject({
      index,
      name: getFederationInstanceName(instance, index),
      remoteCount: getCollectionSize(remotes),
      sharedCount: getCollectionSize(shared),
      pluginCount: getCollectionSize(plugins),
    }) as {
      index: number;
      name: string;
      remoteCount?: number;
      sharedCount?: number;
      pluginCount?: number;
    };
  });
}

function getFederationInstanceDetail(
  instance: unknown,
  index: number,
): Record<string, unknown> {
  const instanceRecord = asRecord(instance);
  const options = asRecord(getRecordProperty(instanceRecord, 'options'));

  return compactObject({
    index,
    name: getFederationInstanceName(instance, index),
    version: getRecordString(instanceRecord, 'version'),
    config: toJsonSafeValue(options, {
      depth: 6,
      maxArrayLength: 80,
      maxObjectKeys: 120,
    }),
  });
}

function getFederationInstanceName(instance: unknown, index: number): string {
  const instanceRecord = asRecord(instance);
  const options = asRecord(getRecordProperty(instanceRecord, 'options'));

  return (
    getRecordString(instanceRecord, 'name') ||
    getRecordString(options, 'name') ||
    `#${index}`
  );
}

function getFederationInstances(): unknown[] {
  return getFederationGlobal()?.__INSTANCES__ || [];
}

function getFederationGlobal(): FederationGlobalLike | undefined {
  const currentGlobal = globalThis as typeof globalThis & {
    __FEDERATION__?: FederationGlobalLike;
    __VMOK__?: FederationGlobalLike;
  };

  return currentGlobal.__FEDERATION__ || currentGlobal.__VMOK__;
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

function getRecordString(
  record: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = getRecordProperty(record, key);
  return typeof value === 'string' && value ? value : undefined;
}

function getCollectionSize(value: unknown): number | undefined {
  if (Array.isArray(value)) {
    return value.length;
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size;
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).length;
  }

  return undefined;
}

function toJsonSafeValue(
  value: unknown,
  options: {
    depth?: number;
    maxArrayLength?: number;
    maxObjectKeys?: number;
    seen?: WeakSet<object>;
  } = {},
): unknown {
  const depth = options.depth ?? 4;
  const maxArrayLength = options.maxArrayLength ?? 40;
  const maxObjectKeys = options.maxObjectKeys ?? 60;
  const seen = options.seen || new WeakSet<object>();

  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'undefined') {
    return undefined;
  }
  if (typeof value === 'function') {
    return `[function ${value.name || 'anonymous'}]`;
  }
  if (typeof value === 'symbol') {
    return value.toString();
  }
  if (typeof value !== 'object') {
    return String(value);
  }
  if (depth <= 0) {
    return '[max-depth]';
  }
  if (seen.has(value)) {
    return '[circular]';
  }

  seen.add(value);
  const nextOptions = {
    depth: depth - 1,
    maxArrayLength,
    maxObjectKeys,
    seen,
  };

  if (Array.isArray(value)) {
    const items = value
      .slice(0, maxArrayLength)
      .map((item) => toJsonSafeValue(item, nextOptions));
    if (value.length > maxArrayLength) {
      items.push(`[truncated ${value.length - maxArrayLength} items]`);
    }
    return items;
  }

  if (value instanceof Map) {
    const entries = Array.from(value.entries()).slice(0, maxArrayLength);
    return {
      type: 'Map',
      size: value.size,
      entries: entries.map(([entryKey, entryValue]) => [
        toJsonSafeValue(entryKey, nextOptions),
        toJsonSafeValue(entryValue, nextOptions),
      ]),
    };
  }

  if (value instanceof Set) {
    return {
      type: 'Set',
      size: value.size,
      values: Array.from(value.values())
        .slice(0, maxArrayLength)
        .map((item) => toJsonSafeValue(item, nextOptions)),
    };
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  const output: Record<string, unknown> = {};
  keys.slice(0, maxObjectKeys).forEach((key) => {
    const nextValue = toJsonSafeValue(record[key], nextOptions);
    if (nextValue !== undefined) {
      output[key] = nextValue;
    }
  });
  if (keys.length > maxObjectKeys) {
    output['__truncatedKeys'] = keys.length - maxObjectKeys;
  }

  return output;
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
