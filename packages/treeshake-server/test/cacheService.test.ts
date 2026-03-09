import { describe, it } from '@rstest/core';
import assert from 'node:assert/strict';

import {
  createCacheHash,
  hitCache,
  retrieveCacheItems,
  retrieveCDNPath,
} from '../src/services/cacheService';
import type { NormalizedConfig } from '../src/domain/build/normalize-config';
import { SERVER_VERSION } from '../src/domain/upload/constant';
import type { ObjectStore } from '../src/ports/objectStore';

const mockConfig: NormalizedConfig[string] = {
  hostName: 'host',
  libraryType: 'global',
  plugins: [],
  shared: [],
  target: ['es2015'],
  uploadOptions: {
    bucketName: 'b',
    cdnRegion: 'r',
    publicFilePath: 'p',
    publicPath: 'pp',
    scmName: 's',
  },
  usedExports: ['foo'],
};

describe('cacheService', () => {
  const makeStore = (
    exists: boolean | ((key: string) => boolean),
  ): ObjectStore => ({
    exists: async (key: string) =>
      typeof exists === 'function' ? exists(key) : exists,
    uploadFile: async () => {},
    publicUrl: (key: string) =>
      `https://example.invalid/${key.replace(/^\//, '')}`,
  });

  describe('createCacheHash', () => {
    it('generates stable hash', () => {
      const hash1 = createCacheHash(mockConfig, 're-shake');
      const hash2 = createCacheHash({ ...mockConfig }, 're-shake');
      assert.equal(hash1, hash2);
    });

    it('differentiates based on build type and usedExports', () => {
      const hashReShake = createCacheHash(mockConfig, 're-shake');
      const hashFull = createCacheHash(mockConfig, 'full');
      // full build ignores usedExports, re-shake includes it
      // However, if usedExports is non-empty, hashes might differ or be same if full build logic empties it.
      // Logic: usedExports: type === "full" ? [] : config.usedExports
      // So if mockConfig has usedExports, hashes should differ.
      assert.notEqual(hashReShake, hashFull);
    });
  });

  describe('retrieveCDNPath', () => {
    it('returns correct path structure', () => {
      const path = retrieveCDNPath({
        config: mockConfig,
        sharedKey: 'pkg@1.0.0',
        type: 're-shake',
      });
      const hash = createCacheHash(mockConfig, 're-shake');
      assert.equal(
        path,
        `tree-shaking-shared/${SERVER_VERSION}/pkg@1.0.0/${hash}.js`,
      );
    });
  });

  describe('hitCache', () => {
    it('returns URL when cache exists', async () => {
      const store = makeStore(true);
      const url = await hitCache('pkg@1.0.0', mockConfig, 're-shake', store);
      assert.ok(url);
      assert.match(url, /^https:\/\/example\.invalid\//);
    });

    it('returns null when cache is missing', async () => {
      const store = makeStore(false);
      const url = await hitCache('pkg@1.0.0', mockConfig, 're-shake', store);
      assert.equal(url, null);
    });
  });

  describe('retrieveCacheItems', () => {
    it('separates cached and non-cached items', async () => {
      const config: NormalizedConfig = {
        'pkg-cached@1.0.0': { ...mockConfig, usedExports: ['a'] },
        'pkg-missing@1.0.0': { ...mockConfig, usedExports: ['b'] },
      };

      const store = makeStore((key) => key.includes('pkg-cached'));

      const result = await retrieveCacheItems(config, 're-shake', store);

      assert.equal(result.cacheItems.length, 1);
      assert.equal(result.cacheItems[0].name, 'pkg-cached');
      assert.equal(Object.keys(result.restConfig).length, 1);
      assert.ok(result.restConfig['pkg-missing@1.0.0']);
      assert.deepEqual(result.excludeShared, [['pkg-cached', '1.0.0']]);
    });

    it('excludes unused exports for re-shake even if not cached', async () => {
      const config: NormalizedConfig = {
        'pkg-unused@1.0.0': { ...mockConfig, usedExports: [] },
      };

      const store = makeStore(false);

      const result = await retrieveCacheItems(config, 're-shake', store);

      assert.equal(result.cacheItems.length, 0);
      assert.equal(Object.keys(result.restConfig).length, 0);
      assert.deepEqual(result.excludeShared, [['pkg-unused', '1.0.0']]);
    });

    it('includes unused exports for full build if not cached', async () => {
      const config: NormalizedConfig = {
        'pkg-unused@1.0.0': { ...mockConfig, usedExports: [] },
      };

      const store = makeStore(false);

      const result = await retrieveCacheItems(config, 'full', store);

      assert.equal(result.cacheItems.length, 0);
      // For full build, even empty usedExports should be built?
      // Logic:
      // } else if (!config.usedExports.length && type === "re-shake") {
      //    excludeShared.push([name, version]);
      // } else {
      //    restConfig[sharedKey] = config;
      // }
      // So if type is "full", it goes to else -> restConfig.
      assert.equal(Object.keys(result.restConfig).length, 1);
      assert.ok(result.restConfig['pkg-unused@1.0.0']);
      assert.deepEqual(result.excludeShared, []);
    });
  });
});
