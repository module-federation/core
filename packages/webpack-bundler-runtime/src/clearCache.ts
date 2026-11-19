import { AsyncLocalStorage } from 'node:async_hooks';
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
};
type Activity = { kind: 'load' | 'update'; active: boolean };
type Adapters = {
  bindings: Set<WebpackRequire>;
  restore(): void;
  load<T>(run: () => Promise<T>): Promise<T>;
  update<T>(run: () => Promise<T>): Promise<T>;
  updating(): boolean;
};
const stateKey = Symbol.for('module-federation.clear-cache.state');
const adaptersKey = Symbol.for('module-federation.clear-cache.adapters');
const nodeRuntimeKey = Symbol.for('module-federation.clear-cache.runtime');
const containerCacheKey = Symbol.for(
  'module-federation.clear-cache.containers',
);
type ContainerCacheClearer = NonNullable<
  WebpackRequire['federation']['clearContainerCache']
>;
type GetContainer = NonNullable<WebpackRequire['getContainer']>;
function containerCacheClearers(): WeakMap<
  GetContainer,
  ContainerCacheClearer
> {
  return ((globalThis as any)[containerCacheKey] ||= new WeakMap());
}
const getAdapters = (instance: any): Adapters | undefined =>
  instance?.[adaptersKey];
const unique = <T>(values: T[]) => [...new Set(values)];
const getState = (runtime: WebpackRequire): State => {
  return ((runtime.federation as any)[stateKey] ||= {});
};

const remoteNames = (runtime: WebpackRequire, key: string) =>
  unique(
    [
      key,
      ...(
        runtime.federation.bundlerRuntimeOptions.remotes?.remoteInfos?.[key] ||
        []
      ).flatMap((info) => [info.name, info.alias]),
      ...(runtime.federation.instance?.options.remotes || [])
        .filter((remote) => remote.name === key || remote.alias === key)
        .flatMap((remote) => [remote.name, remote.alias]),
    ].filter((name): name is string => Boolean(name)),
  );

const requestKeys = (runtime: WebpackRequire, request: string) => {
  const keys = unique([
    ...Object.keys(
      runtime.federation.bundlerRuntimeOptions.remotes?.remoteInfos || {},
    ),
    ...(runtime.federation.instance?.options.remotes || []).map(
      (remote) => remote.name,
    ),
  ]);
  return unique(
    keys.flatMap((key) => {
      const names = remoteNames(runtime, key);
      return names.some(
        (name) => request === name || request.startsWith(`${name}/`),
      )
        ? names
        : [];
    }),
  );
};

const targetFor = (runtime: WebpackRequire, name: string, key = name) => {
  if (!name) throw new Error('clearCache requires a remote name');
  const names = unique([
    ...remoteNames(runtime, key),
    ...requestKeys(runtime, name),
    name,
  ]);
  const options = runtime.federation.bundlerRuntimeOptions.remotes;
  const loading =
    runtime.federation.remotesLoadingData || runtime.remotesLoadingData;
  const remoteIds = new Set<string>(
    names
      .flatMap(
        (remote) =>
          runtime.federation.remotesLoadingData?.cache
            ?.remoteKeyToRemoteModuleIds?.[remote] || [],
      )
      .map(String),
  );
  for (const [id, infos] of Object.entries(options?.idToRemoteMap || {}))
    if (infos.some((info) => names.includes(info.name))) remoteIds.add(id);
  for (const [id, data] of Object.entries(
    loading?.moduleIdToRemoteDataMapping || {},
  ))
    if (names.includes(data.remoteName)) remoteIds.add(id);
  return { key, remoteIds: [...remoteIds] };
};

const safeId = (id: string) =>
  id !== '__proto__' && id !== 'constructor' && id !== 'prototype';

/** The same read-only graph plan drives framework selection and cache eviction. */
export function planRemoteCache({
  webpackRequire: runtime,
  name,
  remoteKey,
}: ClearCacheRuntimeOptions): RemoteCachePlan | undefined {
  const loading = runtime.federation.remotesLoadingData;
  const cache = loading?.cache;
  if (
    !cache?.modules ||
    !cache.factories ||
    !cache.remoteKeyToRemoteModuleIds ||
    !cache.remoteModuleIdToConsumerModuleIds ||
    !cache.consumerModuleIdToParentModuleIds
  )
    return;
  const target = targetFor(runtime, name, remoteKey);
  const remoteModuleIds = target.remoteIds.filter(
    (id) =>
      safeId(id) && Object.hasOwn(cache.remoteModuleIdToConsumerModuleIds, id),
  );
  if (remoteModuleIds.length !== target.remoteIds.length) return;
  const externalModuleIds = unique(
    remoteModuleIds
      .map((id) => loading!.moduleIdToRemoteDataMapping?.[id]?.externalModuleId)
      .filter((id) => id !== undefined)
      .map(String),
  ).filter(safeId);
  const queue = remoteModuleIds.flatMap((id) =>
    cache.remoteModuleIdToConsumerModuleIds[id].map(String),
  );
  const consumers = new Set<string>();
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    if (!safeId(id) || consumers.has(id)) continue;
    consumers.add(id);
    queue.push(
      ...(cache.consumerModuleIdToParentModuleIds[id] || []).map(String),
    );
  }
  return {
    remoteModuleIds,
    externalModuleIds,
    consumerModuleIds: [...consumers],
  };
}

