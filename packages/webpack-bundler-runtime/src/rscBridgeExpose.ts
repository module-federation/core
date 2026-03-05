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
  moduleLoading?: Record<string, unknown>;
  entryCssFiles?: Record<string, string[]>;
  entryJsFiles?: Record<string, string[]>;
  clientExposes?: Record<string, string>;
};

type WebpackRequireRuntime = {
  (moduleId: string): unknown;
  initializeExposesData?: {
    moduleMap?: Record<string, () => Promise<() => unknown> | (() => unknown)>;
  };
  initializeSharingData?: {
    scopeToSharingDataMapping?: Record<string, unknown>;
  };
  e?: (chunkId: string | number) => unknown;
  I?: (shareScope: string, initScope?: unknown) => unknown;
  rscM?: ManifestLike;
};

declare const __webpack_require__: WebpackRequireRuntime;

const shouldDebug =
  typeof process !== 'undefined' && Boolean(process.env?.RSC_MF_DEBUG);

const debugLog = (message: string, data?: Record<string, unknown>) => {
  if (!shouldDebug) {
    return;
  }
  if (data) {
    // eslint-disable-next-line no-console
    console.error('[mf:rsc-bridge-expose]', message, data);
    return;
  }
  // eslint-disable-next-line no-console
  console.error('[mf:rsc-bridge-expose]', message);
};

const CLIENT_REFERENCE_SYMBOL = Symbol.for('react.client.reference');
const BRIDGE_EXPOSE_KEY = './__rspack_rsc_bridge__';
const RSC_SSR_EXPOSE_PREFIX = './__rspack_rsc_ssr__/';
const SSR_LAYER_PREFIX = '(server-side-rendering)/';
const RSC_LAYER_PREFIX = '(react-server-components)/';

const actionReferenceCache: Record<string, (...args: unknown[]) => unknown> =
  Object.create(null);
const clientExposeMap: Record<string, string> = Object.create(null);
const ssrModuleCache: Record<string, unknown> = Object.create(null);
const ssrExposeByServerModuleId: Record<string, string> = Object.create(null);
const shareScopeInitPromises: Partial<Record<string, Promise<void>>> =
  Object.create(null);
let scannedExposes = false;
let scannedSsrExposeMap = false;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeExpose = (expose: string) =>
  expose.startsWith('./') ? expose : `./${expose}`;

const getClientReferenceIdentity = (
  value: unknown,
): { key: string; baseKey: string } | undefined => {
  if (!isObject(value) && typeof value !== 'function') {
    return undefined;
  }
  const candidate = value as {
    $$typeof?: unknown;
    $$id?: unknown;
  };
  if (
    candidate.$$typeof !== CLIENT_REFERENCE_SYMBOL ||
    typeof candidate.$$id !== 'string' ||
    !candidate.$$id
  ) {
    return undefined;
  }
  const key = candidate.$$id;
  const hashIndex = key.indexOf('#');
  const baseKey = hashIndex >= 0 ? key.slice(0, hashIndex) : key;
  return { key, baseKey };
};

const cacheActionReference = (value: unknown) => {
  if (typeof value !== 'function') {
    return;
  }
  const id = (value as { $$id?: unknown }).$$id;
  if (typeof id === 'string' && id) {
    actionReferenceCache[id] = value as (...args: unknown[]) => unknown;
  }
};

const cacheClientExpose = (value: unknown, exposeName: string) => {
  const identity = getClientReferenceIdentity(value);
  if (!identity) {
    return;
  }
  const normalizedExpose = normalizeExpose(exposeName);
  if (!Object.prototype.hasOwnProperty.call(clientExposeMap, identity.key)) {
    clientExposeMap[identity.key] = normalizedExpose;
  }
  if (
    !Object.prototype.hasOwnProperty.call(clientExposeMap, identity.baseKey)
  ) {
    clientExposeMap[identity.baseKey] = normalizedExpose;
  }
};

const inspectExportValue = (value: unknown, exposeName: string) => {
  cacheActionReference(value);
  cacheClientExpose(value, exposeName);
  if (!isObject(value)) {
    return;
  }
  for (const nestedValue of Object.values(value)) {
    cacheActionReference(nestedValue);
    cacheClientExpose(nestedValue, exposeName);
  }
};

