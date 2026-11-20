import type {
  ClearCacheOptions,
  ClearCacheResult,
  ClearCacheRuntimeOptions,
  InstallClearCacheOptions,
  RemoteCachePlan,
  WebpackRequire,
} from './types';

type State = {
  dispose?: () => void;
  evictedChunks?: Set<string>;
  cleaning?: number;
};
type Bindings = { bindings: Set<WebpackRequire> };

const stateKey = Symbol.for('module-federation.clear-cache.state');
const adaptersKey = Symbol.for('module-federation.clear-cache.adapters');
const nodeRuntimeKey = Symbol.for('module-federation.clear-cache.runtime');
const loadTrackerKey = Symbol.for('module-federation.node.load-tracker');
const updatingKey = Symbol.for('module-federation.node.updating');
const containerCacheKey = Symbol.for(
  'module-federation.clear-cache.containers',
);

type ContainerCacheClearer = NonNullable<
  WebpackRequire['federation']['clearContainerCache']
>;
type GetContainer = NonNullable<WebpackRequire['getContainer']>;

const containerCacheClearers = (): WeakMap<
  GetContainer,
  ContainerCacheClearer
> => ((globalThis as any)[containerCacheKey] ||= new WeakMap());

const getBindings = (instance: any): Bindings | undefined =>
  instance?.[adaptersKey];
const getState = (runtime: WebpackRequire): State =>
  ((runtime.federation as any)[stateKey] ||= {});
const unique = <T>(values: Iterable<T>) => [...new Set(values)];
const safeId = (id: string) =>
  id !== '__proto__' && id !== 'constructor' && id !== 'prototype';

function collectNames(runtime: WebpackRequire, key: string): string[] {
  const remoteInfos =
    runtime.federation.bundlerRuntimeOptions.remotes?.remoteInfos;
  const remotes = runtime.federation.instance?.options.remotes || [];
  return unique(
    [
      key,
      ...(remoteInfos?.[key] || []).flatMap((info) => [info.name, info.alias]),
      ...remotes
        .filter((remote) => remote.name === key || remote.alias === key)
        .flatMap((remote) => [remote.name, remote.alias]),
    ].filter((name): name is string => Boolean(name)),
  );
}

function targetFor(runtime: WebpackRequire, name: string, key = name) {
  if (!name) throw new Error('clearCache requires a remote name');
  const remoteInfos =
    runtime.federation.bundlerRuntimeOptions.remotes?.remoteInfos || {};
  const keys = unique([
    ...Object.keys(remoteInfos),
    ...(runtime.federation.instance?.options.remotes || []).map((r) => r.name),
  ]);
  const names = unique([
    ...collectNames(runtime, key),
    ...keys.flatMap((k) => {
      const group = collectNames(runtime, k);
      return group.some((n) => name === n || name.startsWith(`${n}/`))
        ? group
        : [];
    }),
    name,
  ]);
  const options = runtime.federation.bundlerRuntimeOptions.remotes;
  const loading = runtime.remotesLoadingData;
  const remoteIds = new Set<string>();
  for (const [id, infos] of Object.entries(options?.idToRemoteMap || {}))
    if (infos.some((info) => names.includes(info.name))) remoteIds.add(id);
  for (const [id, data] of Object.entries(
    loading?.moduleIdToRemoteDataMapping || {},
  ))
    if (names.includes(data.remoteName)) remoteIds.add(id);
  return { key, remoteIds: [...remoteIds] };
}

