import type {
  ObservabilityEvent,
  ObservabilityLevel,
  ObservabilityMetadata,
  ObservabilityModuleInfoEntry,
  ObservabilityModuleInfoSummary,
  ObservabilityOwnerHint,
  ObservabilityRemoteInfo,
  ObservabilityReport,
  ObservabilityRuntimeEventInput,
  ObservabilityRuntimeOptions,
} from '../type';
import { MAX_MODULE_INFO_ENTRIES } from '../constant';
import { getFederationGlobal } from '../runtime/global';
import { createRemoteInfo } from '../runtime/remote';
import {
  clipObservabilityMetadata,
  clipText,
  isRecord,
  sanitizeText,
  sanitizeUrl,
} from '../utils';

export let traceCounter = 0;

export function normalizeScope(value: unknown) {
  const sanitized = sanitizeText(value, 120);
  const normalized = sanitized?.replace(/[^\w:@.-]+/g, '-');

  return normalized || 'default';
}

export function shouldRecordEvent(
  level: ObservabilityLevel,
  event: ObservabilityRuntimeEventInput,
) {
  if (level === 'verbose') {
    return true;
  }

  if (level === 'summary') {
    return event.status !== 'start';
  }

  return event.status === 'error' || Boolean(event.error);
}

export function createTraceId(event: ObservabilityRuntimeEventInput) {
  traceCounter += 1;
  const owner = event.remote?.name || event.phase || 'runtime';
  const normalizedOwner = owner.replace(/[^a-z0-9]+/gi, '-').slice(0, 80);

  return `mf-${normalizedOwner}-${Date.now().toString(36)}-${traceCounter.toString(
    36,
  )}`;
}

export function getPhaseDurationKey(event: ObservabilityEvent) {
  const exposeKey =
    event.phase === 'expose' || event.phase === 'moduleFactory'
      ? event.expose || ''
      : '';

  return [
    event.traceId,
    event.phase,
    event.requestId || event.remote?.name || event.shared?.name || '',
    exposeKey,
  ].join('|');
}

export function getRemoteEntryKey(
  remote: ObservabilityRemoteInfo | undefined,
): string | undefined {
  if (!remote?.name) {
    return undefined;
  }

  return [remote.name, remote.entryGlobalName || '', remote.entry || ''].join(
    '|',
  );
}

export function getHostRemotesSummary(
  options: ObservabilityRuntimeOptions | undefined,
): string | undefined {
  const remotes = (options?.remotes || [])
    .map((remote) => clipText(remote.alias || remote.name || remote.entry, 120))
    .filter((remote): remote is string => Boolean(remote))
    .slice(0, 20);

  return remotes.length ? remotes.join(',') : undefined;
}

export function resolveRemoteFromRequestId(
  id: string | undefined,
  options: ObservabilityRuntimeOptions | undefined,
): ObservabilityRemoteInfo | undefined {
  if (!id) {
    return undefined;
  }

  const matchedRemote = (options?.remotes || [])
    .filter((remote) => {
      const keys = [remote.alias, remote.name].filter((key): key is string =>
        Boolean(key),
      );

      return keys.some((key) => id === key || id.startsWith(`${key}/`));
    })
    .sort((left, right) => {
      const leftKey = left.alias || left.name || '';
      const rightKey = right.alias || right.name || '';

      return rightKey.length - leftKey.length;
    })[0];

  return createRemoteInfo(matchedRemote);
}

export function resolveAliasRequestId(
  requestId: string | undefined,
  remote: ObservabilityRemoteInfo | undefined,
): string | undefined {
  if (!requestId || !remote?.alias || remote.alias === remote.name) {
    return undefined;
  }

  if (requestId === remote.name) {
    return remote.alias;
  }

  if (requestId.startsWith(`${remote.name}/`)) {
    return `${remote.alias}/${requestId.slice(remote.name.length + 1)}`;
  }

  return undefined;
}

export function sanitizeModuleInfoPath(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  return clipText(value, 320);
}

export function sanitizeModuleInfoGetPublicPath(
  value: unknown,
): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  return clipText(value, 500);
}

export function sanitizeModuleInfoRemoteEntry(
  value: unknown,
): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  return clipText(value, 320);
}

export function createClippedModuleInfoEntry(
  rawName: string,
  rawValue: unknown,
): ObservabilityModuleInfoEntry | undefined {
  const name = clipText(rawName, 240);
  if (!name) {
    return undefined;
  }

  const value = isRecord(rawValue) ? rawValue : {};

  return {
    name,
    publicPath: sanitizeModuleInfoPath(value['publicPath']),
    getPublicPath: sanitizeModuleInfoGetPublicPath(value['getPublicPath']),
    remoteEntry: sanitizeModuleInfoRemoteEntry(value['remoteEntry']),
    globalName: sanitizeText(value['globalName'], 160),
  };
}

