/* eslint-disable no-undef */

import { getResourceUrl, type Manifest } from '@module-federation/sdk';
import type { RemoteInfo } from '@module-federation/runtime/types';

type LegacyFederatedStats = {
  federatedModules?: Array<{
    exposes?: Record<string, string[]>;
  }>;
};

type RemoteRequests = {
  remoteInfo: RemoteInfo;
  manifestUrl?: string;
  requests: Set<string>;
};

// @ts-ignore
if (!globalThis.usedChunks) {
  // @ts-ignore
  globalThis.usedChunks = new Set();
}
/**
 * Initialize usedChunks and share it globally.
 * @type {Set}
 */
// @ts-ignore
export const { usedChunks } = globalThis;
const getFederationController = () =>
  new Function('return globalThis')().__FEDERATION__;

export const getAllKnownRemotes = function (): Record<string, RemoteInfo> {
  const federationController = getFederationController();
  if (!federationController || !federationController.__INSTANCES__) {
    return {};
  }

  const collected: Record<string, RemoteInfo> = {};
  for (const instance of federationController.__INSTANCES__) {
    for (const [, cacheModule] of instance.moduleCache) {
      if (cacheModule.remoteInfo) {
        const remoteInfo = cacheModule.remoteInfo as RemoteInfo;
        collected[remoteInfo.name] = remoteInfo;
        if (remoteInfo.alias) collected[remoteInfo.alias] = remoteInfo;
      }
    }
  }
  return collected;
};

const getConfiguredManifestUrls = (): Map<string, string> => {
  const manifestUrls = new Map<string, string>();
  const federationController = getFederationController();

  for (const instance of federationController?.__INSTANCES__ || []) {
    for (const configuredRemote of instance.options?.remotes || []) {
      if (!('entry' in configuredRemote)) continue;
      try {
        if (!new URL(configuredRemote.entry).pathname.endsWith('.json')) {
          continue;
        }
      } catch {
        continue;
      }
      manifestUrls.set(configuredRemote.name, configuredRemote.entry);
      if (configuredRemote.alias) {
        manifestUrls.set(configuredRemote.alias, configuredRemote.entry);
      }
    }
  }

  return manifestUrls;
};

