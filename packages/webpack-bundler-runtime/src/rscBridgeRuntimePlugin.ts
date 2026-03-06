import {
  type ManifestExport,
  type ManifestLike,
  type ManifestNode,
  type RscBridgeModuleV1 as BridgeModule,
  getClientManifestKeyWithoutHash,
  resolveClientReferenceEntry,
} from './rscManifest';

const RSC_BRIDGE_EXPOSE = '__rspack_rsc_bridge__';
const ACTION_PREFIX = 'remote:';
const MODULE_PREFIX = 'remote-module:';
const SERVER_MODULE_PREFIX = 'remote-server-module:';
const SSR_LAYER_PREFIX = '(server-side-rendering)/';
const RSC_LAYER_PREFIX = '(react-server-components)/';
const ACTION_REMAP_GLOBAL_KEY = '__RSPACK_RSC_MF_ACTION_ID_MAP__';
const ACTION_PROXY_MODULE_ID = '__rspack_mf_rsc_action_proxy__';

type ActionMapRecord = Record<string, { alias: string; rawActionId: string }>;
type ActionRemapMap = Record<string, string>;
type FederationState = {
  [ACTION_REMAP_GLOBAL_KEY]?: ActionRemapMap;
};

type RemoteDataItem = {
  name: string;
  remoteName: string;
};

type ConsumeDataItem = {
  shareKey?: string;
};

type ConsumeHandlerItem = {
  shareKey?: string;
};

type ClientModuleResolutionKind = 'shared' | 'remote';