export function normalizeModuleInfoLookupValue(
  value: unknown,
): string | undefined {
  if (typeof value !== 'string' || !value) {
    return undefined;
  }

  const sanitized =
    /^https?:\/\//i.test(value) || value.startsWith('/')
      ? sanitizeUrl(value)
      : sanitizeText(value, 240);

  return sanitized?.toLowerCase();
}

export function getModuleInfoLookupValues(
  report: ObservabilityReport,
): Set<string> {
  return new Set(
    [
      report.requestId?.split('/')[0],
      report.remote?.name,
      report.remote?.alias,
      report.remote?.entry,
      report.remote?.entryGlobalName,
      report.sanitizedUrl,
      report.errorContext?.['remoteName'],
      report.errorContext?.['remoteAlias'],
      report.errorContext?.['url'],
      report.summary.error?.context?.['remoteName'],
      report.summary.error?.context?.['remoteAlias'],
      report.summary.error?.context?.['url'],
    ]
      .map(normalizeModuleInfoLookupValue)
      .filter((value): value is string => Boolean(value)),
  );
}

export function matchesModuleInfoLookup(
  entry: ObservabilityModuleInfoEntry,
  lookupValues: Set<string>,
): boolean {
  if (!lookupValues.size) {
    return false;
  }

  const entryValues = [
    entry.name,
    entry.publicPath,
    entry.getPublicPath,
    entry.remoteEntry,
    entry.globalName,
  ]
    .map(normalizeModuleInfoLookupValue)
    .filter((value): value is string => Boolean(value));

  return entryValues.some((entryValue) =>
    Array.from(lookupValues).some(
      (lookupValue) =>
        entryValue === lookupValue ||
        entryValue.startsWith(`${lookupValue}:`) ||
        entryValue.includes(`:${lookupValue}`) ||
        (lookupValue.startsWith('http') && entryValue.includes(lookupValue)),
    ),
  );
}

export function getModuleInfoCaptureReason(
  report: ObservabilityReport,
): string | undefined {
  const text = [
    report.errorCode,
    report.errorName,
    report.errorMessage,
    report.summary.error?.errorCode,
    report.summary.error?.errorName,
    report.summary.error?.errorMessage,
    ...report.events.flatMap((event) => [
      event.errorCode,
      event.errorName,
      event.errorMessage,
      event.message,
      event.lifecycle,
    ]),
  ].join('\n');

  if (/RUNTIME-007/.test(text)) {
    return 'remote-snapshot';
  }
  if (/RUNTIME-011/.test(text)) {
    return 'remote-entry-missing-in-snapshot';
  }
  if (/moduleInfo|module info/i.test(text)) {
    return 'module-info';
  }
  if (/remote snapshot|global snapshot|snapshot/i.test(text)) {
    return 'remote-snapshot';
  }

  return undefined;
}

export function createModuleInfoSummary(
  report: ObservabilityReport,
): ObservabilityModuleInfoSummary | undefined {
  const reason = getModuleInfoCaptureReason(report);
  if (!reason) {
    return undefined;
  }

  const moduleInfo = getFederationGlobal()?.moduleInfo;
  const rawEntries = isRecord(moduleInfo) ? Object.entries(moduleInfo) : [];
  const clippedEntries = rawEntries
    .map(([name, value]) => createClippedModuleInfoEntry(name, value))
    .filter((entry): entry is ObservabilityModuleInfoEntry => Boolean(entry));
  const lookupValues = getModuleInfoLookupValues(report);
  const matchedEntries = clippedEntries.filter((entry) =>
    matchesModuleInfoLookup(entry, lookupValues),
  );

  return {
    reason,
    clipped: true,
    totalCount: rawEntries.length,
    matchedCount: matchedEntries.length,
    entries: matchedEntries.slice(0, MAX_MODULE_INFO_ENTRIES),
    availableNames: matchedEntries.length
      ? undefined
      : clippedEntries
          .map((entry) => entry.name)
          .slice(0, MAX_MODULE_INFO_ENTRIES),
  };
}

export function getResourceErrorType(
  event: Pick<
    ObservabilityEvent,
    'errorCode' | 'errorMessage' | 'message' | 'lifecycle' | 'resource'
  >,
): string | undefined {
  if (event.resource?.errorType) {
    return event.resource.errorType;
  }
  const text = `${event.errorMessage || ''}\n${event.message || ''}`;

  if (!event.errorCode && !text) {
    return undefined;
  }

  if (/ScriptExecutionError/i.test(text)) {
    return 'script-execution';
  }

  if (/timeout|timed out/i.test(text)) {
    return 'timeout';
  }

  if (
    /ScriptNetworkError|NetworkError|Failed to fetch|Request failed|ERR_|404|CORS/i.test(
      text,
    )
  ) {
    return 'network';
  }

  return event.errorCode === 'RUNTIME-008' ? 'unknown' : undefined;
}