const parseUsedChunk = (
  chunk: string,
  remoteNames: string[],
): [remote: string, request: string] => {
  const normalizedChunk = chunk.replace('->', '/');
  const remote =
    remoteNames.find(
      (name) =>
        normalizedChunk === name || normalizedChunk.startsWith(`${name}/`),
    ) || normalizedChunk.split('/', 1)[0];
  const request = normalizedChunk.slice(remote.length).replace(/^\//, '');
  return [remote, request.startsWith('./') ? request : `./${request}`];
};

const getMetadataUrl = (entry: string, filename: string): string => {
  const url = new URL(entry);
  url.pathname = `${url.pathname.slice(0, url.pathname.lastIndexOf('/') + 1)}${filename}`;
  url.pathname = url.pathname.replace('/ssr/', '/chunks/');
  return url.href;
};

const getManifestUrl = (
  remoteInfo: RemoteInfo,
  configuredManifestUrl?: string,
): string => {
  if (configuredManifestUrl) return configuredManifestUrl;
  return getMetadataUrl(remoteInfo.entry, 'mf-manifest.json');
};

const getAssetBaseUrl = (metadataUrl: string): URL => {
  const baseUrl = new URL(metadataUrl);
  const staticPathIndex = baseUrl.pathname.indexOf('/static/');
  baseUrl.pathname =
    staticPathIndex === -1
      ? baseUrl.pathname.slice(0, baseUrl.pathname.lastIndexOf('/') + 1)
      : baseUrl.pathname.slice(0, staticPathIndex + 1);
  baseUrl.search = '';
  baseUrl.hash = '';
  return baseUrl;
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const collectManifestAssets = (
  manifest: Manifest,
  manifestUrl: string,
  requests: Set<string>,
): { chunks: string[]; missingRequests: Set<string> } => {
  const chunks = new Set<string>();
  const missingRequests = new Set(requests);
  let assetBaseUrl = getAssetBaseUrl(manifestUrl);
  const resourceBasePath = getResourceUrl(manifest.metaData, '');

  if (resourceBasePath !== 'auto') {
    const normalizedBasePath =
      resourceBasePath && !resourceBasePath.endsWith('/')
        ? `${resourceBasePath}/`
        : resourceBasePath || './';
    assetBaseUrl = new URL(normalizedBasePath, manifestUrl);
  }

  const resolveAssetUrl = (file: string) => new URL(file, assetBaseUrl).href;

  for (const expose of manifest.exposes) {
    const request = expose.path || `./${expose.name}`;
    if (!requests.has(request)) continue;

    const hasSyncAssets =
      expose.assets.js.sync.length > 0 || expose.assets.css.sync.length > 0;
    if (hasSyncAssets) missingRequests.delete(request);

    for (const file of expose.assets.js.sync) {
      chunks.add(resolveAssetUrl(file));
    }
    for (const file of expose.assets.css.sync) {
      chunks.add(resolveAssetUrl(file));
    }
  }

  return { chunks: Array.from(chunks), missingRequests };
};

const collectLegacyAssets = (
  stats: LegacyFederatedStats,
  statsUrl: string,
  requests: Set<string>,
): string[] => {
  const chunks = new Set<string>();
  const assetBaseUrl = getAssetBaseUrl(statsUrl);

  for (const federatedModule of stats.federatedModules || []) {
    for (const request of requests) {
      for (const file of federatedModule.exposes?.[request] || []) {
        chunks.add(new URL(file, assetBaseUrl).href);
      }
    }
  }

  return Array.from(chunks);
};

const processRemote = async (
  remoteInfo: RemoteInfo,
  requests: Set<string>,
  configuredManifestUrl?: string,
): Promise<string[]> => {
  const manifestUrl = getManifestUrl(remoteInfo, configuredManifestUrl);
  let manifestChunks: string[] = [];
  let legacyRequests = requests;

  try {
    const manifest = await fetchJson<Manifest>(manifestUrl);
    const { chunks, missingRequests } = collectManifestAssets(
      manifest,
      manifestUrl,
      requests,
    );
    manifestChunks = chunks;
    if (!missingRequests.size) return chunks;
    legacyRequests = missingRequests;
  } catch {
    // Older remotes may only expose federated-stats.json.
  }

  const statsUrl = getMetadataUrl(remoteInfo.entry, 'federated-stats.json');
  try {
    const stats = await fetchJson<LegacyFederatedStats>(statsUrl);
    return Array.from(
      new Set([
        ...manifestChunks,
        ...collectLegacyAssets(stats, statsUrl, legacyRequests),
      ]),
    );
  } catch (error) {
    if (!manifestChunks.length) console.error('flush error:', error);
    return manifestChunks;
  }
};

/**
 * Flush the chunks and return a deduplicated array of chunks.
 * @returns {Promise<Array>} A promise that resolves to an array of deduplicated chunks.
 */
export const flushChunks = async (): Promise<string[]> => {
  const knownRemotes = getAllKnownRemotes();
  const configuredManifestUrls = getConfiguredManifestUrls();
  const remoteNames = Object.keys(knownRemotes).sort(
    (left, right) => right.length - left.length,
  );
  const requestsByRemote = new Map<string, RemoteRequests>();

  for (const chunk of usedChunks) {
    const [remote, request] = parseUsedChunk(chunk, remoteNames);
    const remoteInfo = knownRemotes[remote];
    if (!remoteInfo) {
      console.error(
        `flush chunks: Remote ${remote} is not defined in the global config`,
      );
      continue;
    }

    const remoteRequests = requestsByRemote.get(remoteInfo.name) || {
      remoteInfo,
      manifestUrl:
        configuredManifestUrls.get(remote) ||
        configuredManifestUrls.get(remoteInfo.name),
      requests: new Set<string>(),
    };
    remoteRequests.requests.add(request);
    requestsByRemote.set(remoteInfo.name, remoteRequests);
  }
  usedChunks.clear();

  const allFlushed = await Promise.all(
    Array.from(
      requestsByRemote.values(),
      ({ remoteInfo, requests, manifestUrl }) =>
        processRemote(remoteInfo, requests, manifestUrl),
    ),
  );

  return Array.from(new Set(allFlushed.flat()));
};