// An MF instance can be shared by multiple physical container runtimes.
// Match the same getter function exported by the loaded container.
function installContainerCache(runtime: WebpackRequire) {
  const get = runtime.getContainer;
  if (!get) return;
  const clear = (preserveShared: boolean) => {
    const cache = runtime.federation.containerCache;
    if (!cache) return false;
    const { retainedModuleIds, modules } = cache;
    const retain = preserveShared
      ? new Set(retainedModuleIds.map(String))
      : undefined;
    for (const id of Object.keys(modules)) {
      if (!retain?.has(id)) delete modules[id];
    }
    return true;
  };
  runtime.federation.clearContainerCache = clear;
  containerCacheClearers().set(get, clear);
}

export function clearContainerCache(
  value: unknown,
  preserveShared = false,
): void {
  const entry = value as
    | {
        get?: GetContainer;
        __webpack_clear_cache__?: () => void;
        __webpack_clear_exposed_cache__?: () => void;
      }
    | undefined;
  const clear = entry?.get && containerCacheClearers().get(entry.get);
  if (clear?.(preserveShared)) return;
  if (preserveShared) entry?.__webpack_clear_exposed_cache__?.();
  else entry?.__webpack_clear_cache__?.();
}

async function drainLoads(drain: () => Promise<unknown>) {
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
  const clear = async (): Promise<ClearCacheResult> => {
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
    const loading = runtime.federation.remotesLoadingData!;
    const records = plan.remoteModuleIds.flatMap((id) => [
      runtime.federation.bundlerRuntimeOptions.remotes
        ?.idToExternalAndNameMapping[id],
      loading.moduleIdToRemoteDataMapping?.[id],
    ]);
    const pending = records.flatMap((record) =>
      record?.p && typeof record.p === 'object' && 'then' in record.p
        ? [record.p]
        : [],
    );
    if (pending.length) await drainLoads(() => Promise.allSettled(pending));

    const { factories, modules } = loading.cache!;
    for (const record of records) if (record) delete record.p;
    for (const id of plan.remoteModuleIds) {
      delete factories[id];
      delete modules[id];
    }
    for (const id of plan.externalModuleIds) delete modules[id];
    for (const id of plan.consumerModuleIds) delete modules[id];
    return { name: options.name, cleared: true };
  };
  const adapters = getAdapters(runtime.federation.instance);
  return adapters ? adapters.update(clear) : clear();
}

const wrapMethod = (
  target: any,
  key: string,
  wrapper: (original: any) => any,
) => {
  const descriptor = Object.getOwnPropertyDescriptor(target, key);
  const wrapped = wrapper(target[key]);
  target[key] = wrapped;
  return () => {
    if (target[key] !== wrapped) return;
    if (descriptor) Object.defineProperty(target, key, descriptor);
    else delete target[key];
  };
};

const createAdapters = (instance: any): Adapters => {
  const bindings = new Set<WebpackRequire>();
  const contexts = new AsyncLocalStorage<Activity>();
  const pending = new Set<Promise<unknown>>();
  let queue = Promise.resolve();
  let updates = 0;

  const track = <T>(kind: Activity['kind'], run: () => Promise<T>) => {
    const context: Activity = { kind, active: true };
    const result = contexts.run(context, async () => run());
    const finish = () => {
      context.active = false;
      pending.delete(result);
    };
    if (kind === 'load') pending.add(result);
    void result.then(finish, finish);
    return result;
  };

  const adapters: Adapters = {
    bindings,
    load(run) {
      if (updates && !contexts.getStore()?.active)
        return queue.then(() => {
          if (!bindings.size)
            throw new Error(
              'Cache adapter detached while waiting to load a remote',
            );
          return adapters.load(run);
        });
      return track('load', run);
    },
    update(run) {
      const context = contexts.getStore();
      if (context?.active) {
        return context.kind === 'update'
          ? run()
          : Promise.reject(
              new Error('Cannot replace a remote from its in-flight load'),
            );
      }
      updates++;
      const result = queue.then(async () => {
        if (pending.size)
          await drainLoads(async () => {
            while (pending.size) await Promise.allSettled([...pending]);
          });
        return track('update', run);
      });
      const finish = () => {
        updates--;
      };
      queue = result.then(finish, finish);
      return result;
    },
    updating: () => updates > 0,
    restore() {
      for (const restore of restores.reverse()) restore();
      if (instance[adaptersKey] === adapters) delete instance[adaptersKey];
    },
  };
  const restores = [
    ...(['loadRemote', 'preloadRemote'] as const).map(
      (key) => [key, adapters.load] as const,
    ),
    ...(['updateRemotes', 'removeRemote'] as const).map(
      (key) => [key, adapters.update] as const,
    ),
  ].flatMap(([key, run]) =>
    typeof instance[key] === 'function'
      ? [
          wrapMethod(
            instance,
            key,
            (original) =>
              function (this: any, ...args: unknown[]) {
                if (!bindings.size) return original.apply(this, args);
                return run(() => original.apply(this, args));
              },
          ),
        ]
      : [],
  );
  Object.defineProperty(instance, adaptersKey, {
    value: adapters,
    configurable: true,
  });
  return adapters;
};