/** The same read-only graph plan drives framework selection and cache eviction. */
export function planRemoteCache({
  webpackRequire: runtime,
  name,
  remoteKey,
}: ClearCacheRuntimeOptions): RemoteCachePlan | undefined {
  const loading = runtime.remotesLoadingData;
  const cache = loading?.cache;
  const remoteData = loading?.moduleIdToRemoteDataMapping;
  if (
    !cache?.modules ||
    !cache.factories ||
    !cache.moduleIdToParentModuleIds ||
    !remoteData
  )
    return;
  const target = targetFor(runtime, name, remoteKey);
  const remoteModuleIds = target.remoteIds.filter(
    (id) => safeId(id) && Object.hasOwn(remoteData, id),
  );
  if (remoteModuleIds.length !== target.remoteIds.length) return;
  const externalModuleIds = unique(
    remoteModuleIds
      .map((id) => remoteData[id]?.externalModuleId)
      .filter((id) => id !== undefined)
      .map(String),
  ).filter(safeId);
  const queue = remoteModuleIds.flatMap((id) =>
    (cache.moduleIdToParentModuleIds[id] || []).map(String),
  );
  const consumers = new Set<string>();
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    if (!safeId(id) || consumers.has(id)) continue;
    consumers.add(id);
    queue.push(...(cache.moduleIdToParentModuleIds[id] || []).map(String));
  }
  return {
    remoteModuleIds,
    externalModuleIds,
    consumerModuleIds: [...consumers],
  };
}

/** Re-run remote factory installation for startup/initial chunks whose factories were evicted. */
export function ensureRemoteChunks(
  runtime: WebpackRequire,
  chunkIds?: Array<string | number>,
): Promise<void> | undefined {
  const remotesHandler = runtime.f?.remotes;
  const loading = runtime.remotesLoadingData;
  if (typeof remotesHandler !== 'function' || !loading?.chunkMapping) return;
  const factories = loading.cache?.factories || runtime.m;
  const state = getState(runtime);
  const candidates = chunkIds
    ? chunkIds.map(String)
    : [...(state.evictedChunks || [])];
  if (!candidates.length) return;
  const promises: unknown[] = [];
  for (const chunkId of unique(candidates)) {
    const ids = loading.chunkMapping[chunkId];
    if (ids?.some((id) => !factories?.[String(id)]))
      remotesHandler(chunkId, promises);
    state.evictedChunks?.delete(chunkId);
  }
  return promises.length
    ? Promise.all(promises).then(() => undefined)
    : undefined;
}

function installContainerCache(runtime: WebpackRequire) {
  const get = runtime.getContainer;
  if (!get) return;
  const clear = (preserveShared: boolean) => {
    if (preserveShared) return false;
    const modules = runtime.remotesLoadingData?.cache?.modules || runtime.c;
    if (modules) for (const id of Object.keys(modules)) delete modules[id];
    void runtime.federation.clearNodeChunks?.({ remoteOnly: false });
    return Boolean(modules);
  };
  runtime.federation.clearContainerCache = clear;
  containerCacheClearers().set(get, clear);
}

export function clearContainerCache(
  value: unknown,
  preserveShared = false,
): void {
  const get = (value as { get?: GetContainer } | undefined)?.get;
  if (get) containerCacheClearers().get(get)?.(preserveShared);
}

