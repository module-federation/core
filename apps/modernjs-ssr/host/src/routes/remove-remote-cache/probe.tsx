import {
  loadRemote,
  registerRemotes,
  removeRemote,
} from '@module-federation/modern-js-v3/runtime';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { writeHeapSnapshot } from 'node:v8';

declare const __webpack_require__:
  | {
      c?: Record<string, unknown>;
      m?: Record<string, unknown>;
      remotesLoadingData?: {
        remoteKeyToChunkIds?: Record<string, unknown>;
        remoteKeyToRemoteModuleIds?: Record<string, unknown>;
        moduleIdToRemoteDataMapping?: Record<string, { remoteName?: string }>;
      };
      federation?: {
        clearCache?: (options: unknown) => Promise<unknown>;
      };
    }
  | undefined;

export type CacheSnapshot = {
  label: string;
  rssMb: number;
  heapUsedMb: number;
  externalMb: number;
  requireCacheEntries: number;
  remoteRequireCacheEntries: number;
  webpackModuleCacheEntries: number;
  webpackModuleFactoryEntries: number;
  bundlerClearCacheInstalled: boolean;
  bundlerChunkRemoteKeys: string[];
  bundlerModuleRemoteKeys: string[];
  bundlerMappedRemoteNames: string[];
  registeredRemoteEntries: string[];
  globalSnapshotKeys: string[];
  hostSnapshotRemotesInfo: Record<string, string>;
  heavyModuleCacheEntries: Array<{
    id: string;
    payloadItems: number;
  }>;
  federationInstances: number;
  moduleCacheKeys: string[];
  heapSnapshotFile?: string;
};

export type ClearCacheProbeCall = {
  options: unknown;
  result?: 'resolved' | 'rejected';
  value?: unknown;
  error?: string;
  beforeChunkRemoteKeys: string[];
  beforeModuleRemoteKeys: string[];
  beforeMappedRemoteNames: string[];
};

export type HeavyRemoteModule = {
  getHeavyPayloadStats?: () => {
    version: string;
    items: number;
    first: string;
    last: string;
    createdAt: number;
    loadCount: number;
  };
};

export type ProbeResult = {
  action?: string;
  gcAvailable: boolean;
  initialRemoteEntry: string;
  reloadedRemoteEntry: string;
  heavyStats?: ReturnType<
    NonNullable<HeavyRemoteModule['getHeavyPayloadStats']>
  >;
  reloadedHeavyStats?: ReturnType<
    NonNullable<HeavyRemoteModule['getHeavyPayloadStats']>
  >;
  clearCacheCalls: ClearCacheProbeCall[];
  removeRemoteError?: string;
  snapshots: CacheSnapshot[];
};

type ProbeOptions = {
  delayedGcSeconds?: number[];
};

type SnapshotOptions = {
  forceHeapSnapshot?: boolean;
};

const toMb = (value: number) => Math.round((value / 1024 / 1024) * 100) / 100;
let heapSnapshotSequence = 0;

const isHeapSnapshotEnabledFor = (
  label: string,
  { forceHeapSnapshot = false }: SnapshotOptions = {},
) => {
  if (forceHeapSnapshot) {
    return true;
  }

  const raw = process.env.MF_SSR_HEAP_SNAPSHOT;
  if (!raw || raw === '0' || raw.toLowerCase() === 'false') {
    return false;
  }

  const normalized = raw.toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'all') {
    return true;
  }

  return normalized
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(label.toLowerCase());
};

const writeProbeHeapSnapshot = (
  label: string,
  options: SnapshotOptions = {},
) => {
  if (!isHeapSnapshotEnabledFor(label, options)) {
    return undefined;
  }

  const dir = process.env.MF_SSR_HEAP_SNAPSHOT_DIR || '/tmp/mf-ssr-cache-probe';
  mkdirSync(dir, { recursive: true });

  const sequence = String((heapSnapshotSequence += 1)).padStart(2, '0');
  const safeLabel = label.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  const file = join(dir, `${sequence}-${safeLabel}-${Date.now()}.heapsnapshot`);
  writeHeapSnapshot(file);
  return file;
};

