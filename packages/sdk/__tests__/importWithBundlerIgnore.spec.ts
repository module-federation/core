import { importWithBundlerIgnore } from '../src';

describe('importWithBundlerIgnore', () => {
  test('exports a callable helper', () => {
    expect(typeof importWithBundlerIgnore).toBe('function');
  });
});
