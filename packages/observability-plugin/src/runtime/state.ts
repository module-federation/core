import { MAX_MODULE_INFO_ENTRIES } from '../constant';
import { normalizeScope } from '../report/diagnosis';
import type {
  ObservabilityBridgeInfo,
  ObservabilityBridgeState,
  ObservabilityEvent,
  ObservabilityInstanceRole,
  ObservabilityPluginOptions,
  ObservabilityRelationshipStatus,
  ObservabilityRuntimeInstanceLike,
  ObservabilityRuntimeModuleInfo,
  ObservabilityRuntimeOrigin,
  ObservabilityRuntimeRelationship,
  ObservabilityRuntimeState,
  ObservabilityRuntimeStateInstance,
  ObservabilityRuntimeStateRemote,
} from '../type';
import {
  getObjectValue,
  isRecord,
  omitUndefinedFields,
  sanitizeText,
  sanitizeUrl,
} from '../utils';
import { getFederationGlobal, getModuleCacheEntries } from './global';
import {
  getOriginShareScopeMap,
  getRuntimeSharedVersionEntries,
  supportsRuntimeObservability,
} from './shared';

interface RuntimeStateManagerOptions {
  options: ObservabilityPluginOptions;
  events: ObservabilityEvent[];
  instancesByRef: Map<string, ObservabilityRuntimeOrigin>;
  lateBoundInstanceRefs: Set<string>;
  boundInstanceRefs: Set<string>;
  getActiveRuntimeInstances: () => ObservabilityRuntimeInstanceLike[];
  registerRuntimeInstance: (origin: ObservabilityRuntimeOrigin) => string;
  getInstanceRef: (origin?: ObservabilityRuntimeOrigin) => string | undefined;
  getBrowserGlobalScope: () => string | undefined;
  getHistoryCleared: () => boolean;
  supportsSemanticResourceLifecycle: (
    origin?: ObservabilityRuntimeOrigin,
  ) => boolean;
}