const toSsrExposeKey = (exposeName: string) => {
  if (!exposeName) {
    return '';
  }
  const normalized = exposeName.startsWith('./')
    ? exposeName.slice(2)
    : exposeName;
  return `${RSC_SSR_EXPOSE_PREFIX}${normalized}`;
};

const stripSsrLayerPrefix = (moduleId: string) =>
  moduleId.startsWith(SSR_LAYER_PREFIX)
    ? moduleId.slice(SSR_LAYER_PREFIX.length)
    : moduleId;

const resolveHiddenSsrExposeFromClientExposeMap = (
  moduleId: string,
  moduleMap?: Record<string, () => Promise<() => unknown> | (() => unknown)>,
) => {
  if (!isObject(moduleMap)) {
    return '';
  }
  const moduleIdCandidates = [moduleId, stripSsrLayerPrefix(moduleId)];
  for (const moduleIdCandidate of moduleIdCandidates) {
    const exposeName = clientExposeMap[moduleIdCandidate];
    if (typeof exposeName !== 'string' || !exposeName) {
      continue;
    }
    const hiddenExpose = toSsrExposeKey(exposeName);
    if (hiddenExpose && typeof moduleMap[hiddenExpose] === 'function') {
      return hiddenExpose;
    }
  }
  return '';
};

const resolveHiddenSsrExposeFromHint = (
  exposeHint: string | undefined,
  moduleMap?: Record<string, () => Promise<() => unknown> | (() => unknown)>,
) => {
  if (!exposeHint || !isObject(moduleMap)) {
    return '';
  }
  const normalizedExpose = normalizeExpose(exposeHint);
  const hiddenExpose = normalizedExpose.startsWith(RSC_SSR_EXPOSE_PREFIX)
    ? normalizedExpose
    : toSsrExposeKey(normalizedExpose);
  if (
    hiddenExpose &&
    typeof hiddenExpose === 'string' &&
    typeof moduleMap[hiddenExpose] === 'function'
  ) {
    return hiddenExpose;
  }
  return '';
};

const resolveClientManifestEntry = (
  clientManifest: Record<string, ManifestExport>,
  clientReferenceId: string,
): ManifestExport | null => {
  if (Object.prototype.hasOwnProperty.call(clientManifest, clientReferenceId)) {
    return clientManifest[clientReferenceId] as ManifestExport;
  }
  const hashIndex = clientReferenceId.lastIndexOf('#');
  if (hashIndex >= 0) {
    const withoutHash = clientReferenceId.slice(0, hashIndex);
    if (Object.prototype.hasOwnProperty.call(clientManifest, withoutHash)) {
      return clientManifest[withoutHash] as ManifestExport;
    }
  }
  return null;
};

const extractChunkIds = (chunks: Array<string | number>) => {
  const chunkIds: Array<string | number> = [];
  const pushChunkId = (chunkId: string | number) => {
    if (!chunkIds.includes(chunkId)) {
      chunkIds.push(chunkId);
    }
  };

  for (let i = 0; i < chunks.length; i += 1) {
    const chunkValue = chunks[i];
    if (typeof chunkValue !== 'string' && typeof chunkValue !== 'number') {
      continue;
    }

    const nextValue = chunks[i + 1];
    if (
      typeof nextValue === 'string' &&
      (nextValue.endsWith('.js') ||
        nextValue.endsWith('.cjs') ||
        nextValue.endsWith('.mjs'))
    ) {
      pushChunkId(chunkValue);
      i += 1;
      continue;
    }

    pushChunkId(chunkValue);
  }

  return chunkIds;
};

