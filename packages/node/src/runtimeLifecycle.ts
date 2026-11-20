import { AsyncLocalStorage } from 'node:async_hooks';
import type {
  ModuleFederation,
  ModuleFederationRuntimePlugin,
} from '@module-federation/runtime';
import type { Remote, RemoteInfo } from '@module-federation/runtime/types';
import helpers from '@module-federation/runtime/helpers';
import {
  clearBoundCaches,
  clearContainerCache,
} from '@module-federation/webpack-bundler-runtime/clear-cache';
import { disposeInstance } from './dispose';
import {
  getNodeInstanceLifecycle,
  loadTrackerKey,
  nodeLifecycleKey,
  updatingKey,
  type NodeInstanceLifecycle,
} from './lifecycle';
import {
  forEachSharedRecord,
  getRemoteSharedOwnership,
  pruneRetiredShareScopes,
  retireShareScope,
} from './share';

export type NodeFederation = ModuleFederation & {
  retainedProviders: Set<ModuleFederation>;
  updateRemotes(remotes: Remote[]): Promise<void>;
  removeRemote(remote: Remote | string): Promise<void>;
};

type Activity = { kind: 'load' | 'update'; active: boolean };

function prepareNodeRemotes(
  host: ModuleFederation,
  remotes: Remote[],
): Remote[] {
  if (!Array.isArray(remotes)) throw new Error('Remotes must be an array');
  const names = new Set<string>();
  const prepared = remotes.map((remote) => {
    if (!remote || typeof remote.name !== 'string' || !remote.name.length)
      throw new Error('Remote name is required');
    if (names.has(remote.name))
      throw new Error(`Duplicate remote: ${remote.name}`);
    names.add(remote.name);
    const result = { ...remote };
    if (Array.isArray(remote.shareScope))
      result.shareScope = [...remote.shareScope];
    if ('entry' in result) {
      if (typeof result.entry !== 'string' || !result.entry.length)
        throw new Error('Remote entry is required');
    } else if (
      !('version' in result) ||
      typeof result.version !== 'string' ||
      !result.version.length
    ) {
      throw new Error('Remote entry or version is required');
    }
    result.shareScope ||= 'default';
    result.type ||= 'global';
    return result;
  });
  const final = [
    ...host.options.remotes.filter((remote) => !names.has(remote.name)),
    ...prepared,
  ];
  for (const remote of final) {
    if (!remote.alias) continue;
    if (typeof remote.alias !== 'string')
      throw new Error('Remote alias must be a string');
    if (
      final.some(
        (other) =>
          other !== remote &&
          (other.name.startsWith(remote.alias!) ||
            other.alias?.startsWith(remote.alias!)),
      )
    )
      throw new Error(
        `Remote alias conflicts with another registration: ${remote.alias}`,
      );
  }
  return prepared;
}

