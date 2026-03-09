import { describe, it } from '@rstest/core';
import assert from 'node:assert/strict';

import { createOssAdapterRegistry } from '../src/adapters/registry';

describe('OSS adapter registry', () => {
  it('contains only local', () => {
    const reg = createOssAdapterRegistry();
    const ids = reg.adapters.map((a) => a.id).sort();
    assert.deepEqual(ids, ['local']);
  });
});
