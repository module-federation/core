import { satisfies } from 'semver';
import type {
  ObservabilityRuntimeOrigin,
  ObservabilityRuntimeShareScopeMap,
  ObservabilityRuntimeSharedCandidate,
  ObservabilityRuntimeSharedSelectionResult,
  ObservabilityRuntimeSharedSource,
  ObservabilitySharedCandidate,
  ObservabilitySharedConflictInfo,
  ObservabilitySharedConflictVersion,
  ObservabilitySharedInfo,
  ObservabilitySharedLifecycleArgs,
  ObservabilitySharedRegistration,
  ObservabilitySharedRegistrationArgs,
  ObservabilitySharedResolveArgs,
} from '../type';
import { SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON } from '../constant';
import { getErrorInfo } from '../report/error';
import { isRecord, sanitizeText } from '../utils';

export function getRuntimeSharedVersionEntries(
  value: unknown,
): Array<[string, ObservabilityRuntimeSharedSource]> {
  if (!isRecord(value) || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value).filter(
    (entry): entry is [string, ObservabilityRuntimeSharedSource] =>
      isRecord(entry[1]) && !Array.isArray(entry[1]),
  );
}

export function normalizeSharedScope(
  value: string | string[] | undefined,
): string[] {
  if (!value) {
    return [];
  }

  return (Array.isArray(value) ? value : [value])
    .map((scope) => sanitizeText(scope, 120))
    .filter((scope): scope is string => Boolean(scope));
}

export function getSharedScopes(
  shareInfo: ObservabilityRuntimeSharedSource | undefined,
): string[] {
  return normalizeSharedScope(shareInfo?.scope).length
    ? normalizeSharedScope(shareInfo?.scope)
    : ['default'];
}

export function getAvailableSharedVersions(
  args: ObservabilitySharedLifecycleArgs,
) {
  const versions = new Set<string>();
  const shareScopeMap = args.shareScopeMap || {};

  getSharedScopes(args.shareInfo).forEach((scope) => {
    Object.keys(shareScopeMap[scope]?.[args.pkgName] || {}).forEach(
      (version) => {
        versions.add(version);
      },
    );
  });

  return Array.from(versions);
}

export function getOriginShareScopeMap(
  origin: ObservabilityRuntimeOrigin,
): ObservabilityRuntimeShareScopeMap {
  return origin.shareScopeMap || origin.sharedHandler?.shareScopeMap || {};
}

export function getSharedVersion(
  value: ObservabilityRuntimeSharedSource | undefined,
) {
  return sanitizeText(value?.version, 120);
}

export function isSingletonShared(
  value: ObservabilityRuntimeSharedSource | undefined,
) {
  return value?.shareConfig?.singleton === true;
}

export function createSharedConflictVersion(
  version: string,
  shared: ObservabilityRuntimeSharedSource | undefined,
): ObservabilitySharedConflictVersion {
  return {
    version,
    from: sanitizeText(shared?.from, 160),
    singleton: isSingletonShared(shared) || undefined,
    loaded: shared?.loaded === true || undefined,
  };
}

export function createSharedSingletonConflict(args: {
  pkgName: string;
  shared: ObservabilityRuntimeSharedSource;
  scope: string;
  shareScopeMap: ObservabilityRuntimeShareScopeMap;
}): ObservabilitySharedConflictInfo | undefined {
  const currentVersion = getSharedVersion(args.shared);
  if (!currentVersion) {
    return undefined;
  }

  const existingVersionMap =
    args.shareScopeMap[args.scope]?.[args.pkgName] || {};
  const existingVersions = Object.entries(existingVersionMap)
    .map(([version, shared]) =>
      createSharedConflictVersion(
        sanitizeText(version, 120) || version,
        shared,
      ),
    )
    .filter((item) => item.version && item.version !== currentVersion);

  if (!existingVersions.length) {
    return undefined;
  }

  const hasSingleton =
    isSingletonShared(args.shared) ||
    existingVersions.some((item) => item.singleton === true);

  if (!hasSingleton) {
    return undefined;
  }

  const versions = Array.from(
    new Set([currentVersion, ...existingVersions.map((item) => item.version)]),
  ).sort();

  if (versions.length <= 1) {
    return undefined;
  }

  return {
    reason: SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON,
    scope: args.scope,
    currentVersion,
    currentFrom: sanitizeText(args.shared.from, 160),
    versions,
    existingVersions,
  };
}

