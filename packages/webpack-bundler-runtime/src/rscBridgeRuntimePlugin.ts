const RSC_BRIDGE_EXPOSE = '__rspack_rsc_bridge__';
const ACTION_PREFIX = 'remote:';
const MODULE_PREFIX = 'remote-module:';
const SSR_LAYER_PREFIX = '(server-side-rendering)/';
const ACTION_REMAP_GLOBAL_KEY = '__RSPACK_RSC_MF_ACTION_ID_MAP__';
const ACTION_PROXY_MODULE_ID = '__rspack_mf_rsc_action_proxy__';

type ManifestExport = {
  id: string;
  name: string;
  chunks?: Array<string | number>;
  async?: boolean;
};

type ManifestNode = Record<string, ManifestExport>;

type ManifestLike = {
  serverManifest?: Record<string, ManifestExport>;
  clientManifest?: Record<string, ManifestExport>;
  serverConsumerModuleMap?: Record<string, ManifestNode>;
  moduleLoading?: unknown;
  entryCssFiles?: Record<string, unknown> | Array<unknown>;
  entryJsFiles?: Array<unknown> | Record<string, unknown>;
  remoteManifests?: Record<
    string,
    {
      moduleLoading?: unknown;
      entryCssFiles?: unknown;
      entryJsFiles?: unknown;
    }
  >;
  clientExposes?: Record<string, string>;
};

type BridgeModule = {
  getManifest?: () => ManifestLike | Promise<ManifestLike>;
  executeAction?: (actionId: string, args: unknown[]) => Promise<unknown>;
  preloadSSRModule?: (moduleId: string) => Promise<unknown>;
  getSSRModule?: (moduleId: string) => unknown;
};

type ActionMapRecord = Record<string, { alias: string; rawActionId: string }>;
type ActionRemapMap = Record<string, string>;
type FederationState = {
  [ACTION_REMAP_GLOBAL_KEY]?: ActionRemapMap;
};

type RemoteDataItem = {
  name: string;
  remoteName: string;
};

type WebpackRequireRuntime = {
  m?: Record<string, (module: { exports: any }) => void>;
  c?: Record<string, { exports?: unknown }>;
  rscM?: ManifestLike;
  remotesLoadingData?: {
    chunkMapping?: Record<string, Array<string | number>>;
    moduleIdToRemoteDataMapping?: Record<string, RemoteDataItem>;
  };
  u?: (chunkId: string | number) => string;
  federation?: {
    instance?: {
      loadRemote?: (request: string) => Promise<BridgeModule>;
      options?: {
        remotes?: Array<{
          name: string;
          alias?: string;
        }>;
      };
    };
    bundlerRuntime?: {
      resolveRemoteModuleId?: (options: {
        webpackRequire: WebpackRequireRuntime;
        alias: string;
        expose: string;
      }) => string | undefined;
    };
    bundlerRuntimeOptions?: {
      remotes?: {
        remoteInfos?: Record<
          string,
          Array<{
            name?: string;
          }>
        >;
      };
    };
  };
};

declare const __webpack_require__: WebpackRequireRuntime;
declare const __FEDERATION__: FederationState | undefined;

const isObject = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null;

const stableStringify = (value: unknown) => {
  try {
    return JSON.stringify(value, (_key, current) => {
      if (Array.isArray(current)) {
        return current;
      }
      if (!isObject(current)) {
        return current;
      }
      return Object.fromEntries(
        Object.keys(current)
          .sort()
          .map((key) => [key, current[key]]),
      );
    });
  } catch {
    return String(value);
  }
};

const assertNoConflict = (
  target: Record<string, any>,
  key: string,
  nextValue: unknown,
  alias: string,
  section: string,
) => {
  if (!Object.prototype.hasOwnProperty.call(target, key)) {
    return;
  }
  if (stableStringify(target[key]) !== stableStringify(nextValue)) {
    throw new Error(
      `[mf:rsc-bridge] ${section} conflict for "${key}" while merging remote "${alias}"`,
    );
  }
};

const ensureHostManifest = () => {
  if (!isObject(__webpack_require__.rscM)) {
    __webpack_require__.rscM = {};
  }
  const manifest = __webpack_require__.rscM as ManifestLike;
  manifest.serverManifest = isObject(manifest.serverManifest)
    ? manifest.serverManifest
    : {};
  manifest.clientManifest = isObject(manifest.clientManifest)
    ? manifest.clientManifest
    : {};
  manifest.serverConsumerModuleMap = isObject(manifest.serverConsumerModuleMap)
    ? manifest.serverConsumerModuleMap
    : {};
  return manifest;
};