const getNodeRequire = () => {
  try {
    return (0, eval)('require') as NodeRequire & {
      cache?: Record<string, unknown>;
    };
  } catch {
    return undefined;
  }
};

const getRequireCacheKeys = () => {
  const nodeRequire = getNodeRequire();
  return nodeRequire?.cache ? Object.keys(nodeRequire.cache) : [];
};

const getWebpackRequire = () => {
  if (typeof __webpack_require__ === 'undefined') {
    return undefined;
  }
  return __webpack_require__;
};

const getFederationInstances = () => {
  const federation = getFederationGlobal();
  return federation?.__INSTANCES__ || [];
};

const getFederationGlobal = () =>
  (
    globalThis as typeof globalThis & {
      __FEDERATION__?: {
        moduleInfo?: Record<
          string,
          {
            remotesInfo?: Record<string, { matchedVersion?: string }>;
            remoteEntry?: string;
            ssrRemoteEntry?: string;
          }
        >;
        __INSTANCES__?: Array<{
          name?: string;
          options?: {
            remotes?: Array<{ name: string; entry?: string }>;
          };
          moduleCache?: Map<string, unknown>;
        }>;
      };
    }
  ).__FEDERATION__;

const getRemoteLoadingDataSummary = () => {
  const remotesLoadingData = getWebpackRequire()?.remotesLoadingData;
  const moduleIdToRemoteDataMapping =
    remotesLoadingData?.moduleIdToRemoteDataMapping || {};

  return {
    chunkRemoteKeys: Object.keys(remotesLoadingData?.remoteKeyToChunkIds || {}),
    moduleRemoteKeys: Object.keys(
      remotesLoadingData?.remoteKeyToRemoteModuleIds || {},
    ),
    mappedRemoteNames: Array.from(
      new Set(
        Object.values(moduleIdToRemoteDataMapping)
          .map((data) => data.remoteName)
          .filter(Boolean),
      ),
    ) as string[],
  };
};

const getHeavyModuleCacheEntries = () => {
  const moduleCache = getWebpackRequire()?.c || {};
  return Object.entries(moduleCache)
    .map(([id, module]) => {
      const exports = (
        module as {
          exports?: {
            heavyPayload?: unknown[];
            getHeavyPayloadStats?: () => { items: number };
          };
        }
      ).exports;
      const heavyPayload = exports?.heavyPayload;
      const payloadItems = Array.isArray(heavyPayload)
        ? heavyPayload.length
        : exports?.getHeavyPayloadStats?.().items;

      if (!payloadItems) {
        return undefined;
      }
      return {
        id,
        payloadItems,
      };
    })
    .filter(Boolean) as CacheSnapshot['heavyModuleCacheEntries'];
};

const forceGc = () => {
  const maybeGc = (
    globalThis as typeof globalThis & {
      gc?: () => void;
    }
  ).gc;
  if (typeof maybeGc !== 'function') {
    return false;
  }
  maybeGc();
  maybeGc();
  return true;
};

