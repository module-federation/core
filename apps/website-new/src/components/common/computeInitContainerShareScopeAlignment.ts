export type ShareScopeKeyInput = string | string[] | undefined;

export type ShareScopeAlignmentItem =
  | {
      scope: string;
      expression: string;
    }
  | {
      scope: string;
      expression: string;
      note: string;
    };

export type ShareScopeAlignmentResult = {
  hostShareScopeKeys: ShareScopeKeyInput;
  remoteShareScopeKey: ShareScopeKeyInput;
  alignment: ShareScopeAlignmentItem[];
  initializedScopes: string[];
  warnings: string[];
};

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function normalizeString(value: string): string {
  return value.trim();
}

function normalizeStringArray(value: string[]): string[] {
  return value.map(normalizeString).filter(Boolean);
}

export function computeInitContainerShareScopeAlignment(
  args: {
    hostShareScopeKeys?: ShareScopeKeyInput;
    remoteShareScopeKey?: ShareScopeKeyInput;
  } = {},
): ShareScopeAlignmentResult {
  const hostShareScopeKeys = args.hostShareScopeKeys;
  const remoteShareScopeKey = args.remoteShareScopeKey;

  const warnings: string[] = [];

  if (isStringArray(hostShareScopeKeys)) {
    if (hostShareScopeKeys.length === 0) {
      warnings.push('Host shareScope is an empty array.');
    } else if (hostShareScopeKeys.length === 1) {
      warnings.push(
        "Host shareScope is an array with a single item. Prefer a string (e.g. 'default') unless you intentionally need array semantics.",
      );
    }
  }

  if (isStringArray(remoteShareScopeKey)) {
    if (remoteShareScopeKey.length === 0) {
      warnings.push('Remote shareScope is an empty array.');
    } else if (remoteShareScopeKey.length === 1) {
      warnings.push(
        "Remote shareScope is an array with a single item. Prefer a string (e.g. 'default') unless you intentionally need array semantics.",
      );
    }
  }

  const alignment: ShareScopeAlignmentItem[] = [];

  const normalizedHostKeys = isStringArray(hostShareScopeKeys)
    ? normalizeStringArray(hostShareScopeKeys)
    : typeof hostShareScopeKeys === 'string'
      ? normalizeString(hostShareScopeKeys)
      : undefined;

  const normalizedRemoteKey = isStringArray(remoteShareScopeKey)
    ? normalizeStringArray(remoteShareScopeKey)
    : typeof remoteShareScopeKey === 'string'
      ? normalizeString(remoteShareScopeKey)
      : undefined;

  const remoteIsArray = Array.isArray(remoteShareScopeKey);

  if (!remoteIsArray) {
    const key =
      typeof normalizedRemoteKey === 'string' && normalizedRemoteKey.length > 0
        ? normalizedRemoteKey
        : 'default';

    if (Array.isArray(normalizedHostKeys)) {
      normalizedHostKeys.forEach((hostKey) => {
        alignment.push({
          scope: hostKey,
          expression: `remote['${hostKey}'] = host['${hostKey}'] ?? {}`,
        });
      });
    } else {
      alignment.push({
        scope: key,
        expression: `remote['${key}'] = host['${key}']`,
        note: 'Aligned via the shareScope object passed to remoteEntry.init(...)',
      });
    }
  } else {
    const keys = Array.isArray(normalizedRemoteKey) ? normalizedRemoteKey : [];
    keys.forEach((key) => {
      if (!normalizedHostKeys) {
        alignment.push({
          scope: key,
          expression: `remote['${key}'] = host['${key}']`,
          note: 'Aligned via the shareScope object passed to remoteEntry.init(...)',
        });
        return;
      }
      alignment.push({
        scope: key,
        expression: `remote['${key}'] = host['${key}'] ?? {}`,
      });
    });
  }

  const initializedScopes = !remoteIsArray
    ? [
        typeof normalizedRemoteKey === 'string' &&
        normalizedRemoteKey.length > 0
          ? normalizedRemoteKey
          : 'default',
      ]
    : Array.isArray(normalizedRemoteKey)
      ? normalizedRemoteKey
      : [];

  return {
    hostShareScopeKeys,
    remoteShareScopeKey,
    alignment,
    initializedScopes,
    warnings,
  };
}