const getNamespacedModuleId = (alias: string, rawId: string | number) =>
  `${MODULE_PREFIX}${alias}:${String(rawId)}`;

const getNamespacedClientManifestKey = (alias: string, key: string | number) =>
  `${MODULE_PREFIX}${alias}:${String(key)}`;

const stripSsrLayerPrefix = (moduleId: string | number) => {
  const normalizedModuleId = String(moduleId);
  return normalizedModuleId.startsWith(SSR_LAYER_PREFIX)
    ? normalizedModuleId.slice(SSR_LAYER_PREFIX.length)
    : normalizedModuleId;
};

const resolveClientModuleIdFromMap = (
  resolvedClientIdsByRawId: Record<string, string>,
  rawId: string | number,
) => {
  const normalizedRawId = String(rawId);
  if (
    Object.prototype.hasOwnProperty.call(
      resolvedClientIdsByRawId,
      normalizedRawId,
    )
  ) {
    return resolvedClientIdsByRawId[normalizedRawId];
  }
  const unprefixedRawId = stripSsrLayerPrefix(normalizedRawId);
  if (
    unprefixedRawId !== normalizedRawId &&
    Object.prototype.hasOwnProperty.call(
      resolvedClientIdsByRawId,
      unprefixedRawId,
    )
  ) {
    return resolvedClientIdsByRawId[unprefixedRawId];
  }
  return undefined;
};

const normalizeExpose = (expose: string) => {
  if (!expose || expose === '.') {
    return '.';
  }
  return expose.startsWith('./') ? expose : `./${expose}`;
};

const normalizeExposeCandidates = (expose: string): string[] => {
  const normalized = normalizeExpose(expose);
  if (normalized === '.') {
    return ['.'];
  }
  if (normalized.startsWith('./')) {
    return [normalized, normalized.slice(2)];
  }
  return [normalized, `./${normalized}`];
};

const getFederationState = (): FederationState | undefined => {
  if (typeof __FEDERATION__ !== 'undefined' && isObject(__FEDERATION__)) {
    return __FEDERATION__;
  }
  return undefined;
};

const getActionRemapMap = () => {
  const federationState = getFederationState();
  if (!federationState) {
    return undefined;
  }
  if (!isObject(federationState[ACTION_REMAP_GLOBAL_KEY])) {
    federationState[ACTION_REMAP_GLOBAL_KEY] = {};
  }
  return federationState[ACTION_REMAP_GLOBAL_KEY] as ActionRemapMap;
};

const registerActionRemap = (rawActionId: string, prefixedActionId: string) => {
  const remapMap = getActionRemapMap();
  if (!remapMap) {
    return;
  }
  const existingValue = remapMap[rawActionId];
  if (!existingValue) {
    remapMap[rawActionId] = prefixedActionId;
    return;
  }
  if (existingValue === prefixedActionId) {
    return;
  }
  throw new Error(
    `[mf:rsc-bridge] Conflicting raw action id "${rawActionId}" mapped to both "${existingValue}" and "${prefixedActionId}"`,
  );
};

const registerActionProxyExport = (
  actionMap: ActionMapRecord,
  actionExportName: string,
  actionRef: { alias: string; rawActionId: string },
) => {
  const existing = actionMap[actionExportName];
  if (!existing) {
    actionMap[actionExportName] = actionRef;
    return;
  }
  if (
    existing.alias === actionRef.alias &&
    existing.rawActionId === actionRef.rawActionId
  ) {
    return;
  }
  throw new Error(
    `[mf:rsc-bridge] Conflicting action export "${actionExportName}" mapped to multiple remotes`,
  );
};

const remapConsumerNode = (
  value: unknown,
  mapServerModuleId: (rawServerModuleId: string) => string,
) => {
  if (!isObject(value)) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value).map(([exportName, exportValue]) => {
      const nextExportValue = isObject(exportValue)
        ? { ...exportValue }
        : exportValue;
      if (isObject(nextExportValue) && nextExportValue['id'] != null) {
        const rawId = String(nextExportValue['id']);
        nextExportValue['id'] = mapServerModuleId(rawId);
      }
      return [exportName, nextExportValue];
    }),
  );
};

