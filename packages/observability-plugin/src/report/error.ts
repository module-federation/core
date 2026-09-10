import type {
  ObservabilityEventSource,
  ObservabilityPluginOptions,
  ObservabilityResourceLoadResultArgs,
} from '../type';
import { ERROR_CODE_PATTERN } from '../constant';
import { getRawText, isRecord, sanitizeStack, sanitizeText } from '../utils';

export function normalizeEventSource(
  value: ObservabilityEventSource | undefined,
): ObservabilityEventSource | undefined {
  return value === 'runtime' || value === 'business' || value === 'react'
    ? value
    : undefined;
}

export function extractErrorCode(value: unknown): string | undefined {
  const matched = String(value ?? '').match(ERROR_CODE_PATTERN)?.[0];
  return matched ? sanitizeText(matched, 40) : undefined;
}

export function getErrorInfo(
  error: unknown,
  stackTraceOptions?: ObservabilityPluginOptions['stackTrace'],
): {
  errorCode?: string;
  errorName?: string;
  errorMessage?: string;
  errorStack?: string;
} {
  if (!error) {
    return {};
  }

  if (error instanceof Error) {
    return {
      errorCode: extractErrorCode(
        `${error.name}\n${error.message}\n${error.stack || ''}`,
      ),
      errorName: getRawText(error.name),
      errorMessage: getRawText(error.message),
      errorStack: sanitizeStack(error.stack, stackTraceOptions),
    };
  }

  if (isRecord(error) && typeof error.message === 'string') {
    return {
      errorCode: extractErrorCode(error.message),
      errorName:
        typeof error.name === 'string' ? getRawText(error.name) : undefined,
      errorMessage: getRawText(error.message),
    };
  }

  return {
    errorCode: extractErrorCode(error),
    errorMessage: getRawText(error),
  };
}

export function classifyResourceLoadError(
  resource: ObservabilityResourceLoadResultArgs,
): string | undefined {
  if (resource.outcome === 'timeout') {
    return 'timeout';
  }

  if (typeof resource.httpStatus === 'number' && resource.httpStatus >= 400) {
    return 'http';
  }

  const errorInfo = getErrorInfo(resource.error);
  const value =
    `${errorInfo.errorName || ''} ${errorInfo.errorMessage || ''}`.trim();
  if (!value) {
    return resource.outcome === 'error' ? 'unknown' : undefined;
  }

  if (/timeout|timed out/i.test(value)) {
    return 'timeout';
  }

  if (/ScriptExecutionError/i.test(value)) {
    return 'execution';
  }

  if (
    /ScriptNetworkError|LinkNetworkError|NetworkError|Failed to fetch|Request failed|ERR_|CORS|ENOENT|unreachable/i.test(
      value,
    )
  ) {
    return 'network';
  }

  if (/RUNTIME-001|global.+not found|not found.+global/i.test(value)) {
    return 'initialization';
  }

  if (
    errorInfo.errorName === 'SyntaxError' ||
    /valid federation manifest|JSON|Unexpected token/i.test(value)
  ) {
    return 'content';
  }

  return resource.outcome === 'error' ? 'unknown' : undefined;
}
