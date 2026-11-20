import { AsyncLocalStorage } from 'node:async_hooks';
import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';
import type { Remote } from '@module-federation/runtime/types';
import { clearBoundCaches } from '@module-federation/webpack-bundler-runtime/clear-cache';
import { disposeInstance } from './dispose';
import { captureNodeRemoteRemoval, prepareNodeRemotes } from './remote';
import {
  loadTrackerKey,
  nodeLifecycleKey,
  updatingKey,
  type NodeFederation,
  type NodeInstanceLifecycle,
} from './symbols';

type Activity = { kind: 'load' | 'update'; active: boolean };

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
      if ((instance as any)[nodeLifecycleKey]) return;
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

      const removeRemoteInternal = async (input: Remote | string) => {
        const target: Remote =
          typeof input === 'string'
            ? host.options.remotes.find(
                (item) => item.name === input || item.alias === input,
              ) || ({ name: input, alias: input } as Remote)
            : input;
        const { info, commit } = captureNodeRemoteRemoval(host, target);
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
              captureNodeRemoteRemoval(host, existing).commit();
              console.warn(
                `[ Federation Runtime ]: The remote "${remote.name}" is already registered. Please note that overriding it may cause unexpected errors.`,
              );
            }
          }
          return originalRegisterRemotes(remotes, {
            ...options,
            force: false,
          });
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
