import {
  createInstance,
  helpers,
  type ModuleFederation,
  type ModuleFederationRuntimePlugin,
} from '@module-federation/enhanced/runtime';
import {
  getResourceUrl,
  loadScript,
  type ModuleInfo,
} from '@module-federation/sdk';
import type { BridgeProviderInstance } from '../types';
import type { BridgeServiceClient } from './protocol';
import { validateServiceClient } from './protocol';

const locks = new Map<string, Promise<unknown>>();
const entries = new Map<string, Set<object>>();
let sequence = 0;
/** One mount owns this consumer scope. The Host's registered release is untouched. */
export async function loadServiceClient(
  client: BridgeServiceClient,
  parent: ModuleFederation,
) {
  validateServiceClient(client);
  const scopeId = ++sequence;
  const installed = new Set<ModuleFederation>();
  const ownedEntries = new Set<string>();
  const token = {};
  const description = JSON.stringify([
    client.snapshot.buildVersion,
    ...(client.dependencies || []).map((item) => [
      item.name,
      item.snapshot.version,
      item.snapshot.buildVersion,
    ]),
  ]);
  const view = btoa(
    Array.from(new TextEncoder().encode(description), (byte) =>
      String.fromCharCode(byte),
    ).join(''),
  );
  if (!('remoteEntry' in client.snapshot))
    throw Error('Service client requires a resolved snapshot');
  // The same producer build can render with a newly selected nested dependency.
  // Isolate that client view without changing the producer's BuildVersion.
  const withView = (snapshot: ModuleInfo) => {
    if (!('remoteEntry' in snapshot))
      throw Error('Service client requires a resolved snapshot');
    const parsed = new URL(
      snapshot.remoteEntry,
      'http://relative-entry.invalid/',
    );
    parsed.searchParams.set('mf_service_view', view);
    // Snapshot remoteEntry is relative to publicPath. Keep it relative: the
    // runtime resolves that prefix after selecting this snapshot.
    return {
      ...snapshot,
      remoteEntry:
        snapshot.remoteEntry.split(/[?#]/)[0] + parsed.search + parsed.hash,
    };
  };
  const selectedRoot = withView(client.snapshot);
  const snapshots = () => [
    { name: client.name, snapshot: selectedRoot },
    ...(client.dependencies || []).map((item) => ({
      ...item,
      snapshot: withView(item.snapshot),
    })),
  ];
  const pins = (): ModuleFederationRuntimePlugin => ({
    name: `bridge-service-client-snapshots-${scopeId}`,
    // Entry evaluation belongs to loadEntry below. Discovery must not race it
    // by evaluating a preloaded global container under the same global name.
    async generatePreloadAssets() {
      return { cssAssets: [], jsAssetsWithoutEntry: [], entryAssets: [] };
    },
    loadSnapshot(args) {
      // Within this mount the response selects the dependency deployment. A
      // producer's compiled/dynamic registration can still contain its old URL.
      const selected = snapshots().find(
        (item) => item.name === args.moduleInfo.name,
      );
      return selected ? { ...args, remoteSnapshot: selected.snapshot } : args;
    },
    loadRemoteSnapshot(args) {
      const selected = snapshots().find(
        (item) => item.name === args.moduleInfo.name,
      );
      return selected ? { ...args, remoteSnapshot: selected.snapshot } : args;
    },
    async afterInitRemote({ remoteInfo }) {
      const key = helpers.utils.getRemoteEntryUniqueKey(remoteInfo);
      const users = entries.get(key) || new Set<object>();
      entries.set(key, users);
      users.add(token);
      ownedEntries.add(key);
      // A nested producer initializes its own MF runtime. Pin that runtime too,
      // before its exposed factory starts loading further dependencies.
      const producer = helpers.global.getRemoteFederationInstance(remoteInfo);
      if (producer && !installed.has(producer)) {
        installed.add(producer);
        producer.registerPlugins([pins()]);
        // A new entry evaluation can reuse the producer's build-identified MF
        // instance. Drop an old nested Module before the new factory executes.
        for (const remote of [...producer.options.remotes]) {
          const selected = snapshots().find(
            (item) => item.name === remote.name,
          );
          const loaded = producer.moduleCache.get(remote.name);
          if (
            selected &&
            loaded &&
            'remoteEntry' in selected.snapshot &&
            loaded.remoteInfo.entry !==
              getResourceUrl(selected.snapshot, selected.snapshot.remoteEntry)
          ) {
            await producer.remoteHandler.removeRemote(remote);
            producer.registerRemotes([remote]);
          }
        }
      }
    },
    async loadEntry({ remoteInfo, loaderHook }) {
      if (!['global', 'var'].includes(remoteInfo.type)) return;
      const key = remoteInfo.entryGlobalName || remoteInfo.name;
      const previous = locks.get(key) || Promise.resolve();
      const loading = previous
        .catch(() => {})
        .then(async () => {
          const url = new URL(remoteInfo.entry);
          if (remoteInfo.buildVersion)
            url.searchParams.set('mf_service_build', remoteInfo.buildVersion);
          await loadScript(url.href, {
            attrs: {},
            createScriptHook(url, attrs) {
              return loaderHook.lifecycle.createScript.emit({
                url,
                attrs,
                remoteInfo,
              }) as any;
            },
          });
          const container = (globalThis as any)[key];
          if (!container)
            throw Error(`Service client entry did not publish ${key}`);
          return container;
        });
      locks.set(key, loading);
      try {
        return await loading;
      } finally {
        if (locks.get(key) === loading) locks.delete(key);
      }
    },
  });
  const snapshot = selectedRoot;
  if (!('remoteEntry' in snapshot))
    throw Error('Service client requires a resolved snapshot');
  const runtime = createInstance({
    name: `bridge_service_client_${scopeId}`,
    remotes: [
      {
        name: client.name,
        entry:
          snapshot.version || getResourceUrl(snapshot, snapshot.remoteEntry),
      },
    ],
    shared: {},
    shareStrategy: 'loaded-first',
    plugins: [pins()],
  });
  for (const [name, scope] of Object.entries(parent.shareScopeMap))
    runtime.initShareScopeMap(name, scope);
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    // Remove this mount's consumer root, not shared producer runtimes that may
    // still serve another mounted application.
    const instances = globalThis.__FEDERATION__.__INSTANCES__;
    const index = instances.indexOf(runtime);
    if (index !== -1) instances.splice(index, 1);
    runtime.moduleCache.clear();
    runtime.options.remotes = [];
    const pluginName = `bridge-service-client-snapshots-${scopeId}`;
    for (const producer of [runtime, ...installed]) {
      for (const hooks of [
        producer.hooks,
        producer.remoteHandler.hooks,
        producer.snapshotHandler.hooks,
        producer.sharedHandler.hooks,
        producer.loaderHook,
        producer.bridgeHook,
      ]) {
        if (hooks.registerPlugins[pluginName]) hooks.removePlugin(pluginName);
      }
      producer.options.plugins = producer.options.plugins.filter(
        (plugin) => plugin?.name !== pluginName,
      );
    }
    installed.clear();
    for (const key of ownedEntries) {
      const users = entries.get(key)!;
      users.delete(token);
      if (!users.size) {
        entries.delete(key);
        delete globalThis.__GLOBAL_LOADING_REMOTE_ENTRY__[key];
      }
    }
    ownedEntries.clear();
    // A snapshot handler creates a global consumer snapshot even with pinned
    // remotes. It belongs only to this mount and must not accumulate on remount.
    delete globalThis.__FEDERATION__.moduleInfo[runtime.name];
    runtime.snapshotHandler.manifestCache.clear();
  };
  try {
    const module = await runtime.loadRemote<{
      default: () => BridgeProviderInstance;
    }>(`${client.name}/${client.expose.replace(/^\.\//, '')}`);
    if (typeof module?.default !== 'function')
      throw Error('Service client has no default Bridge provider');
    return { factory: module.default, release };
  } catch (error) {
    release();
    throw error;
  }
}
