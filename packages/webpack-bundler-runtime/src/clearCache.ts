import type {
  ClearCacheOptions,
  ClearCacheResult,
  ClearCacheRuntimeOptions,
  IdToExternalAndNameMapping,
  ModuleId,
  RemoteInfos,
  RemotesLoadingData,
  InstallClearCacheOptions,
  WebpackRequire,
} from './types';

type ClearCacheTarget = {
  name: string;
  remoteKey: string;
  remoteInfos: NonNullable<RemoteInfos[string]>;
  remoteNames: string[];
  chunkIds: ModuleId[];
  generations: Array<{ key: string; value: number }>;
  remoteModuleIds: ModuleId[];
  externalModuleIds: ModuleId[];
};

type ChunkCacheControl = {
  clear?: (chunkIds: ModuleId[]) => unknown;
  invalidate?: (chunkIds: ModuleId[]) => unknown;
  wait?: (chunkIds: ModuleId[]) => Promise<unknown>;
  snapshot?: (chunkIds: ModuleId[]) => unknown;
  restore?: (states: unknown) => void;
  getGeneration?: (chunkId: ModuleId) => number;
  restoreGenerations?: (generations: Record<string, number>) => void;
};

type RemoteInfoLike = {
  name?: string;
  alias?: string;
  entry?: string;
  type?: string;
  globalName?: string;
  entryGlobalName?: string;
};

type RuntimeRemote = {
  name: string;
  alias?: string;
  shareScope?: string | string[];
  type?: string;
} & Record<string, any>;

type EntrySnapshot = Array<{
  key: string | number;
  had: boolean;
  value: unknown;
}>;

type ClearCacheState = {
  remoteClearBarriers: Record<
    string,
    { promise: Promise<unknown>; resolve: () => void; count: number }
  >;
  remoteGenerations: Record<string, number>;
  remoteEntryUrlGenerations: Record<string, number>;
  staleRemoteCleanups: Record<string, { run: () => void; pending: number }>;
  installed?: boolean;
};

const clearCacheStates = new WeakMap<WebpackRequire, ClearCacheState>();

const hasOwn = (obj: object, key: string | number) =>
  Object.prototype.hasOwnProperty.call(obj, key);

const getOwn = <T>(
  obj: Record<string | number, T> | undefined | null,
  key: string | number,
): T | undefined => {
  if (!obj || !hasOwn(obj, key)) {
    return undefined;
  }
  return obj[key];
};

const deleteOwn = (obj: object | undefined | null, key: string | number) => {
  if (!obj || obj === Object.prototype || !hasOwn(obj, key)) {
    return;
  }
  Reflect.deleteProperty(obj, key);
};

const toList = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];

const pushUnique = <T>(target: T[], values: Array<T | undefined | null>) => {
  for (const value of values) {
    if (value !== undefined && value !== null && !target.includes(value)) {
      target.push(value);
    }
  }
};

const getState = (webpackRequire: WebpackRequire): ClearCacheState => {
  let state = clearCacheStates.get(webpackRequire);
  if (!state) {
    state = {
      remoteClearBarriers: {},
      remoteGenerations: {},
      remoteEntryUrlGenerations: {},
      staleRemoteCleanups: {},
    };
    clearCacheStates.set(webpackRequire, state);
  }
  return state;
};

const getAffectedConsumerModuleIds = (
  webpackRequire: WebpackRequire,
  remoteModuleIds: ModuleId[],
) => {
  const consumerModuleIds: ModuleId[] = [];
  const queue: ModuleId[] = [];
  const consumerMapping =
    webpackRequire.remotesLoadingData?.remoteModuleIdToConsumerModuleIds ?? {};
  const parentMapping =
    webpackRequire.remotesLoadingData?.consumerModuleIdToParentModuleIds ?? {};

  for (const remoteModuleId of remoteModuleIds) {
    pushUnique(queue, toList(consumerMapping[remoteModuleId]));
  }
  for (let i = 0; i < queue.length; i++) {
    const consumerModuleId = queue[i];
    if (consumerModuleIds.includes(consumerModuleId)) {
      continue;
    }
    consumerModuleIds.push(consumerModuleId);
    pushUnique(queue, toList(parentMapping[consumerModuleId]));
  }
  return consumerModuleIds;
};

const getRemoteGeneration = (
  webpackRequire: WebpackRequire,
  remoteKey: string,
) => getState(webpackRequire).remoteGenerations[remoteKey] ?? 0;

const isNodeEsmRemoteEntry = (remoteInfo: RemoteInfoLike) =>
  remoteInfo?.type === 'esm' || remoteInfo?.type === 'module';

const getRemoteEntryUrlGenerationKey = (remoteInfo: RemoteInfoLike) => {
  if (!isNodeEsmRemoteEntry(remoteInfo) || !remoteInfo.entry) {
    return;
  }
  return `${remoteInfo.name}:${remoteInfo.entry}`;
};