const collectServerModuleChunkIds = (
  moduleId: string,
  manifest?: ManifestLike,
) => {
  const serverConsumerModuleMap = isObject(manifest?.serverConsumerModuleMap)
    ? (manifest!.serverConsumerModuleMap as Record<string, ManifestNode>)
    : undefined;
  if (!serverConsumerModuleMap) {
    return [];
  }

  const chunkIds: Array<string | number> = [];
  const pushChunkIds = (nextChunkIds: Array<string | number>) => {
    for (const chunkId of nextChunkIds) {
      if (!chunkIds.includes(chunkId)) {
        chunkIds.push(chunkId);
      }
    }
  };

  for (const node of Object.values(serverConsumerModuleMap)) {
    if (!isObject(node)) {
      continue;
    }
    for (const exportValue of Object.values(node)) {
      if (!isObject(exportValue) || exportValue.id == null) {
        continue;
      }
      if (String(exportValue.id) !== moduleId) {
        continue;
      }
      const chunks = Array.isArray(exportValue.chunks)
        ? (exportValue.chunks as Array<string | number>)
        : [];
      pushChunkIds(extractChunkIds(chunks));
    }
  }

  return chunkIds;
};

const stripLayerPrefix = (moduleId: string) => {
  if (moduleId.startsWith(SSR_LAYER_PREFIX)) {
    return moduleId.slice(SSR_LAYER_PREFIX.length);
  }
  if (moduleId.startsWith(RSC_LAYER_PREFIX)) {
    return moduleId.slice(RSC_LAYER_PREFIX.length);
  }
  return moduleId;
};

const getClientManifestKeysByModuleId = (
  clientManifest: Record<string, ManifestExport>,
  clientModuleId: string,
) =>
  Object.entries(clientManifest)
    .filter(([, value]) => String(value.id) === clientModuleId)
    .map(([key]) => key);

const selectClientReferenceKey = (
  candidateKeys: string[],
  exportName: string,
  exportValue?: ManifestExport,
) => {
  if (candidateKeys.length === 0) {
    return '';
  }
  if (typeof exportValue?.name === 'string' && exportValue.name !== '*') {
    const byManifestName = candidateKeys.find((key) =>
      key.endsWith(`#${exportValue.name}`),
    );
    if (byManifestName) {
      return byManifestName;
    }
  }
  if (exportName !== '*' && exportName !== '__esModule') {
    const byExportName = candidateKeys.find((key) =>
      key.endsWith(`#${exportName}`),
    );
    if (byExportName) {
      return byExportName;
    }
  }
  const withoutHash = candidateKeys.find((key) => !key.includes('#'));
  if (withoutHash) {
    return withoutHash;
  }
  return candidateKeys[0];
};

const createSyntheticClientReference = (
  referenceId: string,
  asyncValue: boolean,
) => {
  const referenceFn = function syntheticClientReference() {
    throw new Error(
      `Attempted to call client reference "${referenceId}" from the server`,
    );
  } as ((...args: unknown[]) => never) & {
    $$typeof?: symbol;
    $$id?: string;
    $$async?: boolean;
  };
  referenceFn.$$typeof = CLIENT_REFERENCE_SYMBOL;
  referenceFn.$$id = referenceId;
  referenceFn.$$async = asyncValue;
  return referenceFn;
};

const buildSyntheticSsrModuleFromManifest = (
  moduleId: string,
  manifest?: ManifestLike,
) => {
  const clientManifest = isObject(manifest?.clientManifest)
    ? (manifest!.clientManifest as Record<string, ManifestExport>)
    : undefined;
  const serverConsumerModuleMap = isObject(manifest?.serverConsumerModuleMap)
    ? (manifest!.serverConsumerModuleMap as Record<string, ManifestNode>)
    : undefined;
  if (!clientManifest || !serverConsumerModuleMap) {
    return null;
  }

  for (const [rawClientModuleId, node] of Object.entries(
    serverConsumerModuleMap,
  )) {
    if (!isObject(node)) {
      continue;
    }
    const normalizedClientModuleId = stripLayerPrefix(rawClientModuleId);
    const clientManifestKeys = getClientManifestKeysByModuleId(
      clientManifest,
      normalizedClientModuleId,
    );
    if (clientManifestKeys.length === 0) {
      continue;
    }

    const syntheticExports: Record<string, unknown> = Object.create(null);
    for (const [exportName, exportValue] of Object.entries(node)) {
      if (!isObject(exportValue) || exportValue.id == null) {
        continue;
      }
      if (String(exportValue.id) !== moduleId) {
        continue;
      }

      const manifestExport = exportValue as ManifestExport;
      const referenceKey = selectClientReferenceKey(
        clientManifestKeys,
        exportName,
        manifestExport,
      );
      if (!referenceKey) {
        continue;
      }
      const syntheticRef = createSyntheticClientReference(
        referenceKey,
        Boolean(manifestExport.async),
      );
      if (exportName === '*') {
        syntheticExports.default = syntheticRef;
        continue;
      }
      if (exportName === '__esModule') {
        continue;
      }
      syntheticExports[exportName] = syntheticRef;
    }

    if (Object.keys(syntheticExports).length > 0) {
      return syntheticExports;
    }
  }

  return null;
};

