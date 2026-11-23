import {
  generateSnapshotFromManifest,
  isManifestProvider,
  type GlobalModuleInfo,
  type Manifest,
  type ModuleInfo,
  type ProviderModuleInfo,
} from '@module-federation/sdk';
import type { ModuleFederation } from '@module-federation/runtime';
import helpers from '@module-federation/runtime/helpers';
import { planRemoteCache } from '@module-federation/webpack-bundler-runtime/clear-cache';

const adaptersKey = Symbol.for('module-federation.clear-cache.adapters');

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, stable(item)]),
    );
  return value;
}

export function isRawManifest(value: unknown): value is Manifest {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'metaData' in value &&
    value.metaData &&
    typeof value.metaData === 'object',
  );
}

export function isResolvedProviderModuleInfo(
  value: unknown,
): value is ProviderModuleInfo {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !isRawManifest(value) &&
    'remoteEntry' in value &&
    typeof (value as { remoteEntry?: unknown }).remoteEntry === 'string' &&
    Boolean((value as { remoteEntry: string }).remoteEntry) &&
    !isManifestProvider(value as ProviderModuleInfo),
  );
}

/**
 * Fingerprint deployment-relevant fields of a resolved provider ModuleInfo.
 * Mutable runtime bookkeeping (such as consumerList) is intentionally ignored.
 */
export function moduleInfoFingerprint(
  moduleInfo: Record<string, unknown> | ProviderModuleInfo,
): string {
  if (
    !moduleInfo ||
    typeof moduleInfo !== 'object' ||
    Array.isArray(moduleInfo)
  )
    throw new TypeError('SSR update requires resolved provider moduleInfo');
  if (isRawManifest(moduleInfo))
    throw new TypeError(
      'moduleInfo must be a resolved ModuleInfo snapshot, not a raw Manifest; pass raw manifests via the manifest field',
    );
  if (!isResolvedProviderModuleInfo(moduleInfo))
    throw new TypeError(
      'SSR update requires resolved provider module information',
    );
  const record = moduleInfo as unknown as Record<string, unknown>;
  const fields = [
    'buildVersion',
    'globalName',
    'remoteEntry',
    'remoteEntryType',
    'ssrRemoteEntry',
    'ssrRemoteEntryType',
    'publicPath',
    'ssrPublicPath',
    'getPublicPath',
    'serviceBaseUrl',
  ];
  const picked: Record<string, unknown> = Object.fromEntries(
    fields.map((key) => [key, record[key]]),
  );
  picked.modules = (record.modules as any[] | undefined)
    ?.map((item) => ({
      moduleName: item.moduleName,
      modulePath: item.modulePath,
      assets: item.assets,
      render: item.render,
      servicePath: item.servicePath,
    }))
    .sort((a, b) => String(a.moduleName).localeCompare(String(b.moduleName)));
  picked.shared = (record.shared as any[] | undefined)
    ?.map((item) => ({
      sharedName: item.sharedName,
      version: item.version,
      assets: item.assets,
    }))
    .sort((a, b) => String(a.sharedName).localeCompare(String(b.sharedName)));
  return JSON.stringify(stable(picked));
}

/** Fingerprint a raw mf-manifest.json document by normalizing it to a ProviderModuleInfo first. */
export function manifestFingerprint(manifest: Manifest, entry: string): string {
  if (!isRawManifest(manifest))
    throw new TypeError(
      'manifest must be a valid Module Federation Manifest with metaData; pass resolved snapshots via moduleInfo',
    );
  const snapshot = generateSnapshotFromManifest(manifest, { version: entry });
  return moduleInfoFingerprint(snapshot);
}

/** Validate and normalize mutually-exclusive manifest / moduleInfo target fields. */
export function resolveTargetModuleInfo(input: {
  entry: string;
  manifest?: Manifest;
  moduleInfo?: ProviderModuleInfo;
}): ProviderModuleInfo | undefined {
  if (input.manifest !== undefined && input.moduleInfo !== undefined)
    throw new TypeError('Specify either manifest or moduleInfo, not both');
  if (input.manifest !== undefined) {
    if (!isRawManifest(input.manifest))
      throw new TypeError(
        'manifest must be a valid Module Federation Manifest with metaData; pass resolved snapshots via moduleInfo',
      );
    const snapshot = generateSnapshotFromManifest(input.manifest, {
      version: input.entry,
    });
    moduleInfoFingerprint(snapshot);
    return snapshot;
  }
  if (input.moduleInfo !== undefined) {
    moduleInfoFingerprint(input.moduleInfo);
    return structuredClone(input.moduleInfo);
  }
  return undefined;
}