export function createSharedConflictInfo(args: {
  pkgName: string;
  shared: ObservabilityRuntimeSharedSource;
  conflict: ObservabilitySharedConflictInfo;
}): ObservabilitySharedInfo {
  const shareConfig = args.shared.shareConfig;

  return {
    name: args.pkgName,
    shareScope: [args.conflict.scope],
    version: args.conflict.currentVersion || args.shared.version,
    requiredVersion: shareConfig?.requiredVersion,
    availableVersions: args.conflict.versions,
    provider: args.conflict.currentFrom,
    useIn: args.shared.useIn,
    singleton: true,
    strictVersion: shareConfig?.strictVersion,
    eager: shareConfig?.eager,
    strategy: args.shared.strategy,
    loaded: args.shared.loaded,
    loading: args.shared.loaded
      ? undefined
      : Boolean(args.shared.loading) || undefined,
    reason: SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON,
    conflict: args.conflict,
  };
}

export function getSharedConflictKey(args: {
  hostName?: string;
  pkgName: string;
  conflict: ObservabilitySharedConflictInfo;
}) {
  return [
    args.hostName || 'unknown',
    args.pkgName,
    args.conflict.scope,
    args.conflict.versions.join(','),
  ].join('|');
}

export function getSharedUseIn(args: ObservabilitySharedLifecycleArgs) {
  const useIn = [
    ...(args.selectedShared?.useIn || []),
    ...(args.shareInfo?.useIn || []),
    args.origin.options?.name || args.origin.name,
  ]
    .map((consumer) => sanitizeText(consumer, 160))
    .filter((consumer): consumer is string => Boolean(consumer));

  return Array.from(new Set(useIn));
}

export function getSharedMissReason(args: ObservabilitySharedLifecycleArgs) {
  if (!args.shareInfo) {
    return 'missing-config';
  }

  return getAvailableSharedVersions(args).length
    ? 'version-mismatch'
    : 'missing-provider';
}

export function getSharedErrorReason(args: ObservabilitySharedLifecycleArgs) {
  if (args.recovered) {
    return getSharedMissReason(args);
  }

  const errorInfo = getErrorInfo(args.error, { enabled: false });
  const errorMessage = errorInfo.errorMessage || '';

  if (!args.shareInfo || /Cannot find shared/i.test(errorMessage)) {
    return 'missing-config';
  }

  if (
    args.lifecycle === 'loadShareSync' &&
    typeof args.shareInfo.get === 'function' &&
    /RUNTIME-00[56]/.test(errorMessage)
  ) {
    return 'sync-async-boundary';
  }

  if (
    args.lifecycle === 'loadShareSync' &&
    !args.shareInfo.get &&
    /RUNTIME-006/.test(errorMessage)
  ) {
    return getSharedMissReason(args);
  }

  if (args.error) {
    return 'load-error';
  }

  return undefined;
}

export function parseStableVersion(version?: string) {
  const matched = version?.match(/^(\d+)\.(\d+)\.(\d+)(?:\+[\w.-]+)?$/);

  if (!matched) {
    return undefined;
  }

  return {
    major: Number(matched[1]),
    minor: Number(matched[2]),
    patch: Number(matched[3]),
  };
}

export function isVersionAtLeast(
  version: { major: number; minor: number; patch: number },
  target: { major: number; minor: number; patch: number },
) {
  if (version.major !== target.major) {
    return version.major > target.major;
  }

  if (version.minor !== target.minor) {
    return version.minor > target.minor;
  }

  return version.patch >= target.patch;
}

export function supportsRuntimeObservability(
  origin?: ObservabilityRuntimeOrigin,
) {
  const version = parseStableVersion(origin?.version);

  if (!version) {
    return false;
  }

  return isVersionAtLeast(version, {
    major: 2,
    minor: 5,
    patch: 0,
  });
}

