import type {
  ClearCacheOptions,
  ClearCacheResult,
  ClearCacheRuntimeOptions,
  InstallClearCacheOptions,
  WebpackRequire,
} from './types';

type State = {
  dispose?: () => void;
};
type Adapters = { bindings: Set<WebpackRequire>; restore: () => void };
const stateKey = Symbol.for('module-federation.clear-cache.state');
const adaptersKey = Symbol.for('module-federation.clear-cache.adapters');
const nodeRuntimeKey = Symbol.for('module-federation.clear-cache.runtime');
const getAdapters = (instance: any): Adapters | undefined =>
  instance?.[adaptersKey];
const unique = <T>(values: T[]) => [...new Set(values)];
const getState = (runtime: WebpackRequire): State => {
  // Use assignment: Rspack require facades forward get/set, not defineProperty.
  return ((runtime as any)[stateKey] ||= {});
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
  const remoteIds = Object.entries(options?.idToRemoteMap || {})
    .filter(([, infos]) => infos.some((info) => names.includes(info.name)))
    .map(([id]) => id);
  // Native metadata also identifies promise/external remotes without MF info.
  for (const [id, data] of Object.entries(
    runtime.remotesLoadingData?.moduleIdToRemoteDataMapping || {},
  ))
    if (names.includes(data.remoteName) && !remoteIds.includes(id))
      remoteIds.push(id);
  return {
    key,
    names,
    remoteIds,
  };
};

/** Container-specific callbacks stay in the bundler adapter. */
export function clearContainerCache(
  value: unknown,
  preserveShared = false,
): void {
  const entry = value as
    | {
        __webpack_clear_cache__?: () => void;
        __webpack_clear_exposed_cache__?: () => void;
      }
    | undefined;
  if (preserveShared) entry?.__webpack_clear_exposed_cache__?.();
  else entry?.__webpack_clear_cache__?.();
}

/** Translate MF names/loading records into the native bundler cache API. */
export async function clearCache(
  options: ClearCacheRuntimeOptions,
): Promise<ClearCacheResult> {
  const runtime = options.webpackRequire;
  const target = targetFor(runtime, options.name, options.remoteKey);
  const native = runtime.remoteCache;
  if (!native) {
    if (target.remoteIds.length)
      throw new Error(
        'SSR remote invalidation requires native bundler remoteCache support',
      );
    return { name: options.name, cleared: true };
  }
  const records = target.remoteIds
    .map(
      (id) =>
        runtime.federation.bundlerRuntimeOptions.remotes
          ?.idToExternalAndNameMapping[id],
    )
    .filter((value) => Boolean(value));
  const pending = records.flatMap((record) =>
    record!.p && typeof record!.p === 'object' && 'then' in record!.p
      ? [record!.p]
      : [],
  );
  const saved = records.map((record) =>
    Object.getOwnPropertyDescriptor(record!, 'p'),
  );
  try {
    await native.clear(target.names, {
      pending,
      reset() {
        for (const record of records) delete record!.p;
      },
    });
    return { name: options.name, cleared: true };
  } catch (error) {
    records.forEach((record, index) => {
      if (saved[index]) Object.defineProperty(record!, 'p', saved[index]!);
      else delete record!.p;
    });
    throw error;
  }
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
  const restore =
    typeof instance.loadRemote === 'function'
      ? wrapMethod(
          instance,
          'loadRemote',
          (original) =>
            function (this: any, id: string, options?: unknown) {
              const active = [...bindings].filter(
                (binding) => requestKeys(binding, id).length,
              );
              const waits = active.flatMap((binding) => {
                const keys = requestKeys(binding, id);
                const wait = binding.remoteCache?.wait(keys);
                return wait ? [wait] : [];
              });
              const load = () => {
                if (active.some((binding) => !bindings.has(binding)))
                  throw new Error(
                    'Cache adapter detached while waiting to load a remote',
                  );
                return original.call(this, id, options);
              };
              return waits.length ? Promise.all(waits).then(load) : load();
            },
        )
      : () => {};
  const adapters = {
    bindings,
    restore() {
      restore();
      if (instance[adaptersKey] === adapters) delete instance[adaptersKey];
    },
  };
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
    if (runtime.remoteCache?.hasPending())
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
  if (!original || (original as any)[nodeRuntimeKey]) return;
  const wrapped: typeof original = {
    ...original,
    init(options) {
      runtime.federation.disposeClearCache?.();
      const instance = original.init(options);
      installClearCache({ webpackRequire: runtime, instance });
      return instance;
    },
    remotes(options) {
      const wait = runtime.remoteCache?.waitForChunk(options.chunkId);
      if (wait) {
        options.promises.push(
          wait.then(() => {
            const promises: Promise<unknown>[] = [];
            original.remotes({ ...options, promises });
            return Promise.all(promises);
          }),
        );
      } else original.remotes(options);
    },
  };
  (wrapped as any)[nodeRuntimeKey] = true;
  runtime.federation.bundlerRuntime = wrapped;
}