function clearNodeRemoteSnapshotCache(
  host: ModuleFederation,
  remote: Remote,
  remoteInfo?: RemoteInfo,
): void {
  const { Global, getInfoWithoutType } = helpers.global;
  const remoteNames = new Set(
    [remote.name, remoteInfo?.name].filter(Boolean) as string[],
  );
  const remoteEntries = new Set(
    ['entry' in remote ? remote.entry : undefined, remoteInfo?.entry].filter(
      Boolean,
    ) as string[],
  );
  const globalModuleInfo = Global.__FEDERATION__.moduleInfo;
  const hostSnapshot = helpers.global.getGlobalSnapshotInfoByModuleInfo({
    name: host.options.name,
    version: host.options.version,
  });
  if (hostSnapshot && 'remotesInfo' in hostSnapshot && hostSnapshot.remotesInfo)
    for (const remoteName of remoteNames) {
      const record = getInfoWithoutType(hostSnapshot.remotesInfo, remoteName);
      if (record.value) delete hostSnapshot.remotesInfo[record.key];
    }

  for (const moduleKey of Object.keys(globalModuleInfo)) {
    const snapshot = globalModuleInfo[moduleKey];
    const snapshotBuildVersion =
      snapshot && 'buildVersion' in snapshot
        ? snapshot.buildVersion
        : undefined;
    if (
      remoteInfo?.buildVersion &&
      snapshotBuildVersion &&
      snapshotBuildVersion !== remoteInfo.buildVersion
    )
      continue;
    for (const remoteName of remoteNames) {
      if (
        moduleKey === remoteName ||
        [...remoteEntries].some(
          (entry) => moduleKey === `${remoteName}:${entry}`,
        ) ||
        (remoteInfo?.version &&
          moduleKey === `${remoteName}:${remoteInfo.version}`)
      )
        delete globalModuleInfo[moduleKey];
    }
  }
  for (const entry of remoteEntries) {
    host.snapshotHandler.manifestCache.delete(entry);
    delete Global.__FEDERATION__.__MANIFEST_LOADING__[entry];
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** Lifecycle policy for long-lived Node processes, installed only by the Node plugin. */
export function nodeRuntimeLifecycle(): ModuleFederationRuntimePlugin {
  return {
    name: 'node-runtime-lifecycle',
    apply(instance) {
      if (getNodeInstanceLifecycle(instance)) return;
      const host = instance as NodeFederation;
      host.retainedProviders = new Set();
      let closed = false;
      let disposal: Promise<void> | undefined;
      let queue: Promise<unknown> = Promise.resolve();
      let updates = 0;
      const contexts = new AsyncLocalStorage<Activity>();
      const activeLoads = new Set<Promise<unknown>>();
      const activeAll = new Set<Promise<unknown>>();

      const track = <T>(kind: Activity['kind'], run: () => Promise<T>) => {
        const context: Activity = { kind, active: true };
        let result: Promise<T>;
        try {
          result = Promise.resolve(contexts.run(context, run));
        } catch (error) {
          context.active = false;
          return Promise.reject(error);
        }
        activeAll.add(result);
        if (kind === 'load') activeLoads.add(result);
        const finish = () => {
          context.active = false;
          activeLoads.delete(result);
          activeAll.delete(result);
        };
        void result.then(finish, finish);
        return result;
      };

      const runLoad = <T>(run: () => Promise<T>): Promise<T> => {
        if (closed)
          return Promise.reject(
            new Error(`MF instance ${host.name} is disposed`),
          );
        if (updates && !contexts.getStore()?.active)
          return queue.then(() => runLoad(run));
        return track('load', run);
      };

      const runUpdate = <T>(run: () => Promise<T>): Promise<T> => {
        if (closed)
          return Promise.reject(
            new Error(`MF instance ${host.name} is disposed`),
          );
        const context = contexts.getStore();
        if (context?.active) {
          return context.kind === 'update'
            ? run()
            : Promise.reject(
                new Error('Cannot replace a remote from its in-flight load'),
              );
        }
        updates++;
        const start = () => {
          if (closed)
            return Promise.reject(
              new Error(`MF instance ${host.name} is disposed`),
            );
          if (activeLoads.size)
            return withTimeout(
              (async () => {
                while (activeLoads.size)
                  await Promise.allSettled([...activeLoads]);
              })(),
              30_000,
              'MF remote loads did not drain before cache invalidation',
            ).then(() => track('update', run));
          return track('update', run);
        };
        const result = (
          updates === 1 ? Promise.resolve().then(start) : queue.then(start)
        ).finally(() => {
          updates--;
        });
        queue = result.catch(() => {});
        activeAll.add(result);
        void result.then(
          () => activeAll.delete(result),
          () => activeAll.delete(result),
        );
        return result;
      };

      const captureRemoval = (target: Remote) => {
        const module = host.moduleCache.get(target.name);
        const info = module?.remoteInfo;
        const instances = globalThis.__FEDERATION__.__INSTANCES__;
        const provider = info
          ? helpers.global.getRemoteFederationInstance(info, [
              ...instances,
              ...host.retainedProviders,
            ])
          : undefined;
        const ownership = info
          ? getRemoteSharedOwnership(info, provider)
          : undefined;
        const entries = new Set(
          [module?.remoteEntryExports, module?.lib].filter(Boolean),
        );
        return {
          info,
          commit() {
            const finalizeRemoval = () => {
              const remoteIndex = host.options.remotes.findIndex(
                (item) => item.name === target.name,
              );
              if (remoteIndex !== -1)
                host.options.remotes.splice(remoteIndex, 1);
              clearNodeRemoteSnapshotCache(host, target, info);
            };
            if (!module || !info || !ownership) {
              finalizeRemoval();
              return;
            }
            const releaseLocal = () => {
              finalizeRemoval();
              host.moduleCache.delete(target.name);
              for (const [id, match] of Object.entries(
                host.remoteHandler.idToRemoteMap,
              ))
                if (match.name === target.name)
                  delete host.remoteHandler.idToRemoteMap[id];
            };
            const usedElsewhere = instances.some(
              (other) =>
                other !== host &&
                [...other.moduleCache.values()].some(
                  (value) =>
                    (value.remoteEntryExports &&
                      entries.has(value.remoteEntryExports)) ||
                    (value.lib && entries.has(value.lib)) ||
                    (provider &&
                      helpers.global.getRemoteFederationInstance(
                        value.remoteInfo,
                        [provider],
                      )),
                ),
            );
            if (usedElsewhere) return releaseLocal();

            const scopes = helpers.share.getGlobalShareScope();
            let preserveShared = false;
            const releaseShared: Array<() => void> = [];
            forEachSharedRecord(scopes, (shared, versions, version) => {
              if (!ownership.owns(shared)) return;
              if (ownership.sharedWithPeer(shared)) {
                preserveShared = true;
                return;
              }
              const useIn = shared.useIn.filter((name) => name !== shared.from);
              if (useIn.length || (shared.loading && !shared.loaded)) {
                preserveShared = true;
                releaseShared.push(() => {
                  shared.useIn = useIn;
                  shared.providerState = 1;
                });
              } else releaseShared.push(() => delete versions[version]);
            });

            const key = info.entryGlobalName;
            const globalEntry = key ? (globalThis as any)[key] : undefined;
            const ownsGlobal = !info.buildVersion || entries.has(globalEntry);
            if (ownsGlobal && globalEntry) entries.add(globalEntry);
            for (const entry of entries)
              clearContainerCache(entry, preserveShared);
            releaseLocal();
            for (const release of releaseShared) release();
            if (ownsGlobal && key && (globalThis as any)[key] === globalEntry) {
              if (
                Object.getOwnPropertyDescriptor(globalThis, key)?.configurable
              )
                delete (globalThis as any)[key];
              else (globalThis as any)[key] = undefined;
            }
            delete globalThis.__GLOBAL_LOADING_REMOTE_ENTRY__[
              helpers.utils.getRemoteEntryUniqueKey(info)
            ];
            if (provider) {
              retireShareScope(provider.shareScopeMap);
              if (preserveShared) host.retainedProviders.add(provider);
              else {
                provider.shareScopeMap = {};
                delete scopes[ownership.id];
              }
              const index = instances.indexOf(provider);
              if (index !== -1) instances.splice(index, 1);
            }
            pruneRetiredShareScopes();
          },
        };
      };

      const removeRemoteInternal = async (input: Remote | string) => {
        const target: Remote =
          typeof input === 'string'
            ? host.options.remotes.find(
                (item) => item.name === input || item.alias === input,
              ) || ({ name: input, alias: input } as Remote)
            : input;
        const { info, commit } = captureRemoval(target);
        await Promise.all([
          clearBoundCaches(host, target.alias || target.name),
          host.remoteHandler.hooks.lifecycle.removeRemote.emit({
            remote: target,
            origin: host,
            remoteInfo: info ? { ...info } : undefined,
          }),
        ]);
        commit();
      };

      const updateRemotesInternal = (remotes: Remote[]) => {
        let captured: Remote[];
        try {
          captured = prepareNodeRemotes(host, remotes);
        } catch (error) {
          return Promise.reject(error);
        }
        return runUpdate(async () => {
          const prepared = prepareNodeRemotes(host, captured);
          for (const remote of prepared) {
            const previous = host.options.remotes.find(
              (item) => item.name === remote.name,
            );
            if (previous) await removeRemoteInternal(previous);
          }
          for (const remote of prepared)
            host.remoteHandler.registerRemote(remote, host.options.remotes);
        });
      };

      for (const key of ['loadRemote', 'loadShare', 'preloadRemote'] as const) {
        const original = host[key] as (...args: any[]) => Promise<unknown>;
        (host[key] as any) = (...args: any[]) =>
          runLoad(() => original.apply(host, args));
      }
      for (const key of [
        'initOptions',
        'loadShareSync',
        'registerPlugins',
        'registerShared',
      ] as const) {
        const original = host[key] as (...args: any[]) => unknown;
        (host[key] as any) = (...args: any[]) => {
          if (closed) throw new Error(`MF instance ${host.name} is disposed`);
          return original.apply(host, args);
        };
      }
      const originalRegisterRemotes = host.registerRemotes.bind(host);
      host.registerRemotes = (
        remotes: Remote[],
        options?: { force?: boolean },
      ) => {
        if (closed) throw new Error(`MF instance ${host.name} is disposed`);
        if (options?.force) {
          for (const remote of remotes) {
            const existing = host.options.remotes.find(
              (item) => item.name === remote.name,
            );
            if (existing) {
              captureRemoval(existing).commit();
              console.warn(
                `[ Federation Runtime ]: The remote "${remote.name}" is already registered. Please note that overriding it may cause unexpected errors.`,
              );
            }
          }
          return originalRegisterRemotes(remotes, { ...options, force: false });
        }
        return originalRegisterRemotes(remotes, options);
      };
      host.updateRemotes = updateRemotesInternal;
      host.removeRemote = (remote: Remote | string) =>
        runUpdate(() => removeRemoteInternal(remote));

      const destroy = () => {
        if (disposal) return disposal;
        closed = true;
        disposal = (async () => {
          if (activeAll.size)
            await withTimeout(
              Promise.allSettled([...activeAll]),
              15_000,
              'MF instance disposal timed out',
            );
          await disposeInstance(host, removeRemoteInternal);
        })().catch((error) => {
          disposal = undefined;
          throw error;
        });
        return disposal;
      };

      const lifecycle: NodeInstanceLifecycle = {
        get closed() {
          return closed;
        },
        destroy,
        updateRemotes: (remotes) => host.updateRemotes(remotes),
        removeRemote: (remote) => host.removeRemote(remote),
      };
      Object.defineProperty(host, nodeLifecycleKey, { value: lifecycle });
      Object.defineProperty(host, loadTrackerKey, { value: runLoad });
      Object.defineProperty(host, updatingKey, { value: () => updates > 0 });
    },
  };
}