async function withDrainTimeout(drain: () => Promise<unknown>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      drain(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                'MF remote loads did not drain before cache invalidation',
              ),
            ),
          30_000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export async function clearCache(
  options: ClearCacheRuntimeOptions,
): Promise<ClearCacheResult> {
  const runtime = options.webpackRequire;
  const plan = planRemoteCache(options);
  if (
    !plan &&
    targetFor(runtime, options.name, options.remoteKey).remoteIds.length
  )
    throw new Error(
      'SSR remote invalidation requires a compiled dependency graph and module tables',
    );
  if (!plan?.remoteModuleIds.length)
    return { name: options.name, cleared: true };
  const loading = runtime.remotesLoadingData!;
  const records = plan.remoteModuleIds.flatMap((id) => [
    runtime.federation.bundlerRuntimeOptions.remotes
      ?.idToExternalAndNameMapping[id],
    loading.moduleIdToRemoteDataMapping?.[id],
  ]);
  const pending = records.filter(
    (r) => r?.p && typeof r.p === 'object' && 'then' in r.p,
  );
  if (pending.length)
    await withDrainTimeout(() =>
      Promise.allSettled(pending.map((r) => r!.p as Promise<unknown>)),
    );
  if (runtime.federation.clearNodeChunks)
    await withDrainTimeout(() =>
      runtime.federation.clearNodeChunks!({ remoteOnly: true }),
    );

  const { factories, modules } = loading.cache!;
  const chunkMapping = loading.chunkMapping || {};
  const evictedIds = new Set(
    plan.remoteModuleIds.filter((id) => Boolean(factories[id])),
  );
  if (evictedIds.size) {
    const evictedChunks = (getState(runtime).evictedChunks ||= new Set());
    for (const [chunkId, ids] of Object.entries(chunkMapping))
      if (ids.some((id) => evictedIds.has(String(id))))
        evictedChunks.add(chunkId);
  }
  for (const record of records) if (record) delete record.p;
  for (const id of plan.remoteModuleIds) {
    delete factories[id];
    delete modules[id];
  }
  for (const id of plan.externalModuleIds) delete modules[id];
  for (const id of plan.consumerModuleIds) delete modules[id];
  return { name: options.name, cleared: true };
}

/** Attach after runtime initialization. Disposing the handle releases its binding. */
export function installClearCache({
  webpackRequire,
  instance = webpackRequire.federation.instance,
}: InstallClearCacheOptions) {
  if (!instance) return;
  const state = getState(webpackRequire);
  if (state.dispose) {
    if (
      ![...(getBindings(instance)?.bindings || [])].some(
        (binding) => getState(binding) === state,
      )
    )
      throw new Error(
        'Cache adapter is already attached to another MF instance',
      );
    return state.dispose;
  }
  let runtime: WebpackRequire | undefined = webpackRequire;
  let holder = getBindings(instance);
  if (!holder) {
    holder = { bindings: new Set<WebpackRequire>() };
    Object.defineProperty(instance, adaptersKey, {
      value: holder,
      configurable: true,
    });
  }
  holder.bindings.add(runtime);
  const prevStartup = runtime.mfAsyncStartup;
  if (typeof prevStartup === 'function') {
    runtime.mfAsyncStartup = () => {
      const base = prevStartup.call(runtime);
      if (!runtime) return base;
      const recheck = () => ensureRemoteChunks(runtime!);
      return base && typeof (base as PromiseLike<unknown>).then === 'function'
        ? (base as Promise<unknown>).then(recheck)
        : (recheck() ?? base);
    };
  }
  runtime.federation.clearCache = async (options: ClearCacheOptions) => {
    if (!runtime) throw new Error('Cache adapter is detached');
    state.cleaning = (state.cleaning || 0) + 1;
    try {
      return await clearCache({ ...options, webpackRequire: runtime });
    } finally {
      state.cleaning!--;
    }
  };
  runtime.federation.ensureRemoteChunks = (chunkIds) =>
    runtime ? ensureRemoteChunks(runtime, chunkIds) : undefined;
  runtime.federation.trackLoad = <T>(run: () => Promise<T>) => {
    const tracker = (runtime?.federation.instance as any)?.[loadTrackerKey];
    return typeof tracker === 'function' ? tracker(run) : run();
  };
  const dispose = () => {
    if (!runtime) return;
    if (state.cleaning || (instance as any)?.[updatingKey]?.())
      throw new Error(
        'Cannot detach cache adapter while cache cleanup is pending',
      );
    if (prevStartup) runtime.mfAsyncStartup = prevStartup;
    delete runtime.federation.clearCache;
    delete runtime.federation.ensureRemoteChunks;
    delete runtime.federation.trackLoad;
    delete runtime.federation.disposeClearCache;
    holder!.bindings.delete(runtime);
    if (!holder!.bindings.size && (instance as any)[adaptersKey] === holder)
      delete (instance as any)[adaptersKey];
    runtime = undefined;
    state.dispose = undefined;
    state.evictedChunks?.clear();
  };
  runtime.federation.disposeClearCache = state.dispose = dispose;
  return dispose;
}

