import type { ModuleFederation } from '../core';
import type {
  RemoteInfo,
  ResourceLoadCacheSource,
  ResourceLoadContext,
  ResourceLoadErrorSummary,
  ResourceLoadErrorType,
  ResourceLoadEvent,
  ResourceLoadOutcome,
  ResourceLoadRemote,
  ResourceLoadResult,
} from '../type';

const RESOURCE_ERROR_URL_PATTERN = /https?:\/\/[^\s'"<>]+/g;
const RESOURCE_ERROR_SENSITIVE_PATTERN =
  /\b(token|authorization|cookie|secret|password|session|access_token|refresh_token|api_key|apikey|key)\s*[:=]\s*([^&\s'",;<>]+)/gi;
const RESOURCE_ERROR_ABSOLUTE_PATH_PATTERN =
  /(?:file:\/\/)?(?:\/(?:Users|private|var|tmp|home|workspace|opt|usr)\/[^\s)]+|[A-Za-z]:\\[^\s)]+)/g;

function sanitizeResourceErrorText(value: unknown, maxLength = 800): string {
  const sanitized = String(value)
    .replace(RESOURCE_ERROR_URL_PATTERN, (rawUrl) => {
      try {
        const url = new URL(rawUrl);
        url.search = '';
        url.hash = '';
        return url.toString();
      } catch {
        return '[redacted-url]';
      }
    })
    .replace(RESOURCE_ERROR_SENSITIVE_PATTERN, '[redacted]')
    .replace(RESOURCE_ERROR_ABSOLUTE_PATH_PATTERN, '[redacted-path]');

  return sanitized.length > maxLength
    ? `${sanitized.slice(0, maxLength)}...`
    : sanitized;
}

function createResourceLoadErrorSummary(
  error: unknown,
): ResourceLoadErrorSummary | undefined {
  if (error === undefined || error === null) {
    return undefined;
  }

  if (error instanceof Error) {
    return {
      name: sanitizeResourceErrorText(error.name, 120),
      message: sanitizeResourceErrorText(error.message),
    };
  }

  return {
    message: sanitizeResourceErrorText(error),
  };
}

function getResourceLoadRemote(
  remoteInfo?: RemoteInfo,
): ResourceLoadRemote | undefined {
  if (!remoteInfo) {
    return undefined;
  }

  return {
    name: remoteInfo.name,
    alias: remoteInfo.alias,
    version: remoteInfo.version,
    buildVersion: remoteInfo.buildVersion,
    type: remoteInfo.type,
    entryGlobalName: remoteInfo.entryGlobalName,
  };
}

export interface ResourceLoadAttempt {
  event: ResourceLoadEvent;
  finish(
    outcome: ResourceLoadOutcome,
    details?: {
      httpStatus?: number;
      mimeType?: string;
      redirected?: boolean;
      cacheSource?: ResourceLoadCacheSource;
      errorType?: ResourceLoadErrorType;
      error?: unknown;
    },
  ): Promise<ResourceLoadResult>;
}

export function classifyResourceLoadError(
  error: unknown,
  fallback: ResourceLoadErrorType = 'unknown',
): ResourceLoadErrorType {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const value = `${error.name} ${error.message}`.toLowerCase();
  if (value.includes('timeout') || value.includes('timed out')) {
    return 'timeout';
  }
  if (
    value.includes('scriptexecutionerror') ||
    value.includes('execution error')
  ) {
    return 'execution';
  }
  if (
    value.includes('network') ||
    value.includes('failed to fetch') ||
    value.includes('cors') ||
    value.includes('unreachable') ||
    value.includes('enoent')
  ) {
    return 'network';
  }
  if (value.includes('runtime-001') || value.includes('global not found')) {
    return 'initialization';
  }
  if (
    error instanceof SyntaxError ||
    value.includes('json') ||
    value.includes('valid federation manifest')
  ) {
    return 'content';
  }

  return fallback;
}

export async function startResourceLoad(
  origin: ModuleFederation,
  options: {
    context: ResourceLoadContext;
    url: string;
    remoteInfo?: RemoteInfo;
    expose?: string;
  },
): Promise<ResourceLoadAttempt> {
  const event: ResourceLoadEvent = {
    ...options.context,
    url: options.url,
    remote: getResourceLoadRemote(options.remoteInfo),
    expose: options.expose || options.context.expose,
    startedAt: Date.now(),
  };
  await origin.loaderHook.lifecycle.beforeLoadResource.emit(event);

  let result: ResourceLoadResult | undefined;
  return {
    event,
    async finish(outcome, details = {}) {
      if (result) {
        return result;
      }

      const endedAt = Date.now();
      const { error, ...safeDetails } = details;
      const errorSummary = createResourceLoadErrorSummary(error);
      result = {
        ...event,
        ...safeDetails,
        ...(errorSummary ? { error: errorSummary } : {}),
        endedAt,
        duration: Math.max(0, endedAt - event.startedAt),
        outcome,
      };
      await origin.loaderHook.lifecycle.afterLoadResource.emit(result);
      return result;
    },
  };
}

export async function emitCachedResourceLoad(
  origin: ModuleFederation,
  options: {
    context: ResourceLoadContext;
    url: string;
    remoteInfo?: RemoteInfo;
    expose?: string;
    cacheSource: ResourceLoadCacheSource;
  },
): Promise<ResourceLoadResult> {
  const attempt = await startResourceLoad(origin, options);
  return attempt.finish('cached', {
    cacheSource: options.cacheSource,
  });
}