export function isRuntimeSharedLoaded(
  shared?: ObservabilityRuntimeSharedSource,
) {
  return (
    shared?.loaded === true ||
    shared?.treeShaking?.loaded === true ||
    (typeof shared?.get === 'function' && shared.loaded === true)
  );
}

export function isRuntimeSharedLoading(
  shared?: ObservabilityRuntimeSharedSource,
) {
  return (
    !isRuntimeSharedLoaded(shared) &&
    Boolean(shared?.loading || shared?.treeShaking?.loading)
  );
}

export function getRuntimeSharedCompatibility(
  version: string,
  requiredVersion?: string | false,
) {
  if (requiredVersion === undefined) {
    return undefined;
  }
  if (requiredVersion === false || requiredVersion === '*') {
    return true;
  }
  try {
    return satisfies(version, requiredVersion, {
      includePrerelease: true,
    });
  } catch {
    return false;
  }
}

export function createRuntimeSharedCandidate(
  scope: string,
  version: string,
  shared: ObservabilityRuntimeSharedSource,
  requiredVersion?: string | false,
): ObservabilityRuntimeSharedCandidate {
  const compatible = getRuntimeSharedCompatibility(version, requiredVersion);
  return {
    scope,
    version,
    provider: shared.from,
    loaded: isRuntimeSharedLoaded(shared),
    loading: isRuntimeSharedLoading(shared),
    singleton: shared.shareConfig?.singleton === true,
    eager: shared.shareConfig?.eager === true,
    strategy: shared.strategy,
    compatible,
    rejectionReason: compatible === false ? 'version-mismatch' : undefined,
  };
}

export function getRuntimeSharedCandidates(args: {
  shareScopeMap?: ObservabilityRuntimeShareScopeMap;
  scope: string;
  pkgName: string;
  requiredVersion?: string | false;
}) {
  return Object.entries(args.shareScopeMap?.[args.scope]?.[args.pkgName] || {})
    .filter(
      (entry): entry is [string, ObservabilityRuntimeSharedSource] =>
        entry[1] !== undefined,
    )
    .map(([version, shared]) =>
      createRuntimeSharedCandidate(
        args.scope,
        version,
        shared,
        args.requiredVersion,
      ),
    );
}

export function createRuntimeSharedSelection(
  args: ObservabilitySharedResolveArgs,
  selectedShared: ObservabilityRuntimeSharedSource | undefined,
  selectionError?: unknown,
): ObservabilityRuntimeSharedSelectionResult {
  const requiredVersion = args.shareInfo.shareConfig?.requiredVersion;
  const candidates = getRuntimeSharedCandidates({
    shareScopeMap: args.shareScopeMap,
    scope: args.scope,
    pkgName: args.pkgName,
    requiredVersion,
  });
  const selectedVersion = selectedShared?.version;
  const selected =
    selectedShared && selectedVersion
      ? createRuntimeSharedCandidate(
          args.scope,
          selectedVersion,
          selectedShared,
          requiredVersion,
        )
      : undefined;

  let reason: string;
  let failureReason: string | undefined;
  if (selectionError) {
    const strictVersionRejected =
      args.shareInfo.shareConfig?.singleton === true &&
      args.shareInfo.shareConfig?.strictVersion === true &&
      typeof requiredVersion === 'string' &&
      getRuntimeSharedCompatibility(args.version, requiredVersion) === false;
    reason = strictVersionRejected ? 'strict-version-rejected' : 'load-error';
    failureReason = reason;
  } else if (!selected) {
    reason = candidates.length ? 'version-mismatch' : 'missing-provider';
    failureReason = reason;
  } else if (args.shareInfo.shareConfig?.singleton) {
    reason = 'singleton-existing';
  } else if (
    args.shareInfo.strategy === 'loaded-first' &&
    (selected.loaded || selected.loading)
  ) {
    reason = 'loaded-first';
  } else if (selected.version === args.shareInfo.version) {
    reason = 'exact-match';
  } else if (requiredVersion === false || requiredVersion === '*') {
    reason =
      args.shareInfo.strategy === 'loaded-first'
        ? 'loaded-first'
        : 'version-first';
  } else if (selected.version === args.version) {
    reason = 'compatible-highest-version';
  } else {
    reason = 'compatible-version';
  }

  const candidatesWithReasons = candidates.map((candidate) => {
    if (
      selected &&
      candidate.scope === selected.scope &&
      candidate.version === selected.version &&
      candidate.provider === selected.provider
    ) {
      return { ...candidate, rejectionReason: undefined };
    }
    if (candidate.rejectionReason) {
      return candidate;
    }
    if (!selected) {
      return candidate;
    }
    if (reason === 'custom-resolver') {
      return { ...candidate, rejectionReason: 'custom-resolver' };
    }
    if (reason === 'singleton-existing') {
      return { ...candidate, rejectionReason: 'singleton-existing' };
    }
    if (reason === 'loaded-first' && !candidate.loaded && !candidate.loading) {
      return { ...candidate, rejectionReason: 'not-loaded' };
    }
    return { ...candidate, rejectionReason: 'lower-priority-version' };
  });

  return {
    scope: args.scope,
    requestedVersion: args.shareInfo.version,
    requiredVersion,
    singleton: args.shareInfo.shareConfig?.singleton,
    strictVersion: args.shareInfo.shareConfig?.strictVersion,
    eager: args.shareInfo.shareConfig?.eager,
    strategy: args.shareInfo.strategy,
    candidates: candidatesWithReasons,
    selected,
    reason,
    failureReason,
    context: args.loadContext,
  };
}

