import { describe, it } from '@rstest/core';
import assert from 'node:assert/strict';
import type { Config } from '../src/domain/build/schema';
import { normalizeConfig } from '../src/domain/build/normalize-config';
import {
  createCacheHash,
  retrieveCDNPath,
  hitCache,
} from '../src/services/cacheService';
import { SERVER_VERSION } from '../src/domain/upload/constant';

class StubStore {
  constructor(
    private existsMap: Set<string>,
    private base: string,
  ) {}
  async exists(key: string) {
    return this.existsMap.has(key);
  }
  async uploadFile() {
    throw new Error('not used');
  }
  publicUrl(key: string) {
    return `${this.base}/${key}`;
  }
}

describe('cacheService', () => {
  it('hash ignores usedExports for full builds', () => {
    const config: Config = {
      shared: [['antd', '6.1.0', ['Button']]],
      plugins: [],
      target: ['es2015'],
      libraryType: 'global',
      hostName: 'host',
    };
    const normA = normalizeConfig(config);
    const normB = normalizeConfig({
      ...config,
      shared: [['antd', '6.1.0', []]],
    } satisfies Config);
    const key = Object.keys(normA)[0];
    const ha = createCacheHash(normA[key], 'full');
    const hb = createCacheHash(normB[key], 'full');
    assert.equal(ha, hb);
  });

  it('cdn path contains version and .js suffix', () => {
    const config: Config = {
      shared: [['antd', '6.1.0', ['Button']]],
      plugins: [],
      target: ['es2015'],
      libraryType: 'global',
      hostName: 'host',
    };
    const norm = normalizeConfig(config);
    const key = Object.keys(norm)[0];
    const p = retrieveCDNPath({
      config: norm[key],
      sharedKey: key,
      type: 're-shake',
    });
    assert.ok(p.startsWith(`tree-shaking-shared/${SERVER_VERSION}/${key}/`));
    assert.ok(p.endsWith('.js'));
  });

  it('hitCache returns publicUrl when exists', async () => {
    const config: Config = {
      shared: [['antd', '6.1.0', ['Button']]],
      plugins: [],
      target: ['es2015'],
      libraryType: 'global',
      hostName: 'host',
    };
    const norm = normalizeConfig(config);
    const key = Object.keys(norm)[0];
    const store = new StubStore(new Set<string>(), 'http://local');
    const miss = await hitCache(key, norm[key], 're-shake', store as any);
    assert.equal(miss, null);
    const path = retrieveCDNPath({
      config: norm[key],
      sharedKey: key,
      type: 're-shake',
    });
    const hitStore = new StubStore(new Set([path]), 'http://local');
    const url = await hitCache(key, norm[key], 're-shake', hitStore as any);
    assert.equal(url, `http://local/${path}`);
  });
});
