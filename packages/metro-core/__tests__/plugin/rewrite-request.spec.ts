import { describe, expect, it } from '@rstest/core';
import type { ConfigT } from 'metro-config';
import { createRewriteRequest } from '../../src/plugin/rewrite-request';

describe('createRewriteRequest', () => {
  it('normalizes manifest rewrite paths to posix separators', () => {
    const rewriteRequest = createRewriteRequest({
      config: {
        projectRoot: 'C:\\repo\\app',
        server: {},
      } as any,
      originalEntryFilename: 'index.js',
      remoteEntryFilename: 'mini.bundle',
      manifestPath: 'C:\\repo\\app\\node_modules\\.mf\\mf-manifest.json',
      tmpDirPath: 'C:\\repo\\app\\node_modules\\.mf',
    });

    expect(rewriteRequest('/mf-manifest.json')).toBe(
      '/[metro-project]/node_modules/.mf/mf-manifest.json',
    );
  });

  it('rewrites the path of an entry URL and leaves its origin alone', () => {
    const rewriteRequest = createRewriteRequest({
      // only the fields the rewrite reads
      config: {
        projectRoot: '/repo/app',
        server: {},
      } as unknown as ConfigT,
      originalEntryFilename: 'index.js',
      remoteEntryFilename: 'host.bundle',
      manifestPath: '/repo/app/node_modules/.mf-metro/mf-manifest.json',
      tmpDirPath: '/repo/app/node_modules/.mf-metro',
    });

    // bundle requests are paths
    expect(rewriteRequest('/host.bundle?platform=ios')).toBe(
      '/node_modules/.mf-metro/host.bundle?platform=ios',
    );
    // HMR entry points are full URLs, and the entry name is part of `localhost`
    expect(
      rewriteRequest('http://localhost:8082/host.bundle?platform=ios'),
    ).toBe(
      'http://localhost:8082/node_modules/.mf-metro/host.bundle?platform=ios',
    );
    expect(rewriteRequest('http://host:8082/host.bundle?platform=ios')).toBe(
      'http://host:8082/node_modules/.mf-metro/host.bundle?platform=ios',
    );
  });
});
