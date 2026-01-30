import { createHash } from 'node:crypto';
import stringify from 'json-stable-stringify';
import {
  type BuildType,
  extractBuildConfig,
  type NormalizedConfig,
  parseNormalizedKey,
} from '@/domain/build/normalize-config';
import { retrieveGlobalName } from '@/domain/build/retrieve-global-name';
import { SERVER_VERSION } from '@/domain/upload/constant';
import type { ObjectStore } from '@/ports/objectStore';
import type { UploadResult } from './uploadService';

export function createCacheHash(
  config: NormalizedConfig[string],
  type: BuildType,
) {
  const relevant = extractBuildConfig(
    {
      ...config,
      usedExports: type === 'full' ? [] : config.usedExports,
    },
    type,
  );
  const json = stringify(relevant);
  if (!json) {
    throw new Error('Can not stringify build config!');
  }

  return createHash('sha256').update(json).digest('hex');
}

export function retrieveCDNPath({
  config,
  sharedKey,
  type,
}: {
  config: NormalizedConfig[string];
  sharedKey: string;
  type: BuildType;
}) {
  const configHash = createCacheHash(config, type);
  // Add .js suffix to make it a valid JS file.
  // Keep origin/feat/build public prefix.
  return `tree-shaking-shared/${SERVER_VERSION}/${sharedKey}/${configHash}.js`;
}

// Cache probing is implemented via the selected ObjectStore adapter.
export async function hitCache(
  sharedKey: string,
  config: NormalizedConfig[string],
  type: BuildType,
  store: ObjectStore,
) {
  const cdnPath = retrieveCDNPath({
    config,
    sharedKey,
    type,
  });
  const exists = await store.exists(cdnPath);
  return exists ? store.publicUrl(cdnPath) : null;
}

export const retrieveCacheItems = async (
  normalizedConfig: NormalizedConfig,
  type: BuildType,
  store: ObjectStore,
) => {
  const cacheItems: Array<UploadResult> = [];
  const restConfig: NormalizedConfig = {};
  const excludeShared: Array<[sharedName: string, version: string]> = [];
  for (const [sharedKey, config] of Object.entries(normalizedConfig)) {
    let cache = false;
    const { name, version } = parseNormalizedKey(sharedKey);

    const cdnUrl = await hitCache(sharedKey, config, type, store);
    if (cdnUrl) {
      cache = true;
      cacheItems.push({
        type,
        name,
        version,
        cdnUrl,
        globalName: retrieveGlobalName(config.hostName, name, version),
      });
    }

    if (cache) {
      excludeShared.push([name, version]);
    } else if (!config.usedExports.length && type === 're-shake') {
      excludeShared.push([name, version]);
    } else {
      restConfig[sharedKey] = config;
    }
  }
  return {
    cacheItems,
    excludeShared,
    restConfig,
  };
};
