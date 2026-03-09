import { describe, expect, it } from 'vitest';
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
});