const withRemoteEntryUrlGeneration = (url: string, generation: number) => {
  if (!url || !generation) {
    return url;
  }
  const key = '__rspack_mf_clear_cache';
  try {
    const parsed = new URL(url);
    parsed.searchParams.set(key, String(generation));
    return parsed.href;
  } catch {
    const hashIndex = url.indexOf('#');
    const base = hashIndex === -1 ? url : url.slice(0, hashIndex);
    const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}${key}=${generation}${hash}`;
  }
};

const getRemoteNames = (
  webpackRequire: WebpackRequire,
  name: string,
  remoteKey: string,
) => {
  const remoteNames: string[] = [];
  pushUnique(remoteNames, [name, remoteKey]);
  for (const remoteInfo of toList(
    webpackRequire.federation.bundlerRuntimeOptions.remotes?.remoteInfos?.[
      remoteKey
    ],
  )) {
    pushUnique(remoteNames, [remoteInfo.name, remoteInfo.alias]);
  }
  return remoteNames;
};

const getRemoteEntryGlobalKeys = (remoteInfo: RemoteInfoLike) => {
  const keys: string[] = [];
  pushUnique(keys, [
    remoteInfo.entryGlobalName,
    remoteInfo.globalName,
    remoteInfo.name,
  ]);
  if (remoteInfo.name) {
    pushUnique(keys, [`__FEDERATION_${remoteInfo.name}:custom__`]);
  }
  return keys;
};

const getRemoteEntryLoadingKey = (remoteInfo: RemoteInfoLike) => {
  if (!remoteInfo.name || !remoteInfo.entry) {
    return;
  }
  return `${remoteInfo.name}:${remoteInfo.entry}`;
};

export const getRemoteKeysForChunk = (
  webpackRequire: WebpackRequire,
  chunkId: ModuleId,
) => {
  const remoteKeys: string[] = [];
  const chunkMapping = webpackRequire.remotesLoadingData?.chunkMapping ?? {};
  const moduleIdToRemoteDataMapping =
    webpackRequire.remotesLoadingData?.moduleIdToRemoteDataMapping ?? {};

  for (const remoteModuleId of toList(chunkMapping[chunkId])) {
    const data = getOwn(moduleIdToRemoteDataMapping, remoteModuleId);
    if (data) {
      pushUnique(remoteKeys, [data.remoteName]);
    }
  }
  return remoteKeys;
};

const getRemoteKeysForRequest = (
  webpackRequire: WebpackRequire,
  request: string,
) => {
  const remoteKeys: string[] = [];
  if (typeof request !== 'string') {
    return remoteKeys;
  }
  for (const [remoteKey, remoteInfos] of Object.entries(
    webpackRequire.federation.bundlerRuntimeOptions.remotes?.remoteInfos ?? {},
  )) {
    const candidates: string[] = [];
    pushUnique(candidates, [remoteKey]);
    for (const remoteInfo of toList(remoteInfos)) {
      pushUnique(candidates, [remoteInfo.name, remoteInfo.alias]);
    }
    if (
      candidates.some(
        (candidate) =>
          request === candidate || request.startsWith(`${candidate}/`),
      )
    ) {
      pushUnique(remoteKeys, candidates);
    }
  }
  for (const remote of toList(
    webpackRequire.federation.instance?.options?.remotes,
  )) {
    const candidates: string[] = [];
    pushUnique(candidates, [remote.name, remote.alias]);
    if (
      candidates.some(
        (candidate) =>
          request === candidate || request.startsWith(`${candidate}/`),
      )
    ) {
      pushUnique(remoteKeys, candidates);
    }
  }
  return remoteKeys;
};

export const waitForRemoteClear = (
  webpackRequire: WebpackRequire,
  remoteKeys: string[],
) => {
  const waits: Promise<unknown>[] = [];
  const { remoteClearBarriers } = getState(webpackRequire);
  for (const remoteKey of remoteKeys) {
    const barrier = remoteClearBarriers[remoteKey];
    if (barrier) {
      pushUnique(waits, [barrier.promise]);
    }
  }
  if (waits.length === 0) {
    return;
  }
  return Promise.all(waits);
};

const beginRemoteClear = (
  webpackRequire: WebpackRequire,
  remoteKeys: string[],
) => {
  const releaseKeys: string[] = [];
  const { remoteClearBarriers } = getState(webpackRequire);
  for (const remoteKey of remoteKeys) {
    if (!remoteClearBarriers[remoteKey]) {
      let resolve: () => void = () => {};
      const promise = new Promise<void>((r) => {
        resolve = r;
      });
      remoteClearBarriers[remoteKey] = {
        promise,
        resolve,
        count: 0,
      };
    }
    remoteClearBarriers[remoteKey].count++;
    releaseKeys.push(remoteKey);
  }
  return () => {
    for (const remoteKey of releaseKeys) {
      const barrier = remoteClearBarriers[remoteKey];
      if (!barrier) {
        continue;
      }
      barrier.count--;
      if (barrier.count === 0) {
        delete remoteClearBarriers[remoteKey];
        barrier.resolve();
      }
    }
  };
};

const captureEntries = (
  obj: Record<string | number, unknown>,
  keys: Array<string | number>,
): EntrySnapshot =>
  keys.map((key) => ({
    key,
    had: hasOwn(obj, key),
    value: obj[key],
  }));

const restoreEntries = (
  obj: Record<string | number, unknown>,
  entries: EntrySnapshot,
) => {
  for (const entry of entries) {
    if (entry.had) {
      obj[entry.key] = entry.value;
    } else {
      delete obj[entry.key];
    }
  }
};

const deleteModuleCache = (
  webpackRequire: WebpackRequire,
  moduleIds: ModuleId[],
) => {
  for (const moduleId of moduleIds) {
    delete webpackRequire.c[moduleId];
  }
};

const isBrowserRuntime = () =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

const emptyRemotesLoadingData = {} as RemotesLoadingData;

const getClearTarget = (
  options: ClearCacheRuntimeOptions,
): ClearCacheTarget => {
  const { webpackRequire } = options;
  const name = options.name;
  if (!name) {
    throw new Error('clearCache requires a remote name');
  }

  const remoteKey = options.remoteKey || name;
  const remotesLoadingData =
    webpackRequire.remotesLoadingData ?? emptyRemotesLoadingData;
  const remoteModuleIds: ModuleId[] = [];
  const moduleIdToRemoteDataMapping =
    remotesLoadingData.moduleIdToRemoteDataMapping ?? {};

  pushUnique(
    remoteModuleIds,
    toList(remotesLoadingData.remoteKeyToRemoteModuleIds?.[remoteKey]),
  );
  if (remoteModuleIds.length === 0) {
    for (const [moduleId, data] of Object.entries(
      moduleIdToRemoteDataMapping,
    )) {
      if (data.remoteName === remoteKey || data.remoteName === name) {
        remoteModuleIds.push(moduleId);
      }
    }
  }
  if (remoteModuleIds.length === 0) {
    throw new Error(`Cannot find remote "${name}" in remote loading data`);
  }

  const externalModuleIds: ModuleId[] = [];
  pushUnique(
    externalModuleIds,
    toList(remotesLoadingData.remoteKeyToExternalModuleIds?.[remoteKey]),
  );
  for (const remoteModuleId of remoteModuleIds) {
    const data = getOwn(moduleIdToRemoteDataMapping, remoteModuleId);
    if (data) {
      pushUnique(externalModuleIds, [data.externalModuleId]);
    }
  }

  const remoteNames = getRemoteNames(webpackRequire, name, remoteKey);
  const remoteInfos = toList(
    webpackRequire.federation.bundlerRuntimeOptions.remotes?.remoteInfos?.[
      remoteKey
    ],
  );
  return {
    name,
    remoteKey,
    remoteInfos,
    remoteNames,
    chunkIds: toList(remotesLoadingData.remoteKeyToChunkIds?.[remoteKey]),
    generations: remoteNames.map((remoteName) => ({
      key: remoteName,
      value: getRemoteGeneration(webpackRequire, remoteName),
    })),
    remoteModuleIds,
    externalModuleIds,
  };
};

const createClearSnapshot = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
  consumerModuleIds: ModuleId[],
) => {
  const remoteModuleIds = target.remoteModuleIds;
  const externalModuleIds = target.externalModuleIds;
  const moduleIds = [
    ...remoteModuleIds,
    ...externalModuleIds,
    ...consumerModuleIds,
  ];
  const idToExternalAndNameMapping =
    webpackRequire.federation.bundlerRuntimeOptions.remotes
      ?.idToExternalAndNameMapping ?? {};
  const moduleIdToRemoteDataMapping =
    webpackRequire.remotesLoadingData?.moduleIdToRemoteDataMapping;
  const remoteLoadingPromises = remoteModuleIds.map((remoteModuleId) => {
    const data = getOwn(moduleIdToRemoteDataMapping, remoteModuleId);
    return {
      data,
      had: data ? Object.prototype.hasOwnProperty.call(data, 'p') : false,
      value: data?.p,
    };
  });
  const runtimeLoadingPromises = remoteModuleIds.map((remoteModuleId) => {
    const data = getOwn(idToExternalAndNameMapping, remoteModuleId);
    return {
      data,
      had: data ? Object.prototype.hasOwnProperty.call(data, 'p') : false,
      value: data?.p,
    };
  });
  const instance = webpackRequire.federation.instance;
  const moduleCacheEntries = instance?.moduleCache
    ? target.remoteNames.map((remoteName) => ({
        key: remoteName,
        had: instance.moduleCache.has(remoteName),
        value: instance.moduleCache.get(remoteName),
      }))
    : [];
  const idToRemoteMap = instance?.remoteHandler?.idToRemoteMap;
  const idToRemoteMapEntries = idToRemoteMap
    ? Object.entries(idToRemoteMap).map(([key, value]) => ({
        key,
        value,
      }))
    : [];
  const federationInstances = Array.isArray(
    (globalThis as any).__FEDERATION__?.__INSTANCES__,
  )
    ? (globalThis as any).__FEDERATION__.__INSTANCES__
    : undefined;
  const federationInstanceSnapshot = federationInstances
    ? [...federationInstances]
    : undefined;
  const remoteEntryGlobalKeys: string[] = [];
  const remoteEntryLoadingKeys: string[] = [];
  for (const remoteInfo of target.remoteInfos) {
    pushUnique(remoteEntryGlobalKeys, getRemoteEntryGlobalKeys(remoteInfo));
    pushUnique(remoteEntryLoadingKeys, [getRemoteEntryLoadingKey(remoteInfo)]);
  }
  const state = getState(webpackRequire);
  const remoteEntryUrlGenerationEntries = target.remoteInfos
    .map((remoteInfo) => getRemoteEntryUrlGenerationKey(remoteInfo))
    .filter((key): key is string => Boolean(key))
    .map((key) => ({
      key,
      had: Object.prototype.hasOwnProperty.call(
        state.remoteEntryUrlGenerations,
        key,
      ),
      value: state.remoteEntryUrlGenerations[key],
    }));
  const globalLoading = globalThis.__GLOBAL_LOADING_REMOTE_ENTRY__ ?? {};
  return {
    restore() {
      restoreEntries(webpackRequire.m, this.moduleFactories);
      restoreEntries(webpackRequire.c, this.moduleCache);
      restoreEntries(globalThis as any, this.remoteEntryGlobals);
      restoreEntries(globalLoading, this.remoteEntryLoading);
      for (const entry of remoteLoadingPromises) {
        if (!entry.data) {
          continue;
        }
        if (entry.had) {
          entry.data.p = entry.value as Promise<any> | number;
        } else {
          delete entry.data.p;
        }
      }
      for (const entry of runtimeLoadingPromises) {
        if (!entry.data) {
          continue;
        }
        if (entry.had) {
          entry.data.p = entry.value as Promise<any> | number;
        } else {
          delete entry.data.p;
        }
      }
      if (instance?.moduleCache) {
        for (const entry of moduleCacheEntries) {
          if (entry.had) {
            instance.moduleCache.set(entry.key, entry.value as any);
          } else {
            instance.moduleCache.delete(entry.key);
          }
        }
      }
      if (idToRemoteMap) {
        for (const key of Object.keys(idToRemoteMap)) {
          delete idToRemoteMap[key];
        }
        for (const entry of idToRemoteMapEntries) {
          idToRemoteMap[entry.key] = entry.value;
        }
      }
      if (federationInstances && federationInstanceSnapshot) {
        federationInstances.splice(
          0,
          federationInstances.length,
          ...federationInstanceSnapshot,
        );
      }
      for (const entry of target.generations) {
        state.remoteGenerations[entry.key] = entry.value;
      }
      for (const entry of remoteEntryUrlGenerationEntries) {
        if (entry.had) {
          state.remoteEntryUrlGenerations[entry.key] = entry.value;
        } else {
          delete state.remoteEntryUrlGenerations[entry.key];
        }
      }
    },
    moduleFactories: captureEntries(webpackRequire.m, remoteModuleIds),
    moduleCache: captureEntries(webpackRequire.c, moduleIds),
    remoteEntryGlobals: captureEntries(
      globalThis as any,
      remoteEntryGlobalKeys,
    ),
    remoteEntryLoading: captureEntries(globalLoading, remoteEntryLoadingKeys),
  };
};

const cleanupRemoteEntryInternalCache = (remoteEntryExports: unknown) => {
  const clear = (
    remoteEntryExports as
      | { __webpack_clear_cache__?: () => void }
      | null
      | undefined
  )?.__webpack_clear_cache__;
  if (typeof clear === 'function') {
    clear();
  }
};

const cleanupRemoteEntryCache = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
) => {
  const globalLoading = globalThis.__GLOBAL_LOADING_REMOTE_ENTRY__;
  for (const remoteInfo of target.remoteInfos) {
    const loadingKey = getRemoteEntryLoadingKey(remoteInfo);
    if (loadingKey && globalLoading) {
      delete globalLoading[loadingKey];
    }
    for (const globalKey of getRemoteEntryGlobalKeys(remoteInfo)) {
      if (!Object.prototype.hasOwnProperty.call(globalThis, globalKey)) {
        continue;
      }
      cleanupRemoteEntryInternalCache((globalThis as any)[globalKey]);
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, globalKey);
      if (descriptor?.configurable) {
        delete (globalThis as any)[globalKey];
      } else {
        (globalThis as any)[globalKey] = undefined;
      }
    }
  }
};

const invalidateRemoteEntryUrlGenerations = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
) => {
  const state = getState(webpackRequire);
  for (const remoteInfo of target.remoteInfos) {
    const key = getRemoteEntryUrlGenerationKey(remoteInfo);
    if (!key) {
      continue;
    }
    state.remoteEntryUrlGenerations[key] =
      (state.remoteEntryUrlGenerations[key] ?? 0) + 1;
  }
};

const cleanupRemoteRuntimeCache = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
) => {
  const instance = webpackRequire.federation.instance;
  if (!instance) {
    return;
  }
  for (const remoteName of target.remoteNames) {
    const module = instance.moduleCache?.get(remoteName) as
      | Record<string, unknown>
      | undefined;
    cleanupRemoteEntryInternalCache(module?.remoteEntryExports);
    cleanupRemoteEntryInternalCache(module?.lib);
    instance.moduleCache?.delete(remoteName);
  }
  for (const remoteInfo of target.remoteInfos) {
    for (const globalKey of getRemoteEntryGlobalKeys(remoteInfo)) {
      cleanupRemoteEntryInternalCache((globalThis as any)[globalKey]);
    }
  }
  const idToRemoteMap = instance.remoteHandler?.idToRemoteMap;
  if (idToRemoteMap) {
    for (const [id, remote] of Object.entries(idToRemoteMap)) {
      if (
        target.remoteNames.includes(remote.name) ||
        target.remoteNames.some((remoteName) => id.startsWith(remoteName))
      ) {
        delete idToRemoteMap[id];
      }
    }
  }
  const federationInstances = (globalThis as any).__FEDERATION__?.__INSTANCES__;
  if (Array.isArray(federationInstances)) {
    for (let i = federationInstances.length - 1; i >= 0; i--) {
      const remoteInstance = federationInstances[i];
      const instanceNames = [
        remoteInstance?.name,
        remoteInstance?.options?.name,
        remoteInstance?.options?.id,
      ].filter((name): name is string => typeof name === 'string');
      if (instanceNames.some((name) => target.remoteNames.includes(name))) {
        federationInstances.splice(i, 1);
      }
    }
  }
};

const cleanupSharedCache = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
) => {
  const shareScopeMap = globalThis.__FEDERATION__?.__SHARE__;
  if (!shareScopeMap) {
    return;
  }
  for (const instanceId of Object.keys(shareScopeMap)) {
    const scopes = shareScopeMap[instanceId];
    if (!scopes || typeof scopes !== 'object') {
      continue;
    }
    for (const scopeName of Object.keys(scopes)) {
      const scope = scopes[scopeName];
      if (!scope || typeof scope !== 'object') {
        continue;
      }
      for (const shareName of Object.keys(scope)) {
        const versions = scope[shareName];
        if (!versions || typeof versions !== 'object') {
          continue;
        }
        for (const shareVersion of Object.keys(versions)) {
          const shared = versions[shareVersion];
          if (
            !shared ||
            typeof shared !== 'object' ||
            !target.remoteNames.includes(shared.from)
          ) {
            continue;
          }
          if (shared.loaded || typeof shared.lib === 'function') {
            continue;
          }
          delete versions[shareVersion];
        }
      }
    }
  }
};

const getNodeChunkCacheControls = (webpackRequire: WebpackRequire) => {
  const controls = webpackRequire.chunkCacheControls;
  if (!controls) {
    return [];
  }
  return Object.values(controls) as ChunkCacheControl[];
};

const getClearCacheWaitTimeout = () => {
  const timeout = (globalThis as any).__rspack_clear_cache_wait_timeout__;
  if (typeof timeout === 'number' && timeout >= 0) {
    return timeout;
  }
  return 30000;
};

const waitWithTimeout = (promise: Promise<unknown> | undefined) => {
  if (!promise || typeof promise.then !== 'function') {
    return Promise.resolve(false);
  }
  const timeout = getClearCacheWaitTimeout();
  if (timeout === Infinity) {
    return promise.then(
      () => false,
      () => false,
    );
  }
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(true);
    }, timeout);
    promise.then(
      () => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve(false);
      },
      () => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve(false);
      },
    );
  });
};

const createNodeChunkCacheSnapshot = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
) => {
  const entries: Array<{
    control: ChunkCacheControl;
    states?: unknown;
    generations?: Record<string, number>;
  }> = [];
  if (target.chunkIds.length === 0) {
    return { restore() {} };
  }
  for (const control of getNodeChunkCacheControls(webpackRequire)) {
    const entry: {
      control: ChunkCacheControl;
      states?: unknown;
      generations?: Record<string, number>;
    } = { control };
    if (typeof control?.snapshot === 'function') {
      entry.states = control.snapshot(target.chunkIds);
    }
    if (
      typeof control?.getGeneration === 'function' &&
      typeof control?.restoreGenerations === 'function'
    ) {
      const generations: Record<string, number> = {};
      for (const chunkId of target.chunkIds) {
        generations[String(chunkId)] = control.getGeneration(chunkId);
      }
      entry.generations = generations;
    }
    if (!entry.states && !entry.generations) {
      continue;
    }
    entries.push(entry);
  }
  return {
    restore() {
      for (const entry of entries) {
        if (entry.states && typeof entry.control.restore === 'function') {
          entry.control.restore(entry.states);
        }
        if (
          entry.generations &&
          typeof entry.control.restoreGenerations === 'function'
        ) {
          entry.control.restoreGenerations(entry.generations);
        }
      }
    },
  };
};

const invalidateNodeChunkGenerations = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
) => {
  if (target.chunkIds.length === 0) {
    return;
  }
  for (const control of getNodeChunkCacheControls(webpackRequire)) {
    if (typeof control?.invalidate === 'function') {
      control.invalidate(target.chunkIds);
    }
  }
};

const cleanupNodeChunkCache = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
) => {
  if (target.chunkIds.length === 0) {
    return;
  }
  for (const control of getNodeChunkCacheControls(webpackRequire)) {
    if (typeof control?.clear === 'function') {
      control.clear(target.chunkIds);
    }
  }
};

const cleanupStaleRemoteCache = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
  consumerModuleIds: ModuleId[],
) => {
  const idToExternalAndNameMapping =
    webpackRequire.federation.bundlerRuntimeOptions.remotes
      ?.idToExternalAndNameMapping ?? {};
  const moduleIdToRemoteDataMapping =
    webpackRequire.remotesLoadingData?.moduleIdToRemoteDataMapping;
  cleanupNodeChunkCache(webpackRequire, target);
  for (const remoteModuleId of target.remoteModuleIds) {
    if (
      remoteModuleId === '__proto__' ||
      remoteModuleId === 'constructor' ||
      remoteModuleId === 'prototype'
    ) {
      continue;
    }
    const data = getOwn(moduleIdToRemoteDataMapping, remoteModuleId);
    const runtimeData = getOwn(idToExternalAndNameMapping, remoteModuleId);
    deleteOwn(data, 'p');
    deleteOwn(runtimeData, 'p');
    delete webpackRequire.m[remoteModuleId];
  }
  deleteModuleCache(webpackRequire, target.remoteModuleIds);
  deleteModuleCache(webpackRequire, target.externalModuleIds);
  deleteModuleCache(webpackRequire, consumerModuleIds);
  cleanupRemoteEntryCache(webpackRequire, target);
  cleanupRemoteRuntimeCache(webpackRequire, target);
};

export const runStaleRemoteCleanups = (
  webpackRequire: WebpackRequire,
  remoteKeys: string[],
) => {
  const cleanups: Array<{ run: () => void }> = [];
  const { staleRemoteCleanups } = getState(webpackRequire);
  for (const remoteKey of remoteKeys) {
    const cleanup = staleRemoteCleanups[remoteKey];
    if (cleanup && !cleanups.includes(cleanup)) {
      cleanups.push(cleanup);
    }
  }
  for (const cleanup of cleanups) {
    cleanup.run();
  }
};

const trackStaleRemoteCleanup = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
  consumerModuleIds: ModuleId[],
  pendingRemoteLoads: Promise<unknown>[],
) => {
  if (pendingRemoteLoads.length === 0) {
    return;
  }
  const cleanup = {
    pending: pendingRemoteLoads.length,
    run() {
      cleanupStaleRemoteCache(webpackRequire, target, consumerModuleIds);
    },
  };
  const { staleRemoteCleanups } = getState(webpackRequire);
  for (const remoteName of target.remoteNames) {
    staleRemoteCleanups[remoteName] = cleanup;
  }
  const finish = () => {
    cleanup.run();
    cleanup.pending--;
    if (cleanup.pending > 0) {
      return;
    }
    for (const remoteName of target.remoteNames) {
      if (staleRemoteCleanups[remoteName] === cleanup) {
        delete staleRemoteCleanups[remoteName];
      }
    }
  };
  for (const pendingRemoteLoad of pendingRemoteLoads) {
    pendingRemoteLoad.then(
      () => Promise.resolve().then(finish),
      () => Promise.resolve().then(finish),
    );
  }
};

const restoreRemoteGenerations = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
) => {
  const state = getState(webpackRequire);
  for (const entry of target.generations) {
    state.remoteGenerations[entry.key] = entry.value;
  }
};

const waitForSettledLoadConsumers = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 0));

const clearRemoteTarget = (
  target: ClearCacheTarget,
  webpackRequire: WebpackRequire,
): Promise<ClearCacheResult> => {
  const releaseBarrier = beginRemoteClear(webpackRequire, target.remoteNames);
  const idToExternalAndNameMapping =
    webpackRequire.federation.bundlerRuntimeOptions.remotes
      ?.idToExternalAndNameMapping ?? {};
  const moduleIdToRemoteDataMapping =
    webpackRequire.remotesLoadingData?.moduleIdToRemoteDataMapping;
  const pendingRemoteLoads: Promise<unknown>[] = [];
  for (const remoteModuleId of target.remoteModuleIds) {
    for (const data of [
      getOwn(moduleIdToRemoteDataMapping, remoteModuleId),
      getOwn(idToExternalAndNameMapping, remoteModuleId),
    ]) {
      if (data?.p && typeof data.p === 'object' && 'then' in data.p) {
        pendingRemoteLoads.push(data.p.catch(() => {}));
      }
    }
  }
  const consumerModuleIds = isBrowserRuntime()
    ? []
    : getAffectedConsumerModuleIds(webpackRequire, target.remoteModuleIds);
  const chunkCacheSnapshot = createNodeChunkCacheSnapshot(
    webpackRequire,
    target,
  );
  let snapshot: ReturnType<typeof createClearSnapshot> | undefined;
  let clearSucceeded = false;

  try {
    const state = getState(webpackRequire);
    for (const remoteName of target.remoteNames) {
      state.remoteGenerations[remoteName] =
        getRemoteGeneration(webpackRequire, remoteName) + 1;
    }
    invalidateNodeChunkGenerations(webpackRequire, target);
    snapshot = createClearSnapshot(webpackRequire, target, consumerModuleIds);
    cleanupStaleRemoteCache(webpackRequire, target, consumerModuleIds);
    invalidateRemoteEntryUrlGenerations(webpackRequire, target);
    cleanupSharedCache(webpackRequire, target);
  } catch (error) {
    if (snapshot) {
      snapshot.restore();
    }
    chunkCacheSnapshot.restore();
    restoreRemoteGenerations(webpackRequire, target);
    releaseBarrier();
    return Promise.reject(error);
  }

  return waitWithTimeout(Promise.all(pendingRemoteLoads))
    .then((timedOut) =>
      waitForSettledLoadConsumers().then(() => {
        cleanupStaleRemoteCache(webpackRequire, target, consumerModuleIds);
        return timedOut;
      }),
    )
    .then((timedOut) => {
      if (timedOut) {
        trackStaleRemoteCleanup(
          webpackRequire,
          target,
          consumerModuleIds,
          pendingRemoteLoads,
        );
      }
      clearSucceeded = true;

      return {
        name: target.name,
        cleared: true as const,
      };
    })
    .catch((error) => {
      if (!clearSucceeded) {
        snapshot?.restore();
        chunkCacheSnapshot.restore();
        restoreRemoteGenerations(webpackRequire, target);
      }
      throw error;
    })
    .finally(releaseBarrier);
};

export const clearCache = (
  options: ClearCacheRuntimeOptions,
): Promise<ClearCacheResult> => {
  let target: ClearCacheTarget;
  try {
    target = getClearTarget(options);
  } catch (error) {
    return Promise.reject(error);
  }
  return clearRemoteTarget(target, options.webpackRequire);
};

const normalizeRemote = (remote: RuntimeRemote): RuntimeRemote => ({
  ...remote,
  shareScope: remote.shareScope || 'default',
  type: remote.type || 'global',
});

const captureRemoteRegistrationSnapshot = (instance: any) => {
  const remotes = toList<RuntimeRemote>(instance.options?.remotes).map(
    (remote) => ({
      ...remote,
    }),
  );
  return {
    restore() {
      instance.options.remotes.splice(0, instance.options.remotes.length);
      instance.options.remotes.push(
        ...remotes.map((remote) => ({
          ...remote,
        })),
      );
    },
  };
};

const createBundlerRemoteInfo = (remote: RuntimeRemote) => {
  const shareScope = Array.isArray(remote.shareScope)
    ? remote.shareScope[0]
    : remote.shareScope;

  return {
    ...remote,
    alias: remote.alias || remote.name,
    externalType: 'script',
    shareScope: shareScope || 'default',
  };
};

const captureBundlerRemoteInfoSnapshot = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
) => {
  const remotesOptions =
    webpackRequire.federation.bundlerRuntimeOptions.remotes!;
  const idToRemoteMap = remotesOptions.idToRemoteMap ?? {};
  const remoteInfos = remotesOptions.remoteInfos ?? {};
  const idToRemoteMapEntries = target.remoteModuleIds.map((remoteModuleId) => ({
    key: remoteModuleId,
    had: Object.prototype.hasOwnProperty.call(idToRemoteMap, remoteModuleId),
    value: idToRemoteMap[remoteModuleId],
  }));
  const remoteInfoEntry = {
    key: target.remoteKey,
    had: Object.prototype.hasOwnProperty.call(remoteInfos, target.remoteKey),
    value: remoteInfos[target.remoteKey],
  };
  return {
    restore() {
      restoreEntries(idToRemoteMap as any, idToRemoteMapEntries);
      restoreEntries(remoteInfos as any, [remoteInfoEntry]);
    },
  };
};

const updateBundlerRemoteInfo = (
  webpackRequire: WebpackRequire,
  target: ClearCacheTarget,
  remote: RuntimeRemote,
) => {
  const remotesOptions =
    webpackRequire.federation.bundlerRuntimeOptions.remotes!;
  const remoteInfo = createBundlerRemoteInfo(remote);
  for (const remoteModuleId of target.remoteModuleIds) {
    remotesOptions.idToRemoteMap[remoteModuleId] = [remoteInfo];
  }
  remotesOptions.remoteInfos ||= {};
  remotesOptions.remoteInfos[target.remoteKey] = [remoteInfo];
};

const replaceRemoteRegistration = (instance: any, remote: RuntimeRemote) => {
  const normalizedRemote = normalizeRemote(remote);
  const targetRemotes = instance.options.remotes;
  const hooks = instance.remoteHandler?.hooks?.lifecycle;
  hooks?.beforeRegisterRemote?.emit({
    remote: normalizedRemote,
    origin: instance,
  });
  const index = targetRemotes.findIndex(
    (item: RuntimeRemote) => item.name === normalizedRemote.name,
  );
  if (index === -1) {
    targetRemotes.push(normalizedRemote);
  } else {
    targetRemotes.splice(index, 1, normalizedRemote);
  }
  hooks?.registerRemote?.emit({
    remote: normalizedRemote,
    origin: instance,
  });
  return normalizedRemote;
};

const registerRemotesWithForce = (
  webpackRequire: WebpackRequire,
  instance: any,
  remotes: RuntimeRemote[],
) => {
  const remoteList = toList(remotes);
  const registrationSnapshot = captureRemoteRegistrationSnapshot(instance);
  const bundlerSnapshots: Array<{ restore: () => void }> = [];
  const clearTargets: Array<ClearCacheTarget | undefined> = [];
  try {
    for (const remote of remoteList) {
      let clearTarget: ClearCacheTarget | undefined;
      try {
        clearTarget = getClearTarget({
          name: remote.name,
          webpackRequire,
        });
      } catch {
        clearTarget = undefined;
      }
      const normalizedRemote = replaceRemoteRegistration(instance, remote);
      if (clearTarget) {
        bundlerSnapshots.push(
          captureBundlerRemoteInfoSnapshot(webpackRequire, clearTarget),
        );
        updateBundlerRemoteInfo(webpackRequire, clearTarget, normalizedRemote);
      }
      clearTargets.push(clearTarget);
    }
  } catch (error) {
    for (let i = bundlerSnapshots.length - 1; i >= 0; i--) {
      bundlerSnapshots[i].restore();
    }
    registrationSnapshot.restore();
    return Promise.reject(error);
  }
  return clearTargets
    .reduce(
      (promise, target) =>
        promise.then(() =>
          target ? clearRemoteTarget(target, webpackRequire) : undefined,
        ),
      Promise.resolve<unknown>(undefined),
    )
    .catch((error) => {
      for (let i = bundlerSnapshots.length - 1; i >= 0; i--) {
        bundlerSnapshots[i].restore();
      }
      registrationSnapshot.restore();
      throw error;
    });
};

const markRemoteModuleGeneration = (
  webpackRequire: WebpackRequire,
  remoteName: string,
  module: Record<string, any> | undefined,
) => {
  if (module && typeof module === 'object') {
    module['__rspack_remote_generation__'] = getRemoteGeneration(
      webpackRequire,
      remoteName,
    );
  }
};

export const installClearCache = ({
  webpackRequire,
  instance,
}: InstallClearCacheOptions) => {
  const state = getState(webpackRequire);
  if (state.installed) {
    return;
  }
  const federation = webpackRequire.federation;
  instance ??= federation.instance;
  if (!instance) {
    return;
  }
  state.installed = true;

  federation.clearCache = (options: ClearCacheOptions) =>
    clearCache({ ...options, webpackRequire });

  const moduleCache = instance.moduleCache;
  if (moduleCache && typeof moduleCache.set === 'function') {
    const originalSet = moduleCache.set.bind(moduleCache);
    (moduleCache as any).set = (
      remoteName: string,
      module: Record<string, any>,
    ) => {
      markRemoteModuleGeneration(webpackRequire, remoteName, module);
      return originalSet(remoteName, module as any);
    };
  }

  if (typeof instance.loadRemote === 'function') {
    const originalLoadRemote = instance.loadRemote.bind(instance);
    (instance as any).loadRemote = (
      id: string,
      options?: Record<string, any>,
    ) => {
      const remoteKeys = getRemoteKeysForRequest(webpackRequire, id);
      runStaleRemoteCleanups(webpackRequire, remoteKeys);
      const load = () => originalLoadRemote(id, options as any);
      return (
        waitForRemoteClear(webpackRequire, remoteKeys)?.then(load) ?? load()
      );
    };
  }

  if (typeof instance.registerRemotes === 'function') {
    const originalRegisterRemotes = instance.registerRemotes.bind(instance);
    (instance as any).registerRemotes = (
      remotes: RuntimeRemote[],
      options?: { force?: boolean },
    ) => {
      if (!options?.force) {
        return originalRegisterRemotes(remotes as any, options as any);
      }
      return registerRemotesWithForce(webpackRequire, instance, remotes);
    };
  }

  instance.loaderHook?.lifecycle?.createScript?.on?.(
    ({ url, remoteInfo }: { url: string; remoteInfo?: RemoteInfoLike }) => {
      if (!remoteInfo) {
        return;
      }
      const key = getRemoteEntryUrlGenerationKey(remoteInfo);
      const generation = key ? state.remoteEntryUrlGenerations[key] : undefined;
      if (!generation) {
        return;
      }
      return {
        url: withRemoteEntryUrlGeneration(url, generation),
      };
    },
  );
};

const reportRemoveRemoteClearCacheError = (error: unknown) => {
  if (typeof console === 'undefined' || typeof console.warn !== 'function') {
    return;
  }
  console.warn(
    `clearCache after removeRemote failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
};

export const createClearCacheRuntimePlugin = ({
  webpackRequire,
}: {
  webpackRequire: WebpackRequire;
}) => ({
  name: 'bundler-runtime-clear-cache-plugin',
  removeRemote({ remote }: { remote: RuntimeRemote }) {
    const clear =
      webpackRequire.federation.clearCache ||
      ((options: ClearCacheOptions) =>
        clearCache({ ...options, webpackRequire }));
    return clear({ name: remote.alias || remote.name })
      .then(() => undefined)
      .catch((error) => {
        reportRemoveRemoteClearCacheError(error);
        throw error;
      });
  },
});