type WebpackRequireRuntime = {
  m?: Record<string, (module: { exports: any }) => void>;
  c?: Record<string, { exports?: unknown }>;
  rscM?: ManifestLike;
  remotesLoadingData?: {
    chunkMapping?: Record<string, Array<string | number>>;
    moduleIdToRemoteDataMapping?: Record<string, RemoteDataItem>;
  };
  consumesLoadingData?: {
    moduleIdToConsumeDataMapping?: Record<string, ConsumeDataItem>;
  };
  u?: (chunkId: string | number) => string;
  federation?: {
    instance?: {
      loadRemote?: (request: string) => Promise<BridgeModule>;
      loadShareSync?: (shareKey: string) => (() => unknown) | false;
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
    consumesLoadingModuleToHandlerMapping?: Record<string, ConsumeHandlerItem>;
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

const getNamespacedServerModuleId = (alias: string, rawId: string | number) =>
  `${SERVER_MODULE_PREFIX}${alias}:${String(rawId)}`;

const getNamespacedClientManifestKey = (alias: string, key: string | number) =>
  `${MODULE_PREFIX}${alias}:${String(key)}`;

const namespaceModuleIdDeterministically = (
  alias: string,
  rawId: string | number,
) => {
  const normalizedRawId = String(rawId);
  const namespaceLayerId = (layerPrefix: string) => {
    const unprefixedId = normalizedRawId.slice(layerPrefix.length);
    return unprefixedId.startsWith(MODULE_PREFIX)
      ? normalizedRawId
      : `${layerPrefix}${getNamespacedModuleId(alias, unprefixedId)}`;
  };
  if (normalizedRawId.startsWith(SSR_LAYER_PREFIX)) {
    return namespaceLayerId(SSR_LAYER_PREFIX);
  }
  if (normalizedRawId.startsWith(RSC_LAYER_PREFIX)) {
    return namespaceLayerId(RSC_LAYER_PREFIX);
  }
  return normalizedRawId.startsWith(MODULE_PREFIX)
    ? normalizedRawId
    : getNamespacedModuleId(alias, normalizedRawId);
};

const namespaceServerModuleIdDeterministically = (
  alias: string,
  rawId: string | number,
) => {
  const normalizedRawId = String(rawId);
  const namespaceLayerId = (layerPrefix: string) => {
    const unprefixedId = normalizedRawId.slice(layerPrefix.length);
    return unprefixedId.startsWith(SERVER_MODULE_PREFIX)
      ? normalizedRawId
      : `${layerPrefix}${getNamespacedServerModuleId(alias, unprefixedId)}`;
  };
  if (normalizedRawId.startsWith(SSR_LAYER_PREFIX)) {
    return namespaceLayerId(SSR_LAYER_PREFIX);
  }
  if (normalizedRawId.startsWith(RSC_LAYER_PREFIX)) {
    return namespaceLayerId(RSC_LAYER_PREFIX);
  }
  return normalizedRawId.startsWith(SERVER_MODULE_PREFIX)
    ? normalizedRawId
    : getNamespacedServerModuleId(alias, normalizedRawId);
};

const isNamespacedRemoteIdForAlias = (alias: string, moduleId: string) => {
  const aliasPrefix = `${MODULE_PREFIX}${alias}:`;
  return (
    moduleId.startsWith(aliasPrefix) ||
    moduleId.startsWith(`${SSR_LAYER_PREFIX}${aliasPrefix}`) ||
    moduleId.startsWith(`${RSC_LAYER_PREFIX}${aliasPrefix}`)
  );
};

const stripLayerPrefix = (moduleId: string | number) => {
  const normalizedModuleId = String(moduleId);
  if (normalizedModuleId.startsWith(SSR_LAYER_PREFIX)) {
    return normalizedModuleId.slice(SSR_LAYER_PREFIX.length);
  }
  if (normalizedModuleId.startsWith(RSC_LAYER_PREFIX)) {
    return normalizedModuleId.slice(RSC_LAYER_PREFIX.length);
  }
  return normalizedModuleId;
};

const applyLayerPrefixFromRawId = (
  rawModuleId: string,
  resolvedModuleId: string,
) => {
  const normalizedResolvedModuleId = String(resolvedModuleId);
  const unprefixedResolvedModuleId = stripLayerPrefix(
    normalizedResolvedModuleId,
  );
  if (rawModuleId.startsWith(SSR_LAYER_PREFIX)) {
    return normalizedResolvedModuleId.startsWith(SSR_LAYER_PREFIX)
      ? normalizedResolvedModuleId
      : `${SSR_LAYER_PREFIX}${unprefixedResolvedModuleId}`;
  }
  if (rawModuleId.startsWith(RSC_LAYER_PREFIX)) {
    return normalizedResolvedModuleId.startsWith(RSC_LAYER_PREFIX)
      ? normalizedResolvedModuleId
      : `${RSC_LAYER_PREFIX}${unprefixedResolvedModuleId}`;
  }
  return normalizedResolvedModuleId;
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
    return applyLayerPrefixFromRawId(
      normalizedRawId,
      resolvedClientIdsByRawId[normalizedRawId],
    );
  }
  const unprefixedRawId = stripLayerPrefix(normalizedRawId);
  if (
    unprefixedRawId !== normalizedRawId &&
    Object.prototype.hasOwnProperty.call(
      resolvedClientIdsByRawId,
      unprefixedRawId,
    )
  ) {
    return applyLayerPrefixFromRawId(
      normalizedRawId,
      resolvedClientIdsByRawId[unprefixedRawId],
    );
  }
  return undefined;
};

const createSharedConsumeModuleIdIndex = () => {
  const shareKeyToModuleId: Record<string, string> = Object.create(null);
  const assignShareKey = (moduleId: string, shareKey: string) => {
    if (!shareKey) {
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(shareKeyToModuleId, shareKey)) {
      shareKeyToModuleId[shareKey] = String(moduleId);
    }
  };
  const handlerMapping =
    __webpack_require__.federation?.consumesLoadingModuleToHandlerMapping;
  if (isObject(handlerMapping)) {
    for (const [moduleId, handlerValue] of Object.entries(handlerMapping)) {
      if (
        !isObject(handlerValue) ||
        typeof handlerValue.shareKey !== 'string'
      ) {
        continue;
      }
      assignShareKey(String(moduleId), handlerValue.shareKey);
    }
  }

  const consumeDataMapping =
    __webpack_require__.consumesLoadingData?.moduleIdToConsumeDataMapping;
  if (isObject(consumeDataMapping)) {
    for (const [moduleId, consumeData] of Object.entries(consumeDataMapping)) {
      if (!isObject(consumeData) || typeof consumeData.shareKey !== 'string') {
        continue;
      }
      assignShareKey(String(moduleId), consumeData.shareKey);
    }
  }

  return shareKeyToModuleId;
};

const resolveSharedConsumeModuleId = (
  rawClientManifestKey: string,
  shareKeyToModuleId: Record<string, string>,
  explicitShareKey?: string,
): string | undefined => {
  const candidateShareKeys = new Set<string>([
    explicitShareKey || getClientManifestKeyWithoutHash(rawClientManifestKey),
  ]);

  for (const shareKey of candidateShareKeys) {
    if (!shareKey) {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(shareKeyToModuleId, shareKey)) {
      return shareKeyToModuleId[shareKey];
    }
  }

  return undefined;
};

const resolveShareKeyFromClientManifestKey = (
  rawClientManifestKey: string,
): string | undefined => {
  const keyWithoutHash = getClientManifestKeyWithoutHash(rawClientManifestKey);
  if (!keyWithoutHash || keyWithoutHash.startsWith(MODULE_PREFIX)) {
    return undefined;
  }
  if (keyWithoutHash.startsWith('.') || keyWithoutHash.startsWith('/')) {
    return undefined;
  }
  if (/^[A-Za-z]:[\\/]/.test(keyWithoutHash) || keyWithoutHash.includes('\\')) {
    return undefined;
  }
  return keyWithoutHash;
};

const getClientModuleResolutionPriority = (
  resolutionKind: ClientModuleResolutionKind | undefined,
) => {
  switch (resolutionKind) {
    case 'shared':
      return 2;
    case 'remote':
      return 1;
    default:
      return 0;
  }
};

const normalizeExpose = (expose: string) => {
  if (!expose || expose === '.') {
    return '.';
  }
  return expose.startsWith('./') ? expose : `./${expose}`;
};

const getRemoteClientReferenceModuleId = (alias: string, expose: string) => {
  const normalizedExpose = normalizeExpose(expose);
  const exposeToken = normalizedExpose.startsWith('./')
    ? normalizedExpose.slice(2)
    : normalizedExpose;
  return getNamespacedModuleId(alias, exposeToken || '.');
};

const parseRemoteClientReferenceModuleId = (
  moduleId: string,
): { alias: string; expose: string } | undefined => {
  const normalizedModuleId = stripLayerPrefix(moduleId);
  if (!normalizedModuleId.startsWith(MODULE_PREFIX)) {
    return undefined;
  }
  const namespacedToken = normalizedModuleId.slice(MODULE_PREFIX.length);
  const aliasSeparatorIndex = namespacedToken.indexOf(':');
  if (aliasSeparatorIndex <= 0) {
    return undefined;
  }
  const alias = namespacedToken.slice(0, aliasSeparatorIndex).trim();
  const exposeToken = namespacedToken.slice(aliasSeparatorIndex + 1).trim();
  if (!alias || !exposeToken) {
    return undefined;
  }
  return {
    alias,
    expose: normalizeExpose(exposeToken),
  };
};

const resolveClientEntryExpose = (
  rawClientManifestKey: string,
  entryName: string | undefined,
  clientExposes: Record<string, string>,
): string | undefined => {
  const rawClientManifestKeyWithoutHash =
    getClientManifestKeyWithoutHash(rawClientManifestKey);

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

const resolveExplicitClientModuleId = (
  remoteManifest: ManifestLike,
  rawClientManifestKey: string,
) => {
  const clientReference = resolveClientReferenceEntry(
    remoteManifest,
    rawClientManifestKey,
  );
  if (!clientReference || !isObject(clientReference.resolution)) {
    return undefined;
  }
  const resolution = clientReference.resolution;
  if (
    resolution.kind === 'shared' &&
    typeof resolution.shareKey === 'string' &&
    resolution.shareKey
  ) {
    return {
      kind: 'shared' as const,
      shareKey: String(resolution.shareKey),
    };
  }
  if (
    resolution.kind === 'remote' &&
    typeof resolution.request === 'string' &&
    resolution.request
  ) {
    return {
      kind: 'remote' as const,
      expose: normalizeExpose(resolution.request),
    };
  }
  return undefined;
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
  mapServerModuleId: (rawServerModuleId: string, exportName: string) => string,
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
        nextExportValue['id'] = mapServerModuleId(rawId, exportName);
      }
      return [exportName, nextExportValue];
    }),
  );
};