export function createSharedCandidate(
  candidate: ObservabilityRuntimeSharedCandidate,
): ObservabilitySharedCandidate {
  return {
    scope: candidate.scope,
    version: candidate.version,
    provider: candidate.provider,
    loaded: candidate.loaded === true,
    loading: candidate.loading === true,
    singleton: candidate.singleton === true,
    eager: candidate.eager === true,
    strategy: candidate.strategy,
    compatible: candidate.compatible,
    rejectionReason: candidate.rejectionReason,
  };
}

export function createSharedInfo(
  args: ObservabilitySharedLifecycleArgs,
  reason?: string,
  selection?: ObservabilityRuntimeSharedSelectionResult,
): ObservabilitySharedInfo {
  const shareConfig = args.shareInfo?.shareConfig;
  const selected = selection?.selected;
  const context = selection?.context || args.loadContext;
  const handledBundlerRuntimeShared = reason === 'custom-share-info-unmatched';
  const loaded = selected?.loaded ?? args.selectedShared?.loaded;
  const candidates = selection?.candidates?.map(createSharedCandidate);

  return {
    name: args.pkgName,
    shareScope: selection?.scope
      ? [selection.scope]
      : getSharedScopes(args.shareInfo),
    version:
      selection?.requestedVersion ||
      args.selectedShared?.version ||
      args.shareInfo?.version,
    requiredVersion: selection?.requiredVersion ?? shareConfig?.requiredVersion,
    selectedVersion: selected?.version || args.selectedShared?.version,
    availableVersions: candidates?.length
      ? Array.from(new Set(candidates.map((candidate) => candidate.version)))
      : getAvailableSharedVersions(args),
    provider: selected?.provider || args.selectedShared?.from,
    useIn: getSharedUseIn(args),
    singleton: selection?.singleton ?? shareConfig?.singleton,
    strictVersion: selection?.strictVersion ?? shareConfig?.strictVersion,
    eager: selection?.eager ?? shareConfig?.eager,
    strategy: selection?.strategy || args.shareInfo?.strategy,
    loaded,
    loading: loaded
      ? undefined
      : selected?.loading || Boolean(args.selectedShared?.loading) || undefined,
    reason,
    selectionReason: selection?.reason,
    failureReason: selection?.failureReason,
    candidates,
    loadType: selection?.loadType,
    trigger: context?.trigger,
    moduleId: context?.moduleId,
    chunkId: context?.chunkId,
    remote: context?.remote,
    expose: context?.expose,
    requestId: context?.requestId,
    operationId: context?.operationId,
    fallback: selection?.fallback,
    recovered: selection?.recovered ?? args.recovered,
    definedBy: handledBundlerRuntimeShared ? 'bundler-runtime' : undefined,
  };
}

