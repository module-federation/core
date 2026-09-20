import type {
  ObservabilityCollectorOptions,
  ObservabilityDevtoolsOptions,
  ObservabilityMetadata,
  ObservabilityPluginOptions,
} from '../type';
import {
  COLLECTOR_PATH,
  DEFAULT_COLLECTOR_PORT,
  DEFAULT_DEVTOOLS_SOURCE,
  HARD_MAX_EVENTS,
  HARD_MAX_REPORT_QUERY_LIMIT,
  MAX_METADATA_KEYS,
  SENSITIVE_PAIR_PATTERN,
  URL_PATTERN,
} from '../constant';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function normalizeMaxEvents(
  value: number | undefined,
  fallback: number,
) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.min(HARD_MAX_EVENTS, Math.floor(value)));
}

export function normalizeQueryLimit(
  value: number | undefined,
): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(1, Math.min(HARD_MAX_REPORT_QUERY_LIMIT, Math.floor(value)));
}

export function normalizeCollectorPort(value: number | undefined) {
  if (!Number.isFinite(value) || !value) {
    return DEFAULT_COLLECTOR_PORT;
  }

  const port = Math.floor(value);
  return port > 0 && port <= 65535 ? port : DEFAULT_COLLECTOR_PORT;
}

export function normalizeCollectorOptions(
  value: ObservabilityPluginOptions['collector'],
): ObservabilityCollectorOptions | undefined {
  if (value === true) {
    return {
      enabled: true,
      port: DEFAULT_COLLECTOR_PORT,
    };
  }

  if (!value || value.enabled === false) {
    return undefined;
  }

  return {
    enabled: true,
    port: normalizeCollectorPort(value.port),
  };
}

export function normalizeDevtoolsOptions(
  value: ObservabilityPluginOptions['devtools'],
): ObservabilityDevtoolsOptions | undefined {
  if (value === true) {
    return {
      enabled: true,
      source: DEFAULT_DEVTOOLS_SOURCE,
    };
  }

  if (!value || value.enabled === false) {
    return undefined;
  }

  return {
    enabled: true,
    source: sanitizeText(value.source, 160) || DEFAULT_DEVTOOLS_SOURCE,
  };
}

export function getCollectorUrl(port: number) {
  return `http://127.0.0.1:${port}${COLLECTOR_PATH}`;
}

export function sanitizeText(
  value: unknown,
  maxLength = 800,
): string | undefined {
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

export function getRawText(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value);
}

export function clipText(value: unknown, maxLength = 320): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const sanitized = String(value);

  return sanitized.length > maxLength
    ? `${sanitized.slice(0, maxLength)}...`
    : sanitized;
}

export function clipObservabilityMetadata(
  metadata: Record<string, unknown> | undefined,
  maxKeys = MAX_METADATA_KEYS,
): ObservabilityMetadata | undefined {
  if (!metadata || typeof metadata !== 'object') {
    return undefined;
  }

  const clipped: ObservabilityMetadata = {};

  Object.entries(metadata)
    .slice(0, maxKeys)
    .forEach(([rawKey, rawValue]) => {
      const key = clipText(rawKey, 80);

      if (!key || rawValue === undefined || rawValue === null) {
        return;
      }

      if (typeof rawValue === 'boolean') {
        clipped[key] = rawValue;
        return;
      }

      if (typeof rawValue === 'number') {
        if (Number.isFinite(rawValue)) {
          clipped[key] = rawValue;
        }
        return;
      }

      const value = clipText(rawValue, 240);
      if (value) {
        clipped[key] = value;
      }
    });

  return Object.keys(clipped).length ? clipped : undefined;
}

export function clipMetadata(
  metadata: Record<string, unknown> | undefined,
  maxKeys = MAX_METADATA_KEYS,
): ObservabilityMetadata | undefined {
  if (!metadata || typeof metadata !== 'object') {
    return undefined;
  }

  const clipped: ObservabilityMetadata = {};

  Object.entries(metadata)
    .slice(0, maxKeys)
    .forEach(([rawKey, rawValue]) => {
      const key = sanitizeText(rawKey, 80);

      if (!key || rawValue === undefined || rawValue === null) {
        return;
      }

      if (typeof rawValue === 'boolean') {
        clipped[key] = rawValue;
        return;
      }

      if (typeof rawValue === 'number') {
        if (Number.isFinite(rawValue)) {
          clipped[key] = rawValue;
        }
        return;
      }

      const value = clipText(rawValue, 240);
      if (value) {
        clipped[key] = value;
      }
    });

  return Object.keys(clipped).length ? clipped : undefined;
}

export function sanitizeStack(
  stack: string | undefined,
  options: ObservabilityPluginOptions['stackTrace'],
): string | undefined {
  if (!stack || options?.enabled === false) {
    return undefined;
  }

  return stack;
}

export function getRawStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack || error.message;
  }

  return undefined;
}

export function sanitizeRequestId(
  value: string | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  return clipText(value, 240);
}

export function sanitizeUrl(value: string | undefined): string | undefined {
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

export function getObjectValue(value: Record<string, unknown>, key: string) {
  return value[key];
}

export function omitUndefinedFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => omitUndefinedFields(item)) as T;
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const cleanValue: Record<string, unknown> = {};

  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    if (item === undefined) {
      return;
    }

    cleanValue[key] = omitUndefinedFields(item);
  });

  return cleanValue as T;
}