const inferExposeHintFromConsumerNode = (node: unknown): string | undefined => {
  if (!isObject(node)) {
    return undefined;
  }

  for (const [exportName, exportValue] of Object.entries(node)) {
    if (exportName !== '*' && exportName !== '__esModule') {
      return normalizeExpose(exportName);
    }
    if (
      isObject(exportValue) &&
      typeof exportValue['name'] === 'string' &&
      exportValue['name'] !== '*' &&
      exportValue['name'] !== '__esModule'
    ) {
      return normalizeExpose(exportValue['name']);
    }
  }

  const starValue = node['*'];
  if (
    isObject(starValue) &&
    typeof starValue['name'] === 'string' &&
    starValue['name'] !== '*' &&
    starValue['name'] !== '__esModule'
  ) {
    return normalizeExpose(starValue['name']);
  }

  return undefined;
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

const resolveBridgeFromLoadArgs = async (
  args: any,
): Promise<BridgeModule | undefined> => {
  if (
    isObject(args?.exposeModule) &&
    typeof args.exposeModule.getManifest === 'function' &&
    typeof args.exposeModule.executeAction === 'function'
  ) {
    return args.exposeModule as BridgeModule;
  }

  if (typeof args?.exposeModuleFactory === 'function') {
    const bridgeCandidate = await Promise.resolve(args.exposeModuleFactory());
    if (
      isObject(bridgeCandidate) &&
      typeof bridgeCandidate.getManifest === 'function' &&
      typeof bridgeCandidate.executeAction === 'function'
    ) {
      return bridgeCandidate as BridgeModule;
    }
  }
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
  const syntheticSharedShareKeyByModuleId: Record<string, string> =
    Object.create(null);
  const syntheticSharedExportsByModuleId: Record<string, unknown> =
    Object.create(null);
  const syntheticRemoteRequestByModuleId: Record<string, string> =
    Object.create(null);
  const resolvedRemoteRequestByModuleId: Record<string, string> =
    Object.create(null);
  const syntheticRemoteExportsByModuleId: Record<string, unknown> =
    Object.create(null);
  const syntheticRemotePromiseByModuleId: Record<
    string,
    Promise<unknown>
  > = Object.create(null);
  const exposeTokenByServerModuleIdByAlias: Record<
    string,
    Record<string, string>
  > = Object.create(null);
  const exposeTokenMapPromiseByAlias: Partial<Record<string, Promise<void>>> =
    {};
  const seededRemoteClientModuleIds = new Set<string>();
  let lazyRemoteFactoryPrototypeInstalled = false;

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

  const installSyntheticSharedClientModuleFactory = (
    moduleId: string,
    shareKey: string,
  ) => {
    const existingShareKey = syntheticSharedShareKeyByModuleId[moduleId];
    if (existingShareKey && existingShareKey !== shareKey) {
      throw new Error(
        `[mf:rsc-bridge] Conflicting shared client reference for "${moduleId}" between "${existingShareKey}" and "${shareKey}"`,
      );
    }
    syntheticSharedShareKeyByModuleId[moduleId] = shareKey;

    if (!isObject(__webpack_require__.m)) {
      __webpack_require__.m = {};
    }
    if (__webpack_require__.m?.[moduleId]) {
      return;
    }

    __webpack_require__.m![moduleId] = (module: { exports: unknown }) => {
      if (
        Object.prototype.hasOwnProperty.call(
          syntheticSharedExportsByModuleId,
          moduleId,
        )
      ) {
        module.exports = syntheticSharedExportsByModuleId[moduleId];
        return;
      }
      const federationInstance = __webpack_require__.federation?.instance;
      if (
        !federationInstance ||
        typeof federationInstance.loadShareSync !== 'function'
      ) {
        throw new Error(
          `[mf:rsc-bridge] Missing loadShareSync for shared client reference "${shareKey}"`,
        );
      }
      const sharedFactory = federationInstance.loadShareSync(shareKey);
      if (typeof sharedFactory !== 'function') {
        throw new Error(
          `[mf:rsc-bridge] Shared client reference "${shareKey}" is unavailable synchronously`,
        );
      }
      const sharedExports = sharedFactory();
      syntheticSharedExportsByModuleId[moduleId] = sharedExports;
      module.exports = sharedExports;
    };
  };

  const installSyntheticRemoteClientModuleFactory = (
    moduleId: string,
    alias: string,
    expose: string,
  ) => {
    const normalizedExpose = normalizeExpose(expose);
    const remoteRequest = `${alias}/${normalizedExpose.startsWith('./') ? normalizedExpose.slice(2) : normalizedExpose}`;
    const existingRequest = syntheticRemoteRequestByModuleId[moduleId];
    if (existingRequest && existingRequest !== remoteRequest) {
      throw new Error(
        `[mf:rsc-bridge] Conflicting remote client reference for "${moduleId}" between "${existingRequest}" and "${remoteRequest}"`,
      );
    }
    syntheticRemoteRequestByModuleId[moduleId] = remoteRequest;

    const exposeTokenFromModuleId =
      parseRemoteClientReferenceModuleId(moduleId)?.expose;
    const normalizedExposeToken =
      exposeTokenFromModuleId && exposeTokenFromModuleId.startsWith('./')
        ? exposeTokenFromModuleId.slice(2)
        : exposeTokenFromModuleId || '';

    const ensureExposeTokenMapForAlias = async () => {
      if (
        isObject(exposeTokenByServerModuleIdByAlias[alias]) &&
        Object.keys(exposeTokenByServerModuleIdByAlias[alias]).length > 0
      ) {
        return;
      }
      const existingPromise = exposeTokenMapPromiseByAlias[alias];
      if (existingPromise) {
        await existingPromise;
        return;
      }

      const buildPromise = (async () => {
        const bridge = await ensureBridge(alias);
        if (typeof bridge.getManifest !== 'function') {
          return;
        }
        const bridgeManifest = await Promise.resolve(bridge.getManifest());
        if (!isObject(bridgeManifest)) {
          return;
        }

        const clientManifest = isObject(bridgeManifest.clientManifest)
          ? (bridgeManifest.clientManifest as Record<string, ManifestExport>)
          : undefined;
        const serverConsumerModuleMap = isObject(
          bridgeManifest.serverConsumerModuleMap,
        )
          ? (bridgeManifest.serverConsumerModuleMap as Record<
              string,
              ManifestNode
            >)
          : undefined;
        if (!clientManifest || !serverConsumerModuleMap) {
          return;
        }

        const clientExposes = isObject(bridgeManifest.clientExposes)
          ? (bridgeManifest.clientExposes as Record<string, string>)
          : {};
        const exposeTokenByClientModuleId: Record<string, string> =
          Object.create(null);

        for (const [rawClientManifestKey, clientEntry] of Object.entries(
          clientManifest,
        )) {
          if (!isObject(clientEntry) || clientEntry.id == null) {
            continue;
          }
          const entryName =
            typeof clientEntry.name === 'string' ? clientEntry.name : undefined;
          const entryExpose = resolveClientEntryExpose(
            rawClientManifestKey,
            entryName,
            clientExposes,
          );
          if (!entryExpose) {
            continue;
          }
          const exposeToken = entryExpose.startsWith('./')
            ? entryExpose.slice(2)
            : entryExpose;
          if (!exposeToken) {
            continue;
          }
          const clientModuleId = stripLayerPrefix(String(clientEntry.id));
          if (
            !Object.prototype.hasOwnProperty.call(
              exposeTokenByClientModuleId,
              clientModuleId,
            )
          ) {
            exposeTokenByClientModuleId[clientModuleId] = exposeToken;
          }
        }

        const nextExposeTokenMap: Record<string, string> = Object.create(null);
        for (const [rawServerConsumerModuleId, node] of Object.entries(
          serverConsumerModuleMap,
        )) {
          if (!isObject(node)) {
            continue;
          }
          const rawClientModuleId = stripLayerPrefix(rawServerConsumerModuleId);
          const exposeToken = exposeTokenByClientModuleId[rawClientModuleId];
          if (!exposeToken) {
            continue;
          }
          if (
            !Object.prototype.hasOwnProperty.call(
              nextExposeTokenMap,
              rawClientModuleId,
            )
          ) {
            nextExposeTokenMap[rawClientModuleId] = exposeToken;
          }

          for (const nodeEntry of Object.values(node)) {
            if (!isObject(nodeEntry) || nodeEntry.id == null) {
              continue;
            }
            const rawServerModuleId = stripLayerPrefix(String(nodeEntry.id));
            if (
              !Object.prototype.hasOwnProperty.call(
                nextExposeTokenMap,
                rawServerModuleId,
              )
            ) {
              nextExposeTokenMap[rawServerModuleId] = exposeToken;
            }
          }
        }

        exposeTokenByServerModuleIdByAlias[alias] = nextExposeTokenMap;
      })()
        .catch((error: unknown) => {
          delete exposeTokenMapPromiseByAlias[alias];
          throw error;
        })
        .finally(() => {
          delete exposeTokenMapPromiseByAlias[alias];
        });

      exposeTokenMapPromiseByAlias[alias] = buildPromise;
      await buildPromise;
    };

    const isLikelyOpaqueExposeToken =
      !normalizedExposeToken || /^\d+$/.test(normalizedExposeToken);

    const resolveRemoteRequest = async () => {
      if (
        Object.prototype.hasOwnProperty.call(
          resolvedRemoteRequestByModuleId,
          moduleId,
        )
      ) {
        return resolvedRemoteRequestByModuleId[moduleId];
      }

      let resolvedRemoteRequest = remoteRequest;
      const exposeTokenByServerModuleId =
        exposeTokenByServerModuleIdByAlias[alias];
      const remappedExposeToken =
        (isObject(exposeTokenByServerModuleId) &&
          typeof exposeTokenByServerModuleId[normalizedExposeToken] ===
            'string' &&
          exposeTokenByServerModuleId[normalizedExposeToken]) ||
        '';
      if (remappedExposeToken) {
        resolvedRemoteRequest = `${alias}/${remappedExposeToken}`;
      } else if (isLikelyOpaqueExposeToken) {
        await ensureExposeTokenMapForAlias();
        const nextExposeTokenMap =
          exposeTokenByServerModuleIdByAlias[alias] || Object.create(null);
        const fallbackExposeToken =
          typeof nextExposeTokenMap[normalizedExposeToken] === 'string'
            ? nextExposeTokenMap[normalizedExposeToken]
            : '';
        if (fallbackExposeToken) {
          resolvedRemoteRequest = `${alias}/${fallbackExposeToken}`;
        }
      }

      resolvedRemoteRequestByModuleId[moduleId] = resolvedRemoteRequest;
      return resolvedRemoteRequest;
    };

    if (!isObject(__webpack_require__.m)) {
      __webpack_require__.m = {};
    }

    __webpack_require__.m![moduleId] = (module: { exports: unknown }) => {
      if (
        Object.prototype.hasOwnProperty.call(
          syntheticRemoteExportsByModuleId,
          moduleId,
        )
      ) {
        module.exports = syntheticRemoteExportsByModuleId[moduleId];
        return;
      }

      let pending = syntheticRemotePromiseByModuleId[moduleId];
      if (!pending) {
        const runtimeInstance = __webpack_require__.federation?.instance;
        if (
          !runtimeInstance ||
          typeof runtimeInstance.loadRemote !== 'function'
        ) {
          throw new Error(
            `[mf:rsc-bridge] Missing loadRemote for remote client reference "${remoteRequest}"`,
          );
        }
        pending = resolveRemoteRequest()
          .then((resolvedRemoteRequest) =>
            Promise.resolve(runtimeInstance.loadRemote(resolvedRemoteRequest)),
          )
          .catch(async (error: unknown) => {
            await ensureExposeTokenMapForAlias();
            const exposeTokenMap =
              exposeTokenByServerModuleIdByAlias[alias] || Object.create(null);
            const fallbackExposeToken =
              typeof exposeTokenMap[normalizedExposeToken] === 'string'
                ? exposeTokenMap[normalizedExposeToken]
                : '';
            if (!fallbackExposeToken) {
              throw error;
            }
            const fallbackRequest = `${alias}/${fallbackExposeToken}`;
            if (fallbackRequest === remoteRequest) {
              throw error;
            }
            resolvedRemoteRequestByModuleId[moduleId] = fallbackRequest;
            return Promise.resolve(runtimeInstance.loadRemote(fallbackRequest));
          })
          .then((exportsValue) => {
            syntheticRemoteExportsByModuleId[moduleId] = exportsValue;
            return exportsValue;
          });
        syntheticRemotePromiseByModuleId[moduleId] = pending;
      }

      module.exports = pending;
    };
  };

  const ensureLazyRemoteClientFactoryPrototype = () => {
    if (lazyRemoteFactoryPrototypeInstalled) {
      return;
    }
    if (!isObject(__webpack_require__.m)) {
      __webpack_require__.m = {};
    }
    const moduleFactories = __webpack_require__.m as Record<string, any>;
    const previousPrototype = Object.getPrototypeOf(moduleFactories);
    const fallbackPrototype = new Proxy(previousPrototype ?? Object.prototype, {
      get(target, property, receiver) {
        if (
          typeof property === 'string' &&
          !Object.prototype.hasOwnProperty.call(moduleFactories, property)
        ) {
          const parsedModuleId = parseRemoteClientReferenceModuleId(property);
          if (parsedModuleId) {
            installSyntheticRemoteClientModuleFactory(
              property,
              parsedModuleId.alias,
              parsedModuleId.expose,
            );
            if (
              Object.prototype.hasOwnProperty.call(moduleFactories, property)
            ) {
              return moduleFactories[property];
            }
          }
        }
        return Reflect.get(target, property, receiver);
      },
      has(target, property) {
        if (
          typeof property === 'string' &&
          !Object.prototype.hasOwnProperty.call(moduleFactories, property)
        ) {
          const parsedModuleId = parseRemoteClientReferenceModuleId(property);
          if (parsedModuleId) {
            installSyntheticRemoteClientModuleFactory(
              property,
              parsedModuleId.alias,
              parsedModuleId.expose,
            );
          }
        }
        return (
          Object.prototype.hasOwnProperty.call(moduleFactories, property) ||
          Reflect.has(target, property)
        );
      },
      getOwnPropertyDescriptor(target, property) {
        if (
          typeof property === 'string' &&
          !Object.prototype.hasOwnProperty.call(moduleFactories, property)
        ) {
          const parsedModuleId = parseRemoteClientReferenceModuleId(property);
          if (parsedModuleId) {
            installSyntheticRemoteClientModuleFactory(
              property,
              parsedModuleId.alias,
              parsedModuleId.expose,
            );
          }
        }
        return (
          Object.getOwnPropertyDescriptor(moduleFactories, property) ||
          Reflect.getOwnPropertyDescriptor(target, property)
        );
      },
    });
    Object.setPrototypeOf(moduleFactories, fallbackPrototype);
    lazyRemoteFactoryPrototypeInstalled = true;
  };

  const seedRemoteClientModuleFactoriesFromRuntimeMapping = () => {
    ensureLazyRemoteClientFactoryPrototype();
    const moduleIdToRemoteDataMapping =
      __webpack_require__.remotesLoadingData?.moduleIdToRemoteDataMapping;
    if (!isObject(moduleIdToRemoteDataMapping)) {
      return;
    }
    for (const remoteData of Object.values(moduleIdToRemoteDataMapping)) {
      if (!isObject(remoteData)) {
        continue;
      }
      const remoteAlias =
        typeof remoteData.remoteName === 'string' ? remoteData.remoteName : '';
      const expose = typeof remoteData.name === 'string' ? remoteData.name : '';
      if (!remoteAlias || !expose) {
        continue;
      }
      const clientModuleId = getRemoteClientReferenceModuleId(
        remoteAlias,
        expose,
      );
      if (seededRemoteClientModuleIds.has(clientModuleId)) {
        continue;
      }
      installSyntheticRemoteClientModuleFactory(
        clientModuleId,
        remoteAlias,
        expose,
      );
      seededRemoteClientModuleIds.add(clientModuleId);
    }
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
    exposeHint?: string,
    args?: any,
  ) => {
    const namespacedModuleId = namespaceServerModuleIdDeterministically(
      alias,
      rawServerModuleId,
    );
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
          await bridge.preloadSSRModule(rawServerModuleId, exposeHint);
        return;
      }
      if (typeof bridge.getSSRModule === 'function') {
        ssrModuleExportsByNamespacedId[namespacedModuleId] =
          bridge.getSSRModule(rawServerModuleId);
        return;
      }
      throw new Error(
        `[mf:rsc-bridge] Remote "${alias}" does not expose preloadSSRModule/getSSRModule for "${rawServerModuleId}"${exposeHint ? ` (hint: ${exposeHint})` : ''}`,
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
    const resolvedClientIdKindByRawId: Record<
      string,
      ClientModuleResolutionKind
    > = Object.create(null);
    const shareKeyToModuleId = createSharedConsumeModuleIdIndex();
    const clientManifestEntriesByRawId: Record<
      string,
      Array<ManifestExport>
    > = Object.create(null);

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
        const explicitClientModule = resolveExplicitClientModuleId(
          remoteManifest,
          rawClientManifestKey,
        );
        const entryExpose =
          explicitClientModule?.kind === 'remote'
            ? explicitClientModule.expose
            : resolveClientEntryExpose(
                rawClientManifestKey,
                entryName,
                clientExposes,
              );
        const resolvedLocalSharedClientModuleId =
          explicitClientModule?.kind === 'shared'
            ? resolveSharedConsumeModuleId(
                rawClientManifestKey,
                shareKeyToModuleId,
                explicitClientModule.shareKey,
              )
            : resolveSharedConsumeModuleId(
                rawClientManifestKey,
                shareKeyToModuleId,
              );
        const resolvedShareKey =
          explicitClientModule?.kind === 'shared'
            ? explicitClientModule.shareKey
            : resolvedLocalSharedClientModuleId
              ? undefined
              : resolveShareKeyFromClientManifestKey(rawClientManifestKey);
        const resolvedRemoteExposeClientModuleId =
          entryExpose && !resolvedLocalSharedClientModuleId
            ? getRemoteClientReferenceModuleId(alias, entryExpose)
            : undefined;

        const fallbackClientModuleId = rawRemoteClientModuleId
          ? namespaceModuleIdDeterministically(alias, rawRemoteClientModuleId)
          : namespaceModuleIdDeterministically(alias, rawClientManifestKey);
        const resolvedSyntheticSharedClientModuleId =
          !resolvedLocalSharedClientModuleId &&
          resolvedShareKey &&
          rawRemoteClientModuleId
            ? namespaceModuleIdDeterministically(alias, rawRemoteClientModuleId)
            : undefined;
        if (resolvedSyntheticSharedClientModuleId && resolvedShareKey) {
          installSyntheticSharedClientModuleFactory(
            resolvedSyntheticSharedClientModuleId,
            resolvedShareKey,
          );
        }

        const nextClientIdKind: ClientModuleResolutionKind =
          resolvedLocalSharedClientModuleId ||
          resolvedSyntheticSharedClientModuleId
            ? 'shared'
            : 'remote';
        let finalClientModuleId =
          resolvedLocalSharedClientModuleId ||
          resolvedSyntheticSharedClientModuleId ||
          resolvedRemoteExposeClientModuleId ||
          fallbackClientModuleId;
        let finalClientIdKind: ClientModuleResolutionKind = nextClientIdKind;

        if (isObject(nextValue)) {
          nextValue.id = finalClientModuleId;
          if (finalClientIdKind === 'shared') {
            nextValue.chunks = [];
          } else if (entryExpose) {
            installSyntheticRemoteClientModuleFactory(
              finalClientModuleId,
              alias,
              entryExpose,
            );
            nextValue.chunks = [];
            nextValue.async = true;
          }
        }
        const clientManifest = hostManifest.clientManifest as Record<
          string,
          any
        >;
        const upsertClientManifestEntry = (
          key: string,
          entry: unknown,
          preferIncomingNonNamespaced: boolean,
        ) => {
          if (!Object.prototype.hasOwnProperty.call(clientManifest, key)) {
            clientManifest[key] = entry;
            return entry;
          }
          const existingEntry = clientManifest[key];
          if (stableStringify(existingEntry) === stableStringify(entry)) {
            return existingEntry;
          }
          if (
            isObject(existingEntry) &&
            isObject(entry) &&
            existingEntry.id != null &&
            entry.id != null
          ) {
            const existingId = String(existingEntry.id);
            const nextId = String(entry.id);
            const existingIsNamespaced = isNamespacedRemoteIdForAlias(
              alias,
              existingId,
            );
            const nextIsNamespaced = isNamespacedRemoteIdForAlias(
              alias,
              nextId,
            );
            if (!existingIsNamespaced && !nextIsNamespaced) {
              if (preferIncomingNonNamespaced && existingId !== nextId) {
                clientManifest[key] = entry;
                return entry;
              }
              return existingEntry;
            }
            if (!existingIsNamespaced && nextIsNamespaced) {
              return existingEntry;
            }
            if (existingIsNamespaced && !nextIsNamespaced) {
              clientManifest[key] = entry;
              return entry;
            }
          }
          throw new Error(
            `[mf:rsc-bridge] clientManifest conflict for "${key}" while merging remote "${alias}"`,
          );
        };

        const scopedAssignedValue = upsertClientManifestEntry(
          scopedClientManifestKey,
          nextValue,
          false,
        );
        const rawAssignedValue = upsertClientManifestEntry(
          rawClientManifestKey,
          nextValue,
          false,
        );
        const preferredAssignedValue = isObject(rawAssignedValue)
          ? rawAssignedValue
          : scopedAssignedValue;

        if (
          isObject(preferredAssignedValue) &&
          preferredAssignedValue.id != null
        ) {
          finalClientModuleId = String(preferredAssignedValue.id);
          if (!isNamespacedRemoteIdForAlias(alias, finalClientModuleId)) {
            finalClientIdKind = 'shared';
          }
          if (isObject(nextValue)) {
            nextValue.id = finalClientModuleId;
            if (finalClientIdKind === 'shared') {
              nextValue.chunks = [];
            } else if (entryExpose) {
              installSyntheticRemoteClientModuleFactory(
                finalClientModuleId,
                alias,
                entryExpose,
              );
              nextValue.chunks = [];
              nextValue.async = true;
            }
          }
        }

        if (isObject(nextValue) && rawRemoteClientModuleId) {
          if (
            !Array.isArray(
              clientManifestEntriesByRawId[rawRemoteClientModuleId],
            )
          ) {
            clientManifestEntriesByRawId[rawRemoteClientModuleId] = [];
          }
          clientManifestEntriesByRawId[rawRemoteClientModuleId].push(
            nextValue as ManifestExport,
          );
        }

        if (!rawRemoteClientModuleId) {
          continue;
        }
        const existingResolvedId =
          resolvedClientIdsByRawId[rawRemoteClientModuleId];
        const existingResolvedKind =
          resolvedClientIdKindByRawId[rawRemoteClientModuleId];
        if (existingResolvedId && existingResolvedId !== finalClientModuleId) {
          if (
            getClientModuleResolutionPriority(existingResolvedKind) >=
            getClientModuleResolutionPriority(finalClientIdKind)
          ) {
            finalClientModuleId = existingResolvedId;
            finalClientIdKind = existingResolvedKind || 'remote';
            if (isObject(nextValue)) {
              nextValue.id = finalClientModuleId;
              if (finalClientIdKind === 'shared') {
                nextValue.chunks = [];
              } else if (entryExpose) {
                installSyntheticRemoteClientModuleFactory(
                  finalClientModuleId,
                  alias,
                  entryExpose,
                );
                nextValue.chunks = [];
                nextValue.async = true;
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
            getClientModuleResolutionPriority(existingPrefixedResolvedKind) >=
            getClientModuleResolutionPriority(finalClientIdKind)
          ) {
            finalClientModuleId = existingPrefixedResolvedId;
            finalClientIdKind = existingPrefixedResolvedKind || 'remote';
            if (isObject(nextValue)) {
              nextValue.id = finalClientModuleId;
              if (finalClientIdKind === 'shared') {
                nextValue.chunks = [];
              } else if (entryExpose) {
                installSyntheticRemoteClientModuleFactory(
                  finalClientModuleId,
                  alias,
                  entryExpose,
                );
                nextValue.chunks = [];
                nextValue.async = true;
              }
            }
          }
        }
        resolvedClientIdsByRawId[prefixedRawRemoteClientModuleId] =
          finalClientModuleId;
        resolvedClientIdKindByRawId[prefixedRawRemoteClientModuleId] =
          finalClientIdKind;
        const rawIdEntries =
          clientManifestEntriesByRawId[rawRemoteClientModuleId];
        if (Array.isArray(rawIdEntries)) {
          for (const entryValue of rawIdEntries) {
            entryValue.id = finalClientModuleId;
            if (finalClientIdKind === 'shared') {
              entryValue.chunks = [];
            } else if (entryExpose) {
              installSyntheticRemoteClientModuleFactory(
                finalClientModuleId,
                alias,
                entryExpose,
              );
              entryValue.chunks = [];
              entryValue.async = true;
            }
          }
        }
      }
    }

    if (isObject(remoteManifest.serverConsumerModuleMap)) {
      const remoteServerConsumerModuleMap =
        remoteManifest.serverConsumerModuleMap as Record<string, ManifestNode>;
      const ssrPreloadPromises: Array<Promise<string>> = [];
      for (const [rawModuleId, value] of Object.entries(
        remoteServerConsumerModuleMap,
      )) {
        const normalizedRawModuleId = String(rawModuleId);
        const rscLayerFallbackNode = normalizedRawModuleId.startsWith(
          RSC_LAYER_PREFIX,
        )
          ? remoteServerConsumerModuleMap[
              `${SSR_LAYER_PREFIX}${stripLayerPrefix(normalizedRawModuleId)}`
            ] ||
            remoteServerConsumerModuleMap[
              stripLayerPrefix(normalizedRawModuleId)
            ]
          : undefined;
        const sourceNode = rscLayerFallbackNode || value;
        const inferredExposeHint = inferExposeHintFromConsumerNode(sourceNode);
        const resolvedModuleId =
          resolveClientModuleIdFromMap(resolvedClientIdsByRawId, rawModuleId) ||
          namespaceModuleIdDeterministically(alias, rawModuleId);

        const nextValue = remapConsumerNode(
          sourceNode,
          (rawServerModuleId, exportName) => {
            const exportScopedHint =
              exportName !== '*' && exportName !== '__esModule'
                ? normalizeExpose(exportName)
                : inferredExposeHint;
            const namespacedServerModuleId =
              namespaceServerModuleIdDeterministically(
                alias,
                rawServerModuleId,
              );
            ssrPreloadPromises.push(
              preloadSsrModule(
                alias,
                rawServerModuleId,
                exportScopedHint,
                args,
              ),
            );
            return namespacedServerModuleId;
          },
        );

        const serverConsumerModuleMap =
          hostManifest.serverConsumerModuleMap as Record<string, any>;
        const upsertServerConsumerNode = (
          key: string,
          node: unknown,
          preferIncoming = false,
        ) => {
          if (
            !Object.prototype.hasOwnProperty.call(serverConsumerModuleMap, key)
          ) {
            serverConsumerModuleMap[key] = node;
            return;
          }
          const existingNode = serverConsumerModuleMap[key];
          if (stableStringify(existingNode) === stableStringify(node)) {
            return;
          }
          if (preferIncoming) {
            serverConsumerModuleMap[key] = node;
            return;
          }
          if (!isNamespacedRemoteIdForAlias(alias, key)) {
            return;
          }
          throw new Error(
            `[mf:rsc-bridge] serverConsumerModuleMap conflict for "${key}" while merging remote "${alias}"`,
          );
        };
        const isLayerSpecificRawModuleId =
          rawModuleId.startsWith(SSR_LAYER_PREFIX) ||
          rawModuleId.startsWith(RSC_LAYER_PREFIX);
        const shouldPreferIncomingLayerSpecificNode =
          isLayerSpecificRawModuleId &&
          isNamespacedRemoteIdForAlias(alias, resolvedModuleId);
        upsertServerConsumerNode(
          resolvedModuleId,
          nextValue,
          shouldPreferIncomingLayerSpecificNode,
        );

        const prefixedResolvedModuleId =
          resolvedModuleId.startsWith(SSR_LAYER_PREFIX) ||
          resolvedModuleId.startsWith(RSC_LAYER_PREFIX)
            ? resolvedModuleId
            : `${SSR_LAYER_PREFIX}${resolvedModuleId}`;
        upsertServerConsumerNode(
          prefixedResolvedModuleId,
          nextValue,
          shouldPreferIncomingLayerSpecificNode &&
            isNamespacedRemoteIdForAlias(alias, prefixedResolvedModuleId),
        );
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

      let bridge: BridgeModule | undefined;
      if (isBridgeExposeRequest(args)) {
        bridge = await resolveBridgeFromLoadArgs(args);
        if (!bridge) {
          return;
        }
        bridgePromises[alias] = Promise.resolve(bridge);
      } else {
        bridge = await ensureBridge(alias, args);
      }
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

  seedRemoteClientModuleFactoriesFromRuntimeMapping();

  return {
    name: 'rspack-rsc-bridge-runtime-plugin',
    async afterResolve(args: any) {
      seedRemoteClientModuleFactoriesFromRuntimeMapping();
      const alias = resolveRemoteAlias(args);
      if (!alias) {
        return args;
      }
      if (isBridgeExposeRequest(args)) {
        return args;
      }
      await ensureRemoteAliasMerged(alias, args);
      return args;
    },
    async onLoad(args: any) {
      seedRemoteClientModuleFactoriesFromRuntimeMapping();
      const alias = resolveRemoteAlias(args);
      if (!alias) {
        return args;
      }
      if (isBridgeExposeRequest(args) && aliasMergePromises[alias]) {
        return args;
      }
      await ensureRemoteAliasMerged(alias, args);
      return args;
    },
  };
};

export default rscBridgeRuntimePlugin;