export function resolveProviderEntryUrl(
  info: ProviderModuleInfo,
  options: { ssr?: boolean } = {},
): string | undefined {
  const file = options.ssr
    ? info.ssrRemoteEntry || info.remoteEntry
    : info.remoteEntry;
  if (typeof file !== 'string' || !file) return undefined;
  if (/^https?:\/\//.test(file) || file.startsWith('/')) return file;
  const publicPath =
    options.ssr && 'ssrPublicPath' in info && info.ssrPublicPath
      ? info.ssrPublicPath
      : 'publicPath' in info
        ? info.publicPath
        : undefined;
  if (
    typeof publicPath === 'string' &&
    publicPath.length > 0 &&
    publicPath !== 'auto'
  ) {
    return `${publicPath.replace(/\/$/, '')}/${file.replace(/^\//, '')}`;
  }
  return undefined;
}

export function isNodeRemoteLoaded(
  instance: ModuleFederation,
  remoteName: string,
): boolean {
  const names = new Set<string>([remoteName]);
  for (const remote of instance.options?.remotes || []) {
    if (remote.name === remoteName || remote.alias === remoteName) {
      names.add(remote.name);
      if (remote.alias) names.add(remote.alias);
    }
  }
  for (const name of names) {
    if (instance.moduleCache?.has(name)) return true;
  }
  for (const mod of instance.moduleCache?.values() || []) {
    if (
      names.has(mod.remoteInfo?.name) ||
      (mod.remoteInfo?.alias && names.has(mod.remoteInfo.alias))
    )
      return true;
  }
  const bindings: Set<any> | undefined = (instance as any)[adaptersKey]
    ?.bindings;
  if (bindings) {
    for (const runtime of bindings) {
      const cache = runtime?.c;
      if (!cache || typeof cache !== 'object') continue;
      for (const name of names) {
        const plan = planRemoteCache({ webpackRequire: runtime, name });
        if (!plan) continue;
        if (
          [...plan.remoteModuleIds, ...plan.consumerModuleIds].some((id) =>
            Object.prototype.hasOwnProperty.call(cache, id),
          )
        )
          return true;
      }
    }
  }
  return false;
}

export interface RegisteredRemoteDescriptor {
  name: string;
  alias?: string;
  entry?: string;
  version?: string;
  type?: string;
  entryGlobalName?: string;
}

export interface GlobalModuleInfoRemoteDiff {
  name: string;
  alias?: string;
  entry: string;
  clientEntry?: string;
  type?: string;
  entryGlobalName?: string;
  key: string;
  matchedVersion?: string;
  moduleInfo: ProviderModuleInfo;
  loaded: boolean;
}

export interface GlobalModuleInfoDiffResult {
  changed: boolean;
  loadedRemotes: GlobalModuleInfoRemoteDiff[];
  unloadedRemotes: GlobalModuleInfoRemoteDiff[];
  hasSnapshotDiff: boolean;
}

function validateGlobalModuleInfo(globalModuleInfo: GlobalModuleInfo): void {
  if (
    !globalModuleInfo ||
    typeof globalModuleInfo !== 'object' ||
    Array.isArray(globalModuleInfo)
  )
    throw new TypeError('globalModuleInfo must be a GlobalModuleInfo object');
  for (const [key, value] of Object.entries(globalModuleInfo)) {
    if (value === undefined) continue;
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new TypeError(`Invalid GlobalModuleInfo entry for "${key}"`);
    if (isRawManifest(value))
      throw new TypeError(
        `GlobalModuleInfo entry "${key}" is a raw Manifest; pass resolved ModuleInfo snapshots instead`,
      );
  }
}

function lookupHostSnapshot(
  snapshotMap: GlobalModuleInfo,
  host?: { name: string; version?: string },
): ModuleInfo | undefined {
  if (!host?.name) return undefined;
  const { getInfoWithoutType } = helpers.global;
  const candidates = [
    host.version ? `${host.name}:${host.version}` : undefined,
    host.name,
  ].filter(Boolean) as string[];
  for (const key of candidates) {
    const found = getInfoWithoutType(snapshotMap, key).value;
    if (found && 'remotesInfo' in found) return found as ModuleInfo;
  }
  return undefined;
}

export function lookupProviderInGlobalModuleInfo(
  snapshotMap: GlobalModuleInfo,
  remote: RegisteredRemoteDescriptor,
  host?: { name: string; version?: string },
):
  | { key: string; matchedVersion?: string; moduleInfo: ProviderModuleInfo }
  | undefined {
  const { getInfoWithoutType } = helpers.global;
  const names = [remote.name, remote.alias].filter(Boolean) as string[];
  const hostSnapshot = lookupHostSnapshot(snapshotMap, host);
  if (
    hostSnapshot &&
    'remotesInfo' in hostSnapshot &&
    hostSnapshot.remotesInfo
  ) {
    for (const name of names) {
      const record = getInfoWithoutType(hostSnapshot.remotesInfo, name).value;
      if (record?.matchedVersion) {
        const versionedKey = `${name}:${record.matchedVersion}`;
        const found = getInfoWithoutType(snapshotMap, versionedKey);
        if (found.value && isResolvedProviderModuleInfo(found.value)) {
          return {
            key: found.key,
            matchedVersion: record.matchedVersion,
            moduleInfo: found.value,
          };
        }
      }
    }
  }

  for (const name of names) {
    const directKeys: Array<{ key: string; matchedVersion?: string }> = [
      ...(remote.version
        ? [{ key: `${name}:${remote.version}`, matchedVersion: remote.version }]
        : []),
      ...(remote.entry
        ? [{ key: `${name}:${remote.entry}`, matchedVersion: remote.entry }]
        : []),
      { key: name, matchedVersion: undefined },
    ];
    for (const candidate of directKeys) {
      const found = getInfoWithoutType(snapshotMap, candidate.key);
      if (found.value && isResolvedProviderModuleInfo(found.value)) {
        return {
          key: found.key,
          matchedVersion:
            candidate.matchedVersion ||
            (typeof found.value.version === 'string' && found.value.version
              ? found.value.version
              : undefined),
          moduleInfo: found.value,
        };
      }
    }
  }

  for (const name of names) {
    const prefix = `${name}:`;
    const matches = Object.entries(snapshotMap).filter(
      ([key, value]) =>
        (key.startsWith(prefix) || key.endsWith(`/${prefix}`)) &&
        isResolvedProviderModuleInfo(value),
    ) as Array<[string, ProviderModuleInfo]>;
    if (matches.length === 1) {
      const [key, value] = matches[0];
      const suffix = key.slice(key.indexOf(prefix) + prefix.length);
      return {
        key,
        matchedVersion: suffix || value.version || undefined,
        moduleInfo: value,
      };
    }
  }
  return undefined;
}

function collectRegisteredRemotes(
  instances: ModuleFederation[],
  extraRemotes: RegisteredRemoteDescriptor[] = [],
): RegisteredRemoteDescriptor[] {
  const byName = new Map<string, RegisteredRemoteDescriptor>();
  for (const instance of instances) {
    for (const remote of instance.options?.remotes || []) {
      if (!byName.has(remote.name)) {
        byName.set(remote.name, {
          name: remote.name,
          alias: remote.alias,
          entry: 'entry' in remote ? remote.entry : undefined,
          version: 'version' in remote ? remote.version : undefined,
          type: 'type' in remote ? remote.type : undefined,
          entryGlobalName:
            'entryGlobalName' in remote ? remote.entryGlobalName : undefined,
        });
      }
    }
  }
  for (const remote of extraRemotes) {
    const existing =
      byName.get(remote.name) ||
      [...byName.values()].find(
        (item) => item.alias === remote.name || item.name === remote.alias,
      );
    if (!existing) byName.set(remote.name, { ...remote });
    else {
      byName.set(existing.name, {
        ...existing,
        alias: existing.alias ?? remote.alias,
        entry: existing.entry ?? remote.entry,
        version: existing.version ?? remote.version,
        type: existing.type ?? remote.type,
        entryGlobalName: existing.entryGlobalName ?? remote.entryGlobalName,
      });
    }
  }
  return [...byName.values()];
}

function resolveInstanceCachedModuleInfo(
  instances: ModuleFederation[],
  remote: RegisteredRemoteDescriptor,
): ProviderModuleInfo | undefined {
  for (const instance of instances) {
    if (remote.entry) {
      const cachedManifest = instance.snapshotHandler?.manifestCache?.get(
        remote.entry,
      );
      if (cachedManifest) {
        return generateSnapshotFromManifest(cachedManifest, {
          version: remote.entry,
        });
      }
    }
  }
  return undefined;
}

function rawSnapshotFingerprint(
  entry: NonNullable<GlobalModuleInfo[string]>,
): string {
  if (isResolvedProviderModuleInfo(entry)) return moduleInfoFingerprint(entry);
  const record = entry as unknown as Record<string, unknown>;
  return JSON.stringify(
    stable({
      version: record.version,
      buildVersion: record.buildVersion,
      remoteEntry: record.remoteEntry,
      ssrRemoteEntry: record.ssrRemoteEntry,
      remotesInfo: record.remotesInfo,
    }),
  );
}

/**
 * Pure read-only diff of a candidate GlobalModuleInfo against active Node instances
 * and the current global snapshot table.
 */
export function diffNodeGlobalModuleInfo(
  nextGlobalModuleInfo: GlobalModuleInfo,
  options: {
    instances?: ModuleFederation[];
    remotes?: RegisteredRemoteDescriptor[];
    host?: { name: string; version?: string };
    currentGlobalModuleInfo?: GlobalModuleInfo;
    resolveCurrentModuleInfo?: (
      remote: RegisteredRemoteDescriptor,
    ) => ProviderModuleInfo | undefined;
    isRemoteLoaded?: (
      remoteName: string,
      instance?: ModuleFederation,
    ) => boolean;
  } = {},
): GlobalModuleInfoDiffResult {
  validateGlobalModuleInfo(nextGlobalModuleInfo);
  const Global = helpers.global.Global;
  const instances =
    options.instances ?? (Global.__FEDERATION__?.__INSTANCES__ || []);
  const currentGlobal =
    options.currentGlobalModuleInfo ??
    (Global.__FEDERATION__?.moduleInfo || {});
  const host =
    options.host ??
    (instances[0]
      ? {
          name: instances[0].options.name,
          version: instances[0].options.version,
        }
      : undefined);

  const registered = collectRegisteredRemotes(instances, options.remotes);
  const loadedRemotes: GlobalModuleInfoRemoteDiff[] = [];
  const unloadedRemotes: GlobalModuleInfoRemoteDiff[] = [];

  for (const remote of registered) {
    const nextFound = lookupProviderInGlobalModuleInfo(
      nextGlobalModuleInfo,
      remote,
      host,
    );
    if (!nextFound) continue;
    const currentInfo =
      options.resolveCurrentModuleInfo?.(remote) ||
      lookupProviderInGlobalModuleInfo(currentGlobal, remote, host)
        ?.moduleInfo ||
      resolveInstanceCachedModuleInfo(instances, remote);

    let remoteChanged =
      !currentInfo ||
      moduleInfoFingerprint(currentInfo) !==
        moduleInfoFingerprint(nextFound.moduleInfo);
    if (!remoteChanged) {
      for (const instance of instances) {
        const loadedInfo = instance.moduleCache?.get(remote.name)?.remoteInfo;
        if (
          loadedInfo?.buildVersion &&
          nextFound.moduleInfo.buildVersion &&
          loadedInfo.buildVersion !== nextFound.moduleInfo.buildVersion
        ) {
          remoteChanged = true;
          break;
        }
      }
    }
    if (!remoteChanged) continue;

    const loaded = instances.length
      ? instances.some(
          (instance) =>
            isNodeRemoteLoaded(instance, remote.name) ||
            Boolean(options.isRemoteLoaded?.(remote.name, instance)),
        )
      : Boolean(options.isRemoteLoaded?.(remote.name, undefined));

    const isManifestEntry = Boolean(
      remote.entry && /\.json(?:[?#]|$)/.test(remote.entry),
    );
    const matchedIsUrl = Boolean(
      nextFound.matchedVersion &&
      (/^https?:\/\//.test(nextFound.matchedVersion) ||
        nextFound.matchedVersion.startsWith('/')),
    );
    const resolvedSsrEntry = resolveProviderEntryUrl(nextFound.moduleInfo, {
      ssr: true,
    });
    const resolvedClientEntry = resolveProviderEntryUrl(nextFound.moduleInfo, {
      ssr: false,
    });
    const entry = matchedIsUrl
      ? nextFound.matchedVersion!
      : isManifestEntry
        ? remote.entry!
        : resolvedSsrEntry ||
          remote.entry ||
          nextFound.matchedVersion ||
          nextFound.moduleInfo.remoteEntry;
    const clientEntry =
      matchedIsUrl && /\.json(?:[?#]|$)/.test(nextFound.matchedVersion!)
        ? nextFound.matchedVersion
        : isManifestEntry
          ? remote.entry
          : resolvedClientEntry;

    const diffItem: GlobalModuleInfoRemoteDiff = {
      name: remote.name,
      ...(remote.alias ? { alias: remote.alias } : {}),
      entry,
      ...(clientEntry ? { clientEntry } : {}),
      type:
        nextFound.moduleInfo.ssrRemoteEntryType ||
        nextFound.moduleInfo.remoteEntryType ||
        remote.type,
      entryGlobalName:
        nextFound.moduleInfo.globalName || remote.entryGlobalName,
      key: nextFound.key,
      ...(nextFound.matchedVersion
        ? { matchedVersion: nextFound.matchedVersion }
        : {}),
      moduleInfo: structuredClone(nextFound.moduleInfo),
      loaded,
    };

    if (loaded) loadedRemotes.push(diffItem);
    else unloadedRemotes.push(diffItem);
  }

  let hasSnapshotDiff = false;
  for (const [key, nextValue] of Object.entries(nextGlobalModuleInfo)) {
    if (!nextValue) continue;
    const currentValue = currentGlobal[key];
    if (
      !currentValue ||
      rawSnapshotFingerprint(currentValue) !== rawSnapshotFingerprint(nextValue)
    ) {
      hasSnapshotDiff = true;
      break;
    }
  }

  return {
    changed:
      loadedRemotes.length > 0 || unloadedRemotes.length > 0 || hasSnapshotDiff,
    loadedRemotes,
    unloadedRemotes,
    hasSnapshotDiff,
  };
}

/**
 * Synchronize GlobalModuleInfo entries into globalThis.__FEDERATION__.moduleInfo,
 * updating host remotesInfo mappings, pruning superseded provider keys, and
 * refreshing unloaded remote registrations in-place without evicting caches.
 */
export function applyNodeGlobalModuleInfo(
  nextGlobalModuleInfo: GlobalModuleInfo,
  options: {
    instances?: ModuleFederation[];
    remotes?: RegisteredRemoteDescriptor[];
    host?: { name: string; version?: string };
    remoteNames?: Iterable<string>;
  } = {},
): void {
  validateGlobalModuleInfo(nextGlobalModuleInfo);
  const { Global, getInfoWithoutType } = helpers.global;
  const globalSnapshot = Global.__FEDERATION__.moduleInfo;
  const instances =
    options.instances ?? (Global.__FEDERATION__?.__INSTANCES__ || []);
  const filterSet = options.remoteNames
    ? new Set(options.remoteNames)
    : undefined;
  const host =
    options.host ??
    (instances[0]
      ? {
          name: instances[0].options.name,
          version: instances[0].options.version,
        }
      : undefined);

  const registered = collectRegisteredRemotes(instances, options.remotes);
  const retainedKeys = new Set<string>();

  if (!filterSet) {
    for (const [key, value] of Object.entries(nextGlobalModuleInfo)) {
      if (!value) continue;
      globalSnapshot[key] = structuredClone(value);
      retainedKeys.add(key);
    }
  }

  let hostKey = host?.version ? `${host.name}:${host.version}` : host?.name;
  let hostEntry = host ? lookupHostSnapshot(globalSnapshot, host) : undefined;
  if (host && !hostEntry) {
    const incomingHost = lookupHostSnapshot(nextGlobalModuleInfo, host);
    if (incomingHost) {
      hostEntry = structuredClone(incomingHost);
    } else {
      hostEntry = {
        version: host.version || '',
        remoteEntry: '',
        remotesInfo: {},
      } as unknown as ModuleInfo;
    }
    hostKey = host.version ? `${host.name}:${host.version}` : host.name;
    globalSnapshot[hostKey] = hostEntry;
  }
  if (hostKey) retainedKeys.add(hostKey);
  if (host?.name) retainedKeys.add(host.name);

  for (const remote of registered) {
    if (
      filterSet &&
      !filterSet.has(remote.name) &&
      !(remote.alias && filterSet.has(remote.alias))
    )
      continue;
    const nextFound = lookupProviderInGlobalModuleInfo(
      nextGlobalModuleInfo,
      remote,
      host,
    );
    if (!nextFound) continue;

    const effectiveVersion =
      nextFound.matchedVersion ??
      (typeof nextFound.moduleInfo.version === 'string' &&
      nextFound.moduleInfo.version
        ? nextFound.moduleInfo.version
        : undefined) ??
      remote.version ??
      remote.entry;

    const canonicalKey = effectiveVersion
      ? `${remote.name}:${effectiveVersion}`
      : remote.name;
    const cloned = structuredClone(nextFound.moduleInfo);
    if (!cloned.version && effectiveVersion) cloned.version = effectiveVersion;

    globalSnapshot[nextFound.key] = structuredClone(cloned);
    globalSnapshot[canonicalKey] = cloned;
    retainedKeys.add(nextFound.key);
    retainedKeys.add(canonicalKey);

    if (hostEntry && 'remotesInfo' in hostEntry) {
      hostEntry.remotesInfo ||= {};
      const existingRecord = getInfoWithoutType(
        hostEntry.remotesInfo,
        remote.name,
      );
      const remoteInfoKey = existingRecord.value
        ? existingRecord.key
        : remote.name;
      hostEntry.remotesInfo[remoteInfoKey] = {
        matchedVersion: effectiveVersion || '',
      };
    }

    const prefixes = [remote.name, remote.alias].filter(Boolean) as string[];
    for (const existingKey of Object.keys(globalSnapshot)) {
      if (retainedKeys.has(existingKey)) continue;
      if (
        prefixes.some(
          (name) => existingKey === name || existingKey.startsWith(`${name}:`),
        )
      ) {
        delete globalSnapshot[existingKey];
      }
    }

    for (const instance of instances) {
      if (remote.entry) {
        instance.snapshotHandler?.manifestCache?.delete(remote.entry);
        delete Global.__FEDERATION__.__MANIFEST_LOADING__?.[remote.entry];
      }
      if (effectiveVersion) {
        instance.snapshotHandler?.manifestCache?.delete(effectiveVersion);
        delete Global.__FEDERATION__.__MANIFEST_LOADING__?.[effectiveVersion];
      }
      if (!isNodeRemoteLoaded(instance, remote.name)) {
        const reg = instance.options?.remotes?.find(
          (item) => item.name === remote.name || item.alias === remote.name,
        );
        if (reg) {
          if (
            'version' in reg &&
            effectiveVersion &&
            !/^https?:\/\//.test(effectiveVersion)
          ) {
            reg.version = effectiveVersion;
          } else if ('entry' in reg && reg.entry) {
            if (
              effectiveVersion &&
              (/^https?:\/\//.test(effectiveVersion) ||
                effectiveVersion.startsWith('/'))
            ) {
              reg.entry = effectiveVersion;
            } else if (!/\.json(?:[?#]|$)/.test(reg.entry)) {
              const resolved = resolveProviderEntryUrl(nextFound.moduleInfo, {
                ssr: true,
              });
              if (resolved) reg.entry = resolved;
            }
          }
        }
      }
    }
  }
}
