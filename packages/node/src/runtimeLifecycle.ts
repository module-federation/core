import type {
  ModuleFederation,
  ModuleFederationRuntimePlugin,
} from '@module-federation/runtime';
import helpers from '@module-federation/runtime/helpers';
import { clearContainerCache } from '@module-federation/webpack-bundler-runtime/clear-cache';
import { disposeInstance } from './dispose';
import {
  getRemoteSharedOwnership,
  retireShareScope,
  pruneRetiredShareScopes,
} from './share';

export type NodeFederation = ModuleFederation & {
  retainedProviders: Set<ModuleFederation>;
};

/** Lifecycle policy for long-lived Node processes, installed only by the Node plugin. */
export function nodeRuntimeLifecycle(): ModuleFederationRuntimePlugin {
  return {
    name: 'node-runtime-lifecycle',
    apply(instance) {
      const host = instance as NodeFederation;
      host.retainedProviders = new Set();
      let closed = false;
      Object.defineProperty(host, 'disposed', { get: () => closed });
      let disposal: Promise<void> | undefined;
      const pending = new Set<Promise<unknown>>();
      for (const key of [
        'loadRemote',
        'loadShare',
        'preloadRemote',
        'updateRemotes',
        'removeRemote',
      ] as const) {
        const original = host[key] as (...args: any[]) => Promise<unknown>;
        (host[key] as any) = (...args: any[]) => {
          if (closed)
            return Promise.reject(
              new Error(`MF instance ${host.name} is disposed`),
            );
          const promise = original.apply(host, args);
          pending.add(promise);
          void promise.then(
            () => pending.delete(promise),
            () => pending.delete(promise),
          );
          return promise;
        };
      }
      for (const key of [
        'initOptions',
        'loadShareSync',
        'registerPlugins',
        'registerRemotes',
        'registerShared',
      ] as const) {
        const original = host[key] as (...args: any[]) => unknown;
        (host[key] as any) = (...args: any[]) => {
          if (closed) throw new Error(`MF instance ${host.name} is disposed`);
          return original.apply(host, args);
        };
      }
      const destroy = host.destroy.bind(host);
      host.destroy = () => {
        if (disposal) return disposal;
        closed = true;
        disposal = (async () => {
          let timer: ReturnType<typeof setTimeout> | undefined;
          try {
            await Promise.race([
              Promise.allSettled([...pending]),
              new Promise<never>((_, reject) => {
                timer = setTimeout(
                  () => reject(new Error('MF instance disposal timed out')),
                  15000,
                );
              }),
            ]);
          } finally {
            clearTimeout(timer);
          }
          await disposeInstance(host, destroy);
        })().catch((error) => {
          disposal = undefined;
          throw error;
        });
        return disposal;
      };
      return {
        beforeRemoveRemote({ remote }) {
          const module = host.moduleCache.get(remote.name);
          if (!module) return { remove() {} };
          const info = module.remoteInfo;
          const instances = globalThis.__FEDERATION__.__INSTANCES__;
          const provider = helpers.global.getRemoteFederationInstance(info, [
            ...instances,
            ...host.retainedProviders,
          ]);
          const ownership = getRemoteSharedOwnership(info, provider);
          const entries = new Set(
            [module.remoteEntryExports, module.lib].filter(Boolean),
          );
          return {
            remove() {
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
              const releaseLocal = () => {
                host.moduleCache.delete(remote.name);
                for (const [id, match] of Object.entries(
                  host.remoteHandler.idToRemoteMap,
                ))
                  if (match.name === remote.name)
                    delete host.remoteHandler.idToRemoteMap[id];
              };
              if (usedElsewhere) return releaseLocal();
              const scopes = helpers.share.getGlobalShareScope();
              let preserveShared = false;
              const releaseShared: Array<() => void> = [];
              for (const scopeMap of Object.values(scopes))
                for (const packages of Object.values(scopeMap))
                  for (const versions of Object.values(packages))
                    for (const [version, shared] of Object.entries(versions)) {
                      if (!ownership.owns(shared)) continue;
                      if (ownership.sharedWithPeer(shared)) {
                        preserveShared = true;
                        continue;
                      }
                      const useIn = shared.useIn.filter(
                        (name) => name !== shared.from,
                      );
                      if (useIn.length || (shared.loading && !shared.loaded)) {
                        preserveShared = true;
                        releaseShared.push(() => {
                          shared.useIn = useIn;
                          shared.providerState = 1;
                        });
                      } else releaseShared.push(() => delete versions[version]);
                    }
              const key = info.entryGlobalName;
              const globalEntry = key ? (globalThis as any)[key] : undefined;
              const ownsGlobal = !info.buildVersion || entries.has(globalEntry);
              if (ownsGlobal && globalEntry) entries.add(globalEntry);
              for (const entry of entries)
                clearContainerCache(entry, preserveShared);
              releaseLocal();
              for (const release of releaseShared) release();
              if (
                ownsGlobal &&
                key &&
                (globalThis as any)[key] === globalEntry
              ) {
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
        },
      };
    },
  };
}
