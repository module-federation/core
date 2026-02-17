import {
  getWebpackRequire,
  getWebpackRequireOrThrow,
  importWithBundlerIgnore,
} from '../src/accessor';

describe('webpack require accessor', () => {
  afterEach(() => {
    delete (globalThis as { __webpack_require__?: unknown }).__webpack_require__;
  });

  test('returns undefined when webpack runtime is unavailable', () => {
    expect(getWebpackRequire()).toBeUndefined();
  });

  test('returns the webpack require function when present', () => {
    const webpackRequire = Object.assign(jest.fn(), {
      federation: { bundlerRuntime: {} },
    });
    (globalThis as { __webpack_require__?: unknown }).__webpack_require__ =
      webpackRequire;

    expect(getWebpackRequire()).toBe(webpackRequire);
  });

  test('throws with clear message when webpack runtime is unavailable', () => {
    expect(() => getWebpackRequireOrThrow()).toThrow(
      'Unable to access __webpack_require__.',
    );
  });

  test('re-exports dynamic import helper', () => {
    expect(typeof importWithBundlerIgnore).toBe('function');
  });
});
