import { AsyncLocalStorage } from 'node:async_hooks';
import { createHash } from 'node:crypto';
import * as React from 'react';
import { loadScriptNode } from '@module-federation/runtime';
import {
  generateSnapshotFromManifest,
  getResourceUrl,
  type Manifest,
  type ProviderModuleInfo,
} from '@module-federation/sdk';
import { getBrowserManifestUrl, normalizeNextManifestUrl } from './remotes';

const GENERATION_QUERY_PARAM = 'mf-build-version';
const GENERATION_REMOTE_PREFIX = '__nextjs_mf_generation__';
const DEV_MANIFEST_FETCH_ATTEMPTS = 24;
const DEV_MANIFEST_FETCH_DELAY_MS = 250;

type UsedRemoteReference = {
  runtimeName: string;
  expose: string;
};

type FederatedRequestState = {
  usedRemotes: UsedRemoteReference[];
  seenRemotes: Set<string>;
  generationBySpecifier: Map<string, RemoteGeneration>;
  generationByRuntimeName: Map<string, RemoteGeneration>;
  generationByEntryGlobalName: Map<string, RemoteGeneration>;
};

type FederatedRemoteReference = {
  name: string;
  alias?: string;
  entry?: string;
  type?: string;
  shareScope?: string | string[];
};

type RemoteGeneration = {
  baseKey: string;
  baseName: string;
  baseAlias?: string;
  baseManifestUrl: string;
  baseEntryGlobalName: string;
  manifestUrl: string;
  assetManifestUrl: string;
  buildVersion: string;
  entryGlobalName: string;
  runtimeName: string;
  type?: string;
  shareScope?: string | string[];
  manifest: Manifest;
  assetManifest: Manifest;
  assetSnapshot?: ProviderModuleInfo;
  refCount: number;
  active: boolean;
  retired: boolean;
};

type FederationInstanceLike = {
  options?: {
    remotes?: FederatedRemoteReference[];
  };
  remoteHandler?: {
    registerRemotes?: (
      remotes: FederatedRemoteReference[],
      options?: { force?: boolean },
    ) => void;
    removeRemote?: (remote: FederatedRemoteReference) => void;
  };
  snapshotHandler?: {
    manifestCache?: Map<string, Manifest>;
  };
};

type LoaderHookLike = {
  lifecycle: {
    createScript: {
      emit: (args: { url: string; attrs?: Record<string, unknown> }) => unknown;
    };
    fetch: {
      emit: (
        input: RequestInfo | URL,
        init?: RequestInit,
      ) => Promise<Response | undefined>;
    };
  };
};

type RemoteContainer = {
  init: (...args: any[]) => unknown;
  get: (...args: any[]) => unknown;
};

type FederatedSsrGlobal = {
  storage: AsyncLocalStorage<FederatedRequestState>;
  generations: Map<string, Map<string, RemoteGeneration>>;
  activeBuildVersions: Map<string, string>;
  record: (runtimeName: string, expose: string) => void;
  rewriteId: (id: string) => string;
  ensureRemoteGeneration: (args: {
    remote: { name: string; alias?: string };
    remoteInfo: {
      name: string;
      entry: string;
      entryGlobalName: string;
      buildVersion?: string;
    };
  }) => Promise<RemoteGeneration | undefined>;
  pinRemote: (args: {
    remote: { name: string; alias?: string };
    remoteInfo: {
      name: string;
      entry: string;
      entryGlobalName: string;
      buildVersion?: string;
    };
  }) => RemoteGeneration | undefined;
  getPinnedManifestResponse: (manifestUrl: string) => Response | undefined;
  loadEntry: (args: {
    loaderHook: LoaderHookLike;
    remoteInfo: {
      name: string;
      entry: string;
      entryGlobalName: string;
      type?: string;
    };
  }) => Promise<unknown> | undefined;
};

declare global {
  // eslint-disable-next-line no-var
  var __NEXTJS_MF_SSR__: FederatedSsrGlobal | undefined;
}

const isRemoteContainer = (value: unknown): value is RemoteContainer =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as RemoteContainer).init === 'function' &&
  typeof (value as RemoteContainer).get === 'function';

const createRequestState = (): FederatedRequestState => ({
  usedRemotes: [],
  seenRemotes: new Set(),
  generationBySpecifier: new Map(),
  generationByRuntimeName: new Map(),
  generationByEntryGlobalName: new Map(),
});

