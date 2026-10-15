import type {
  FederationObservabilityGlobal,
  ObservabilityLoadedBeforeConsumer,
  ObservabilityLoadedBeforeInfo,
  ObservabilityRemoteInfo,
  ObservabilityRuntimeInstanceLike,
  ObservabilityRuntimeModuleLike,
  ObservabilityRuntimeOrigin,
} from '../type';
import {
  getObjectValue,
  isRecord,
  omitUndefinedFields,
  sanitizeText,
} from '../utils';

export function getFederationGlobal():
  | FederationObservabilityGlobal
  | undefined {
  return (
    globalThis as {
      __FEDERATION__?: FederationObservabilityGlobal;
    }
  ).__FEDERATION__;
}

export function normalizeExposeName(value: unknown): string | undefined {
  const sanitized = sanitizeText(value, 240);
  if (!sanitized) {
    return undefined;
  }

  return sanitized.replace(/^\.\//, '');
}

export function getModuleCacheEntries(
  moduleCache: ObservabilityRuntimeInstanceLike['moduleCache'],
): unknown[] {
  if (!moduleCache) {
    return [];
  }

  if (moduleCache instanceof Map) {
    return Array.from(moduleCache.values());
  }

  const entries =
    typeof moduleCache.entries === 'function'
      ? Array.from(
          moduleCache.entries.call(moduleCache) as Iterable<[unknown, unknown]>,
        )
      : undefined;

  if (entries) {
    return entries.map(([, value]) => value);
  }

  if (isRecord(moduleCache)) {
    return Object.values(moduleCache);
  }

  return [];
}

export function getLoadedExposesForRemote(
  instance: ObservabilityRuntimeInstanceLike,
  remoteName: string | undefined,
) {
  if (!remoteName) {
    return [];
  }

  return Array.from(
    new Set(
      Object.values(instance.remoteHandler?.idToRemoteMap || {})
        .filter((item) => item?.name === remoteName)
        .map((item) => sanitizeText(item.expose, 240))
        .filter((expose): expose is string => Boolean(expose)),
    ),
  );
}

export function collectLoadedBeforeInfo(
  remote: ObservabilityRemoteInfo | undefined,
  expose: string | undefined,
  origin?: ObservabilityRuntimeOrigin,
): ObservabilityLoadedBeforeInfo | undefined {
  const entryGlobalName = remote?.entryGlobalName;
  if (!entryGlobalName) {
    return undefined;
  }

  const federation = getFederationGlobal();
  const instances = Array.isArray(federation?.__INSTANCES__)
    ? federation.__INSTANCES__
    : [];
  const targetExpose = normalizeExposeName(expose);
  const consumers: ObservabilityLoadedBeforeConsumer[] = [];

  instances.forEach((instance) => {
    if (instance === origin) {
      return;
    }

    const matchedModule = getModuleCacheEntries(instance.moduleCache).find(
      (item): item is ObservabilityRuntimeModuleLike =>
        isRuntimeModuleWithEntryGlobalName(item, entryGlobalName),
    );

    if (!matchedModule) {
      return;
    }

    const exposes = getLoadedExposesForRemote(
      instance,
      matchedModule.remoteInfo?.name,
    );
    const consumer: ObservabilityLoadedBeforeConsumer = {
      name:
        sanitizeText(instance.options?.name, 120) ||
        sanitizeText(instance.name, 120),
      remoteEntryExports: Boolean(matchedModule.remoteEntryExports),
      containerInitialized: matchedModule.inited === true,
      exposes: exposes.length ? exposes : undefined,
    };

    consumers.push(omitUndefinedFields(consumer));
  });

  if (!consumers.length) {
    return undefined;
  }

  const exposeLoadedBefore = targetExpose
    ? consumers.some((consumer) =>
        (consumer.exposes || []).some(
          (loadedExpose) => normalizeExposeName(loadedExpose) === targetExpose,
        ),
      )
    : false;

  return {
    producer: true,
    expose: exposeLoadedBefore,
    consumers,
  };
}

export function isRuntimeModuleWithEntryGlobalName(
  value: unknown,
  entryGlobalName: string,
): value is ObservabilityRuntimeModuleLike {
  if (!isRecord(value)) {
    return false;
  }

  const remoteInfo = getObjectValue(value, 'remoteInfo');
  return (
    isRecord(remoteInfo) &&
    getObjectValue(remoteInfo, 'entryGlobalName') === entryGlobalName
  );
}