export function createSharedRegistrationInfo(
  args: ObservabilitySharedRegistrationArgs,
  registrationId: string,
): ObservabilitySharedInfo {
  const candidateSource = args.shared;
  const effectiveSource = args.registeredShared;
  const requiredVersion = candidateSource.shareConfig?.requiredVersion;
  const candidate = createSharedCandidate(
    createRuntimeSharedCandidate(
      args.scope,
      candidateSource.version || '0',
      candidateSource,
      requiredVersion,
    ),
  );
  const effective = effectiveSource
    ? createSharedCandidate(
        createRuntimeSharedCandidate(
          args.scope,
          effectiveSource.version || '0',
          effectiveSource,
          requiredVersion,
        ),
      )
    : undefined;
  const candidates = getRuntimeSharedCandidates({
    shareScopeMap: args.shareScopeMap,
    scope: args.scope,
    pkgName: args.pkgName,
    requiredVersion,
  });
  const previous = args.previousShared;
  let action: ObservabilitySharedRegistration['action'];
  let reason: string;
  if (previous === candidateSource) {
    action = 'reused';
    reason = 'same-registration-reused';
  } else if (!previous && effectiveSource) {
    action = 'registered';
    reason = 'first-registration';
  } else if (previous && effectiveSource !== previous) {
    action = 'replaced';
    reason =
      candidate.eager && previous.shareConfig?.eager !== true
        ? 'eager-preferred'
        : 'provider-name-preferred';
  } else {
    action = 'ignored';
    reason =
      previous?.strategy === 'loaded-first'
        ? 'loaded-first-preserved'
        : previous?.loaded
          ? 'loaded-version-preserved'
          : previous?.shareConfig?.eager && !candidate.eager
            ? 'eager-provider-preserved'
            : 'provider-name-preserved';
  }

  return {
    name: args.pkgName,
    shareScope: [args.scope],
    version: candidate.version,
    selectedVersion: effective?.version,
    availableVersions: Array.from(
      new Set(candidates.map((item) => item.version)),
    ),
    provider: effective?.provider,
    singleton: candidate.singleton,
    eager: candidate.eager,
    strategy: candidate.strategy,
    loaded: effective?.loaded,
    loading: effective?.loading || undefined,
    candidates: candidates.map(createSharedCandidate),
    trigger: args.trigger,
    registration: {
      registrationId,
      action,
      reason,
      trigger: args.trigger,
      scope: args.scope,
      candidate,
      effective,
    },
  };
}

export function sanitizeSharedCandidate(
  candidate: ObservabilitySharedCandidate,
): ObservabilitySharedCandidate | undefined {
  const scope = sanitizeText(candidate.scope, 120);
  const version = sanitizeText(candidate.version, 120);
  if (!scope || !version) {
    return undefined;
  }
  return {
    scope,
    version,
    provider: sanitizeText(candidate.provider, 160),
    loaded: candidate.loaded === true,
    loading: candidate.loading === true,
    singleton: candidate.singleton === true,
    eager: candidate.eager === true,
    strategy: sanitizeText(candidate.strategy, 80),
    compatible: candidate.compatible,
    rejectionReason: sanitizeText(candidate.rejectionReason, 120),
  };
}

export function sanitizeSharedRegistration(
  registration: ObservabilitySharedRegistration | undefined,
): ObservabilitySharedRegistration | undefined {
  if (!registration) {
    return undefined;
  }
  const candidate = sanitizeSharedCandidate(registration.candidate);
  const effective = registration.effective
    ? sanitizeSharedCandidate(registration.effective)
    : undefined;
  const registrationId = sanitizeText(registration.registrationId, 120);
  const scope = sanitizeText(registration.scope, 120);
  const trigger = sanitizeText(registration.trigger, 80);
  const reason = sanitizeText(registration.reason, 120);
  if (!candidate || !registrationId || !scope || !trigger || !reason) {
    return undefined;
  }
  return {
    registrationId,
    action: registration.action,
    reason,
    trigger,
    scope,
    candidate,
    effective,
  };
}