const normalizeExpose = (expose: string | undefined): string => {
  if (!expose || expose === '.' || expose === './') {
    return '.';
  }

  return expose.startsWith('./') ? expose : `./${expose}`;
};

const stableHash = (value: string): string =>
  createHash('sha1').update(value).digest('hex').slice(0, 12);

const appendGenerationQuery = (value: string, buildVersion: string): string => {
  if (!value) {
    return value;
  }

  try {
    const url = new URL(value);
    url.searchParams.set(GENERATION_QUERY_PARAM, buildVersion);
    return url.toString();
  } catch {
    const separator = value.includes('?') ? '&' : '?';
    return `${value}${separator}${GENERATION_QUERY_PARAM}=${encodeURIComponent(buildVersion)}`;
  }
};

const isGenerationRemote = (remoteName: string | undefined): boolean =>
  Boolean(remoteName?.startsWith(GENERATION_REMOTE_PREFIX));

const getFederationInstances = (): FederationInstanceLike[] => {
  const instances = (
    globalThis as typeof globalThis & {
      __FEDERATION__?: {
        __INSTANCES__?: FederationInstanceLike[];
      };
    }
  ).__FEDERATION__?.__INSTANCES__;

  return Array.isArray(instances) ? instances : [];
};

const getBaseRemoteKey = (remoteName: string, manifestUrl: string): string =>
  `${remoteName}@${manifestUrl}`;

const getConfiguredRemotes = (): Array<
  FederatedRemoteReference & { baseKey: string; entry: string }
> => {
  const remotes = new Map<
    string,
    FederatedRemoteReference & { baseKey: string; entry: string }
  >();

  for (const instance of getFederationInstances()) {
    for (const remote of instance.options?.remotes || []) {
      if (!remote.entry || isGenerationRemote(remote.name)) {
        continue;
      }

      const manifestUrl = normalizeNextManifestUrl(remote.entry);
      const baseKey = getBaseRemoteKey(remote.name, manifestUrl);
      if (!remotes.has(baseKey)) {
        remotes.set(baseKey, {
          ...remote,
          entry: manifestUrl,
          baseKey,
        });
      }
    }
  }

  return Array.from(remotes.values());
};

