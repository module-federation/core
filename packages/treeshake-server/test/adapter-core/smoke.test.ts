import { describe, it } from '@rstest/core';
import assert from 'node:assert/strict';
import * as core from '@/adapters/types';

describe('adapter-core', () => {
  it('loads as a module', () => {
    assert.equal(typeof core, 'object');
  });
});