const preloadServerModuleChunks = async (
  moduleId: string,
  manifest?: ManifestLike,
) => {
  const chunkIds = collectServerModuleChunkIds(moduleId, manifest);
  if (chunkIds.length === 0) {
    return false;
  }
  if (typeof __webpack_require__.e !== 'function') {
    throw new Error(
      `[rsc-bridge-expose] Chunk loader "__webpack_require__.e" is unavailable while preloading server module "${moduleId}"`,
    );
  }
  await Promise.all(
    chunkIds.map((chunkId) => {
      const loadResult = __webpack_require__.e!(chunkId);
      if (
        loadResult &&
        typeof (loadResult as Promise<unknown>).then === 'function'
      ) {
        return loadResult as Promise<unknown>;
      }
      return Promise.resolve(loadResult);
    }),
  );
  return true;
};

const collectClientReferenceIdsFromExports = (
  exportsValue: unknown,
  ids: string[],
) => {
  const maybeRef = exportsValue as { $$id?: unknown } | undefined;
  if (
    typeof exportsValue === 'function' &&
    typeof maybeRef?.$$id === 'string'
  ) {
    ids.push(maybeRef.$$id);
  }
  if (!isObject(exportsValue)) {
    return;
  }
  for (const nestedValue of Object.values(exportsValue)) {
    const maybeNestedRef = nestedValue as { $$id?: unknown } | undefined;
    if (
      typeof nestedValue === 'function' &&
      typeof maybeNestedRef?.$$id === 'string'
    ) {
      ids.push(maybeNestedRef.$$id);
    }
  }
};

const resolveFactoryExports = async (getFactory: () => unknown) => {
  const factory = await Promise.resolve(getFactory());
  if (typeof factory === 'function') {
    return (factory as () => unknown)();
  }
  return factory;
};

const getShareScopesForServerModuleId = (
  moduleId: string,
  manifest?: ManifestLike,
) => {
  const scopes = new Set<string>(['default']);
  const declaredShareScopes =
    __webpack_require__.initializeSharingData?.scopeToSharingDataMapping;
  if (isObject(declaredShareScopes)) {
    for (const shareScope of Object.keys(declaredShareScopes)) {
      if (shareScope) {
        scopes.add(shareScope);
      }
    }
  }
  if (moduleId.startsWith('(server-side-rendering)/')) {
    scopes.add('ssr');
  }
  if (moduleId.startsWith('(react-server-components)/')) {
    scopes.add('rsc');
  }
  const serverConsumerModuleMap = isObject(manifest?.serverConsumerModuleMap)
    ? (manifest!.serverConsumerModuleMap as Record<string, ManifestNode>)
    : undefined;
  if (serverConsumerModuleMap) {
    const unprefixedModuleId = moduleId.startsWith(SSR_LAYER_PREFIX)
      ? moduleId.slice(SSR_LAYER_PREFIX.length)
      : moduleId.startsWith(RSC_LAYER_PREFIX)
        ? moduleId.slice(RSC_LAYER_PREFIX.length)
        : moduleId;

    if (
      Object.prototype.hasOwnProperty.call(
        serverConsumerModuleMap,
        `${SSR_LAYER_PREFIX}${unprefixedModuleId}`,
      )
    ) {
      scopes.add('ssr');
    }
    if (
      Object.prototype.hasOwnProperty.call(
        serverConsumerModuleMap,
        `${RSC_LAYER_PREFIX}${unprefixedModuleId}`,
      )
    ) {
      scopes.add('rsc');
    }
  }
  return Array.from(scopes);
};

