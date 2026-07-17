import { normalizeManifestOptions } from './manifest-options';

describe('normalizeManifestOptions', () => {
  it('preserves manifest: false for client plugin selection', () => {
    expect(normalizeManifestOptions(false, false)).toBe(false);
  });

  it('retains custom options while setting the compiler-specific path', () => {
    expect(
      normalizeManifestOptions({ fileName: 'custom', filePath: 'old' }, false),
    ).toEqual({ fileName: 'custom', filePath: '/static/chunks' });
    expect(normalizeManifestOptions(true, true)).toEqual({ filePath: '' });
  });
});
