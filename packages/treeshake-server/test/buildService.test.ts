import { describe, it } from '@rstest/core';
import assert from 'node:assert/strict';
import { createCacheHash } from '../src/services/cacheService';
import type { NormalizedConfig } from '../src/domain/build/normalize-config';

describe('createCacheHash', () => {
  it('generates stable hash for same config', () => {
    const config: NormalizedConfig[string] = {
      hostName: 'host',
      libraryType: 'global',
      plugins: [],
      shared: [],
      target: ['es2015'],
      uploadOptions: {
        bucketName: 'b',
        cdnRegion: 'r',
        publicFilePath: 'p1',
        publicPath: 'p2',
        scmName: 's',
      },
      usedExports: ['foo', 'bar'],
    };
    const hash1 = createCacheHash(config, 're-shake');
    const hash2 = createCacheHash({ ...config }, 're-shake');
    assert.equal(hash1, hash2);
  });

  it('generates different hash for different usedExports in re-shake', () => {
    const config: NormalizedConfig[string] = {
      hostName: 'host',
      libraryType: 'global',
      plugins: [],
      shared: [],
      target: ['es2015'],
      uploadOptions: {
        bucketName: 'b',
        cdnRegion: 'r',
        publicFilePath: 'p1',
        publicPath: 'p2',
        scmName: 's',
      },
      usedExports: ['foo'],
    };
    const hash1 = createCacheHash(config, 're-shake');
    const hash2 = createCacheHash(
      { ...config, usedExports: ['bar'] },
      're-shake',
    );
    assert.notEqual(hash1, hash2);
  });

  it('ignores usedExports in full build', () => {
    const config: NormalizedConfig[string] = {
      hostName: 'host',
      libraryType: 'global',
      plugins: [],
      shared: [],
      target: ['es2015'],
      uploadOptions: {
        bucketName: 'b',
        cdnRegion: 'r',
        publicFilePath: 'p1',
        publicPath: 'p2',
        scmName: 's',
      },
      usedExports: ['foo'],
    };
    const hash1 = createCacheHash(config, 'full');
    const hash2 = createCacheHash({ ...config, usedExports: ['bar'] }, 'full');
    assert.equal(hash1, hash2);
  });
});