const ensureShareScopeInitialized = async (shareScope: string) => {
  if (!shareScope || typeof __webpack_require__.I !== 'function') {
    return;
  }
  const existing = shareScopeInitPromises[shareScope];
  if (existing) {
    await existing;
    return;
  }

  const initPromise = (async () => {
    const initResult = __webpack_require__.I!(shareScope);
    if (
      initResult &&
      typeof (initResult as Promise<unknown>).then === 'function'
    ) {
      await initResult;
    }
  })().catch((error: unknown) => {
    delete shareScopeInitPromises[shareScope];
    throw error;
  });

  shareScopeInitPromises[shareScope] = initPromise;
  await initPromise;
};

const ensureShareScopesForModuleId = async (
  moduleId: string,
  manifest?: ManifestLike,
) => {
  const shareScopes = getShareScopesForServerModuleId(moduleId, manifest);
  await Promise.all(
    shareScopes.map((shareScope) => ensureShareScopeInitialized(shareScope)),
  );
};

const scanExposedModules = async () => {
  if (scannedExposes) {
    return;
  }
  scannedExposes = true;

  const moduleMap = __webpack_require__.initializeExposesData?.moduleMap;
  if (!isObject(moduleMap)) {
    return;
  }

  for (const [exposeName, getFactory] of Object.entries(moduleMap)) {
    if (exposeName === BRIDGE_EXPOSE_KEY || typeof getFactory !== 'function') {
      continue;
    }
    try {
      const exportsValue = await resolveFactoryExports(getFactory);
      inspectExportValue(exportsValue, exposeName);
      if (isObject(exportsValue) && isObject(exportsValue['default'])) {
        inspectExportValue(exportsValue['default'], exposeName);
      }
    } catch {
      // Ignore expose loading errors while scanning bridge metadata.
    }
  }
};

const buildSsrExposeMap = async (force = false) => {
  if (scannedSsrExposeMap && !force) {
    return;
  }
  scannedSsrExposeMap = true;

  const moduleMap = __webpack_require__.initializeExposesData?.moduleMap;
  const manifest = isObject(__webpack_require__.rscM)
    ? (__webpack_require__.rscM as ManifestLike)
    : undefined;
  const clientManifest = isObject(manifest?.clientManifest)
    ? (manifest!.clientManifest as Record<string, ManifestExport>)
    : undefined;
  const serverConsumerModuleMap = isObject(manifest?.serverConsumerModuleMap)
    ? (manifest!.serverConsumerModuleMap as Record<string, ManifestNode>)
    : undefined;

  if (!isObject(moduleMap) || !clientManifest || !serverConsumerModuleMap) {
    return;
  }

  for (const [exposeName, getFactory] of Object.entries(moduleMap)) {
    if (
      exposeName === BRIDGE_EXPOSE_KEY ||
      exposeName.startsWith(RSC_SSR_EXPOSE_PREFIX) ||
      typeof getFactory !== 'function'
    ) {
      continue;
    }
    const hiddenSsrExpose = toSsrExposeKey(exposeName);
    if (
      !hiddenSsrExpose ||
      !Object.prototype.hasOwnProperty.call(moduleMap, hiddenSsrExpose)
    ) {
      continue;
    }

    try {
      const exportsValue = await resolveFactoryExports(getFactory);
      const referenceIds: string[] = [];
      collectClientReferenceIdsFromExports(exportsValue, referenceIds);
      if (isObject(exportsValue) && isObject(exportsValue['default'])) {
        collectClientReferenceIdsFromExports(
          exportsValue['default'],
          referenceIds,
        );
      }
      debugLog('buildSsrExposeMap:refs', {
        exposeName,
        hiddenSsrExpose,
        referenceIds,
      });

      for (const referenceId of referenceIds) {
        const clientEntry = resolveClientManifestEntry(
          clientManifest,
          referenceId,
        );
        if (!clientEntry || clientEntry.id == null) {
          debugLog('buildSsrExposeMap:missingClientEntry', {
            exposeName,
            referenceId,
          });
          continue;
        }
        const consumerNode = serverConsumerModuleMap[String(clientEntry.id)];
        if (!isObject(consumerNode)) {
          debugLog('buildSsrExposeMap:missingConsumerNode', {
            exposeName,
            referenceId,
            clientEntryId: String(clientEntry.id),
          });
          continue;
        }
        const consumerTarget = (consumerNode as ManifestNode)['*'];
        if (!isObject(consumerTarget) || consumerTarget.id == null) {
          debugLog('buildSsrExposeMap:missingConsumerTarget', {
            exposeName,
            referenceId,
            clientEntryId: String(clientEntry.id),
            consumerNodeKeys: Object.keys(consumerNode as ManifestNode),
          });
          continue;
        }
        const serverModuleId = String(consumerTarget.id);
        if (
          !Object.prototype.hasOwnProperty.call(
            ssrExposeByServerModuleId,
            serverModuleId,
          )
        ) {
          ssrExposeByServerModuleId[serverModuleId] = hiddenSsrExpose;
          debugLog('buildSsrExposeMap:set', {
            exposeName,
            serverModuleId,
            hiddenSsrExpose,
          });
        }
      }
    } catch {
      debugLog('buildSsrExposeMap:exposeLoadError', {
        exposeName,
        hiddenSsrExpose,
      });
    }
  }
};