const resolveRemoteAlias = (args: any): string | undefined => {
  const candidateAliases = [
    args?.remote?.alias,
    args?.pkgNameOrAlias,
    args?.remote?.name,
    args?.remoteInfo?.alias,
    args?.remoteInfo?.name,
    args?.name,
  ];
  for (const candidate of candidateAliases) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }
  return undefined;
};

const resolveExposeSpecifier = (args: any): string => {
  const candidateExposes = [
    args?.expose,
    args?.id,
    args?.request,
    args?.pkgNameOrAlias,
    args?.remote?.id,
    args?.remote?.expose,
    args?.remoteInfo?.id,
    args?.remoteInfo?.expose,
    args?.name,
  ];
  for (const candidate of candidateExposes) {
    if (
      (typeof candidate === 'string' || typeof candidate === 'number') &&
      String(candidate).trim()
    ) {
      return String(candidate);
    }
  }
  return '';
};

const isBridgeExposeRequest = (args: any) =>
  resolveExposeSpecifier(args).includes(RSC_BRIDGE_EXPOSE);

const getRemoteNameCandidates = (alias: string): Set<string> => {
  const candidates = new Set<string>([alias]);

  const remoteInfos =
    __webpack_require__.federation?.bundlerRuntimeOptions?.remotes?.remoteInfos;
  const aliasRemoteInfos = remoteInfos?.[alias];
  if (Array.isArray(aliasRemoteInfos)) {
    for (const remoteInfo of aliasRemoteInfos) {
      if (typeof remoteInfo?.name === 'string' && remoteInfo.name) {
        candidates.add(remoteInfo.name);
      }
    }
  }

  const remotes = __webpack_require__.federation?.instance?.options?.remotes;
  if (Array.isArray(remotes)) {
    for (const remote of remotes) {
      if (!remote || typeof remote.name !== 'string') {
        continue;
      }
      if (remote.alias === alias || remote.name === alias) {
        candidates.add(remote.name);
        if (typeof remote.alias === 'string' && remote.alias) {
          candidates.add(remote.alias);
        }
      }
    }
  }

  return candidates;
};

const remoteWrapperModuleIdIndexCache: Record<
  string,
  Record<string, string>
> = Object.create(null);

const buildRemoteWrapperModuleIdIndex = (
  alias: string,
): Record<string, string> => {
  if (
    Object.prototype.hasOwnProperty.call(remoteWrapperModuleIdIndexCache, alias)
  ) {
    return remoteWrapperModuleIdIndexCache[alias];
  }

  const exposeToModuleId: Record<string, string> = Object.create(null);
  const remoteNameCandidates = getRemoteNameCandidates(alias);
  const mapping =
    __webpack_require__.remotesLoadingData?.moduleIdToRemoteDataMapping || {};

  for (const [moduleId, remoteData] of Object.entries(mapping)) {
    if (!isObject(remoteData)) {
      continue;
    }
    if (
      typeof remoteData.remoteName !== 'string' ||
      !remoteNameCandidates.has(remoteData.remoteName)
    ) {
      continue;
    }
    if (typeof remoteData.name !== 'string' || !remoteData.name) {
      continue;
    }

    for (const exposeKey of normalizeExposeCandidates(remoteData.name)) {
      if (!Object.prototype.hasOwnProperty.call(exposeToModuleId, exposeKey)) {
        exposeToModuleId[exposeKey] = moduleId;
        continue;
      }
      if (exposeToModuleId[exposeKey] !== moduleId) {
        throw new Error(
          `[mf:rsc-bridge] Conflicting wrapper module id for "${alias}/${exposeKey}"`,
        );
      }
    }
  }

  remoteWrapperModuleIdIndexCache[alias] = exposeToModuleId;
  return exposeToModuleId;
};

const resolveRemoteWrapperModuleId = (
  alias: string,
  expose: string,
): string | undefined => {
  const bundlerRuntimeResolver =
    __webpack_require__.federation?.bundlerRuntime?.resolveRemoteModuleId;

  for (const exposeCandidate of normalizeExposeCandidates(expose)) {
    const resolvedByBundlerRuntime =
      typeof bundlerRuntimeResolver === 'function'
        ? bundlerRuntimeResolver({
            webpackRequire: __webpack_require__,
            alias,
            expose: exposeCandidate,
          })
        : undefined;
    if (
      typeof resolvedByBundlerRuntime === 'string' &&
      resolvedByBundlerRuntime
    ) {
      return resolvedByBundlerRuntime;
    }
  }

  const exposeToModuleId = buildRemoteWrapperModuleIdIndex(alias);
  for (const exposeCandidate of normalizeExposeCandidates(expose)) {
    const resolvedByIndex = exposeToModuleId[exposeCandidate];
    if (typeof resolvedByIndex === 'string' && resolvedByIndex) {
      return resolvedByIndex;
    }
  }
  return undefined;
};

