import { assert, describe, test, it } from 'vitest';
import { FederationHost } from '../src/index';

describe('FederationHost', () => {
  it('args', () => {
    const GM = new FederationHost({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [],
    });
  });
});