export async function clearBoundCaches(
  origin: object,
  name: string,
): Promise<void> {
  const bindings = getBindings(origin)?.bindings;
  if (!bindings?.size) return;
  const results = await Promise.allSettled(
    [...bindings].map((binding) => binding.federation.clearCache!({ name })),
  );
  const failure = results.find((result) => result.status === 'rejected');
  if (failure?.status === 'rejected') throw failure.reason;
}

export const createClearCacheRuntimePlugin = ({
  handleRemoveRemote = true,
}: { handleRemoveRemote?: boolean } = {}) => ({
  name: 'bundler-runtime-clear-cache-plugin',
  dispose({ origin }: { origin: object }) {
    for (const binding of [...(getBindings(origin)?.bindings || [])]) {
      binding.federation.disposeClearCache?.();
      if (binding.federation.instance === origin)
        binding.federation.instance = undefined;
    }
  },
  registerRemote({
    remote,
    origin,
  }: {
    remote: { name: string; alias?: string; shareScope?: string | string[] };
    origin: object;
  }) {
    for (const binding of getBindings(origin)?.bindings || []) {
      const options = binding.federation.bundlerRuntimeOptions.remotes;
      if (!options) continue;
      const target = targetFor(
        binding,
        remote.name,
        remote.alias || remote.name,
      );
      const info = {
        ...remote,
        alias: remote.alias || remote.name,
        externalType: 'script',
        shareScope:
          (Array.isArray(remote.shareScope)
            ? remote.shareScope[0]
            : remote.shareScope) || 'default',
      };
      for (const id of target.remoteIds) options.idToRemoteMap[id] = [info];
      (options.remoteInfos ||= {})[target.key] = [info];
    }
  },
  ...(handleRemoveRemote
    ? {
        removeRemote({
          remote,
          origin,
        }: {
          remote: { name: string; alias?: string };
          origin: object;
        }) {
          const bindings = getBindings(origin)?.bindings;
          if (!bindings?.size) return;
          return clearBoundCaches(origin, remote.alias || remote.name);
        },
      }
    : {}),
});

/** Opt in from a Node runtime plugin before bundler init runs. */
export function installNodeCacheRuntime(runtime: WebpackRequire): void {
  const original = runtime.federation.bundlerRuntime;
  if (!original) {
    Object.defineProperty(runtime.federation, 'bundlerRuntime', {
      configurable: true,
      enumerable: true,
      set(value) {
        Object.defineProperty(runtime.federation, 'bundlerRuntime', {
          configurable: true,
          enumerable: true,
          writable: true,
          value,
        });
        installNodeCacheRuntime(runtime);
      },
    });
    return;
  }
  if ((original as any)[nodeRuntimeKey]) return;
  const wrapped: typeof original = {
    ...original,
    init(options) {
      runtime.federation.disposeClearCache?.();
      const instance = original.init(options);
      installContainerCache(runtime);
      installClearCache({ webpackRequire: runtime, instance });
      return instance;
    },
    remotes(options) {
      const tracker = (runtime.federation.instance as any)?.[loadTrackerKey];
      if (
        typeof tracker !== 'function' ||
        !options.chunkMapping[options.chunkId]?.length
      ) {
        original.remotes(options);
        return;
      }
      options.promises.push(
        tracker(async () => {
          const promises: Promise<unknown>[] = [];
          original.remotes({ ...options, promises });
          const settled = await Promise.allSettled(promises);
          const failure = settled.find((r) => r.status === 'rejected');
          if (failure?.status === 'rejected') throw failure.reason;
        }),
      );
    },
  };
  (wrapped as any)[nodeRuntimeKey] = true;
  runtime.federation.bundlerRuntime = wrapped;
}