export function getOwnerHint(
  event: Pick<
    ObservabilityEvent,
    | 'errorCode'
    | 'phase'
    | 'shared'
    | 'remote'
    | 'errorMessage'
    | 'message'
    | 'lifecycle'
    | 'resource'
  >,
): ObservabilityOwnerHint | undefined {
  const resourceErrorType = getResourceErrorType(event);

  if (event.resource?.errorType) {
    if (
      resourceErrorType === 'network' ||
      resourceErrorType === 'timeout' ||
      resourceErrorType === 'http'
    ) {
      return 'network';
    }
    if (resourceErrorType === 'execution' || resourceErrorType === 'content') {
      return 'remote';
    }
  }

  switch (event.errorCode) {
    case 'RUNTIME-001':
    case 'RUNTIME-002':
    case 'RUNTIME-011':
    case 'RUNTIME-013':
    case 'RUNTIME-014':
    case 'RUNTIME-015':
      return 'remote';
    case 'RUNTIME-003':
    case 'RUNTIME-004':
    case 'RUNTIME-007':
      return 'host';
    case 'RUNTIME-005':
    case 'RUNTIME-006':
    case 'RUNTIME-012':
      return 'shared';
    case 'RUNTIME-008':
      return resourceErrorType === 'network' || resourceErrorType === 'timeout'
        ? 'network'
        : 'remote';
    default:
      if (event.shared) {
        return 'shared';
      }
      if (event.remote) {
        return 'remote';
      }
      if (event.phase === 'manifest' || event.phase === 'matchRemote') {
        return 'host';
      }
      return event.errorCode ? 'runtime' : undefined;
  }
}

export function getRetryable(
  event: Pick<
    ObservabilityEvent,
    'errorCode' | 'errorMessage' | 'message' | 'lifecycle' | 'resource'
  >,
): boolean | undefined {
  const resourceErrorType = getResourceErrorType(event);

  if (resourceErrorType === 'network' || resourceErrorType === 'timeout') {
    return true;
  }
  if (resourceErrorType === 'execution' || resourceErrorType === 'content') {
    return false;
  }

  if (event.errorCode === 'RUNTIME-008') {
    return resourceErrorType === 'network' || resourceErrorType === 'timeout';
  }

  if (event.errorCode === 'RUNTIME-003') {
    const text = `${event.errorMessage || ''}\n${event.message || ''}`;
    return /NetworkError|Failed to fetch|Request failed|timeout|timed out/i.test(
      text,
    );
  }

  if (
    event.errorCode &&
    [
      'RUNTIME-001',
      'RUNTIME-002',
      'RUNTIME-004',
      'RUNTIME-005',
      'RUNTIME-006',
      'RUNTIME-011',
      'RUNTIME-012',
      'RUNTIME-013',
      'RUNTIME-014',
      'RUNTIME-015',
    ].includes(event.errorCode)
  ) {
    return false;
  }

  return undefined;
}

export function createErrorContext(
  event: ObservabilityEvent,
  inputContext?: Record<string, unknown>,
): ObservabilityMetadata | undefined {
  const context: Record<string, unknown> = {
    ...inputContext,
  };

  if (event.lifecycle) {
    context['lifecycle'] = event.lifecycle;
  }
  if (event.requestId) {
    context['requestId'] = event.requestId;
  }
  if (event.requestAlias) {
    context['requestAlias'] = event.requestAlias;
  }
  if (event.remote?.name) {
    context['remoteName'] = event.remote.name;
  }
  if (event.remote?.alias) {
    context['remoteAlias'] = event.remote.alias;
  }
  if (event.remote?.type) {
    context['remoteType'] = event.remote.type;
  }
  if (event.remote?.entryGlobalName) {
    context['entryGlobalName'] = event.remote.entryGlobalName;
  }
  if (event.sanitizedUrl) {
    context['url'] = event.sanitizedUrl;
  }
  if (event.expose) {
    context['expose'] = event.expose;
  }
  if (event.shared?.name) {
    context['shareName'] = event.shared.name;
  }
  if (event.shared?.requiredVersion) {
    context['requiredVersion'] = event.shared.requiredVersion;
  }
  if (event.shared?.selectedVersion) {
    context['selectedVersion'] = event.shared.selectedVersion;
  }
  if (event.shared?.provider) {
    context['provider'] = event.shared.provider;
  }

  const resourceErrorType = getResourceErrorType(event);
  if (resourceErrorType) {
    context['resourceErrorType'] =
      resourceErrorType === 'execution'
        ? 'script-execution'
        : resourceErrorType;
  }

  return clipObservabilityMetadata(context);
}