export function createRuntimeStateManager({
  options,
  events,
  instancesByRef,
  lateBoundInstanceRefs,
  boundInstanceRefs,
  getActiveRuntimeInstances,
  registerRuntimeInstance,
  getInstanceRef,
  getBrowserGlobalScope,
  getHistoryCleared,
  supportsSemanticResourceLifecycle,
}: RuntimeStateManagerOptions) {
  const bridgeStatesByInstance = new Map<
    string,
    Map<string, ObservabilityBridgeState>
  >();

  const createStateRemote = (
    value: unknown,
    fallbackName?: string,
  ): ObservabilityRuntimeStateRemote | undefined => {
    if (typeof value === 'string') {
      return {
        name: fallbackName || sanitizeText(value, 120) || 'unknown',
        entry: sanitizeUrl(value),
      };
    }
    if (!isRecord(value)) {
      return fallbackName ? { name: fallbackName } : undefined;
    }

    const name =
      sanitizeText(getObjectValue(value, 'name'), 120) ||
      sanitizeText(fallbackName, 120);
    if (!name) {
      return undefined;
    }

    return omitUndefinedFields({
      name,
      alias: sanitizeText(getObjectValue(value, 'alias'), 120),
      version: sanitizeText(getObjectValue(value, 'version'), 120),
      entry: sanitizeUrl(
        sanitizeText(
          getObjectValue(value, 'entry') ||
            getObjectValue(value, 'remoteEntry') ||
            getObjectValue(value, 'manifestUrl'),
          320,
        ),
      ),
      entryGlobalName: sanitizeText(
        getObjectValue(value, 'entryGlobalName') ||
          getObjectValue(value, 'globalName'),
        120,
      ),
      type: sanitizeText(getObjectValue(value, 'type'), 80),
    });
  };

  const getDeclaredRemotes = (origin: ObservabilityRuntimeOrigin) => {
    const remotes = origin.options?.remotes;
    const values = Array.isArray(remotes)
      ? remotes.map((value) => [undefined, value] as const)
      : isRecord(remotes)
        ? Object.entries(remotes)
        : [];

    return values
      .map(([name, value]) => createStateRemote(value, name))
      .filter(
        (remote): remote is ObservabilityRuntimeStateRemote =>
          remote !== undefined,
      );
  };

  const getLoadedProducerRemotes = (origin: ObservabilityRuntimeOrigin) =>
    getModuleCacheEntries(origin.moduleCache)
      .map((module) =>
        createStateRemote(
          isRecord(module) ? getObjectValue(module, 'remoteInfo') : undefined,
        ),
      )
      .filter(
        (remote): remote is ObservabilityRuntimeStateRemote =>
          remote !== undefined,
      );

  const getShareScopeSummaries = (origin: ObservabilityRuntimeOrigin) =>
    Object.entries(getOriginShareScopeMap(origin)).map(([name, scope]) => {
      const sharedEntries = Object.entries(scope || {})
        .map(([rawName, versions]) => ({
          rawName,
          name: sanitizeText(rawName, 160) || 'unknown',
          versions: getRuntimeSharedVersionEntries(versions),
        }))
        .filter((entry) => entry.versions.length > 0)
        .sort((left, right) => left.rawName.localeCompare(right.rawName))
        .slice(0, 100);
      return {
        name: sanitizeText(name, 120) || 'default',
        sharedCount: sharedEntries.length,
        sharedNames: sharedEntries.map((entry) => entry.name),
        shared: sharedEntries.map((entry) => ({
          name: entry.name,
          versions: entry.versions.slice(0, 20).map(([version, shared]) =>
            omitUndefinedFields({
              version: sanitizeText(version, 120) || version,
              provider: sanitizeText(shared.from, 160),
              loaded: shared.loaded === true || undefined,
              singleton: shared.shareConfig?.singleton || undefined,
              eager: shared.shareConfig?.eager || undefined,
              strategy: sanitizeText(shared.strategy, 80),
            }),
          ),
        })),
      };
    });

  const updateBridgeState = (
    origin: ObservabilityRuntimeOrigin,
    bridge: ObservabilityBridgeInfo,
    signal: 'start' | 'result',
  ) => {
    const instanceRef = getInstanceRef(origin);
    if (!instanceRef) {
      return;
    }
    let states = bridgeStatesByInstance.get(instanceRef);
    if (!states) {
      states = new Map();
      bridgeStatesByInstance.set(instanceRef, states);
    }
    const key = `${bridge.bridgeId}\u0000${bridge.side}`;
    const previous = states.get(key);
    let status = previous?.status || 'idle';
    if (signal === 'start') {
      if (bridge.operation === 'destroy') {
        status = 'destroying';
      } else if (
        bridge.operation === 'render' ||
        bridge.operation === 'update'
      ) {
        status = 'rendering';
      }
    } else if (signal === 'result') {
      if (bridge.outcome === 'error') {
        status = 'error';
      } else if (bridge.operation === 'destroy') {
        status = 'destroyed';
      } else if (
        bridge.operation === 'render' ||
        bridge.operation === 'update'
      ) {
        status = 'rendered';
      }
    }

    states.set(key, {
      bridgeId: bridge.bridgeId,
      side: bridge.side,
      framework: bridge.framework,
      moduleName: bridge.moduleName || previous?.moduleName,
      remote: bridge.remote || previous?.remote,
      expose: bridge.expose || previous?.expose,
      status,
      lastOperation: bridge.operation,
      lastOperationId: bridge.operationId,
      lastOperationAt: bridge.endedAt || bridge.startedAt,
      routeSyncObserved:
        bridge.operation === 'route-sync' ||
        previous?.routeSyncObserved === true,
    });
  };

  const getBridgeSummary = (
    origin: ObservabilityRuntimeOrigin,
    instanceRef: string,
  ): ObservabilityRuntimeStateInstance['bridge'] => {
    if (!isRecord(origin.bridgeHook)) {
      return undefined;
    }
    const lifecycle = getObjectValue(origin.bridgeHook, 'lifecycle');
    const states = Array.from(
      bridgeStatesByInstance.get(instanceRef)?.values() || [],
    )
      .sort(
        (left, right) =>
          (right.lastOperationAt || 0) - (left.lastOperationAt || 0),
      )
      .map((state) => ({ ...state }));
    const latest = states[0];
    return {
      available: true,
      lifecycleCount: isRecord(lifecycle)
        ? Object.keys(lifecycle).length
        : undefined,
      framework: latest?.framework,
      moduleName: latest?.moduleName,
      remote: latest?.remote,
      expose: latest?.expose,
      status: latest?.status || 'idle',
      lastOperationAt: latest?.lastOperationAt,
      routeSyncObserved: states.some((state) => state.routeSyncObserved),
      states,
    };
  };

  const getRuntimeModuleInfo = (): ObservabilityRuntimeModuleInfo[] => {
    const moduleInfo = getFederationGlobal()?.moduleInfo || {};
    return Object.entries(moduleInfo)
      .map(([key, value]) => {
        const record = isRecord(value) ? value : {};
        const rawRemotes = getObjectValue(record, 'remotes');
        const remoteValues = Array.isArray(rawRemotes)
          ? rawRemotes.map((remote) => [undefined, remote] as const)
          : isRecord(rawRemotes)
            ? Object.entries(rawRemotes)
            : [];
        const remotes = remoteValues
          .map(([name, remote]) => createStateRemote(remote, name))
          .filter(
            (remote): remote is ObservabilityRuntimeStateRemote =>
              remote !== undefined,
          );
        return omitUndefinedFields({
          key: sanitizeText(key, 160) || key,
          name: sanitizeText(getObjectValue(record, 'name'), 120),
          version: sanitizeText(
            getObjectValue(record, 'version') ||
              getObjectValue(record, 'buildVersion'),
            120,
          ),
          entry: sanitizeUrl(
            sanitizeText(
              getObjectValue(record, 'entry') ||
                getObjectValue(record, 'remoteEntry') ||
                getObjectValue(record, 'manifestUrl'),
              320,
            ),
          ),
          tag: sanitizeText(getObjectValue(record, 'tag'), 120),
          remotes: remotes.length ? remotes : undefined,
        });
      })
      .slice(0, MAX_MODULE_INFO_ENTRIES);
  };

  const getRuntimeFrame = () => {
    try {
      return typeof window === 'undefined'
        ? undefined
        : window === window.top
          ? 'top'
          : 'child';
    } catch {
      return 'child';
    }
  };

  const getRuntimeStateSnapshot = (): ObservabilityRuntimeState => {
    const activeInstances = getActiveRuntimeInstances();
    activeInstances.forEach((instance) => registerRuntimeInstance(instance));
    const moduleInfo = getRuntimeModuleInfo();
    const instanceOrigins = Array.from(instancesByRef.entries());
    const instanceDrafts = instanceOrigins.map(([instanceRef, origin]) => ({
      instanceRef,
      origin,
      name:
        sanitizeText(origin.name, 120) ||
        sanitizeText(origin.options?.name, 120),
      optionsName: sanitizeText(origin.options?.name, 120),
      optionsVersion: sanitizeText(origin.options?.version, 120),
      runtimeVersion: sanitizeText(origin.version, 80),
      remotes: getDeclaredRemotes(origin),
      loadedProducers: getLoadedProducerRemotes(origin),
      consumerEvidence: [] as string[],
      producerEvidence: [] as string[],
    }));

    instanceDrafts.forEach((draft) => {
      const matchingModuleInfo = moduleInfo.filter((info) => {
        const names = [draft.name, draft.optionsName].filter(
          (name): name is string => Boolean(name),
        );
        return names.some(
          (name) =>
            info.name === name ||
            info.key === name ||
            (info.key.includes(name) &&
              (!draft.optionsVersion ||
                info.version === draft.optionsVersion ||
                info.key.includes(draft.optionsVersion))),
        );
      });
      if (draft.remotes.length) {
        draft.consumerEvidence.push('options.remotes');
      }
      if (draft.loadedProducers.length) {
        draft.consumerEvidence.push('moduleCache.remoteInfo');
      }
      if (matchingModuleInfo.some((info) => info.remotes?.length)) {
        draft.consumerEvidence.push('moduleInfo.remotes');
      }
      if (matchingModuleInfo.length) {
        draft.producerEvidence.push('moduleInfo');
      }
    });

    const relationships: ObservabilityRuntimeRelationship[] = [];
    instanceDrafts.forEach((consumer) => {
      consumer.loadedProducers.forEach((remote) => {
        const matchingModuleInfo = moduleInfo.filter(
          (info) =>
            info.name === remote.name ||
            info.key === remote.name ||
            Boolean(remote.entry && info.entry === remote.entry) ||
            Boolean(remote.version && info.version === remote.version),
        );
        const candidates = instanceDrafts.filter((producer) => {
          if (producer.instanceRef === consumer.instanceRef) {
            return false;
          }
          const names = new Set(
            [producer.name, producer.optionsName].filter(
              (name): name is string => Boolean(name),
            ),
          );
          const directNameMatches =
            names.has(remote.name) ||
            Boolean(remote.alias && names.has(remote.alias));
          const moduleInfoMatches = matchingModuleInfo.some(
            (info) =>
              Boolean(info.name && names.has(info.name)) ||
              names.has(info.key) ||
              Boolean(info.version && producer.optionsVersion === info.version),
          );
          const versionMatches =
            !remote.version ||
            !producer.optionsVersion ||
            producer.optionsVersion === remote.version;
          return (directNameMatches || moduleInfoMatches) && versionMatches;
        });
        const status: ObservabilityRelationshipStatus =
          candidates.length === 1
            ? 'resolved'
            : candidates.length > 1
              ? 'ambiguous'
              : 'unresolved';
        candidates.forEach((candidate) => {
          if (!candidate.producerEvidence.includes('consumer.moduleCache')) {
            candidate.producerEvidence.push('consumer.moduleCache');
          }
        });
        relationships.push(
          omitUndefinedFields({
            consumerInstanceRef: consumer.instanceRef,
            producerInstanceRef:
              candidates.length === 1 ? candidates[0].instanceRef : undefined,
            candidateProducerInstanceRefs:
              candidates.length > 1
                ? candidates.map((candidate) => candidate.instanceRef)
                : undefined,
            remote,
            evidence: ['moduleCache.remoteInfo'],
            status,
          }),
        );
      });
    });

    const instances = instanceDrafts.map(
      (draft): ObservabilityRuntimeStateInstance => {
        const isConsumer = draft.consumerEvidence.length > 0;
        const isProducer = draft.producerEvidence.length > 0;
        const role: ObservabilityInstanceRole =
          isConsumer && isProducer
            ? 'mixed'
            : isConsumer
              ? 'consumer'
              : isProducer
                ? 'producer'
                : 'unknown';
        return omitUndefinedFields({
          instanceRef: draft.instanceRef,
          name: draft.name,
          optionsName: draft.optionsName,
          optionsVersion: draft.optionsVersion,
          runtimeVersion: draft.runtimeVersion,
          role,
          roleEvidence: {
            consumer: [...draft.consumerEvidence],
            producer: [...draft.producerEvidence],
          },
          remotes: draft.remotes,
          loadedProducers: draft.loadedProducers,
          shareScopes: getShareScopeSummaries(draft.origin),
          bridge: getBridgeSummary(draft.origin, draft.instanceRef),
          active: activeInstances.includes(
            draft.origin as ObservabilityRuntimeInstanceLike,
          ),
        });
      },
    );
    const hasLateBinding = lateBoundInstanceRefs.size > 0;
    const historyCleared = getHistoryCleared();
    const hasIncompleteHistory = hasLateBinding || historyCleared;
    const hasStableSharedRuntime = instanceDrafts.some((draft) =>
      supportsRuntimeObservability(draft.origin),
    );
    const hasSharedState = instances.some(
      (instance) => instance.shareScopes.length > 0,
    );
    const hasRemoteSignals = events.some((event) => Boolean(event.remote));
    const hasSharedSignals = events.some((event) => Boolean(event.shared));
    const hasDetailedSharedSignals = events.some(
      (event) =>
        Boolean(event.shared?.selectionReason) ||
        Boolean(event.shared?.registration),
    );
    const hasDetailedSharedHooks = instanceDrafts.some((draft) =>
      Boolean(
        draft.origin.sharedHandler?.hooks?.lifecycle?.['afterRegisterShare'],
      ),
    );
    const hasBridge = instances.some((instance) => instance.bridge?.available);
    const bridgeEvents = events.filter((event) => Boolean(event.bridge));
    const hasBridgeSignals = bridgeEvents.length > 0;
    const traceCompleteness = hasIncompleteHistory ? 'partial' : 'complete';
    const hasResourceLifecycle = instanceDrafts.some((draft) =>
      supportsSemanticResourceLifecycle(draft.origin),
    );
    const remoteTraceCompleteness =
      hasIncompleteHistory || !hasResourceLifecycle ? 'partial' : 'complete';

    return omitUndefinedFields({
      schemaVersion: 1,
      observedAt: Date.now(),
      scope: {
        name: getBrowserGlobalScope() || normalizeScope(options.browser?.scope),
        realm: 'current',
        frame: getRuntimeFrame(),
      },
      completeness: {
        currentState: 'complete',
        history: hasIncompleteHistory ? 'partial' : 'complete',
        historyCleared,
        lateBoundInstanceRefs: Array.from(lateBoundInstanceRefs),
        recommendation: hasIncompleteHistory
          ? 'Reload or reopen the page to capture complete runtime history.'
          : undefined,
      },
      capabilities: {
        instanceState: {
          available: true,
          completeness: 'complete',
        },
        remoteTrace: {
          available: hasRemoteSignals || boundInstanceRefs.size > 0,
          completeness: remoteTraceCompleteness,
          reason: !hasResourceLifecycle
            ? 'Runtime resource completion hooks are unavailable; remote resource history may be incomplete.'
            : hasRemoteSignals
              ? undefined
              : 'No remote lifecycle signal has been observed yet.',
        },
        sharedState: {
          available: hasSharedState,
          completeness: hasSharedState ? 'complete' : 'unavailable',
        },
        sharedTrace: {
          available: hasStableSharedRuntime && hasSharedSignals,
          completeness:
            hasStableSharedRuntime && hasSharedSignals
              ? hasDetailedSharedHooks && hasDetailedSharedSignals
                ? traceCompleteness
                : 'partial'
              : 'unavailable',
          reason: hasStableSharedRuntime
            ? hasSharedSignals
              ? hasDetailedSharedHooks && hasDetailedSharedSignals
                ? undefined
                : 'Shared history is available, but detailed registration or selection results are missing.'
              : 'No shared lifecycle signal has been observed yet.'
            : 'Shared tracing requires a stable runtime version of 2.5.0 or newer.',
        },
        bridgeTrace: {
          available: hasBridgeSignals,
          completeness: !hasBridgeSignals
            ? 'unavailable'
            : hasIncompleteHistory
              ? 'partial'
              : 'complete',
          reason: !hasBridgeSignals
            ? hasBridge
              ? 'Bridge is present, but no Bridge lifecycle signal has been observed.'
              : 'Bridge is not present on an observed instance.'
            : hasIncompleteHistory
              ? 'runtime history is incomplete'
              : undefined,
        },
      },
      instances,
      relationships,
      moduleInfo,
    });
  };

  return {
    getRuntimeStateSnapshot,
    updateBridgeState,
  };
}
