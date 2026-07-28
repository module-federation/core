import type {
  ObservabilityRemoteInfo,
  ObservabilityResourceInfo,
  ObservabilityRuntimeRemoteSource,
} from '../type';
import {
  clipText,
  omitUndefinedFields,
  sanitizeText,
  sanitizeUrl,
} from '../utils';

export function sanitizeRemote(
  remote: ObservabilityRemoteInfo | undefined,
): ObservabilityRemoteInfo | undefined {
  if (!remote || !remote.name) {
    return undefined;
  }

  return {
    name: remote.name,
    alias: sanitizeText(remote.alias, 120),
    entry: clipText(remote.entry, 320),
    entryGlobalName: sanitizeText(remote.entryGlobalName, 120),
    type: sanitizeText(remote.type, 80),
  };
}

export function sanitizeResource(
  resource: ObservabilityResourceInfo | undefined,
): ObservabilityResourceInfo | undefined {
  if (!resource) {
    return undefined;
  }

  const type = sanitizeText(resource.type, 80);
  if (!type) {
    return undefined;
  }

  return omitUndefinedFields({
    type,
    initiator: resource.initiator,
    outcome: resource.outcome,
    url: sanitizeUrl(resource.url),
    startedAt: Number.isFinite(resource.startedAt)
      ? resource.startedAt
      : Date.now(),
    endedAt:
      resource.endedAt !== undefined && Number.isFinite(resource.endedAt)
        ? resource.endedAt
        : undefined,
    duration:
      resource.duration !== undefined && Number.isFinite(resource.duration)
        ? Math.max(0, resource.duration)
        : undefined,
    httpStatus:
      resource.httpStatus !== undefined && Number.isFinite(resource.httpStatus)
        ? resource.httpStatus
        : undefined,
    mimeType: sanitizeText(resource.mimeType, 160),
    redirected:
      typeof resource.redirected === 'boolean'
        ? resource.redirected
        : undefined,
    cacheSource: sanitizeText(resource.cacheSource, 80),
    errorType: sanitizeText(resource.errorType, 80),
  });
}

export function createRemoteInfo(
  remote: ObservabilityRuntimeRemoteSource | undefined,
): ObservabilityRemoteInfo | undefined {
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

export function isManifestUrl(value: string | undefined): boolean {
  const sanitized = sanitizeUrl(value);

  return Boolean(sanitized && /manifest.*\.json$/i.test(sanitized));
}