export async function getManifest(): Promise<ManifestLike> {
  await scanExposedModules();
  const manifest = isObject(__webpack_require__.rscM)
    ? (__webpack_require__.rscM as ManifestLike)
    : {};
  return {
    ...manifest,
    clientExposes: {
      ...(manifest.clientExposes || {}),
      ...clientExposeMap,
    },
  };
}

export async function executeAction(actionId: string, args: unknown[]) {
  await scanExposedModules();
  const action = actionReferenceCache[actionId];
  if (typeof action !== 'function') {
    throw new Error(
      `[rsc-bridge-expose] Missing remote action for "${actionId}". Ensure the action is reachable from a federated expose.`,
    );
  }
  return action(...(Array.isArray(args) ? args : []));
}

export async function preloadSSRModule(moduleId: string, exposeHint?: string) {
  const normalizedModuleId = String(moduleId);
  if (
    Object.prototype.hasOwnProperty.call(ssrModuleCache, normalizedModuleId)
  ) {
    return ssrModuleCache[normalizedModuleId];
  }

  await scanExposedModules();
  const manifest = isObject(__webpack_require__.rscM)
    ? (__webpack_require__.rscM as ManifestLike)
    : undefined;
  await ensureShareScopesForModuleId(normalizedModuleId, manifest);
  await buildSsrExposeMap();

  const didPreloadChunksFromManifest = await preloadServerModuleChunks(
    normalizedModuleId,
    manifest,
  );
  if (didPreloadChunksFromManifest) {
    try {
      const required = __webpack_require__(normalizedModuleId);
      const resolvedModuleExports =
        required && typeof (required as Promise<unknown>).then === 'function'
          ? await (required as Promise<unknown>)
          : required;
      ssrModuleCache[normalizedModuleId] = resolvedModuleExports;
      return resolvedModuleExports;
    } catch (error) {
      debugLog('preloadSSRModule:manifestChunkRequireFailed', {
        moduleId: normalizedModuleId,
        error: String(error),
      });
    }
  }

  const shareScopeMap = (__webpack_require__ as unknown as { S?: any }).S;
  const ssrReact = shareScopeMap?.ssr?.react;
  debugLog('preloadSSRModule:shareState', {
    moduleId: normalizedModuleId,
    shareScopeKeys: shareScopeMap ? Object.keys(shareScopeMap) : [],
    ssrReactVersions: isObject(ssrReact) ? Object.keys(ssrReact) : [],
  });

  const moduleMap = __webpack_require__.initializeExposesData?.moduleMap;
  const hiddenExposeFromHint = resolveHiddenSsrExposeFromHint(
    typeof exposeHint === 'string' ? exposeHint : undefined,
    moduleMap,
  );
  let hiddenSsrExpose =
    hiddenExposeFromHint ||
    ssrExposeByServerModuleId[normalizedModuleId] ||
    resolveHiddenSsrExposeFromClientExposeMap(normalizedModuleId, moduleMap);
  if (!hiddenSsrExpose) {
    await ensureShareScopeInitialized('ssr');
    await ensureShareScopeInitialized('rsc');
    await buildSsrExposeMap(true);
    hiddenSsrExpose =
      hiddenExposeFromHint ||
      ssrExposeByServerModuleId[normalizedModuleId] ||
      resolveHiddenSsrExposeFromClientExposeMap(normalizedModuleId, moduleMap);
  }
  debugLog('preloadSSRModule:hiddenExpose', {
    moduleId: normalizedModuleId,
    exposeHint: exposeHint || '',
    hiddenExposeFromHint: hiddenExposeFromHint || '',
    hiddenSsrExpose: hiddenSsrExpose || '',
    hasHiddenExposeFactory:
      isObject(moduleMap) &&
      typeof hiddenSsrExpose === 'string' &&
      typeof moduleMap[hiddenSsrExpose] === 'function',
  });
  if (
    isObject(moduleMap) &&
    typeof hiddenSsrExpose === 'string' &&
    typeof moduleMap[hiddenSsrExpose] === 'function'
  ) {
    // Prime remote chunks through the hidden expose, then read the requested
    // server module id from the runtime graph.
    await resolveFactoryExports(moduleMap[hiddenSsrExpose]!);
    let resolvedModuleExports: unknown;
    try {
      const required = __webpack_require__(normalizedModuleId);
      resolvedModuleExports =
        required && typeof (required as Promise<unknown>).then === 'function'
          ? await (required as Promise<unknown>)
          : required;
    } catch (error) {
      throw new Error(
        `[rsc-bridge-expose] Hidden SSR expose "${hiddenSsrExpose}" loaded but server module "${normalizedModuleId}" is unavailable: ${String(error)}`,
      );
    }
    if (shouldDebug) {
      const exportKeys = isObject(resolvedModuleExports)
        ? Object.keys(resolvedModuleExports as Record<string, unknown>)
        : [];
      const sampleExportValue =
        isObject(resolvedModuleExports) && exportKeys.length > 0
          ? (resolvedModuleExports as Record<string, unknown>)[exportKeys[0]]
          : resolvedModuleExports;
      const sampleClientReferenceType =
        (typeof sampleExportValue === 'function' ||
          isObject(sampleExportValue)) &&
        sampleExportValue != null &&
        '$$typeof' in (sampleExportValue as Record<string, unknown>)
          ? String((sampleExportValue as Record<string, unknown>)['$$typeof'])
          : '';
      const sampleClientReferenceId =
        (typeof sampleExportValue === 'function' ||
          isObject(sampleExportValue)) &&
        sampleExportValue != null &&
        '$$id' in (sampleExportValue as Record<string, unknown>)
          ? String((sampleExportValue as Record<string, unknown>)['$$id'])
          : '';
      debugLog('preloadSSRModule:resolvedExports', {
        moduleId: normalizedModuleId,
        hiddenSsrExpose,
        exportKeys,
        sampleType: typeof sampleExportValue,
        sampleClientReferenceType,
        sampleClientReferenceId,
      });
    }
    ssrModuleCache[normalizedModuleId] = resolvedModuleExports;
    return resolvedModuleExports;
  }

  const syntheticModuleFromManifest = buildSyntheticSsrModuleFromManifest(
    normalizedModuleId,
    manifest,
  );
  if (syntheticModuleFromManifest) {
    ssrModuleCache[normalizedModuleId] = syntheticModuleFromManifest;
    return syntheticModuleFromManifest;
  }

  throw new Error(
    `[rsc-bridge-expose] Missing hidden SSR expose for "${normalizedModuleId}". Bridge mapping failed; no raw module-id fallback is allowed.`,
  );
}

export function getSSRModule(moduleId: string) {
  const normalizedModuleId = String(moduleId);
  if (
    Object.prototype.hasOwnProperty.call(ssrModuleCache, normalizedModuleId)
  ) {
    return ssrModuleCache[normalizedModuleId];
  }
  throw new Error(
    `[rsc-bridge-expose] SSR module "${normalizedModuleId}" was requested before preload.`,
  );
}
