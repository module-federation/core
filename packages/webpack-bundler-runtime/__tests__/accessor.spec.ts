import { getWebpackRequire, getWebpackRequireOrThrow } from '../src/accessor';

describe('webpack require accessor', () => {
  test('returns undefined when webpack runtime is unavailable', () => {
    expect(getWebpackRequire()).toBeUndefined();
  });

  test('throws with clear message when webpack runtime is unavailable', () => {
    expect(() => getWebpackRequireOrThrow()).toThrow(
      'Unable to access __webpack_require__.',
    );
  });
});
