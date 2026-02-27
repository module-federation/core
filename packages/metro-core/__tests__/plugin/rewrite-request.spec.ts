import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createRewriteRequest } from '../../src/plugin/rewrite-request';

describe('createRewriteRequest', () => {
  it('rewrites dts asset requests to tmp dir when names are available', () => {
    const projectRoot = '/virtual/metro-core';
    const rewriteRequest = createRewriteRequest({
      config: {
        projectRoot,
        server: {},
      } as any,
      originalEntryFilename: 'index.js',
      remoteEntryFilename: 'remoteEntry.js',
      manifestPath: path.join(
        projectRoot,
        'node_modules',
        '.mf-metro',
        'mf-manifest.json',
      ),
      tmpDirPath: path.join(projectRoot, 'node_modules', '.mf-metro'),
      getDtsAssetNames: () => ({
        zipName: '@mf-types.zip',
        apiFileName: '@mf-types.d.ts',
      }),
    });

    expect(rewriteRequest('/@mf-types.zip')).toBe(
      '/node_modules/.mf-metro/@mf-types.zip',
    );
    expect(rewriteRequest('/@mf-types.d.ts')).toBe(
      '/node_modules/.mf-metro/@mf-types.d.ts',
    );
  });
});