const resolveClientEntryExpose = (
  rawClientManifestKey: string,
  entryName: string | undefined,
  clientExposes: Record<string, string>,
): string | undefined => {
  const rawClientManifestKeyWithoutHash = (() => {
    const hashIndex = rawClientManifestKey.indexOf('#');
    return hashIndex >= 0
      ? rawClientManifestKey.slice(0, hashIndex)
      : rawClientManifestKey;
  })();

  const manifestKeys = Array.from(
    new Set(
      rawClientManifestKey === rawClientManifestKeyWithoutHash
        ? [rawClientManifestKey]
        : [rawClientManifestKey, rawClientManifestKeyWithoutHash],
    ),
  );

  if (entryName && entryName !== '*' && entryName !== '__esModule') {
    for (const rawClientManifestKeyCandidate of manifestKeys) {
      const exposedByFullKey =
        clientExposes[`${rawClientManifestKeyCandidate}#${entryName}`];
      if (typeof exposedByFullKey === 'string' && exposedByFullKey) {
        return normalizeExpose(exposedByFullKey);
      }
    }
  }

  for (const rawClientManifestKeyCandidate of manifestKeys) {
    const exposedByKey = clientExposes[rawClientManifestKeyCandidate];
    if (typeof exposedByKey === 'string' && exposedByKey) {
      return normalizeExpose(exposedByKey);
    }
  }

  if (entryName && entryName !== '*' && entryName !== '__esModule') {
    return normalizeExpose(entryName);
  }

  return undefined;
};

const installActionProxyModule = ({
  actionMap,
  ensureBridge,
}: {
  actionMap: ActionMapRecord;
  ensureBridge: (alias: string, args?: any) => Promise<BridgeModule>;
}) => {
  if (!isObject(__webpack_require__.m)) {
    __webpack_require__.m = {};
  }
  if (__webpack_require__.m?.[ACTION_PROXY_MODULE_ID]) {
    return;
  }

  __webpack_require__.m![ACTION_PROXY_MODULE_ID] = (module: {
    exports: any;
  }) => {
    const getActionFn = (property: string) => {
      const actionRef = actionMap[property];
      if (!actionRef) {
        return undefined;
      }
      return async (...args: unknown[]) => {
        const bridge = await ensureBridge(actionRef.alias);
        if (typeof bridge.executeAction !== 'function') {
          throw new Error(
            `[mf:rsc-bridge] Missing executeAction bridge method for remote "${actionRef.alias}"`,
          );
        }
        return bridge.executeAction(
          actionRef.rawActionId,
          Array.isArray(args) ? args : [],
        );
      };
    };

    module.exports = new Proxy(
      {},
      {
        get(_target, property) {
          if (property === 'then') {
            return undefined;
          }
          if (typeof property !== 'string') {
            return undefined;
          }
          return getActionFn(property);
        },
        has(_target, property) {
          return (
            typeof property === 'string' &&
            Object.prototype.hasOwnProperty.call(actionMap, property)
          );
        },
        getOwnPropertyDescriptor(_target, property) {
          if (
            typeof property !== 'string' ||
            !Object.prototype.hasOwnProperty.call(actionMap, property)
          ) {
            return undefined;
          }
          return {
            configurable: true,
            enumerable: true,
            get() {
              return getActionFn(property);
            },
          };
        },
        ownKeys() {
          return Object.keys(actionMap);
        },
      },
    );
  };
};

