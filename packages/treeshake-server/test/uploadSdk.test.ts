import { describe, it } from '@rstest/core';

import assert from 'node:assert/strict';

import { uploadDirectory } from '../src/utils/uploadSdk';

describe('uploadDirectory', () => {
  it('returns a CDN URL with trailing slash', async () => {
    const url = await uploadDirectory({
      outputDir: '/tmp/project/dist',
      cdnBaseUrl: 'https://cdn.example.com',
      targetPath: '/jobs/demo',
    });

    assert.equal(url, 'https://cdn.example.com/jobs/demo/');
  });

  it('throws when required fields are missing', async () => {
    await assert.rejects(() =>
      uploadDirectory({
        outputDir: '/tmp/project/dist',
        cdnBaseUrl: 'https://cdn.example.com',
        targetPath: '',
      }),
    );
    await assert.rejects(() =>
      uploadDirectory({
        outputDir: '',
        cdnBaseUrl: 'https://cdn.example.com',
        targetPath: 'jobs/demo',
      }),
    );
    await assert.rejects(() =>
      uploadDirectory({
        outputDir: '/tmp/project/dist',
        cdnBaseUrl: '',
        targetPath: 'jobs/demo',
      }),
    );
  });
});
