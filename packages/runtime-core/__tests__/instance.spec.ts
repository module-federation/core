import { assert, describe, test, it } from 'vitest';
import { ModuleFederation } from '../src/index';

describe('ModuleFederation', () => {
  it('should initialize with provided arguments', () => {
    const GM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [],
    });
  });
});