const findConfiguredRemoteForRequest = (
  remote: { name: string; alias?: string },
  remoteInfo: {
    name: string;
    entry: string;
    entryGlobalName: string;
  },
):
  | (FederatedRemoteReference & { baseKey: string; entry: string })
  | undefined => {
  const requestedNames = new Set(
    [
      remote.name,
      remote.alias,
      remoteInfo.name,
      remoteInfo.entryGlobalName,
    ].filter((value): value is string => Boolean(value)),
  );
  const requestedEntry = normalizeNextManifestUrl(remoteInfo.entry);

  return getConfiguredRemotes().find((candidate) => {
    const candidateEntries = new Set([
      normalizeNextManifestUrl(candidate.entry),
      normalizeNextManifestUrl(getBrowserManifestUrl(candidate.entry)),
    ]);

    if (!candidateEntries.has(requestedEntry)) {
      return false;
    }

    return (
      requestedNames.has(candidate.name) ||
      (candidate.alias ? requestedNames.has(candidate.alias) : false)
    );
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const findJsonDocumentEnd = (source: string): number | undefined => {
  let depth = 0;
  let started = false;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index++) {
    const character = source[index];

    if (!started) {
      if (character.trim() === '') {
        continue;
      }

      if (character !== '{' && character !== '[') {
        return undefined;
      }

      started = true;
      depth = 1;
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === '\\') {
        escaped = true;
        continue;
      }

      if (character === '"') {
        inString = false;
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === '{' || character === '[') {
      depth += 1;
      continue;
    }

    if (character === '}' || character === ']') {
      depth -= 1;

      if (depth === 0) {
        return index + 1;
      }
    }
  }

  return undefined;
};

const parseManifestResponse = async (
  response: Response,
  manifestUrl: string,
): Promise<Manifest> => {
  if (typeof response.text !== 'function') {
    return (await response.json()) as Manifest;
  }

  const source = await response.text();
  const documentEnd = findJsonDocumentEnd(source);

  if (documentEnd === undefined) {
    throw new Error(`Unable to parse remote manifest ${manifestUrl}`);
  }

  return JSON.parse(source.slice(0, documentEnd)) as Manifest;
};

const fetchManifest = async (manifestUrl: string): Promise<Manifest> => {
  const response = await fetch(manifestUrl, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `Unable to fetch remote manifest ${manifestUrl}: ${response.status} ${response.statusText}`,
    );
  }

  return parseManifestResponse(response, manifestUrl);
};

const fetchManifestWithRetries = async (
  manifestUrl: string,
): Promise<Manifest> => {
  const attempts =
    process.env['NODE_ENV'] === 'development' ? DEV_MANIFEST_FETCH_ATTEMPTS : 1;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fetchManifest(manifestUrl);
    } catch (error) {
      lastError = error;

      if (attempt === attempts - 1) {
        throw error;
      }

      await sleep(DEV_MANIFEST_FETCH_DELAY_MS);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Unable to fetch remote manifest ${manifestUrl}`);
};

const fetchManifestWithDevFallback = async (
  manifestUrl: string,
): Promise<Manifest> => {
  try {
    return await fetchManifestWithRetries(manifestUrl);
  } catch (error) {
    const browserManifestUrl = getBrowserManifestUrl(manifestUrl);

    if (browserManifestUrl === manifestUrl) {
      throw error;
    }

    return fetchManifestWithRetries(browserManifestUrl);
  }
};

const getManifestBuildVersion = (
  manifestUrl: string,
  manifest: Manifest,
): string =>
  manifest.metaData?.buildInfo?.buildVersion || stableHash(manifestUrl);

const getGenerationRuntimeName = (
  baseKey: string,
  buildVersion: string,
): string =>
  `${GENERATION_REMOTE_PREFIX}${stableHash(`${baseKey}:${buildVersion}`)}`;

const getGenerationGlobalName = (
  baseName: string,
  buildVersion: string,
): string => `__NEXTJS_MF_${stableHash(`${baseName}:${buildVersion}`)}__`;

const getCurrentRequestState = (): FederatedRequestState | undefined =>
  getGlobalSsrStore().storage.getStore();

const clearManifestCaches = (manifestUrl: string) => {
  for (const instance of getFederationInstances()) {
    instance.snapshotHandler?.manifestCache?.delete(manifestUrl);
  }
};

const ensureGenerationRegistered = (generation: RemoteGeneration) => {
  for (const instance of getFederationInstances()) {
    const remotes = instance.options?.remotes || [];
    const hasBaseRemote = remotes.some(
      (remote) =>
        !isGenerationRemote(remote.name) &&
        remote.name === generation.baseName &&
        normalizeNextManifestUrl(remote.entry || '') ===
          generation.baseManifestUrl,
    );
    const hasGenerationRemote = remotes.some(
      (remote) => remote.name === generation.runtimeName,
    );

    if (!hasBaseRemote || hasGenerationRemote) {
      continue;
    }

    instance.remoteHandler?.registerRemotes?.(
      [
        {
          name: generation.runtimeName,
          entry: generation.manifestUrl,
          shareScope: generation.shareScope,
          type: generation.type,
        },
      ],
      { force: false },
    );
  }
};

const retireGenerationIfIdle = (generation: RemoteGeneration) => {
  if (!generation.retired || generation.refCount > 0) {
    return;
  }

  clearManifestCaches(generation.manifestUrl);
  clearManifestCaches(generation.baseManifestUrl);

  for (const instance of getFederationInstances()) {
    const remote = instance.options?.remotes?.find(
      (candidate) => candidate.name === generation.runtimeName,
    );

    if (!remote) {
      continue;
    }

    instance.snapshotHandler?.manifestCache?.delete(generation.manifestUrl);
    instance.snapshotHandler?.manifestCache?.delete(generation.baseManifestUrl);
    instance.remoteHandler?.removeRemote?.(remote);
  }

  const store = getGlobalSsrStore();
  const generationBucket = store.generations.get(generation.baseKey);
  generationBucket?.delete(generation.buildVersion);
  if (generationBucket && generationBucket.size === 0) {
    store.generations.delete(generation.baseKey);
    if (
      store.activeBuildVersions.get(generation.baseKey) ===
      generation.buildVersion
    ) {
      store.activeBuildVersions.delete(generation.baseKey);
    }
  }
};

const registerGenerationForRequest = (
  state: FederatedRequestState,
  remote: FederatedRemoteReference & { baseKey: string; entry: string },
  manifest: Manifest,
  assetManifest: Manifest,
): RemoteGeneration => {
  const store = getGlobalSsrStore();
  const buildVersion = getManifestBuildVersion(remote.entry, manifest);
  const generationBucket =
    store.generations.get(remote.baseKey) ||
    new Map<string, RemoteGeneration>();
  let generation = generationBucket.get(buildVersion);

  if (!generation) {
    generation = {
      baseKey: remote.baseKey,
      baseName: remote.name,
      baseAlias: remote.alias,
      baseManifestUrl: remote.entry,
      baseEntryGlobalName:
        manifest.metaData?.globalName || manifest.name || remote.name,
      manifestUrl: appendGenerationQuery(remote.entry, buildVersion),
      assetManifestUrl: appendGenerationQuery(
        getBrowserManifestUrl(remote.entry),
        buildVersion,
      ),
      buildVersion,
      entryGlobalName: getGenerationGlobalName(remote.name, buildVersion),
      runtimeName: getGenerationRuntimeName(remote.baseKey, buildVersion),
      type: remote.type,
      shareScope: remote.shareScope,
      manifest,
      assetManifest,
      refCount: 0,
      active: false,
      retired: false,
    };
    generationBucket.set(buildVersion, generation);
    store.generations.set(remote.baseKey, generationBucket);
  }

  const previousBuildVersion = store.activeBuildVersions.get(remote.baseKey);
  if (previousBuildVersion && previousBuildVersion !== buildVersion) {
    const previousGeneration = generationBucket.get(previousBuildVersion);
    if (previousGeneration) {
      previousGeneration.active = false;
      previousGeneration.retired = true;
      retireGenerationIfIdle(previousGeneration);
    }
    clearManifestCaches(remote.entry);
  }

  generation.active = true;
  generation.retired = false;
  store.activeBuildVersions.set(remote.baseKey, buildVersion);
  ensureGenerationRegistered(generation);

  generation.refCount += 1;
  state.generationBySpecifier.set(remote.name, generation);
  state.generationBySpecifier.set(remote.baseKey, generation);
  state.generationByRuntimeName.set(generation.runtimeName, generation);
  state.generationByEntryGlobalName.set(generation.entryGlobalName, generation);
  if (remote.alias) {
    state.generationBySpecifier.set(remote.alias, generation);
  }

  return generation;
};

const ensureRemoteGeneration = async (
  state: FederatedRequestState,
  remote: { name: string; alias?: string },
  remoteInfo: {
    name: string;
    entry: string;
    entryGlobalName: string;
    buildVersion?: string;
  },
): Promise<RemoteGeneration | undefined> => {
  const existingGeneration =
    state.generationByRuntimeName.get(remote.name) ||
    state.generationBySpecifier.get(remote.name) ||
    (remote.alias
      ? state.generationBySpecifier.get(remote.alias)
      : undefined) ||
    state.generationBySpecifier.get(remoteInfo.name) ||
    state.generationByEntryGlobalName.get(remoteInfo.entryGlobalName);

  if (existingGeneration) {
    return existingGeneration;
  }

  const configuredRemote = findConfiguredRemoteForRequest(remote, remoteInfo);
  if (!configuredRemote) {
    return undefined;
  }

  const manifest = await fetchManifestWithDevFallback(configuredRemote.entry);
  const buildVersion = getManifestBuildVersion(
    configuredRemote.entry,
    manifest,
  );
  const registeredGeneration = getGlobalSsrStore()
    .generations.get(configuredRemote.baseKey)
    ?.get(buildVersion);
  const assetManifest =
    registeredGeneration?.assetManifest ||
    (await fetchManifestWithRetries(
      getBrowserManifestUrl(configuredRemote.entry),
    ));

  return registerGenerationForRequest(
    state,
    configuredRemote,
    manifest,
    assetManifest,
  );
};

const releaseRequestGenerations = (state: FederatedRequestState) => {
  const seenGenerations = new Set<RemoteGeneration>();

  for (const generation of state.generationByRuntimeName.values()) {
    if (seenGenerations.has(generation)) {
      continue;
    }

    seenGenerations.add(generation);
    generation.refCount = Math.max(0, generation.refCount - 1);
    retireGenerationIfIdle(generation);
  }
};

const loadAssetSnapshot = (
  generation: RemoteGeneration,
): ProviderModuleInfo => {
  if (generation.assetSnapshot) {
    return generation.assetSnapshot;
  }

  generation.assetSnapshot = generateSnapshotFromManifest(
    generation.assetManifest,
    {
      version: generation.assetManifestUrl,
    },
  );
  return generation.assetSnapshot;
};

const getExposeCandidates = (expose: string): string[] => {
  if (expose === '.') {
    return ['.', './'];
  }

  const normalizedExpose = expose.replace(/^\.\//, '');
  return [`./${normalizedExpose}`, normalizedExpose];
};

const addGenerationAsset = (
  assets: Set<string>,
  generation: RemoteGeneration,
  asset: string,
) => {
  assets.add(appendGenerationQuery(asset, generation.buildVersion));
};

const collectModuleAssets = (
  generation: RemoteGeneration,
  snapshot: ProviderModuleInfo,
  expose: string,
  assets: Set<string>,
) => {
  addGenerationAsset(
    assets,
    generation,
    getResourceUrl(snapshot, snapshot.remoteEntry),
  );

  const exposeCandidates = new Set(getExposeCandidates(expose));
  snapshot.modules.forEach((module) => {
    if (
      !exposeCandidates.has(module.moduleName) &&
      !exposeCandidates.has(module.modulePath || '')
    ) {
      return;
    }

    module.assets.css.sync.forEach((asset) =>
      addGenerationAsset(assets, generation, getResourceUrl(snapshot, asset)),
    );
    module.assets.css.async.forEach((asset) =>
      addGenerationAsset(assets, generation, getResourceUrl(snapshot, asset)),
    );
    module.assets.js.sync.forEach((asset) =>
      addGenerationAsset(assets, generation, getResourceUrl(snapshot, asset)),
    );
    module.assets.js.async.forEach((asset) =>
      addGenerationAsset(assets, generation, getResourceUrl(snapshot, asset)),
    );
  });
};

const getGlobalSsrStore = (): FederatedSsrGlobal => {
  if (globalThis.__NEXTJS_MF_SSR__) {
    return globalThis.__NEXTJS_MF_SSR__;
  }

  globalThis.__NEXTJS_MF_SSR__ = {
    storage: new AsyncLocalStorage<FederatedRequestState>(),
    generations: new Map(),
    activeBuildVersions: new Map(),
    record(runtimeName: string, expose: string) {
      const state = this.storage.getStore();
      if (!state) {
        return;
      }

      const normalizedExpose = normalizeExpose(expose);
      const dedupeKey = `${runtimeName}:${normalizedExpose}`;
      if (state.seenRemotes.has(dedupeKey)) {
        return;
      }

      state.seenRemotes.add(dedupeKey);
      state.usedRemotes.push({
        runtimeName,
        expose: normalizedExpose,
      });
    },
    rewriteId(id: string) {
      const state = this.storage.getStore();
      if (!state) {
        return id;
      }

      const candidates = Array.from(state.generationBySpecifier.entries()).sort(
        ([left], [right]) => right.length - left.length,
      );

      for (const [specifier, generation] of candidates) {
        if (id === specifier || id.startsWith(`${specifier}/`)) {
          return `${generation.runtimeName}${id.slice(specifier.length)}`;
        }
      }

      return id;
    },
    async ensureRemoteGeneration({
      remote,
      remoteInfo,
    }: {
      remote: { name: string; alias?: string };
      remoteInfo: {
        name: string;
        entry: string;
        entryGlobalName: string;
        buildVersion?: string;
      };
    }) {
      const state = this.storage.getStore();
      if (!state) {
        return undefined;
      }

      return ensureRemoteGeneration(state, remote, remoteInfo);
    },
    pinRemote({
      remote,
      remoteInfo,
    }: {
      remote: { name: string; alias?: string };
      remoteInfo: {
        name: string;
        entry: string;
        entryGlobalName: string;
        buildVersion?: string;
      };
    }) {
      const state = this.storage.getStore();
      if (!state) {
        return undefined;
      }

      const generation =
        state.generationByRuntimeName.get(remote.name) ||
        state.generationBySpecifier.get(remote.name) ||
        (remote.alias
          ? state.generationBySpecifier.get(remote.alias)
          : undefined);

      if (!generation) {
        return undefined;
      }

      remoteInfo.name = generation.baseName;
      remoteInfo.entry = appendGenerationQuery(
        remoteInfo.entry,
        generation.buildVersion,
      );
      remoteInfo.entryGlobalName = generation.entryGlobalName;
      return generation;
    },
    getPinnedManifestResponse(manifestUrl: string) {
      const state = this.storage.getStore();
      if (!state) {
        return undefined;
      }

      for (const generation of state.generationByRuntimeName.values()) {
        if (
          manifestUrl === generation.manifestUrl ||
          manifestUrl === generation.baseManifestUrl
        ) {
          return new Response(JSON.stringify(generation.manifest), {
            headers: {
              'content-type': 'application/json',
            },
          });
        }
      }

      return undefined;
    },
    async loadEntry({
      loaderHook,
      remoteInfo,
    }: {
      loaderHook: LoaderHookLike;
      remoteInfo: {
        name: string;
        entry: string;
        entryGlobalName: string;
        type?: string;
      };
    }) {
      const state = this.storage.getStore();
      if (!state) {
        return undefined;
      }

      const generation =
        state.generationByEntryGlobalName.get(remoteInfo.entryGlobalName) ||
        state.generationByRuntimeName.get(remoteInfo.name);
      if (!generation) {
        return undefined;
      }

      const currentGlobal = globalThis as typeof globalThis &
        Record<string, unknown>;
      if (currentGlobal[generation.entryGlobalName]) {
        return currentGlobal[generation.entryGlobalName];
      }

      const attachedBaseContainer =
        currentGlobal[generation.baseEntryGlobalName];
      if (isRemoteContainer(attachedBaseContainer)) {
        currentGlobal[generation.entryGlobalName] = attachedBaseContainer;
        return attachedBaseContainer;
      }

      const remoteEntryExports = await loadScriptNode(remoteInfo.entry, {
        attrs: {
          name: remoteInfo.name,
          globalName: generation.baseEntryGlobalName,
          type: remoteInfo.type,
        },
        loaderHook: {
          createScriptHook: (url: string) => {
            const result = loaderHook.lifecycle.createScript.emit({
              url,
              attrs: {},
            });

            if (
              result &&
              typeof result === 'object' &&
              'url' in result &&
              typeof (result as { url?: unknown }).url === 'string'
            ) {
              return { url: (result as { url: string }).url };
            }

            return undefined;
          },
          fetch: (input: RequestInfo | URL, init?: RequestInit) =>
            loaderHook.lifecycle.fetch.emit(input, init || {}),
        } as never,
      });

      currentGlobal[generation.entryGlobalName] = remoteEntryExports;
      return remoteEntryExports;
    },
  };

  return globalThis.__NEXTJS_MF_SSR__;
};

export const withFederatedRequest = async <T>(
  callback: () => Promise<T> | T,
): Promise<T> => {
  if (getCurrentRequestState()) {
    return Promise.resolve(callback());
  }

  const store = getGlobalSsrStore();

  return store.storage.run(createRequestState(), async () => {
    const state = store.storage.getStore();
    if (!state) {
      return Promise.resolve(callback());
    }

    try {
      return await callback();
    } finally {
      releaseRequestGenerations(state);
    }
  });
};

export const flushChunks = async (): Promise<string[]> => {
  const state = getCurrentRequestState();
  if (!state || !state.usedRemotes.length) {
    return [];
  }

  const assets = new Set<string>();

  for (const reference of state.usedRemotes) {
    const generation = state.generationByRuntimeName.get(reference.runtimeName);
    if (!generation) {
      continue;
    }

    const snapshot = loadAssetSnapshot(generation);
    collectModuleAssets(generation, snapshot, reference.expose, assets);
  }

  state.usedRemotes.length = 0;
  state.seenRemotes.clear();

  return Array.from(assets);
};

export interface FlushedChunksProps {
  chunks: string[];
}

export const FlushedChunks = ({ chunks = [] }: FlushedChunksProps) => {
  const css = chunks
    .filter((chunk) => chunk.endsWith('.css') || chunk.includes('.css?'))
    .map((chunk) =>
      React.createElement('link', {
        key: chunk,
        href: chunk,
        rel: 'stylesheet',
      }),
    );

  const scripts = chunks
    .filter((chunk) => chunk.endsWith('.js') || chunk.includes('.js?'))
    .map((chunk) =>
      React.createElement('script', {
        key: chunk,
        src: chunk,
        async: true,
      }),
    );

  return React.createElement(React.Fragment, null, css, scripts);
};