const snapshot = (
  label: string,
  options: SnapshotOptions = {},
): CacheSnapshot => {
  const memory = process.memoryUsage();
  const requireCacheKeys = getRequireCacheKeys();
  const webpackRequire = getWebpackRequire();
  const federationInstances = getFederationInstances();
  const remoteLoadingDataSummary = getRemoteLoadingDataSummary();
  const hostInstance = federationInstances.find(
    (instance) => instance.name === 'host',
  );
  const federationGlobal = getFederationGlobal();
  const globalSnapshot = federationGlobal?.moduleInfo || {};
  const hostSnapshot = globalSnapshot.host;
  const hostSnapshotRemotesInfo = Object.fromEntries(
    Object.entries(hostSnapshot?.remotesInfo || {}).map(([key, info]) => [
      key,
      info.matchedVersion || '',
    ]),
  );
  const registeredRemotes = (hostInstance?.options?.remotes || []) as Array<{
    name: string;
    entry?: string;
  }>;

  const cacheSnapshot: CacheSnapshot = {
    label,
    rssMb: toMb(memory.rss),
    heapUsedMb: toMb(memory.heapUsed),
    externalMb: toMb(memory.external),
    requireCacheEntries: requireCacheKeys.length,
    remoteRequireCacheEntries: requireCacheKeys.filter((key) =>
      key.includes('modernjs-ssr/remote'),
    ).length,
    webpackModuleCacheEntries: Object.keys(webpackRequire?.c || {}).length,
    webpackModuleFactoryEntries: Object.keys(webpackRequire?.m || {}).length,
    bundlerClearCacheInstalled: Boolean(webpackRequire?.federation?.clearCache),
    bundlerChunkRemoteKeys: remoteLoadingDataSummary.chunkRemoteKeys,
    bundlerModuleRemoteKeys: remoteLoadingDataSummary.moduleRemoteKeys,
    bundlerMappedRemoteNames: remoteLoadingDataSummary.mappedRemoteNames,
    registeredRemoteEntries: Array.from(
      new Set(
        registeredRemotes
          .filter((remote) => remote.name === 'remote')
          .map((remote) => remote.entry || ''),
      ),
    ),
    globalSnapshotKeys: Object.keys(globalSnapshot),
    hostSnapshotRemotesInfo,
    heavyModuleCacheEntries: getHeavyModuleCacheEntries(),
    federationInstances: federationInstances.length,
    moduleCacheKeys: Array.from(hostInstance?.moduleCache?.keys?.() || []),
  };
  const heapSnapshotFile = writeProbeHeapSnapshot(label, options);
  if (heapSnapshotFile) {
    cacheSnapshot.heapSnapshotFile = heapSnapshotFile;
  }
  return cacheSnapshot;
};

const stringifyError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const wrapClearCacheForProbe = (calls: ClearCacheProbeCall[]) => {
  const webpackRequire = getWebpackRequire();
  const federation = webpackRequire?.federation;
  const originalClearCache = federation?.clearCache;

  if (!federation || typeof originalClearCache !== 'function') {
    return () => {};
  }

  federation.clearCache = async (options: unknown) => {
    const before = getRemoteLoadingDataSummary();
    const call: ClearCacheProbeCall = {
      options,
      beforeChunkRemoteKeys: before.chunkRemoteKeys,
      beforeModuleRemoteKeys: before.moduleRemoteKeys,
      beforeMappedRemoteNames: before.mappedRemoteNames,
    };
    calls.push(call);

    try {
      const value = await originalClearCache(options);
      call.result = 'resolved';
      call.value = value;
      return value;
    } catch (error) {
      call.result = 'rejected';
      call.error = stringifyError(error);
      throw error;
    }
  };

  return () => {
    federation.clearCache = originalClearCache;
  };
};

const loadHeavyStats = async () => {
  const heavyModule = (await loadRemote('remote/Heavy')) as HeavyRemoteModule;
  return heavyModule.getHeavyPayloadStats?.();
};

const remoteV1Entry = 'http://127.0.0.1:3051/static/mf-manifest.json';
const remoteV2Entry = 'http://127.0.0.1:3055/mf-manifest.json';
export const DEFAULT_DELAYED_GC_SECONDS = [10, 20, 30];

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const collectDelayedGcSnapshots = async (delayedGcSeconds: number[]) => {
  const snapshots: CacheSnapshot[] = [];
  let previousSeconds = 0;

  for (const seconds of delayedGcSeconds) {
    await delay((seconds - previousSeconds) * 1000);
    forceGc();
    snapshots.push(snapshot(`after delayed gc ${seconds}s`));
    previousSeconds = seconds;
  }

  return snapshots;
};