export function sanitizeShared(
  shared: ObservabilitySharedInfo | undefined,
): ObservabilitySharedInfo | undefined {
  if (!shared || !shared.name) {
    return undefined;
  }

  return {
    name: sanitizeText(shared.name, 160) || 'unknown',
    shareScope: normalizeSharedScope(shared.shareScope),
    version: sanitizeText(shared.version, 120),
    requiredVersion:
      shared.requiredVersion === false
        ? false
        : sanitizeText(shared.requiredVersion, 120),
    selectedVersion: sanitizeText(shared.selectedVersion, 120),
    availableVersions: (shared.availableVersions || [])
      .map((version) => sanitizeText(version, 120))
      .filter((version): version is string => Boolean(version))
      .slice(0, 20),
    provider: sanitizeText(shared.provider, 160),
    useIn: (shared.useIn || [])
      .map((consumer) => sanitizeText(consumer, 160))
      .filter((consumer): consumer is string => Boolean(consumer)),
    singleton: shared.singleton,
    strictVersion: shared.strictVersion,
    eager: shared.eager,
    strategy: sanitizeText(shared.strategy, 80),
    loaded: shared.loaded,
    loading: shared.loading,
    reason: sanitizeText(shared.reason, 120),
    definedBy:
      shared.definedBy === 'bundler-runtime' ? 'bundler-runtime' : undefined,
    conflict: sanitizeSharedConflict(shared.conflict),
    candidates: (shared.candidates || [])
      .map(sanitizeSharedCandidate)
      .filter(
        (candidate): candidate is ObservabilitySharedCandidate =>
          candidate !== undefined,
      )
      .slice(0, 20),
    selectionReason: sanitizeText(shared.selectionReason, 120),
    failureReason: sanitizeText(shared.failureReason, 120),
    loadType:
      shared.loadType === 'sync' || shared.loadType === 'async'
        ? shared.loadType
        : undefined,
    trigger: sanitizeText(shared.trigger, 80),
    moduleId:
      typeof shared.moduleId === 'number'
        ? shared.moduleId
        : sanitizeText(shared.moduleId, 160),
    chunkId:
      typeof shared.chunkId === 'number'
        ? shared.chunkId
        : sanitizeText(shared.chunkId, 160),
    remote: sanitizeText(shared.remote, 160),
    expose: sanitizeText(shared.expose, 240),
    requestId: sanitizeText(shared.requestId, 240),
    operationId: sanitizeText(shared.operationId, 160),
    fallback: shared.fallback === true || undefined,
    recovered: shared.recovered === true || undefined,
    registration: sanitizeSharedRegistration(shared.registration),
  };
}

export function sanitizeSharedConflict(
  conflict: ObservabilitySharedConflictInfo | undefined,
): ObservabilitySharedConflictInfo | undefined {
  if (!conflict) {
    return undefined;
  }

  const scope = sanitizeText(conflict.scope, 120) || 'default';
  const versions = (conflict.versions || [])
    .map((version) => sanitizeText(version, 120))
    .filter((version): version is string => Boolean(version))
    .slice(0, 20);
  const existingVersions = (conflict.existingVersions || [])
    .map((item) => ({
      version: sanitizeText(item.version, 120),
      from: sanitizeText(item.from, 160),
      singleton: item.singleton === true || undefined,
      loaded: item.loaded === true || undefined,
    }))
    .filter(
      (item): item is ObservabilitySharedConflictVersion =>
        typeof item.version === 'string' && item.version.length > 0,
    )
    .slice(0, 20);

  return {
    reason: SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON,
    scope,
    currentVersion: sanitizeText(conflict.currentVersion, 120),
    currentFrom: sanitizeText(conflict.currentFrom, 160),
    versions,
    existingVersions,
  };
}