/** Attach after runtime initialization. Disposing the handle releases its binding. */
export function installClearCache({
  webpackRequire,
  instance = webpackRequire.federation.instance,
}: InstallClearCacheOptions) {
  if (!instance) return;
  const state = getState(webpackRequire);
  if (state.dispose) {
    if (
      ![...(getAdapters(instance)?.bindings || [])].some(
        (binding) => getState(binding) === state,
      )
    )
      throw new Error(
        'Cache adapter is already attached to another MF instance',
      );
    return state.dispose;
  }
  let runtime: WebpackRequire | undefined = webpackRequire;
  let adapters: Adapters | undefined =
    getAdapters(instance) || createAdapters(instance);
  adapters.bindings.add(runtime);
  let restore: (() => void) | undefined = wrapMethod(
    runtime.federation,
    'clearCache',
    () => (options: ClearCacheOptions) =>
      runtime
        ? clearCache({ ...options, webpackRequire: runtime })
        : Promise.reject(new Error('Cache adapter is detached')),
  );
  const originalDispose = Object.getOwnPropertyDescriptor(
    runtime.federation,
    'disposeClearCache',
  );
  const dispose = () => {
    if (!runtime) return;
    if (adapters!.updating())
      throw new Error(
        'Cannot detach cache adapter while cache cleanup is pending',
      );
    restore!();
    restore = undefined;
    adapters!.bindings.delete(runtime);
    if (runtime.federation.disposeClearCache === dispose) {
      if (originalDispose)
        Object.defineProperty(
          runtime.federation,
          'disposeClearCache',
          originalDispose,
        );
      else delete runtime.federation.disposeClearCache;
    }
    runtime = undefined;
    state.dispose = undefined;
    if (!adapters!.bindings.size) adapters!.restore();
    adapters = undefined;
  };
  runtime.federation.disposeClearCache = state.dispose = dispose;
  return dispose;
}

export const createClearCacheRuntimePlugin = () => ({
  name: 'bundler-runtime-clear-cache-plugin',
  dispose({ origin }: { origin: object }) {
    for (const binding of [...(getAdapters(origin)?.bindings || [])]) {
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
    for (const binding of getAdapters(origin)?.bindings || []) {
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
  async removeRemote({
    remote,
    origin,
  }: {
    remote: { name: string; alias?: string };
    origin: object;
  }) {
    const bindings = getAdapters(origin)?.bindings;
    if (!bindings) return;
    const results = await Promise.allSettled(
      [...bindings].map((binding) =>
        binding.federation.clearCache!({ name: remote.alias || remote.name }),
      ),
    );
    const failure = results.find((result) => result.status === 'rejected');
    if (failure?.status === 'rejected') throw failure.reason;
  },
});

/** Opt in from a Node runtime plugin before bundler init runs. */
export function installNodeCacheRuntime(runtime: WebpackRequire): void {
  const original = runtime.federation.bundlerRuntime;
  if (!original) {
    // Rspack evaluates plugin factories before assigning its bundler runtime.
    // Each entry must opt in even when MF reuses an instance and its plugins.
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
      const adapters = getAdapters(runtime.federation.instance);
      if (!adapters || !options.chunkMapping[options.chunkId]?.length) {
        original.remotes(options);
        return;
      }
      options.promises.push(
        adapters.load(async () => {
          const promises: Promise<unknown>[] = [];
          original.remotes({ ...options, promises });
          const settled = await Promise.allSettled(promises);
          const failure = settled.find(
            (result) => result.status === 'rejected',
          );
          if (failure?.status === 'rejected') throw failure.reason;
        }),
      );
    },
  };
  (wrapped as any)[nodeRuntimeKey] = true;
  runtime.federation.bundlerRuntime = wrapped;
}
