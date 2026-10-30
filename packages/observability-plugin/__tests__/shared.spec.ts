import { describe, expect, it } from '@rstest/core';
import {
  createRuntimeSharedCandidate,
  getRuntimeSharedCompatibility,
} from '../src/runtime/shared';

describe('runtime shared version compatibility', () => {
  it.each([
    ['1.4.2', '^1.2.0', true],
    ['2.0.0', '^1.2.0', false],
    ['1.2.9', '~1.2.0', true],
    ['1.3.0', '~1.2.0', false],
    ['1.2.3', '1.2.3', true],
    ['1.2.4', '1.2.3', false],
    ['1.2.3-beta.1', '>=1.2.3-beta.0 <1.2.3', true],
    ['1.2.3-beta.2', '1.2.3-beta.1', false],
    ['1.2.3', '*', true],
  ])(
    'matches semver behavior for %s against %s',
    (version, range, expected) => {
      expect(getRuntimeSharedCompatibility(version, range)).toBe(expected);
    },
  );

  it('reports a shared-version mismatch through the candidate result', () => {
    const candidate = createRuntimeSharedCandidate(
      'default',
      '17.0.2',
      { from: 'host', loaded: true },
      '^18.0.0',
    );

    expect(candidate).toMatchObject({
      compatible: false,
      rejectionReason: 'version-mismatch',
    });
  });
});