const rscBridgeRuntimePlugin = () => {
  const bridgePromises: Partial<Record<string, Promise<BridgeModule>>> = {};
  const aliasMergePromises: Partial<Record<string, Promise<void>>> = {};
  const shareScopeInitPromises: Partial<Record<string, Promise<void>>> = {};
  const mergedRemoteAliases = new Set<string>();
  const actionMap: ActionMapRecord = Object.create(null);
  const ssrModuleExportsByNamespacedId: Record<string, unknown> =
    Object.create(null);
  const ssrModulePreloadPromises: Partial<Record<string, Promise<void>>> = {};

  const ensureSsrModuleFactory = (
    namespacedModuleId: string,
    rawServerModuleId: string,
  ) => {
    if (!isObject(__webpack_require__.m)) {
      __webpack_require__.m = {};
    }
    if (__webpack_require__.m?.[namespacedModuleId]) {
      return;
    }
    __webpack_require__.m![namespacedModuleId] = (module: {
      exports: unknown;
    }) => {
      if (
        !Object.prototype.hasOwnProperty.call(
          ssrModuleExportsByNamespacedId,
          namespacedModuleId,
        )
      ) {
        throw new Error(
          `[mf:rsc-bridge] SSR module "${namespacedModuleId}" (source "${rawServerModuleId}") was requested before preload`,
        );
      }
      module.exports = ssrModuleExportsByNamespacedId[namespacedModuleId];
    };
  };

  const ensureBridge = async (alias: string, args?: any) => {
    const existingBridgePromise = bridgePromises[alias];
    if (existingBridgePromise) {
      return existingBridgePromise;
    }

    const runtimeInstance =
      args?.origin && typeof args.origin.loadRemote === 'function'
        ? args.origin
        : __webpack_require__.federation?.instance;

    if (!runtimeInstance || typeof runtimeInstance.loadRemote !== 'function') {
      throw new Error(
        '[mf:rsc-bridge] Module Federation runtime instance is unavailable while loading the RSC bridge',
      );
    }

    const ensureShareScopesInitialized = async () => {
      const existingShareScopeInit = shareScopeInitPromises[alias];
      if (existingShareScopeInit) {
        await existingShareScopeInit;
        return;
      }

      const getScopesFromValue = (value: unknown): string[] => {
        if (Array.isArray(value)) {
          return value.filter(
            (item): item is string => typeof item === 'string',
          );
        }
        if (typeof value === 'string') {
          return [value];
        }
        return [];
      };

      const scopeSet = new Set<string>();

      const aliasRemoteInfos =
        __webpack_require__.federation?.bundlerRuntimeOptions?.remotes
          ?.remoteInfos?.[alias];
      if (Array.isArray(aliasRemoteInfos)) {
        for (const remoteInfo of aliasRemoteInfos) {
          for (const scope of getScopesFromValue(remoteInfo?.shareScope)) {
            if (scope) {
              scopeSet.add(scope);
            }
          }
        }
      }

      const configuredRemotes = runtimeInstance?.options?.remotes;
      if (Array.isArray(configuredRemotes)) {
        for (const remote of configuredRemotes) {
          if (!remote || typeof remote !== 'object') {
            continue;
          }
          if (remote.alias !== alias && remote.name !== alias) {
            continue;
          }
          for (const scope of getScopesFromValue(remote.shareScope)) {
            if (scope) {
              scopeSet.add(scope);
            }
          }
        }
      }

      if (scopeSet.size === 0) {
        scopeSet.add('default');
      }

      const initPromise = (async () => {
        for (const scope of scopeSet) {
          const initResult =
            typeof runtimeInstance.initializeSharing === 'function'
              ? runtimeInstance.initializeSharing(scope)
              : typeof __webpack_require__.I === 'function'
                ? __webpack_require__.I(scope)
                : undefined;
          if (
            initResult &&
            typeof (initResult as Promise<unknown>).then === 'function'
          ) {
            await initResult;
          }
        }
      })().catch((error: unknown) => {
        delete shareScopeInitPromises[alias];
        throw error;
      });

      shareScopeInitPromises[alias] = initPromise;
      await initPromise;
    };

    await ensureShareScopesInitialized();

    const bridgePromise = Promise.resolve(
      runtimeInstance.loadRemote(`${alias}/${RSC_BRIDGE_EXPOSE}`),
    )
      .then((bridge: BridgeModule) => {
        if (
          !bridge ||
          typeof bridge.getManifest !== 'function' ||
          typeof bridge.executeAction !== 'function'
        ) {
          throw new Error(
            `[mf:rsc-bridge] Remote "${alias}" is missing the internal RSC bridge expose`,
          );
        }
        return bridge;
      })
      .catch((error: unknown) => {
        delete bridgePromises[alias];
        throw error;
      });

    bridgePromises[alias] = bridgePromise;
    return bridgePromise;
  };

  const preloadSsrModule = async (
    alias: string,
    rawServerModuleId: string,
    args?: any,
  ) => {
    const namespacedModuleId = getNamespacedModuleId(alias, rawServerModuleId);
    ensureSsrModuleFactory(namespacedModuleId, rawServerModuleId);

    if (
      Object.prototype.hasOwnProperty.call(
        ssrModuleExportsByNamespacedId,
        namespacedModuleId,
      )
    ) {
      return namespacedModuleId;
    }

    const existingPreload = ssrModulePreloadPromises[namespacedModuleId];
    if (existingPreload) {
      await existingPreload;
      return namespacedModuleId;
    }

    const preloadPromise = (async () => {
      const bridge = await ensureBridge(alias, args);
      if (typeof bridge.preloadSSRModule === 'function') {
        ssrModuleExportsByNamespacedId[namespacedModuleId] =
          await bridge.preloadSSRModule(rawServerModuleId);
        return;
      }
      if (typeof bridge.getSSRModule === 'function') {
        ssrModuleExportsByNamespacedId[namespacedModuleId] =
          bridge.getSSRModule(rawServerModuleId);
        return;
      }
      throw new Error(
        `[mf:rsc-bridge] Remote "${alias}" does not expose preloadSSRModule/getSSRModule for "${rawServerModuleId}"`,
      );
    })()
      .catch((error: unknown) => {
        delete ssrModuleExportsByNamespacedId[namespacedModuleId];
        throw error;
      })
      .finally(() => {
        delete ssrModulePreloadPromises[namespacedModuleId];
      });

    ssrModulePreloadPromises[namespacedModuleId] = preloadPromise;
    await preloadPromise;
    return namespacedModuleId;
  };

  const mergeRemoteManifest = async (
    alias: string,
    remoteManifest: ManifestLike,
    proxyModuleId: string,
    args?: any,
  ) => {
    if (!isObject(remoteManifest)) {
      return;
    }

    const hostManifest = ensureHostManifest();
    const clientExposes = isObject(remoteManifest.clientExposes)
      ? (remoteManifest.clientExposes as Record<string, string>)
      : {};
    const resolvedClientIdsByRawId: Record<string, string> =
      Object.create(null);
    const resolvedClientIdKindByRawId: Record<string, 'wrapper' | 'fallback'> =
      Object.create(null);

    if (isObject(remoteManifest.clientManifest)) {
      for (const [rawClientManifestKey, value] of Object.entries(
        remoteManifest.clientManifest,
      )) {
        const scopedClientManifestKey = getNamespacedClientManifestKey(
          alias,
          rawClientManifestKey,
        );
        const nextValue = isObject(value) ? { ...value } : value;
        const rawRemoteClientModuleId =
          isObject(nextValue) && nextValue.id != null
            ? String(nextValue.id)
            : undefined;
        const entryName =
          isObject(nextValue) && typeof nextValue.name === 'string'
            ? nextValue.name
            : undefined;
        const entryExpose = resolveClientEntryExpose(
          rawClientManifestKey,
          entryName,
          clientExposes,
        );

        const resolvedClientModuleId = entryExpose
          ? resolveRemoteWrapperModuleId(alias, entryExpose)
          : undefined;

        const fallbackClientModuleId = rawRemoteClientModuleId
          ? getNamespacedModuleId(alias, rawRemoteClientModuleId)
          : getNamespacedModuleId(alias, rawClientManifestKey);

        const nextClientIdKind = resolvedClientModuleId
          ? 'wrapper'
          : 'fallback';
        let finalClientModuleId =
          resolvedClientModuleId || fallbackClientModuleId;
        let finalClientIdKind: 'wrapper' | 'fallback' = nextClientIdKind;

        if (isObject(nextValue)) {
          nextValue.id = finalClientModuleId;
          if (resolvedClientModuleId) {
            // Resolved wrapper module ids are expected to already exist in the
            // browser runtime graph.
            nextValue.chunks = [];
          }
        }

        assertNoConflict(
          hostManifest.clientManifest as Record<string, any>,
          scopedClientManifestKey,
          nextValue,
          alias,
          'clientManifest',
        );
        (hostManifest.clientManifest as Record<string, any>)[
          scopedClientManifestKey
        ] = nextValue;

        assertNoConflict(
          hostManifest.clientManifest as Record<string, any>,
          rawClientManifestKey,
          nextValue,
          alias,
          'clientManifest',
        );
        (hostManifest.clientManifest as Record<string, any>)[
          rawClientManifestKey
        ] = nextValue;

        if (!rawRemoteClientModuleId) {
          continue;
        }
        const existingResolvedId =
          resolvedClientIdsByRawId[rawRemoteClientModuleId];
        const existingResolvedKind =
          resolvedClientIdKindByRawId[rawRemoteClientModuleId];
        if (existingResolvedId && existingResolvedId !== finalClientModuleId) {
          // Resolve duplicate raw ids deterministically without relying on
          // module id string patterns:
          // 1) keep previously resolved wrapper ids
          // 2) otherwise keep existing fallback over a new fallback
          // 3) upgrade existing fallback to wrapper when one is discovered
          if (
            existingResolvedKind === 'wrapper' ||
            finalClientIdKind === 'fallback'
          ) {
            finalClientModuleId = existingResolvedId;
            finalClientIdKind = existingResolvedKind || 'fallback';
            if (isObject(nextValue)) {
              nextValue.id = finalClientModuleId;
              if (finalClientIdKind === 'wrapper') {
                nextValue.chunks = [];
              }
            }
          }
        }
        resolvedClientIdsByRawId[rawRemoteClientModuleId] = finalClientModuleId;
        resolvedClientIdKindByRawId[rawRemoteClientModuleId] =
          finalClientIdKind;
        const prefixedRawRemoteClientModuleId =
          rawRemoteClientModuleId.startsWith(SSR_LAYER_PREFIX)
            ? rawRemoteClientModuleId
            : `${SSR_LAYER_PREFIX}${rawRemoteClientModuleId}`;
        const existingPrefixedResolvedId =
          resolvedClientIdsByRawId[prefixedRawRemoteClientModuleId];
        const existingPrefixedResolvedKind =
          resolvedClientIdKindByRawId[prefixedRawRemoteClientModuleId];
        if (
          existingPrefixedResolvedId &&
          existingPrefixedResolvedId !== finalClientModuleId
        ) {
          if (
            existingPrefixedResolvedKind === 'wrapper' ||
            finalClientIdKind === 'fallback'
          ) {
            finalClientModuleId = existingPrefixedResolvedId;
            finalClientIdKind = existingPrefixedResolvedKind || 'fallback';
            if (isObject(nextValue)) {
              nextValue.id = finalClientModuleId;
              if (finalClientIdKind === 'wrapper') {
                nextValue.chunks = [];
              }
            }
          }
        }
        resolvedClientIdsByRawId[prefixedRawRemoteClientModuleId] =
          finalClientModuleId;
        resolvedClientIdKindByRawId[prefixedRawRemoteClientModuleId] =
          finalClientIdKind;
      }
    }

    if (isObject(remoteManifest.serverConsumerModuleMap)) {
      const ssrPreloadPromises: Array<Promise<string>> = [];
      for (const [rawModuleId, value] of Object.entries(
        remoteManifest.serverConsumerModuleMap,
      )) {
        const resolvedModuleId =
          resolveClientModuleIdFromMap(resolvedClientIdsByRawId, rawModuleId) ||
          getNamespacedModuleId(alias, rawModuleId);

        const nextValue = remapConsumerNode(value, (rawServerModuleId) => {
          const namespacedServerModuleId = getNamespacedModuleId(
            alias,
            rawServerModuleId,
          );
          ssrPreloadPromises.push(
            preloadSsrModule(alias, rawServerModuleId, args),
          );
          return namespacedServerModuleId;
        });

        assertNoConflict(
          hostManifest.serverConsumerModuleMap as Record<string, any>,
          resolvedModuleId,
          nextValue,
          alias,
          'serverConsumerModuleMap',
        );
        (hostManifest.serverConsumerModuleMap as Record<string, any>)[
          resolvedModuleId
        ] = nextValue;

        const prefixedResolvedModuleId = resolvedModuleId.startsWith(
          SSR_LAYER_PREFIX,
        )
          ? resolvedModuleId
          : `${SSR_LAYER_PREFIX}${resolvedModuleId}`;
        assertNoConflict(
          hostManifest.serverConsumerModuleMap as Record<string, any>,
          prefixedResolvedModuleId,
          nextValue,
          alias,
          'serverConsumerModuleMap',
        );
        (hostManifest.serverConsumerModuleMap as Record<string, any>)[
          prefixedResolvedModuleId
        ] = nextValue;
      }
      if (ssrPreloadPromises.length > 0) {
        await Promise.all(ssrPreloadPromises);
      }
    }

    const remoteScopedManifest = {
      moduleLoading: remoteManifest.moduleLoading,
      entryCssFiles: remoteManifest.entryCssFiles,
      entryJsFiles: remoteManifest.entryJsFiles,
    };

    if (!isObject(hostManifest.remoteManifests)) {
      hostManifest.remoteManifests = Object.create(null);
    }
    (hostManifest.remoteManifests as Record<string, unknown>)[alias] =
      remoteScopedManifest;

    if (remoteManifest.moduleLoading != null) {
      if (isObject(hostManifest.moduleLoading)) {
        (hostManifest.moduleLoading as Record<string, unknown>)[alias] =
          remoteManifest.moduleLoading;
      } else {
        hostManifest.moduleLoading = {
          [alias]: remoteManifest.moduleLoading,
        };
      }
    }

    if (remoteManifest.entryJsFiles != null) {
      if (!Array.isArray(hostManifest.entryJsFiles)) {
        const nextEntryJsFiles: unknown[] = [];
        if (isObject(hostManifest.entryJsFiles)) {
          Object.assign(nextEntryJsFiles, hostManifest.entryJsFiles);
        }
        hostManifest.entryJsFiles = nextEntryJsFiles;
      }
      (hostManifest.entryJsFiles as Record<string, unknown>)[alias] =
        remoteManifest.entryJsFiles;
    }

    if (remoteManifest.entryCssFiles != null) {
      if (
        isObject(hostManifest.entryCssFiles) ||
        Array.isArray(hostManifest.entryCssFiles)
      ) {
        (hostManifest.entryCssFiles as Record<string, unknown>)[alias] =
          remoteManifest.entryCssFiles;
      } else {
        hostManifest.entryCssFiles = {
          [alias]: remoteManifest.entryCssFiles,
        };
      }
    }

    if (!isObject(remoteManifest.serverManifest)) {
      return;
    }

    for (const [rawActionId, actionEntry] of Object.entries(
      remoteManifest.serverManifest,
    )) {
      const prefixedActionId = `${ACTION_PREFIX}${alias}:${rawActionId}`;
      const prefixedHostActionEntry = {
        id: proxyModuleId,
        name: prefixedActionId,
        chunks: [],
        async:
          isObject(actionEntry) && 'async' in actionEntry
            ? Boolean((actionEntry as Record<string, any>)['async'])
            : true,
      };
      assertNoConflict(
        hostManifest.serverManifest as Record<string, any>,
        prefixedActionId,
        prefixedHostActionEntry,
        alias,
        'serverManifest',
      );
      (hostManifest.serverManifest as Record<string, any>)[prefixedActionId] =
        prefixedHostActionEntry;

      const rawHostActionEntry = {
        ...prefixedHostActionEntry,
        name: rawActionId,
      };

      assertNoConflict(
        hostManifest.serverManifest as Record<string, any>,
        rawActionId,
        rawHostActionEntry,
        alias,
        'serverManifest',
      );
      (hostManifest.serverManifest as Record<string, any>)[rawActionId] =
        rawHostActionEntry;

      registerActionProxyExport(actionMap, prefixedActionId, {
        alias,
        rawActionId,
      });
      registerActionProxyExport(actionMap, rawActionId, {
        alias,
        rawActionId,
      });
      registerActionRemap(rawActionId, prefixedActionId);
    }
  };

  const ensureRemoteAliasMerged = async (alias: string, args: any) => {
    if (isBridgeExposeRequest(args)) {
      return;
    }
    const existingMergePromise = aliasMergePromises[alias];
    if (existingMergePromise) {
      await existingMergePromise;
      return;
    }
    if (mergedRemoteAliases.has(alias)) {
      return;
    }

    const mergePromise = (async () => {
      installActionProxyModule({
        actionMap,
        ensureBridge,
      });

      const bridge = await ensureBridge(alias, args);
      const remoteManifest =
        typeof bridge.getManifest === 'function'
          ? await Promise.resolve(bridge.getManifest())
          : {};

      await mergeRemoteManifest(
        alias,
        remoteManifest || {},
        ACTION_PROXY_MODULE_ID,
        args,
      );
      mergedRemoteAliases.add(alias);
    })();

    aliasMergePromises[alias] = mergePromise;
    try {
      await mergePromise;
    } finally {
      delete aliasMergePromises[alias];
    }
  };

  return {
    name: 'rspack-rsc-bridge-runtime-plugin',
    async afterResolve(args: any) {
      const alias = resolveRemoteAlias(args);
      if (!alias) {
        return args;
      }
      await ensureRemoteAliasMerged(alias, args);
      return args;
    },
    async onLoad(args: any) {
      const alias = resolveRemoteAlias(args);
      if (!alias) {
        return args;
      }
      await ensureRemoteAliasMerged(alias, args);
      return args;
    },
  };
};

export default rscBridgeRuntimePlugin;