const registerRemoteV1 = () => {
  registerRemotes(
    [
      {
        name: 'remote',
        entry: remoteV1Entry,
      },
    ],
    { force: true },
  );
};

const registerRemoteV2 = () => {
  registerRemotes(
    [
      {
        name: 'remote',
        entry: remoteV2Entry,
      },
    ],
    { force: true },
  );
};

export const runLoadRemoteStep = async (): Promise<ProbeResult> => {
  try {
    await removeRemote('remote');
  } catch {
    // This route is the first step and should be repeatable after prior runs.
  }
  registerRemoteV1();

  const heavyStats = await loadHeavyStats();
  const gcAvailable = forceGc();
  const afterLoad = snapshot('load remote', { forceHeapSnapshot: true });

  return {
    action: 'load remote',
    gcAvailable,
    initialRemoteEntry: remoteV1Entry,
    reloadedRemoteEntry: remoteV2Entry,
    heavyStats,
    clearCacheCalls: [],
    snapshots: [afterLoad],
  };
};

export const runRemoveRemoteStep = async (): Promise<ProbeResult> => {
  const clearCacheCalls: ClearCacheProbeCall[] = [];
  const restoreClearCache = wrapClearCacheForProbe(clearCacheCalls);
  try {
    await removeRemote('remote');
  } finally {
    restoreClearCache();
  }

  await new Promise((resolve) => setTimeout(resolve, 0));
  const gcAvailable = forceGc();
  const afterRemove = snapshot('removeRemote', { forceHeapSnapshot: true });

  return {
    action: 'removeRemote',
    gcAvailable,
    initialRemoteEntry: remoteV1Entry,
    reloadedRemoteEntry: remoteV2Entry,
    clearCacheCalls,
    snapshots: [afterRemove],
  };
};

export const runRegisterNewRemoteStep = async (): Promise<ProbeResult> => {
  registerRemoteV2();
  const reloadedHeavyStats = await loadHeavyStats();
  const gcAvailable = forceGc();
  const afterRegister = snapshot('register new remote', {
    forceHeapSnapshot: true,
  });

  return {
    action: 'register new remote',
    gcAvailable,
    initialRemoteEntry: remoteV1Entry,
    reloadedRemoteEntry: remoteV2Entry,
    reloadedHeavyStats,
    clearCacheCalls: [],
    snapshots: [afterRegister],
  };
};

export const runProbe = async ({
  delayedGcSeconds = DEFAULT_DELAYED_GC_SECONDS,
}: ProbeOptions = {}): Promise<ProbeResult> => {
  await removeRemote('remote');
  registerRemoteV1();

  forceGc();
  const beforeLoad = snapshot('before load');
  const heavyStats = await loadHeavyStats();
  const afterLoad = snapshot('after load');

  const clearCacheCalls: ClearCacheProbeCall[] = [];
  const restoreClearCache = wrapClearCacheForProbe(clearCacheCalls);
  let removeRemoteError: string | undefined;
  try {
    await removeRemote('remote');
  } catch (error) {
    removeRemoteError = stringifyError(error);
  } finally {
    restoreClearCache();
  }
  const afterRemove = snapshot('after removeRemote');
  await new Promise((resolve) => setTimeout(resolve, 0));
  const gcAvailable = forceGc();
  const afterGc = snapshot('after gc');
  const delayedGcSnapshots = await collectDelayedGcSnapshots(delayedGcSeconds);
  registerRemoteV2();
  const reloadedHeavyStats = await loadHeavyStats();
  const afterReload = snapshot('after reload');

  return {
    gcAvailable,
    initialRemoteEntry: remoteV1Entry,
    reloadedRemoteEntry: remoteV2Entry,
    heavyStats,
    reloadedHeavyStats,
    clearCacheCalls,
    removeRemoteError,
    snapshots: [
      beforeLoad,
      afterLoad,
      afterRemove,
      afterGc,
      ...delayedGcSnapshots,
      afterReload,
    ],
  };
};
